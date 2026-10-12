import { Autocomplete, Box, Chip, Stack, TextField, Typography } from '@mui/material';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { Trash01 } from '@untitledui/icons';
import useSWR from 'swr';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  ProductKind,
  ProductSkuStatus,
  ProductVariationSkuKind,
  productApi,
  productSkuSearchApi,
  type ProductPackagingRelationUpsertRequestDto,
  type ProductSpuPackagingRelation,
  type WmsSkuSearchListItem,
} from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { StackRowAlignCenter } from '../../../../components/styled';

type PackagingCandidate = {
  id: string;
  skuCode: string;
  name: string;
  productName?: string;
  productKind?: string;
  image?: string | null;
  basePriceAfterTax?: number | null;
  includedPriceAfterTax?: number | null;
  packagingType?: string | null;
};

type EditablePackagingRelation = {
  localId: string;
  id?: string;
  productVariationId: string;
  packagingVariationId: string;
  quantity: number;
  includedPriceAfterTax: string;
  isRequired: boolean;
  isDefault: boolean;
  canCustomerChoose: boolean;
  isVisibleOnProduct: boolean;
  sortOrder: number;
  status: string;
  effectiveFrom: string;
  effectiveTo: string;
};

const toCandidateFromSearch = (row: WmsSkuSearchListItem): PackagingCandidate => ({
  id: row.id,
  skuCode: row.skuCode,
  name: row.name,
  productName: row.product?.name,
  productKind: row.product?.productKind,
  image: row.image ?? row.medias?.[0]?.url ?? null,
  basePriceAfterTax: row.packaging?.basePriceAfterTax != null ? Number(row.packaging.basePriceAfterTax) : null,
  includedPriceAfterTax: row.packaging?.includedPriceAfterTax != null ? Number(row.packaging.includedPriceAfterTax) : null,
  packagingType: row.packaging?.packagingType ?? null,
});

const toCandidateFromRelation = (relation: ProductSpuPackagingRelation): PackagingCandidate | null => {
  if (!relation.packagingVariation) return null;
  return {
    id: relation.packagingVariation.id,
    skuCode: relation.packagingVariation.skuCode,
    name: relation.packagingVariation.name,
    basePriceAfterTax: relation.packagingVariation.packagingProfile ? Number(relation.packagingVariation.packagingProfile.basePriceAfterTax) : null,
    includedPriceAfterTax: relation.packagingVariation.packagingProfile ? Number(relation.packagingVariation.packagingProfile.includedPriceAfterTax) : null,
    packagingType: relation.packagingVariation.packagingProfile?.packagingType ?? null,
  };
};

const toEditableRelation = (relation: ProductSpuPackagingRelation): EditablePackagingRelation => ({
  localId: relation.id,
  id: relation.id,
  productVariationId: relation.productVariationId ?? '',
  packagingVariationId: relation.packagingVariationId,
  quantity: relation.quantity ?? 1,
  includedPriceAfterTax: relation.includedPriceAfterTax ?? '',
  isRequired: relation.isRequired,
  isDefault: relation.isDefault,
  canCustomerChoose: relation.canCustomerChoose,
  isVisibleOnProduct: relation.isVisibleOnProduct,
  sortOrder: relation.sortOrder ?? 0,
  status: relation.status ?? 'ACTIVE',
  effectiveFrom: relation.effectiveFrom ? relation.effectiveFrom.slice(0, 10) : '',
  effectiveTo: relation.effectiveTo ? relation.effectiveTo.slice(0, 10) : '',
});

