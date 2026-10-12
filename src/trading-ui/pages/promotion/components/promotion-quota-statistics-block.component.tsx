import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { Settings01 } from '@untitledui/icons';
import useSWR from 'swr';
import { promotionApi, type PromotionDraftSchemaType, type PromotionQuotaStatisticDto } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../components/styled';
import { PROMOTION_SCHEMA_TYPE_LABEL } from '../promotion.constant';
import { PromotionConfigSection } from './promotion-config-section.component';

const DANGER_COLOR = '#D92D20';
const EMPTY_STATE = { icon: <Settings01 size={40} color="#98A2B3" />, title: '', description: '' };

const formatQuotaCount = (value: number): string => value.toLocaleString('vi-VN');

const resolveSchemaTypeLabel = (schemaType: string): string => PROMOTION_SCHEMA_TYPE_LABEL[schemaType as PromotionDraftSchemaType] ?? schemaType;

const QuotaMetric = ({ label, value, emphasizeDanger }: { label: string; value: number; emphasizeDanger?: boolean }) => (
  <Stack gap={0.25} sx={{ minWidth: 0, flex: 1 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>{label}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: emphasizeDanger ? DANGER_COLOR : '#101828' }}>{formatQuotaCount(value)}</Typography>
  </Stack>
);

const QuotaStatisticCard = ({ item }: { item: PromotionQuotaStatisticDto }) => (
  <Box
    sx={{
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      bgcolor: '#FFFFFF',
      p: 2,
    }}
  >
    <Stack gap={1.5}>
      <StackRowAlignCenterJustBetween sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{item.schemaName}</Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.25,
            py: 0.5,
            borderRadius: '8px',
            bgcolor: '#EFF4FF',
            border: '1px solid #B2DDFF',
          }}
        >
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#175CD3' }}>{resolveSchemaTypeLabel(item.schemaType)}</Typography>
        </Box>
      </StackRowAlignCenterJustBetween>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        <QuotaMetric label="Tổng" value={item.total} />
        <QuotaMetric label="Đã dùng" value={item.committed} />
        <QuotaMetric label="Đang giữ" value={item.held} />
        <QuotaMetric label="Còn lại" value={item.available} emphasizeDanger={item.available === 0} />
      </Box>
    </Stack>
  </Box>
);

interface PromotionQuotaStatisticsBlockProps {
  promotionId: string;
  enabled: boolean;
}

export const PromotionQuotaStatisticsBlock = ({ promotionId, enabled }: PromotionQuotaStatisticsBlockProps) => {
  const { data, error, isLoading } = useSWR(
    enabled && promotionId ? (['promotion-quota-statistics', promotionId] as const) : null,
    ([, id]: readonly [string, string]) => promotionApi.getPublishedPromotionQuotaStatistics(id),
    { revalidateOnFocus: false },
  );

  if (!enabled) return null;

  if (isLoading) {
    return (
      <Box id="promotion-section-quota">
        <PromotionConfigSection id="quota" title="Thống kê quota" action={null} isEmpty={false} emptyState={EMPTY_STATE}>
          <StackRowAlignCenter gap={1}>
            <CircularProgress size={16} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Đang tải thống kê quota...</Typography>
          </StackRowAlignCenter>
        </PromotionConfigSection>
      </Box>
    );
  }

  if (error || !data?.quotaStatistics?.length) {
    return (
      <Box id="promotion-section-quota">
        <PromotionConfigSection
          id="quota"
          title="Thống kê quota"
          action={null}
          isEmpty
          emptyState={{
            ...EMPTY_STATE,
            title: 'Chưa có thống kê quota',
            description: 'Chưa có dữ liệu quota cho chương trình này.',
          }}
        >
          {null}
        </PromotionConfigSection>
      </Box>
    );
  }

  return (
    <Box id="promotion-section-quota">
      <PromotionConfigSection id="quota" title="Thống kê quota" action={null} isEmpty={false} emptyState={EMPTY_STATE}>
        <Stack gap={1.5}>
          {data.quotaStatistics.map((item) => (
            <QuotaStatisticCard key={`${item.schemaId}:${item.quotaPolicyId}`} item={item} />
          ))}
        </Stack>
      </PromotionConfigSection>
    </Box>
  );
};
