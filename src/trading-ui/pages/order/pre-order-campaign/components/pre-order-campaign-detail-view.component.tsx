import { Box, Stack, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import useSWR from 'swr';
import { preOrderCampaignApi, type PreOrderCampaign, type PreOrderCampaignBadgeTemplate } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDateTime } from '../../../../common/utils';
import { formLabelSx } from '../../../../components/form/form-field.styles';
import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';
import { StackRowAlignCenter } from '../../../../components/styled';
import { getPreOrderCampaignStatusLabel } from '../pre-order-campaign.constants';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

const SectionCard = ({ title, children }: SectionCardProps) => (
  <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2.5, gap: 2 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{title}</Typography>
    {children}
  </Stack>
);

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <Stack gap={0.75} sx={{ minWidth: 0, flex: 1 }}>
    <Typography sx={formLabelSx}>{label}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{value || '—'}</Typography>
  </Stack>
);

const AppliedLabelBadge = ({ template }: { template: PreOrderCampaignBadgeTemplate | null }) => {
  if (!template) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Chưa gắn label</Typography>;
  }

  const text = template.displayText?.trim() || template.name;
  const textColor = template.styleConfig?.textColor || '#FFFFFF';
  const backgroundColor = template.styleConfig?.backgroundColor || '#EC4899';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1.5,
        py: 0.75,
        borderRadius: '6px',
        bgcolor: backgroundColor,
        color: textColor,
        ...TYPOGRAPHY_STYLES.sm.semibold,
        width: 'fit-content',
      }}
    >
      {text}
    </Box>
  );
};

export type PreOrderCampaignDetailViewProps = {
  campaign: PreOrderCampaign;
};

export const PreOrderCampaignDetailView = ({ campaign }: PreOrderCampaignDetailViewProps) => {
  const expectedStockAt = campaign.expectedStockAt ?? campaign.expectedAvailableAt ?? null;

  const badgeTemplatesSwr = useSWR(['pre-order-campaign-badge-templates'] as const, () => preOrderCampaignApi.getPreOrderCampaignBadgeTemplates(), {
    revalidateOnFocus: false,
  });

  const selectedTemplate = useMemo(() => {
    const id = campaign.badgeTemplateId;
    if (!id) return null;
    return (badgeTemplatesSwr.data?.list ?? []).find((item) => item.id === id) ?? null;
  }, [badgeTemplatesSwr.data?.list, campaign.badgeTemplateId]);

  const skus = campaign.skus ?? [];

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Stack sx={{ p: 2, pb: 2, overflow: 'auto', flex: 1, minHeight: 0 }}>
        <SectionCard title="Thông tin chung">
          <ReadOnlyField label="Tên chiến dịch" value={campaign.name} />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <ReadOnlyField label="Thời gian bắt đầu" value={formatDateTime(campaign.startAt)} />
            <ReadOnlyField label="Thời gian kết thúc" value={formatDateTime(campaign.endAt)} />
          </Stack>
          <Box sx={{ maxWidth: { sm: '50%' } }}>
            <ReadOnlyField label="Thời gian mở bán dự kiến" value={expectedStockAt ? formatDateTime(expectedStockAt) : '—'} />
          </Box>
        </SectionCard>

        <SectionCard title="Cấu hình Label - Tích hợp CMS">
          <Stack gap={0.75}>
            <Typography sx={formLabelSx}>Label áp dụng</Typography>
            <AppliedLabelBadge template={selectedTemplate} />
          </Stack>
        </SectionCard>

        <SectionCard title="Danh sách biến thể áp dụng đặt trước">
          {skus.length === 0 ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Chưa có biến thể nào được áp dụng.</Typography>
          ) : (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
              {skus.map((sku) => (
                <StackRowAlignCenter
                  key={sku.id ?? sku.skuCode}
                  gap={1.5}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #F3F4F6',
                    '&:last-of-type': { borderBottom: 0 },
                  }}
                >
                  <Box component="img" src={sku.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="" sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', bgcolor: '#F3F4F6', flexShrink: 0 }} />
                  <Stack sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }} noWrap>
                      {sku.productName || sku.skuCode}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }} noWrap>
                      SKU: {sku.skuCode}
                    </Typography>
                  </Stack>
                </StackRowAlignCenter>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Stack>

      <Box sx={{ px: 3, pb: 3, pt: 1, flexShrink: 0, bgcolor: '#F9FAFB' }}>
        <HighlightStatusToggle label="Kích hoạt chiến dịch" checked={Boolean(campaign.isActive)} disabled activeLabel="Kích hoạt" inactiveLabel="Vô hiệu hoá" />
      </Box>
    </Stack>
  );
};

/** Prefer BE `statusLabel`, fallback local map. */
export const resolvePreOrderCampaignStatusDisplay = (campaign: PreOrderCampaign): string => campaign.statusLabel?.trim() || getPreOrderCampaignStatusLabel(campaign.status);