const toEditableDraftRelation = (relation: ProductPackagingRelationUpsertRequestDto, index: number): EditablePackagingRelation => ({
  localId: `draft-${index}-${relation.productVariationId ?? relation.sourceVariationClientKey ?? 'SPU'}-${relation.packagingVariationId}`,
  productVariationId: relation.productVariationId ?? relation.sourceVariationClientKey ?? '',
  packagingVariationId: relation.packagingVariationId,
  quantity: relation.quantity ?? 1,
  includedPriceAfterTax: relation.includedPriceAfterTax === undefined || relation.includedPriceAfterTax === null ? '' : String(relation.includedPriceAfterTax),
  isRequired: relation.isRequired ?? true,
  isDefault: relation.isDefault ?? true,
  canCustomerChoose: relation.canCustomerChoose ?? false,
  isVisibleOnProduct: relation.isVisibleOnProduct ?? true,
  sortOrder: relation.sortOrder ?? index,
  status: relation.status ?? 'ACTIVE',
  effectiveFrom: relation.effectiveFrom ? relation.effectiveFrom.slice(0, 10) : '',
  effectiveTo: relation.effectiveTo ? relation.effectiveTo.slice(0, 10) : '',
});

const EMPTY_RELATIONS: ProductSpuPackagingRelation[] = [];
const EMPTY_DRAFT_RELATIONS: ProductPackagingRelationUpsertRequestDto[] = [];

const createBlankRelation = (index: number): EditablePackagingRelation => ({
  localId: `new-${Date.now()}-${index}`,
  productVariationId: '',
  packagingVariationId: '',
  quantity: 1,
  includedPriceAfterTax: '',
  isRequired: true,
  isDefault: true,
  canCustomerChoose: false,
  isVisibleOnProduct: true,
  sortOrder: index,
  status: 'ACTIVE',
  effectiveFrom: '',
  effectiveTo: '',
});

interface ProductSpuPackagingRelationsEditorProps {
  productId?: string;
  productKind?: string;
  relations?: ProductSpuPackagingRelation[];
  draftRelations?: ProductPackagingRelationUpsertRequestDto[];
  onDraftRelationsChange?: (relations: ProductPackagingRelationUpsertRequestDto[]) => void;
  readOnly?: boolean;
  disabled?: boolean;
  onSaved?: () => Promise<unknown> | unknown;
}

