import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import useSWR from 'swr';
import { OrderType } from '@/trading-ui/adapters/library';
import { Box, Button, ButtonBase, Checkbox, CircularProgress, FormControlLabel, IconButton, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import {
  productSkuSearchApi,
  promotionApi,
  PromotionScope,
  RUNTIME_EVALUATE_REASON_CODE,
  type CandidateLookupKeyDto,
  type CandidateResultResponseDto,
  type RuntimeEvaluateLineDto,
  type RuntimeEvaluateRequestDto,
  type RuntimeEvaluateResponseDto,
  type RuntimeCandidateEvaluationResultDto,
  type SchemaEvaluationResultDto,
  type LineAdjustmentResultDto,
  type SelectedLineAdjustmentDto,
  type RejectedLineAdjustmentDto,
  type RuntimeSelectionResultDto,
  type WmsSkuSearchListItem,
} from '../../../../apis';
import { resolveWmsSkuDisplayName, resolveWmsSkuImageUrl, resolveWmsSkuPriceMinor } from '../../../../apis/product/sku-search.util';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { DialogComponent } from '../../../../components/dialog';
import { QuantityNumberSpinner, SearchInput, SelectInput, TextDateInput, TextInput } from '../../../../components/form';
import { StackAlignJustCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween, StackRowAlignEnd, StackRowJustEnd, StackRowWrap } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import {
  computeLineSubtotal,
  formatMinorAmount,
  formatVnd,
  getReasonCodeLabel,
  getSchemaTypeLabel,
  getScopeLabel,
  isSuccessCode,
  parseMinorInput,
  sumLinesSubtotal,
} from './promotion-simulation.helpers';

export interface RuntimeEvaluateState {
  result: RuntimeEvaluateResponseDto | null;
  error: string | null;
  evaluating: boolean;
  isValid: boolean;
}

export interface RuntimeEvaluatePanelProps {
  variant?: 'inline' | 'sandbox';
  onEvaluateStateChange?: (state: RuntimeEvaluateState) => void;
}

interface RuntimeSimulationLine extends RuntimeEvaluateLineDto {
  readonly skuCode?: string;
  readonly skuName?: string;
  readonly skuImageUrl?: string | null;
  readonly categoryNames?: readonly string[];
  readonly collectionNames?: readonly string[];
}

interface SimulationSkuPick {
  readonly skuId: string;
  readonly skuCode: string;
  readonly skuName: string;
  readonly imageUrl: string | null;
  readonly priceMinor: string;
  readonly categoryIds: readonly string[];
  readonly categoryNames: readonly string[];
  readonly collectionIds: readonly string[];
  readonly collectionNames: readonly string[];
}

type LineEditableField = 'quantity' | 'unitPriceMinor' | 'categoryIds' | 'collectionIds' | 'hasExistingPromotion' | 'hasExistingDiscount';

const SCOPES_DEFAULT = PromotionScope.SKU_ITEM;
const QUANTITY_MAX = 999_999;
const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

const SCOPE_OPTIONS = [PromotionScope.SKU_ITEM, PromotionScope.LINE_ITEM, PromotionScope.CART, PromotionScope.SHIPPING, PromotionScope.PAYMENT, PromotionScope.BUNDLE].map((value) => ({
  value,
  label: getScopeLabel(value),
}));

const ACTION_BUTTON_SX = {
  textTransform: 'none',
  bgcolor: '#101828',
  boxShadow: 'none',
  color: '#FFFFFF',
  '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' },
  '&:disabled': { bgcolor: '#D0D5DD', color: '#98A2B3' },
};

const SECONDARY_BUTTON_SX = {
  textTransform: 'none',
  color: '#344054',
  borderColor: '#D0D5DD',
};

const SECTION_SX = {
  p: 2,
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  bgcolor: '#FFFFFF',
};

const MUTED_SECTION_SX = {
  ...SECTION_SX,
  bgcolor: '#FCFCFD',
};

const FormRow = ({ children }: { children: ReactNode }) => (
  <StackRowWrap gap={1.5} sx={{ alignItems: 'flex-start' }}>
    {children}
  </StackRowWrap>
);

const FormCell = ({ children, minWidth = 260, flex = '1 1 0' }: { children: ReactNode; minWidth?: number; flex?: string }) => (
  <Stack sx={{ flex, minWidth: { xs: '100%', sm: minWidth }, maxWidth: '100%' }}>{children}</Stack>
);

const StatRow = ({ children }: { children: ReactNode }) => (
  <StackRowWrap gap={1.5} sx={{ alignItems: 'stretch' }}>
    {children}
  </StackRowWrap>
);

const createEmptyLine = (index: number): RuntimeSimulationLine => ({
  lineId: `line-${Date.now()}-${index}`,
  skuId: '',
  quantity: 1,
  unitPriceMinor: '0',
  lineSubtotalMinor: '0',
  categoryIds: [],
  collectionIds: [],
});

const parseCsv = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const nonEmptyString = (value: string | null | undefined): string | null => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

const resolveCategoryIds = (item: WmsSkuSearchListItem): string[] => {
  const direct = item.categoryIds?.map((id) => nonEmptyString(id)).filter((id): id is string => Boolean(id)) ?? [];
  const productCategory = nonEmptyString(item.product?.categoryId);
  return direct.length > 0 ? direct : productCategory ? [productCategory] : [];
};

const resolveCollectionIds = (item: WmsSkuSearchListItem): string[] => {
  const direct = item.collectionIds?.map((id) => nonEmptyString(id)).filter((id): id is string => Boolean(id)) ?? [];
  if (direct.length > 0) return direct;
  return item.collections?.map((collection) => nonEmptyString(collection.id)).filter((id): id is string => Boolean(id)) ?? [];
};

const resolveCollectionNames = (item: WmsSkuSearchListItem): string[] => item.collections?.map((collection) => nonEmptyString(collection.name)).filter((name): name is string => Boolean(name)) ?? [];

