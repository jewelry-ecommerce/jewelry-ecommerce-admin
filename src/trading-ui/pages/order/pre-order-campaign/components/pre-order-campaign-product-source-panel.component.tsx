import { Stack } from '@mui/material';
import { useMemo, type ChangeEvent } from 'react';
import useSWR from 'swr';
import { categoryApi, collectionApi, PreOrderProductSourceType } from '../../../../apis';
import { SelectAllInput, SelectInput } from '../../../../components/form';
import { PRE_ORDER_PRODUCT_SOURCE_OPTIONS } from '../pre-order-campaign.constants';

const UUID_LIKE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PreOrderCampaignProductSourcePanelProps = {
  productSourceType: PreOrderProductSourceType | '';
  productSourceRefs: string[];
  disabled?: boolean;
  onProductSourceTypeChange: (value: PreOrderProductSourceType | '') => void;
  onProductSourceRefsChange: (refs: string[]) => void;
  /** Clear SKU đã chọn khi đổi nguồn / thành phần nguồn. */
  onClearSelectedSkus: () => void;
};

export const PreOrderCampaignProductSourcePanel = ({
  productSourceType,
  productSourceRefs,
  disabled = false,
  onProductSourceTypeChange,
  onProductSourceRefsChange,
  onClearSelectedSkus,
}: PreOrderCampaignProductSourcePanelProps) => {
  const collectionsSwr = useSWR(
    productSourceType === PreOrderProductSourceType.COLLECTION ? (['pre-order-collections'] as const) : null,
    () => collectionApi.getCollectionList({ isPagination: false }),
    { revalidateOnFocus: false },
  );

  const categoriesSwr = useSWR(productSourceType === PreOrderProductSourceType.CATEGORY ? (['pre-order-categories'] as const) : null, () => categoryApi.getCategoryList({ isPagination: false }), {
    revalidateOnFocus: false,
  });

  const collectionOptions = useMemo(
    () => (collectionsSwr.data?.list ?? []).map((item) => ({ value: String(item.id ?? '').trim(), label: item.name })).filter((item) => UUID_LIKE_PATTERN.test(item.value)),
    [collectionsSwr.data?.list],
  );

  const categoryOptions = useMemo(
    () => (categoriesSwr.data?.list ?? []).map((item) => ({ value: String(item.id ?? '').trim(), label: item.name })).filter((item) => UUID_LIKE_PATTERN.test(item.value)),
    [categoriesSwr.data?.list],
  );

  const handleSourceTypeChange = (value: string) => {
    const next = (value || '') as PreOrderProductSourceType | '';
    onProductSourceTypeChange(next);
    onProductSourceRefsChange([]);
    onClearSelectedSkus();
  };

  const handleRefsSelectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = (e.target as EventTarget & { value: unknown }).value;
    const refs = Array.isArray(raw)
      ? raw
          .map(String)
          .map((id) => id.trim())
          .filter((id) => UUID_LIKE_PATTERN.test(id))
      : [];
    onProductSourceRefsChange(refs);
    onClearSelectedSkus();
  };

  const showRefsSelect = productSourceType === PreOrderProductSourceType.COLLECTION || productSourceType === PreOrderProductSourceType.CATEGORY;
  const refsDisabled = disabled || !showRefsSelect;
  const refsOptions = productSourceType === PreOrderProductSourceType.COLLECTION ? collectionOptions : categoryOptions;

  return (
    <Stack gap={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'flex-start' }}>
        <SelectInput
          label="Nguồn sản phẩm"
          value={productSourceType}
          onChange={(e) => handleSourceTypeChange(String(e.target.value))}
          options={PRE_ORDER_PRODUCT_SOURCE_OPTIONS}
          placeholder="Vui lòng chọn nguồn sản phẩm..."
          allowDeselect
          disabled={disabled}
          fullWidth
          sx={{ flex: 1, minWidth: 0 }}
        />
        {showRefsSelect ? (
          <SelectAllInput
            label="Chọn thành phần nguồn"
            value={productSourceRefs}
            onChange={handleRefsSelectChange}
            options={refsOptions}
            placeholder="Vui lòng chọn thành phần nguồn..."
            searchable
            searchPlaceholder="Tìm thành phần nguồn..."
            disabled={refsDisabled}
            fullWidth
            sx={{ flex: 1, minWidth: 0 }}
          />
        ) : (
          <SelectInput
            label="Chọn thành phần nguồn"
            value=""
            onChange={() => undefined}
            options={[]}
            placeholder="Vui lòng chọn thành phần nguồn..."
            disabled
            fullWidth
            sx={{ flex: 1, minWidth: 0 }}
          />
        )}
      </Stack>
    </Stack>
  );
};