export const ProductSpuPackagingRelationsEditor = ({
  productId,
  productKind,
  relations = EMPTY_RELATIONS,
  draftRelations,
  onDraftRelationsChange,
  readOnly = false,
  disabled = false,
  onSaved,
}: ProductSpuPackagingRelationsEditorProps) => {
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [rows, setRows] = useState<EditablePackagingRelation[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingCandidate | null>(null);
  const [attachedCandidates, setAttachedCandidates] = useState<PackagingCandidate[]>([]);
  const [packagingSelectorOpen, setPackagingSelectorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastDraftPayloadJsonRef = useRef('');
  const lastPropsSyncJsonRef = useRef('');

  useEffect(() => {
    const useDraft = draftRelations !== undefined;
    const sourceJson = JSON.stringify(useDraft ? draftRelations : relations);
    if (sourceJson === lastPropsSyncJsonRef.current) return;
    lastPropsSyncJsonRef.current = sourceJson;

    setRows(useDraft ? (draftRelations ?? EMPTY_DRAFT_RELATIONS).map(toEditableDraftRelation) : relations.map(toEditableRelation));
    if (!useDraft) {
      setAttachedCandidates(relations.map(toCandidateFromRelation).filter((item): item is PackagingCandidate => Boolean(item)));
    }
  }, [draftRelations, relations]);

  const candidateSwr = useSWR(
    packagingSelectorOpen ? (['product/admin/skus/search', deferredSearch] as const) : null,
    ([, keyword]) =>
      productSkuSearchApi.searchAdminSkus({
        orderType: 'DESC',
        orderBy: 'createdAt',
        isPagination: false,
        search: keyword || undefined,
        productKind: ProductKind.PACKAGING,
        skuKind: ProductVariationSkuKind.PACKAGING,
        variationStatus: ProductSkuStatus.ACTIVE,
      }),
    { revalidateOnFocus: false },
  );

  const searchCandidates = useMemo(() => (candidateSwr.data?.list ?? []).map(toCandidateFromSearch), [candidateSwr.data?.list]);

  const selectedCandidates = attachedCandidates;

  const candidateMap = useMemo(() => {
    const map = new Map<string, PackagingCandidate>();
    for (const item of [...selectedCandidates, ...searchCandidates]) {
      map.set(item.id, item);
    }
    return map;
  }, [searchCandidates, selectedCandidates]);

  const candidateOptions = useMemo(() => Array.from(candidateMap.values()), [candidateMap]);

  const duplicateKey = useMemo(() => {
    const seen = new Set<string>();
    for (const row of rows) {
      if (!row.packagingVariationId) continue;
      const key = row.packagingVariationId;
      if (seen.has(key)) return key;
      seen.add(key);
    }
    return null;
  }, [rows]);

  const validationMessage = useMemo(() => {
    if (rows.some((row) => !row.packagingVariationId)) {
      return 'Mỗi dòng phải chọn 1 biến thể bao bì.';
    }
    if (rows.some((row) => row.quantity < 1)) {
      return 'Số lượng bao bì phải lớn hơn hoặc bằng 1.';
    }
    if (duplicateKey) {
      return `Trùng bao bì: ${duplicateKey}`;
    }
    return null;
  }, [duplicateKey, rows]);

  const isPackagingProduct = productKind === ProductKind.PACKAGING || productKind === ProductKind.SHIPPING_PACKAGING;

  const persistRows = async (nextRows: EditablePackagingRelation[], successMessage: string, candidateHints: PackagingCandidate[] = attachedCandidates) => {
    if (disabled || readOnly || isPackagingProduct) return;
    const nextCandidateMap = new Map(candidateHints.map((item) => [item.id, item]));
    if (!productId) {
      setRows(nextRows);
      setAttachedCandidates(Array.from(nextCandidateMap.values()));
      return;
    }

    setSaving(true);
    try {
      const response = await productApi.patchAdminProductPackagingRelations(productId, {
        relations: buildPayload(nextRows),
      });
      const responseRelations = response.list ?? [];
      const responseCandidates = responseRelations.map(toCandidateFromRelation).filter((item): item is PackagingCandidate => Boolean(item));
      setRows(responseRelations.length > 0 || nextRows.length === 0 ? responseRelations.map(toEditableRelation) : nextRows);
      setAttachedCandidates(responseCandidates.length > 0 || nextRows.length === 0 ? responseCandidates : Array.from(nextCandidateMap.values()));
      showSnackbar({ type: SnackbarType.SUCCESS, message: successMessage });
      await onSaved?.();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRow = (localId: string) => {
    const nextRows = rows.filter((row) => row.localId !== localId);
    const nextIds = new Set(nextRows.map((row) => row.packagingVariationId));
    void persistRows(
      nextRows,
      'Đã bỏ bao bì khỏi sản phẩm.',
      attachedCandidates.filter((item) => nextIds.has(item.id)),
    );
  };

  const handleAttachSelectedPackaging = () => {
    if (!selectedPackaging) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Chọn biến thể bao bì trước khi gắn.' });
      return;
    }

    if (rows.some((row) => row.packagingVariationId === selectedPackaging.id)) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Bao bì này đã được gắn vào sản phẩm.' });
      return;
    }

    const nextRows = [
      ...rows,
      {
        ...createBlankRelation(rows.length),
        productVariationId: '',
        packagingVariationId: selectedPackaging.id,
      },
    ];
    setSelectedPackaging(null);
    setSearch('');
    void persistRows(nextRows, 'Đã gắn bao bì vào sản phẩm.', [...attachedCandidates, selectedPackaging]);
  };

  const buildPayload = (sourceRows = rows) =>
    sourceRows.map((row): ProductPackagingRelationUpsertRequestDto => {
      return {
        packagingVariationId: row.packagingVariationId,
        quantity: row.quantity,
        includedPriceAfterTax: row.includedPriceAfterTax.trim() === '' ? null : Number(row.includedPriceAfterTax),
        isRequired: row.isRequired,
        isDefault: row.isDefault,
        canCustomerChoose: row.canCustomerChoose,
        isVisibleOnProduct: row.isVisibleOnProduct,
        sortOrder: row.sortOrder,
        status: row.status.trim() || 'ACTIVE',
        effectiveFrom: row.effectiveFrom || null,
        effectiveTo: row.effectiveTo || null,
      };
    });

  useEffect(() => {
    if (!onDraftRelationsChange || validationMessage) return;
    const payload = buildPayload();
    const payloadJson = JSON.stringify(payload);
    if (payloadJson === lastDraftPayloadJsonRef.current) return;
    lastDraftPayloadJsonRef.current = payloadJson;
    onDraftRelationsChange(payload);
  }, [onDraftRelationsChange, rows, validationMessage]);

  if (isPackagingProduct) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Bao bì không được gắn thêm bao bì cho chính nó.</Typography>;
  }

  if (readOnly && rows.length === 0) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>—</Typography>;
  }

  return (
    <Stack gap={2}>
      {!readOnly ? (
        <Stack gap={1.5}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#475467' }}>Chọn bao bì đã tạo để gắn vào toàn bộ biến thể của sản phẩm này.</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} sx={{ width: '100%' }}>
            <Autocomplete<PackagingCandidate, false, false, false>
              options={candidateOptions}
              value={selectedPackaging}
              inputValue={search}
              getOptionLabel={(option) => `${option.skuCode} • ${option.name}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={candidateSwr.isLoading}
              onOpen={() => setPackagingSelectorOpen(true)}
              onClose={() => setPackagingSelectorOpen(false)}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, value) => setSelectedPackaging(value)}
              noOptionsText={deferredSearch.length < 2 ? 'Nhập từ khóa để tìm biến thể bao bì.' : 'Không tìm thấy biến thể bao bì.'}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <Box component="li" key={key} {...optionProps}>
                    <Stack>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{option.name}</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
                        {option.productName ?? 'Packaging product'} • Giá lẻ {option.basePriceAfterTax ?? 0}
                      </Typography>
                    </Stack>
                  </Box>
                );
              }}
              renderInput={(params) => <TextField {...params} size="small" label="Tìm biến thể bao bì / hộp đựng" placeholder="Nhập mã biến thể hoặc tên bao bì" />}
              disabled={disabled || rows.length > 0}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <CustomButton
              variant="primary"
              fullWidth={false}
              onClick={handleAttachSelectedPackaging}
              disabled={disabled || saving || rows.length > 0 || !selectedPackaging}
              sx={{
                flex: 1,
                minWidth: 0,
                textTransform: 'none',
                bgcolor: '#101828',
                height: 40,
                whiteSpace: 'nowrap',
              }}
            >
              Gắn bao bì vào sản phẩm
            </CustomButton>
          </Stack>
          {validationMessage ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>{validationMessage}</Typography> : null}
        </Stack>
      ) : null}

      {rows.map((row) => {
        const selectedCandidate = row.packagingVariationId ? (candidateMap.get(row.packagingVariationId) ?? null) : null;

        return (
          <Stack
            key={row.localId}
            gap={1.5}
            sx={{
              p: 2,
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              bgcolor: '#FCFCFD',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Stack gap={0.5}>
                <StackRowAlignCenter gap={1}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{selectedCandidate?.skuCode ?? row.packagingVariationId}</Typography>
                  {selectedCandidate?.packagingType ? <Chip size="small" variant="outlined" label={selectedCandidate.packagingType} /> : null}
                </StackRowAlignCenter>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>
                  {selectedCandidate?.name ?? 'Bao bì đã chọn'}
                  {selectedCandidate?.productName ? ` • ${selectedCandidate.productName}` : ''}
                  {selectedCandidate?.basePriceAfterTax !== null && selectedCandidate?.basePriceAfterTax !== undefined ? ` • Giá lẻ ${selectedCandidate.basePriceAfterTax}` : ''}
                </Typography>
              </Stack>
              {!readOnly ? (
                <PermissionIconButton size="small" onClick={() => handleRemoveRow(row.localId)} disabled={disabled || saving}>
                  <Trash01 size={16} />
                </PermissionIconButton>
              ) : null}
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default ProductSpuPackagingRelationsEditor;