const mapSkuToPick = (item: WmsSkuSearchListItem): SimulationSkuPick | null => {
  const skuId = nonEmptyString(item.id);
  const skuCode = nonEmptyString(item.skuCode);
  if (!skuId || !skuCode) return null;

  const categoryName = nonEmptyString(item.product?.categoryName);
  const skuName = resolveWmsSkuDisplayName(item, skuCode);

  return {
    skuId,
    skuCode,
    skuName,
    imageUrl: resolveWmsSkuImageUrl(item),
    priceMinor: resolveWmsSkuPriceMinor(item),
    categoryIds: resolveCategoryIds(item),
    categoryNames: categoryName ? [categoryName] : [],
    collectionIds: resolveCollectionIds(item),
    collectionNames: resolveCollectionNames(item),
  };
};

const deriveCartLineSubtotal = (line: RuntimeEvaluateLineDto): string => computeLineSubtotal(Math.max(1, line.quantity), line.unitPriceMinor);

const buildRuntimeLine = (line: RuntimeSimulationLine): RuntimeEvaluateLineDto => ({
  lineId: line.lineId,
  skuId: line.skuId,
  quantity: Number(line.quantity),
  unitPriceMinor: String(line.unitPriceMinor),
  lineSubtotalMinor: String(deriveCartLineSubtotal(line)),
  categoryIds: [...line.categoryIds],
  collectionIds: [...line.collectionIds],
  hasExistingPromotion: line.hasExistingPromotion,
  hasExistingDiscount: line.hasExistingDiscount,
});

const StatusBadge = ({ status }: { status: 'APPLICABLE' | 'REJECTED' }) => (
  <Box
    component="span"
    sx={{
      fontSize: 11,
      fontWeight: 600,
      lineHeight: '18px',
      px: 1,
      borderRadius: '6px',
      flexShrink: 0,
      bgcolor: status === 'APPLICABLE' ? '#ECFDF3' : '#FFFBFA',
      color: status === 'APPLICABLE' ? '#027A48' : '#B42318',
      border: '1px solid',
      borderColor: status === 'APPLICABLE' ? '#ABEFC6' : '#FECDCA',
    }}
  >
    {status === 'APPLICABLE' ? 'Có thể áp dụng' : 'Bị loại'}
  </Box>
);

const ReasonCodeTag = ({ code, compact = false }: { code: string; compact?: boolean }) => {
  const success = isSuccessCode(code);
  return (
    <Box
      component="span"
      title={code}
      sx={{
        fontSize: 11,
        lineHeight: '18px',
        px: compact ? 0.75 : 1,
        borderRadius: '4px',
        bgcolor: success ? '#ECFDF3' : '#FFFBFA',
        color: success ? '#027A48' : '#B42318',
        border: '1px solid',
        borderColor: success ? '#ABEFC6' : '#FECDCA',
        whiteSpace: 'normal',
      }}
    >
      {getReasonCodeLabel(code)}
    </Box>
  );
};

interface MiniStatProps {
  label: string;
  value: string | number;
  highlight?: 'success' | 'error' | 'neutral';
}

const MiniStat = ({ label, value, highlight = 'neutral' }: MiniStatProps) => {
  const bgColor = highlight === 'success' ? '#F6FEF9' : highlight === 'error' ? '#FFFBFA' : '#F9FAFB';
  const borderColor = highlight === 'success' ? '#ABEFC6' : highlight === 'error' ? '#FECDCA' : '#E5E7EB';
  const valueColor = highlight === 'success' ? '#039855' : highlight === 'error' ? '#B42318' : '#101828';
  return (
    <Paper elevation={0} sx={{ flex: '1 1 180px', minWidth: 160, p: 1.5, borderRadius: '8px', bgcolor: bgColor, border: '1px solid', borderColor, textAlign: 'center' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].semibold, color: valueColor }}>{value}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>{label}</Typography>
    </Paper>
  );
};

interface SkuPickerDialogProps {
  open: boolean;
  currentSkuId?: string;
  onClose: () => void;
  onSelect: (sku: SimulationSkuPick) => void;
}

const SkuPickerDialog = ({ open, currentSkuId, onClose, onSelect }: SkuPickerDialogProps) => {
  if (!open) return null;
  return <SkuPickerDialogContent currentSkuId={currentSkuId} onClose={onClose} onSelect={onSelect} />;
};

const SkuPickerDialogContent = ({ currentSkuId, onClose, onSelect }: Omit<SkuPickerDialogProps, 'open'>) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSWR(
    ['promotion-runtime-admin-sku-list', search] as const,
    () =>
      productSkuSearchApi.getAdminSkus({
        orderType: OrderType.DESC,
        orderBy: 'updatedAt',
        search: search.trim() || undefined,
        isPagination: false,
      }),
    { revalidateOnFocus: false },
  );

  const rows = useMemo(() => data?.list ?? [], [data?.list]);
  const handleSelect = useCallback(
    (item: WmsSkuSearchListItem) => {
      const mapped = mapSkuToPick(item);
      if (!mapped) return;
      onSelect(mapped);
      onClose();
    },
    [onClose, onSelect],
  );

  return (
    <DialogComponent open onClose={onClose} title="Chọn biến thể giả lập" maxWidth="md" buttonLeft={{ content: 'Đóng', variant: 'outlined', onClick: onClose }}>
      <Stack gap={2} sx={{ maxHeight: 'min(68vh, 620px)' }}>
        <SearchInput debounceMs={320} placeholder="Tìm theo tên sản phẩm, mã biến thể, mã vạch..." onDebouncedChange={setSearch} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <Stack sx={{ overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: 2 }}>
          {isLoading ? (
            <StackAlignJustCenter sx={{ py: 4 }}>
              <CircularProgress size={20} />
            </StackAlignJustCenter>
          ) : rows.length === 0 ? (
            <StackAlignJustCenter sx={{ py: 4 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Không tìm thấy biến thể phù hợp.</Typography>
            </StackAlignJustCenter>
          ) : (
            rows.map((item) => <SkuPickerRow key={item.id} item={item} selected={String(item.id) === currentSkuId} onSelect={handleSelect} />)
          )}
        </Stack>
      </Stack>
    </DialogComponent>
  );
};

const SkuPickerRow = ({ item, selected, onSelect }: { item: WmsSkuSearchListItem; selected: boolean; onSelect: (item: WmsSkuSearchListItem) => void }) => {
  const mapped = mapSkuToPick(item);
  const selectable = Boolean(mapped);
  const stock = typeof item.stock === 'number' ? item.stock : Number(item.stock ?? 0);
  const stockKnown = Number.isFinite(stock);
  const imageUrl = mapped?.imageUrl || productDefaultImageSrc;

  return (
    <ButtonBase
      disabled={!selectable}
      onClick={() => onSelect(item)}
      sx={{
        width: '100%',
        display: 'block',
        borderBottom: '1px solid #F3F4F6',
        bgcolor: selected ? '#F0F9FF' : '#FFFFFF',
        cursor: selectable ? 'pointer' : 'not-allowed',
        p: 1.5,
        textAlign: 'left',
        '&:hover': selectable ? { bgcolor: '#F9FAFB' } : undefined,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <StackRowAlignCenter gap={1.5} sx={{ width: '100%' }}>
        <Box component="img" src={imageUrl} alt="" sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'contain', bgcolor: '#F3F4F6' }} />
        <Stack sx={{ minWidth: 0, gap: 0.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }} noWrap>
            {mapped?.skuName ?? item.name}
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }} noWrap>
            Mã biến thể: {mapped?.skuCode ?? item.skuCode}
          </Typography>
          {mapped?.categoryNames.length ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }} noWrap>
              Danh mục: {mapped.categoryNames.join(', ')}
            </Typography>
          ) : null}
        </Stack>
        <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0, ml: 'auto' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{formatVnd(mapped?.priceMinor ?? '0')}</Typography>
          {stockKnown ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: stock <= 0 ? '#B42318' : '#027A48' }}>{stock <= 0 ? 'Hết hàng' : `Còn ${stock}`}</Typography> : null}
        </Stack>
      </StackRowAlignCenter>
    </ButtonBase>
  );
};

interface CartLineRowProps {
  line: RuntimeSimulationLine;
  index: number;
  onChange: (index: number, field: LineEditableField, value: number | string | boolean | string[]) => void;
  onOpenSkuPicker: (index: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const CartLineRow = ({ line, index, onChange, onOpenSkuPicker, onRemove, canRemove }: CartLineRowProps) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
      <Stack gap={1.5}>
        <StackRowAlignCenterJustBetween sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Dòng hàng {index + 1}</Typography>
          {canRemove ? (
            <IconButton size="small" onClick={() => onRemove(index)} sx={{ color: '#F04438', borderRadius: '6px', border: '1px solid #FECDDA' }}>
              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          ) : null}
        </StackRowAlignCenterJustBetween>

        <Stack gap={1.25}>
          <Stack gap={0.5}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#667085' }}>Sản phẩm / biến thể *</Typography>
            <StackRowAlignCenter gap={1.25} sx={{ p: 1.25, borderRadius: '8px', border: '1px solid #D0D5DD', bgcolor: '#F9FAFB', minHeight: 72 }}>
              <Box
                component="img"
                src={line.skuImageUrl || productDefaultImageSrc}
                alt=""
                sx={{ width: 52, height: 52, borderRadius: '8px', objectFit: 'contain', bgcolor: '#F3F4F6', flexShrink: 0 }}
              />
              <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: line.skuName ? '#101828' : '#98A2B3' }} noWrap>
                  {line.skuName || 'Chưa chọn biến thể'}
                </Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }} noWrap>
                  {line.skuCode ? `Mã biến thể: ${line.skuCode}` : 'Chọn từ danh sách biến thể'}
                </Typography>
              </Stack>
              <Button size="small" variant="outlined" onClick={() => onOpenSkuPicker(index)} sx={{ ...SECONDARY_BUTTON_SX, flexShrink: 0, minWidth: 96 }}>
                Chọn biến thể
              </Button>
            </StackRowAlignCenter>
          </Stack>

          <StackRowAlignEnd gap={1.25} sx={{ flexWrap: 'wrap' }}>
            <Stack gap={0.5} sx={{ flex: '0 0 132px', minWidth: 132 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#667085' }}>Số lượng *</Typography>
              <QuantityNumberSpinner value={line.quantity} min={1} max={QUANTITY_MAX} onCommit={(next) => onChange(index, 'quantity', next)} />
            </Stack>

            <Stack gap={0.5} sx={{ flex: '1 1 220px', minWidth: { xs: '100%', sm: 220 } }}>
              <TextInput
                label="Đơn giá giả lập (VND)"
                requiredMark
                value={formatMinorAmount(line.unitPriceMinor)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(index, 'unitPriceMinor', parseMinorInput(e.target.value))}
                size="small"
              />
            </Stack>

            <Stack gap={0.5} sx={{ flex: '1 1 180px', minWidth: { xs: '100%', sm: 180 } }}>
              <TextInput label="Tạm tính" value={formatVnd(deriveCartLineSubtotal(line))} disabled size="small" />
            </Stack>
          </StackRowAlignEnd>
        </Stack>

        <StackRowWrap gap={1.5}>
          <FormControlLabel
            control={<Checkbox size="small" checked={line.hasExistingPromotion ?? false} onChange={(_, checked) => onChange(index, 'hasExistingPromotion', checked)} />}
            label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Dòng này đã có khuyến mãi</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={line.hasExistingDiscount ?? false} onChange={(_, checked) => onChange(index, 'hasExistingDiscount', checked)} />}
            label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Dòng này đã có chiết khấu</Typography>}
          />
        </StackRowWrap>

        <Box sx={{ borderTop: '1px solid #F2F4F7', pt: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowTechnicalDetails((prev) => !prev)}
            startIcon={showTechnicalDetails ? <UnfoldLessOutlinedIcon sx={{ fontSize: 16 }} /> : <UnfoldMoreOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', color: '#475467', px: 0 }}
          >
            {showTechnicalDetails ? 'Ẩn chi tiết kỹ thuật dòng hàng' : 'Chi tiết kỹ thuật dòng hàng'}
          </Button>
          {showTechnicalDetails ? (
            <Box sx={{ mt: 1 }}>
              <FormRow>
                <FormCell minWidth={180}>
                  <TechField label="lineId" value={line.lineId} disabled />
                </FormCell>
                <FormCell minWidth={180}>
                  <TechField label="skuId" value={line.skuId || 'Chưa có SKU'} disabled />
                </FormCell>
                <FormCell minWidth={180}>
                  <TechField label="categoryIds" value={line.categoryIds.join(',')} placeholder="Tự map từ SKU nếu API có" onChange={(value) => onChange(index, 'categoryIds', parseCsv(value))} />
                </FormCell>
                <FormCell minWidth={180}>
                  <TechField
                    label="collectionIds"
                    value={line.collectionIds.join(',')}
                    placeholder="Tự map từ SKU nếu API có"
                    onChange={(value) => onChange(index, 'collectionIds', parseCsv(value))}
                  />
                </FormCell>
              </FormRow>
            </Box>
          ) : null}
          {showTechnicalDetails && (line.categoryNames?.length || line.collectionNames?.length) ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.75 }}>Dữ liệu đã map: {[...(line.categoryNames ?? []), ...(line.collectionNames ?? [])].join(', ')}</Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
};

const TechField = ({ label, value, placeholder, disabled, onChange }: { label: string; value: string; placeholder?: string; disabled?: boolean; onChange?: (value: string) => void }) => (
  <Stack gap={0.25}>
    <TextInput label={label} value={value} disabled={disabled} placeholder={placeholder} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)} size="small" />
  </Stack>
);

const CandidateRow = ({ candidate }: { candidate: CandidateResultResponseDto }) => (
  <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
    <Stack gap={0.75}>
      <StackRowAlignCenterJustBetween>
        <Stack gap={0.25} sx={{ minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getSchemaTypeLabel(candidate.schemaType)}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', overflowWrap: 'anywhere' }}>Schema: {candidate.promotionSchemaId}</Typography>
        </Stack>
        <ReasonCodeTag code={candidate.reasonCode} compact />
      </StackRowAlignCenterJustBetween>
      <StackRowWrap gap={0.75}>
        <Box sx={{ flex: '1 1 120px' }}>
          <SmallMeta label="Phạm vi" value={getScopeLabel(candidate.scope)} />
        </Box>
        <Box sx={{ flex: '1 1 120px' }}>
          <SmallMeta label="Ưu tiên" value={String(candidate.priority)} />
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <SmallMeta label="Promotion" value={candidate.promotionId} />
        </Box>
        <Box sx={{ flex: '1 1 180px' }}>
          <SmallMeta label="Snapshot" value={candidate.promotionSnapshotId} />
        </Box>
      </StackRowWrap>
      <MatchedKeyList keys={candidate.matchedKeys} />
    </Stack>
  </Box>
);

const SmallMeta = ({ label, value }: { label: string; value: string }) => (
  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', overflowWrap: 'anywhere' }}>
    {label}:{' '}
    <Box component="span" sx={{ color: '#101828', fontWeight: 500, fontSize: 11 }}>
      {value}
    </Box>
  </Typography>
);

const MatchedKeyList = ({ keys }: { keys: readonly CandidateLookupKeyDto[] }) => (
  <Box sx={{ pt: 0.5, borderTop: '1px solid #F2F4F7' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#667085' }}>Khóa tra cứu khớp:</Typography>
    <StackRowWrap gap={0.5} sx={{ mt: 0.25 }}>
      {keys.map((key, index) => (
        <Box
          key={`${key.keyType}-${key.keyValue}-${index}`}
          component="span"
          sx={{ fontSize: 11, lineHeight: '18px', px: 0.75, borderRadius: '4px', bgcolor: '#F0F9FF', color: '#026AA2', border: '1px solid #B9E6FE' }}
        >
          {key.keyType}={key.keyValue}
          {key.lineId ? ` (${key.lineId})` : ''}
        </Box>
      ))}
    </StackRowWrap>
  </Box>
);

const LineAdjustmentCard = ({ adjustment }: { adjustment: LineAdjustmentResultDto }) => (
  <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Dòng: {adjustment.lineId}</Typography>
    <StackRowWrap gap={0.5} sx={{ mt: 0.5 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', flex: '1 1 160px' }}>Mã biến thể: {adjustment.skuId}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', flex: '1 1 80px' }}>SL: {adjustment.quantity}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', flex: '1 1 160px' }}>Đơn giá: {formatVnd(adjustment.unitPriceMinor)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', flex: '1 1 160px' }}>Tạm tính: {formatVnd(adjustment.lineSubtotalMinor)}</Typography>
    </StackRowWrap>
    <Box sx={{ mt: 0.75, p: 0.75, borderRadius: '4px', bgcolor: '#F6FEF9', border: '1px solid #ABEFC6' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#039855' }}>Chiết khấu ước tính: -{formatVnd(adjustment.discountAmountMinor)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Tạm tính sau chiết khấu: {formatVnd(adjustment.effectiveLineSubtotalMinor)}</Typography>
      <ReasonTags codes={adjustment.reasonCodes} />
    </Box>
  </Box>
);

const ReasonTags = ({ codes }: { codes: readonly string[] }) =>
  codes.length > 0 ? (
    <StackRowWrap gap={0.5} sx={{ mt: 0.5 }}>
      {codes.map((code, index) => (
        <ReasonCodeTag key={`${code}-${index}`} code={code} compact />
      ))}
    </StackRowWrap>
  ) : null;

const SchemaEvalCard = ({ schema }: { schema: SchemaEvaluationResultDto }) => (
  <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
    <Stack gap={1}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Schema: {getSchemaTypeLabel(schema.schemaType)}</Typography>
        <StackRowWrap gap={1} sx={{ alignItems: 'center' }}>
          <StatusMini passed={schema.conditionPassed} passText="Điều kiện: OK" failText="Điều kiện: Không đạt" />
          <StatusMini passed={schema.benefitPassed} passText="Quyền lợi: Có" failText="Quyền lợi: Không" />
        </StackRowWrap>
      </StackRowAlignCenterJustBetween>
      {schema.lineAdjustments.length > 0 ? (
        <Stack gap={0.75}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Chiết khấu dòng</Typography>
          {schema.lineAdjustments.map((adj) => (
            <LineAdjustmentCard key={adj.lineId} adjustment={adj} />
          ))}
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#039855', textAlign: 'right' }}>Tổng chiết khấu schema: {formatVnd(schema.totalDiscountAmountMinor)}</Typography>
        </Stack>
      ) : (
        <ReasonTags codes={[schema.conditionReasonCode, ...schema.benefitReasonCodes]} />
      )}
    </Stack>
  </Box>
);

const StatusMini = ({ passed, passText, failText }: { passed: boolean; passText: string; failText: string }) => (
  <Box component="span" sx={{ fontSize: 11, fontWeight: 600, px: 0.75, borderRadius: '4px', bgcolor: passed ? '#ECFDF3' : '#FFFBFA', color: passed ? '#027A48' : '#B42318' }}>
    {passed ? passText : failText}
  </Box>
);

const SelectedAdjustmentCard = ({ adjustment }: { adjustment: SelectedLineAdjustmentDto }) => (
  <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#F6FEF9', border: '1px solid #ABEFC6' }}>
    <Stack gap={0.75}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#039855' }}>Dòng: {adjustment.lineId}</Typography>
        <ReasonCodeTag code={RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_SELECTED} compact />
      </StackRowAlignCenterJustBetween>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Mã biến thể: {adjustment.skuId}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#039855' }}>Chiết khấu được chọn: -{formatVnd(adjustment.discountAmountMinor)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3', overflowWrap: 'anywhere' }}>Schema: {adjustment.promotionSchemaId}</Typography>
    </Stack>
  </Box>
);

const RejectedAdjustmentCard = ({ adjustment }: { adjustment: RejectedLineAdjustmentDto }) => (
  <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#FFFBFA', border: '1px solid #FECDCA' }}>
    <Stack gap={0.75}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#B42318' }}>Dòng: {adjustment.lineId}</Typography>
      <ReasonTags codes={adjustment.reasonCodes} />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Mã biến thể: {adjustment.skuId}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B42318' }}>Chiết khấu không được chọn: {formatVnd(adjustment.discountAmountMinor)}</Typography>
    </Stack>
  </Box>
);

const SelectionSummary = ({ selection }: { selection: RuntimeSelectionResultDto }) => (
  <StatRow>
    <MiniStat label="Ưu đãi được chọn" value={selection.selectedAdjustmentCount} highlight={selection.selectedAdjustmentCount > 0 ? 'success' : 'neutral'} />
    <MiniStat label="Bị loại do tương thích" value={selection.rejectedAdjustmentCount} highlight={selection.rejectedAdjustmentCount > 0 ? 'error' : 'neutral'} />
    <MiniStat
      label="Tổng giảm đã chọn"
      value={formatVnd(selection.totalSelectedDiscountAmountMinor || '0')}
      highlight={parseInt(selection.totalSelectedDiscountAmountMinor || '0', 10) > 0 ? 'success' : 'neutral'}
    />
  </StatRow>
);

const FriendlyEvaluationCard = ({ evaluation }: { evaluation: RuntimeCandidateEvaluationResultDto }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: '8px',
      border: '1px solid',
      borderColor: evaluation.status === 'APPLICABLE' ? '#ABEFC6' : '#FECDCA',
      bgcolor: evaluation.status === 'APPLICABLE' ? '#F6FEF9' : '#FFFBFA',
    }}
  >
    <Stack gap={1}>
      <StackRowAlignCenterJustBetween>
        <Stack sx={{ minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getSchemaTypeLabel(evaluation.schemaType)}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
            {getScopeLabel(evaluation.scope)} · Chiết khấu ước tính {formatVnd(evaluation.totalDiscountAmountMinor)}
          </Typography>
        </Stack>
        <StatusBadge status={evaluation.status} />
      </StackRowAlignCenterJustBetween>
      <ReasonTags codes={evaluation.status === 'APPLICABLE' ? [RUNTIME_EVALUATE_REASON_CODE.LINE_ADJUSTMENT_SELECTED] : evaluation.reasonCodes} />
    </Stack>
  </Box>
);

const EvaluationCard = ({ evaluation }: { evaluation: RuntimeCandidateEvaluationResultDto }) => (
  <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid', borderColor: evaluation.status === 'APPLICABLE' ? '#ABEFC6' : '#FECDCA', bgcolor: '#FFFFFF' }}>
    <Stack gap={1.5}>
      <StackRowAlignCenterJustBetween>
        <Stack gap={0.25}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>{getSchemaTypeLabel(evaluation.schemaType)}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', overflowWrap: 'anywhere' }}>Schema: {evaluation.promotionSchemaId}</Typography>
        </Stack>
        <StatusBadge status={evaluation.status} />
      </StackRowAlignCenterJustBetween>
      <ReasonTags codes={evaluation.reasonCodes} />
      <EvaluationStage label="Đối tượng khách hàng" passed={evaluation.audience.passed} codes={[evaluation.audience.reasonCode]} />
      <EvaluationStage
        label={`Phạm vi sản phẩm: ${evaluation.target.eligibleLineIds.length} dòng phù hợp`}
        passed={evaluation.target.eligibleLineIds.length > 0}
        codes={evaluation.target.reasonCodes}
      />
      {evaluation.schemas.length > 0 ? (
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>Đánh giá schema</Typography>
          {evaluation.schemas.map((schema) => (
            <SchemaEvalCard key={schema.promotionSchemaId} schema={schema} />
          ))}
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', textAlign: 'right' }}>Tổng chiết khấu: {formatVnd(evaluation.totalDiscountAmountMinor)}</Typography>
        </Stack>
      ) : null}
      {evaluation.matchedKeys.length > 0 ? <MatchedKeyList keys={evaluation.matchedKeys} /> : null}
    </Stack>
  </Box>
);

const EvaluationStage = ({ label, passed, codes }: { label: string; passed: boolean; codes: readonly string[] }) => (
  <Box sx={{ p: 1, borderRadius: '6px', bgcolor: passed ? '#F6FEF9' : '#FFFBFA', border: '1px solid', borderColor: passed ? '#ABEFC6' : '#FECDCA' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>{label}</Typography>
    <ReasonTags codes={codes} />
  </Box>
);

export const RuntimeEvaluatePanel = ({ variant = 'inline', onEvaluateStateChange }: RuntimeEvaluatePanelProps = {}) => {
  const { showSnackbar } = useSnackbar();
  const isSandbox = variant === 'sandbox';

  const [scope, setScope] = useState<PromotionScope>(SCOPES_DEFAULT);
  const [evaluatedAt, setEvaluatedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [customerMode, setCustomerMode] = useState<'guest' | 'logged-in'>('guest');
  const [customerId, setCustomerId] = useState('');
  const [segmentIdsText, setSegmentIdsText] = useState('');
  const [cartId, setCartId] = useState('');
  const [lines, setLines] = useState<RuntimeSimulationLine[]>([createEmptyLine(0)]);
  const [skuPickerLineIndex, setSkuPickerLineIndex] = useState<number | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<RuntimeEvaluateResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLineChange = useCallback((index: number, field: LineEditableField, value: number | string | boolean | string[]) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const changed = { ...line, [field]: value };
        if (field !== 'quantity' && field !== 'unitPriceMinor') return changed;
        return { ...changed, lineSubtotalMinor: deriveCartLineSubtotal(changed) };
      }),
    );
  }, []);

  const handleAddLine = useCallback(() => setLines((prev) => [...prev, createEmptyLine(prev.length)]), []);
  const handleRemoveLine = useCallback((index: number) => setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)), []);

  const handleSelectSku = useCallback(
    (sku: SimulationSkuPick) => {
      setLines((prev) =>
        prev.map((line, index) => {
          if (index !== skuPickerLineIndex) return line;
          const nextPrice = sku.priceMinor !== '0' ? sku.priceMinor : line.unitPriceMinor;
          const changed: RuntimeSimulationLine = {
            ...line,
            skuId: sku.skuId,
            skuCode: sku.skuCode,
            skuName: sku.skuName,
            skuImageUrl: sku.imageUrl,
            unitPriceMinor: nextPrice,
            categoryIds: [...sku.categoryIds],
            categoryNames: [...sku.categoryNames],
            collectionIds: [...sku.collectionIds],
            collectionNames: [...sku.collectionNames],
          };
          return { ...changed, lineSubtotalMinor: deriveCartLineSubtotal(changed) };
        }),
      );
    },
    [skuPickerLineIndex],
  );

  const requestPayload: RuntimeEvaluateRequestDto | null = useMemo(() => {
    const invalidLine = lines.some((line) => !line.lineId || !line.skuId || line.quantity < 1);
    if (invalidLine) return null;

    return {
      scopes: [scope],
      evaluatedAt: evaluatedAt ? new Date(evaluatedAt).toISOString() : new Date().toISOString(),
      customer: {
        customerId: customerMode === 'logged-in' ? customerId.trim() || null : null,
        segmentIds: parseCsv(segmentIdsText),
      },
      cart: {
        cartId: cartId.trim() || null,
        currency: 'VND',
      },
      lines: lines.map(buildRuntimeLine),
    };
  }, [scope, evaluatedAt, customerId, segmentIdsText, cartId, lines, customerMode]);

  const handleEvaluate = useCallback(async () => {
    if (!requestPayload) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Vui lòng chọn biến thể và nhập số lượng hợp lệ cho từng dòng hàng.' });
      return;
    }

    setEvaluating(true);
    setError(null);
    setResult(null);
    setShowDebug(false);

    try {
      const response = await promotionApi.evaluateRuntime(requestPayload);
      setResult(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể kết nối đến server.';
      setError(message);
      showSnackbar({ type: SnackbarType.ERROR, message });
    } finally {
      setEvaluating(false);
    }
  }, [requestPayload, showSnackbar]);

  const evaluations = result?.evaluations ?? [];
  const applicableEvals = evaluations.filter((e) => e.status === 'APPLICABLE');
  const rejectedEvals = evaluations.filter((e) => e.status === 'REJECTED');
  const selection = result?.selection ?? null;
  const simulatedSubtotal = useMemo(() => String(sumLinesSubtotal(lines)), [lines]);
  const selectedDiscount = selection?.totalSelectedDiscountAmountMinor ?? '0';
  const afterDiscountVal = BigInt(simulatedSubtotal) - BigInt(selectedDiscount);
  const afterDiscountStr = afterDiscountVal <= 0n ? '0' : afterDiscountVal.toString();
  const affectedLineIds = selection ? [...new Set([...selection.selectedLineAdjustments.map((a) => a.lineId), ...selection.rejectedLineAdjustments.map((a) => a.lineId)])] : [];
  const currentPickerLine = skuPickerLineIndex === null ? undefined : lines[skuPickerLineIndex];
  const simulationIsValid = Boolean(result) && !error && afterDiscountVal >= 0n && lines.some((line) => line.skuId);

  useEffect(() => {
    onEvaluateStateChange?.({
      result,
      error,
      evaluating,
      isValid: simulationIsValid,
    });
  }, [error, evaluating, onEvaluateStateChange, result, simulationIsValid]);

  const panelSx = isSandbox
    ? { borderRadius: '10px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    : { borderRadius: '8px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflow: 'hidden' };

  const formScrollSx = isSandbox ? { flex: 1, minHeight: 0, overflowY: 'auto' } : undefined;

  return (
    <Paper elevation={0} sx={panelSx}>
      <StackRowAlignCenterJustBetween sx={{ gap: 2, p: 2, borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
        <Stack gap={0.5} sx={{ minWidth: 260, flex: '1 1 420px' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>{isSandbox ? 'Giỏ hàng & tính giá' : 'Giả lập khuyến mãi'}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>
            {isSandbox ? 'Nhập đúng payload gửi lên API evaluate runtime: phạm vi, khách hàng, giỏ hàng và dòng hàng.' : 'Chọn sản phẩm, nhập số lượng và giá bán để kiểm tra ưu đãi có thể áp dụng.'}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<PlayArrowOutlinedIcon sx={{ fontSize: 18 }} />}
          disabled={evaluating || !requestPayload}
          onClick={() => void handleEvaluate()}
          sx={{ ...ACTION_BUTTON_SX, minWidth: 148, flexShrink: 0 }}
        >
          {evaluating ? 'Đang giả lập...' : 'Giả lập ngay'}
        </Button>
      </StackRowAlignCenterJustBetween>

      <Stack gap={2} sx={{ p: 2, ...formScrollSx }}>
        <Stack gap={1.5} sx={MUTED_SECTION_SX}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Thông tin giả lập</Typography>
          <FormRow>
            <FormCell>
              <SelectInput label="Phạm vi kiểm tra" requiredMark value={scope} onChange={(e) => setScope(e.target.value as PromotionScope)} options={SCOPE_OPTIONS} />
            </FormCell>
            <FormCell>
              <TextDateInput label="Thời điểm đánh giá" requiredMark value={evaluatedAt} onChange={setEvaluatedAt} mode="dateTime" placeholder="Chọn thời điểm đánh giá" />
            </FormCell>
          </FormRow>
        </Stack>

        <Stack gap={1.5} sx={MUTED_SECTION_SX}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Khách hàng</Typography>
          <RadioGroup row value={customerMode} onChange={(_, value) => setCustomerMode(value as 'guest' | 'logged-in')} sx={{ gap: 1 }}>
            <FormControlLabel value="guest" control={<Radio size="small" />} label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Khách vãng lai</Typography>} />
            <FormControlLabel value="logged-in" control={<Radio size="small" />} label={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>Khách đã đăng nhập</Typography>} />
          </RadioGroup>
          <FormRow>
            <FormCell minWidth={220}>
              <TextInput
                label="Mã khách hàng"
                value={customerMode === 'guest' ? '' : customerId}
                disabled={customerMode === 'guest'}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerId(e.target.value)}
                placeholder={customerMode === 'guest' ? 'Khách vãng lai' : 'Nhập mã khách hàng'}
                size="small"
              />
            </FormCell>
            <FormCell minWidth={220}>
              <TextInput
                label="Phân khúc khách hàng"
                value={segmentIdsText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSegmentIdsText(e.target.value)}
                placeholder="Nhập nếu cần kiểm tra phân khúc"
                size="small"
              />
            </FormCell>
            <FormCell minWidth={220}>
              <TextInput label="Mã giỏ hàng" value={cartId} onChange={(e: ChangeEvent<HTMLInputElement>) => setCartId(e.target.value)} placeholder="Tự đặt hoặc để trống" size="small" />
            </FormCell>
          </FormRow>
        </Stack>

        <Stack gap={1.5} sx={SECTION_SX}>
          <StackRowAlignCenterJustBetween sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Giỏ hàng giả lập</Typography>
            <Button size="small" variant="outlined" startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />} onClick={handleAddLine} sx={{ ...SECONDARY_BUTTON_SX, flexShrink: 0 }}>
              Thêm dòng hàng
            </Button>
          </StackRowAlignCenterJustBetween>
          <Stack gap={1}>
            {lines.map((line, index) => (
              <CartLineRow key={line.lineId} line={line} index={index} onChange={handleLineChange} onOpenSkuPicker={setSkuPickerLineIndex} onRemove={handleRemoveLine} canRemove={lines.length > 1} />
            ))}
          </Stack>
          <StackRowJustEnd gap={2} sx={{ px: 0.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>
              Tổng tạm tính giả lập:{' '}
              <Box component="span" sx={{ fontWeight: 600, color: '#101828' }}>
                {formatVnd(simulatedSubtotal)}
              </Box>
            </Typography>
          </StackRowJustEnd>
        </Stack>

        <Stack gap={0.5}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowRawJson((prev) => !prev)}
            startIcon={showRawJson ? <UnfoldLessOutlinedIcon sx={{ fontSize: 16 }} /> : <UnfoldMoreOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', color: '#475467', justifyContent: 'flex-start', alignSelf: 'flex-start' }}
          >
            {showRawJson ? 'Ẩn JSON yêu cầu' : 'Chi tiết kỹ thuật: JSON yêu cầu'}
          </Button>
          {showRawJson && requestPayload ? <JsonBox value={requestPayload} /> : null}
        </Stack>

        {error ? (
          <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#FFFBFA', border: '1px solid #FECDCA' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#B42318' }}>Lỗi</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#B42318' }}>{error}</Typography>
          </Box>
        ) : null}

        {result ? (
          <Stack gap={2.5}>
            <Stack gap={1.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Kết quả giả lập</Typography>
              <StatRow>
                <MiniStat label="Tổng tạm tính" value={formatVnd(simulatedSubtotal)} highlight={parseInt(simulatedSubtotal, 10) > 0 ? 'success' : 'neutral'} />
                <MiniStat label="Tổng giảm giá" value={`-${formatVnd(selectedDiscount)}`} highlight={parseInt(selectedDiscount, 10) > 0 ? 'success' : 'neutral'} />
                <MiniStat label="Tổng sau giảm" value={formatVnd(afterDiscountStr)} highlight={parseInt(afterDiscountStr, 10) > 0 ? 'success' : 'neutral'} />
              </StatRow>
              <StatRow>
                <MiniStat label="Ưu đãi tìm thấy" value={result.candidates.length} highlight={result.candidates.length > 0 ? 'success' : 'neutral'} />
                <MiniStat label="Có thể áp dụng" value={applicableEvals.length} highlight={applicableEvals.length > 0 ? 'success' : 'neutral'} />
                <MiniStat label="Bị loại" value={rejectedEvals.length} highlight={rejectedEvals.length > 0 ? 'error' : 'neutral'} />
                <MiniStat label="Dòng bị ảnh hưởng" value={affectedLineIds.length} highlight={affectedLineIds.length > 0 ? 'success' : 'neutral'} />
              </StatRow>
            </Stack>

            <Stack gap={1.25}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Ưu đãi áp dụng được</Typography>
              {applicableEvals.length > 0 ? (
                applicableEvals.map((ev) => <FriendlyEvaluationCard key={`friendly-ok-${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} />)
              ) : (
                <EmptyResult text="Không có ưu đãi nào áp dụng được với giỏ hàng giả lập này." />
              )}
            </Stack>

            <Stack gap={1.25}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Ưu đãi bị loại</Typography>
              {rejectedEvals.length > 0 ? (
                rejectedEvals.map((ev) => <FriendlyEvaluationCard key={`friendly-rejected-${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} />)
              ) : (
                <EmptyResult text="Không có ưu đãi bị loại." />
              )}
            </Stack>

            <Button
              size="small"
              variant="text"
              onClick={() => setShowDebug((prev) => !prev)}
              startIcon={showDebug ? <UnfoldLessOutlinedIcon sx={{ fontSize: 16 }} /> : <UnfoldMoreOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', color: '#475467', alignSelf: 'flex-start' }}
            >
              {showDebug ? 'Ẩn chi tiết kỹ thuật' : 'Xem chi tiết kỹ thuật'}
            </Button>

            {showDebug ? <RuntimeDebugDetails result={result} evaluations={evaluations} applicableEvals={applicableEvals} rejectedEvals={rejectedEvals} /> : null}
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Đánh giá lúc: {new Date(result.evaluatedAt).toLocaleString('vi-VN')}</Typography>
          </Stack>
        ) : null}
      </Stack>

      <SkuPickerDialog open={skuPickerLineIndex !== null} currentSkuId={currentPickerLine?.skuId} onClose={() => setSkuPickerLineIndex(null)} onSelect={handleSelectSku} />
    </Paper>
  );
};

const EmptyResult = ({ text }: { text: string }) => (
  <Box sx={{ p: 2, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', textAlign: 'center' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{text}</Typography>
  </Box>
);

const JsonBox = ({ value }: { value: RuntimeEvaluateRequestDto }) => (
  <Box
    component="pre"
    sx={{
      p: 1.5,
      borderRadius: '6px',
      bgcolor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      fontSize: 12,
      lineHeight: 1.5,
      overflow: 'auto',
      maxHeight: 300,
      color: '#344054',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    }}
  >
    {JSON.stringify(value, null, 2)}
  </Box>
);

interface RuntimeDebugDetailsProps {
  result: RuntimeEvaluateResponseDto;
  evaluations: readonly RuntimeCandidateEvaluationResultDto[];
  applicableEvals: readonly RuntimeCandidateEvaluationResultDto[];
  rejectedEvals: readonly RuntimeCandidateEvaluationResultDto[];
}

const RuntimeDebugDetails = ({ result, evaluations, applicableEvals, rejectedEvals }: RuntimeDebugDetailsProps) => (
  <Stack gap={2}>
    <Stack gap={1.5}>
      <Stack gap={0.5}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Tra cứu candidate</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Danh sách candidate tìm thấy từ index lookup dựa trên target và thời gian.</Typography>
      </Stack>
      <StatRow>
        <MiniStat label="Khóa tra cứu" value={result.explain.totalLookupKeys} />
        <MiniStat label="Candidate khớp" value={result.explain.matchedCandidateCount} highlight={result.explain.matchedCandidateCount > 0 ? 'success' : 'error'} />
        <MiniStat label="Candidate trùng" value={result.explain.dedupedCandidateCount} />
      </StatRow>
      <ReasonTags codes={result.explain.reasonCodes} />
      {result.candidates.length > 0 ? (
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#344054' }}>Candidate ({result.candidates.length})</Typography>
          {result.candidates.map((candidate) => (
            <CandidateRow key={`${candidate.promotionSchemaId}-${candidate.promotionSnapshotId}`} candidate={candidate} />
          ))}
        </Stack>
      ) : (
        <EmptyResult text="Không tìm thấy candidate nào." />
      )}
    </Stack>

    {evaluations.length > 0 ? (
      <Stack gap={1.5}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Đánh giá & chiết khấu</Typography>
        <StatRow>
          <MiniStat label="Đã đánh giá" value={result.explain.evaluatedCandidateCount} highlight={result.explain.evaluatedCandidateCount > 0 ? 'success' : 'error'} />
          <MiniStat label="Có thể áp dụng" value={result.explain.applicableCandidateCount} highlight={result.explain.applicableCandidateCount > 0 ? 'success' : 'neutral'} />
          <MiniStat label="Bị loại" value={result.explain.rejectedCandidateCount} highlight={result.explain.rejectedCandidateCount > 0 ? 'error' : 'neutral'} />
          <MiniStat label="Tổng chiết khấu" value={formatVnd(result.explain.totalDiscountAmountMinor || '0')} />
        </StatRow>
        {applicableEvals.length > 0 ? (
          <Stack gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#039855' }}>Có thể áp dụng ({applicableEvals.length})</Typography>
            {applicableEvals.map((ev) => (
              <EvaluationCard key={`${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} />
            ))}
          </Stack>
        ) : null}
        {rejectedEvals.length > 0 ? (
          <Stack gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#B42318' }}>Bị loại ({rejectedEvals.length})</Typography>
            {rejectedEvals.map((ev) => (
              <EvaluationCard key={`rejected-${ev.promotionSchemaId}-${ev.promotionSnapshotId}`} evaluation={ev} />
            ))}
          </Stack>
        ) : null}
      </Stack>
    ) : null}

    {result.selection ? (
      <Stack gap={1.5}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Chọn ưu đãi thắng</Typography>
        <SelectionSummary selection={result.selection} />
        {result.selection.selectedLineAdjustments.length > 0 ? (
          <Stack gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#039855' }}>Ưu đãi được chọn ({result.selection.selectedAdjustmentCount})</Typography>
            {result.selection.selectedLineAdjustments.map((adj, index) => (
              <SelectedAdjustmentCard key={`sel-${adj.lineId}-${adj.promotionSchemaId}-${index}`} adjustment={adj} />
            ))}
          </Stack>
        ) : (
          <EmptyResult text="Không có ưu đãi được chọn." />
        )}
        {result.selection.rejectedLineAdjustments.length > 0 ? (
          <Stack gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#B42318' }}>Ưu đãi bị loại do tương thích ({result.selection.rejectedAdjustmentCount})</Typography>
            {result.selection.rejectedLineAdjustments.map((adj, index) => (
              <RejectedAdjustmentCard key={`rej-${adj.lineId}-${adj.promotionSchemaId}-${index}`} adjustment={adj} />
            ))}
          </Stack>
        ) : (
          <EmptyResult text="Không có ưu đãi bị loại do tương thích." />
        )}
      </Stack>
    ) : null}
  </Stack>
);
