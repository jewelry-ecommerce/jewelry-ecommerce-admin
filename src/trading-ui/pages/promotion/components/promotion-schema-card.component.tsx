import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import { PromotionDraftSchemaType, type DraftVoucherCodeResponseDto, type PromotionDraftSchema, type PromotionDraftSchemaComponentsResponseDto } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { formatDateTime } from '../../../common/utils';
import { PermissionIconButton } from '../../../components/button';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../components/styled';
import { formatBenefitSummary, formatConditionSummary } from './promotion-schema-component-config-drawer';
import { promotionListButtonPermission } from '../promotion-permission.constants';
import { PROMOTION_SCHEMA_DISPLAY_STATUS_TAG, PROMOTION_SCHEMA_STATUS_TAG, PROMOTION_SCHEMA_TYPE_LABEL, canUnpublishPromotionSchema, formatPromotionCostSources } from '../promotion.constant';
import { TagCommonComponent } from '../../../components/tag';

interface PromotionSchemaCardProps {
  schema: PromotionDraftSchema;
  schemaComponents?: PromotionDraftSchemaComponentsResponseDto;
  voucherCode?: DraftVoucherCodeResponseDto | null;
  isEditable: boolean;
  isFocused: boolean;
  isDeleting: boolean;
  isUnpublishing?: boolean;
  showUnpublishAction?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUnpublish?: () => void;
}

const META_CHIP_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  px: 1.25,
  py: 0.5,
  borderRadius: '8px',
  bgcolor: '#EFF4FF',
  border: '1px solid #B2DDFF',
} as const;

interface SchemaConfigBlockProps {
  title: string;
  icon: ReactNode;
  summary: string;
}

const formatTimeWindow = (startsAt?: string | null, endsAt?: string | null): string => `${formatDateTime(startsAt)} - ${formatDateTime(endsAt)}`;

const SchemaConfigBlock = ({ title, icon, summary }: SchemaConfigBlockProps) => {
  const isConfigured = summary !== 'Chưa cấu hình';

  return (
    <Stack
      sx={{
        gap: 1,
      }}
    >
      <StackRowAlignCenter gap={0.75}>
        {icon}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#344054' }}>{title}</Typography>
      </StackRowAlignCenter>

      <Typography
        sx={{
          ...TYPOGRAPHY_STYLES.base.regular,
          color: isConfigured ? '#475467' : '#98A2B3',
          fontStyle: isConfigured ? 'normal' : 'italic',
          flex: 1,
          overflowWrap: 'break-word',
        }}
      >
        {summary}
      </Typography>
    </Stack>
  );
};

export const PromotionSchemaCard = ({
  schema,
  schemaComponents,
  voucherCode,
  isEditable,
  isFocused,
  isDeleting,
  isUnpublishing = false,
  showUnpublishAction = false,
  onEdit,
  onDelete,
  onUnpublish,
}: PromotionSchemaCardProps) => {
  const statusTag = schema.displayStatus != null ? PROMOTION_SCHEMA_DISPLAY_STATUS_TAG[schema.displayStatus] : PROMOTION_SCHEMA_STATUS_TAG[schema.status];
  const canUnpublish = showUnpublishAction && canUnpublishPromotionSchema(schema);
  const conditionSummary = formatConditionSummary(schemaComponents?.condition);
  const benefitSummary = formatBenefitSummary(schemaComponents?.benefit);
  const hasCondition = ![PromotionDraftSchemaType.MARKDOWN, PromotionDraftSchemaType.FLAT_PRICE].includes(schema.schemaType);
  const isVoucher = schema.schemaType === PromotionDraftSchemaType.VOUCHER;
  const releaseWindow = isVoucher ? formatTimeWindow(voucherCode?.issuanceStartsAt, voucherCode?.issuanceEndsAt) : formatTimeWindow(schema.effectiveStartsAt, schema.effectiveEndsAt);
  const applyWindow = isVoucher ? formatTimeWindow(voucherCode?.usageStartsAt, voucherCode?.usageEndsAt) : formatTimeWindow(schema.schemaStartsAt, schema.schemaEndsAt);

  return (
    <Box
      id={`promotion-schema-${schema.id}`}
      tabIndex={-1}
      sx={{
        width: '100%',
        gap: 1.5,
        display: 'flex',
        flexDirection: 'column',
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto',
        borderRadius: '8px',
        outline: isFocused ? '2px solid #2E90FA' : 'none',
        outlineOffset: 2,
        border: '1px solid #E5E7EB',
        p: 2,
      }}
    >
      <StackRowAlignCenterJustBetween>
        <StackRowAlignCenter>
          <Box sx={{ ...META_CHIP_SX, alignSelf: 'flex-start' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#175CD3' }}>{PROMOTION_SCHEMA_TYPE_LABEL[schema.schemaType] ?? schema.schemaType}</Typography>
          </Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{schema.name}</Typography>
        </StackRowAlignCenter>
        {isEditable || canUnpublish ? (
          <StackRow gap={0.5} sx={{ flexShrink: 0 }}>
            {isEditable ? (
              <>
                <PermissionIconButton
                  size="small"
                  onClick={onEdit}
                  {...promotionListButtonPermission('edit', 'Sửa hình thức khuyến mãi', 'api_promotion_draft_update')}
                  sx={{ color: '#667085', borderRadius: '6px', border: '1px solid #E5E7EB', '&:hover': { bgcolor: '#F3F4F6', color: '#101828' } }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </PermissionIconButton>
                <PermissionIconButton
                  size="small"
                  onClick={onDelete}
                  disabled={isDeleting}
                  {...promotionListButtonPermission('delete', 'Xóa bản nháp', 'api_promotion_draft_delete')}
                  sx={{ color: '#F04438', borderRadius: '6px', border: '1px solid #FECDD3', '&:hover': { bgcolor: '#FEF2F2' } }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                </PermissionIconButton>
              </>
            ) : null}
            {canUnpublish ? (
              <PermissionIconButton
                size="small"
                onClick={onUnpublish}
                disabled={isUnpublishing}
                {...promotionListButtonPermission('unpublish_schema', 'Dừng hình thức khuyến mãi', ['api_promotion_post_promotions_id_schemas_schemaid_unpublish', 'api_promotion_schema_unpublish'])}
                sx={{ color: '#B54708', borderRadius: '6px', border: '1px solid #FECDCA', '&:hover': { bgcolor: '#FFFAEB' } }}
              >
                <StopCircleOutlinedIcon sx={{ fontSize: 16 }} />
              </PermissionIconButton>
            ) : null}
          </StackRow>
        ) : null}
      </StackRowAlignCenterJustBetween>
      <StackRowAlignCenter>
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.base.semibold,
            px: 1,
            borderRadius: '6px',
            bgcolor: statusTag.bg,
            color: statusTag.color,
            width: 'fit-content',
          }}
        >
          {statusTag.text}
        </Typography>
        <TagCommonComponent content={PROMOTION_SCHEMA_STATUS_TAG[schema.status]?.text} />
      </StackRowAlignCenter>
      {schema.description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Mô tả: {schema.description}</Typography> : null}
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Nguồn chi phí: {formatPromotionCostSources(schema.costSources)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Thời gian phát hành: {releaseWindow}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Thời gian áp dụng: {applyWindow}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {hasCondition ? <SchemaConfigBlock title="Điều kiện" icon={<RuleOutlinedIcon sx={{ fontSize: 16, color: '#667085' }} />} summary={conditionSummary} /> : null}
        <SchemaConfigBlock title="Ưu đãi" icon={<LocalOfferOutlinedIcon sx={{ fontSize: 16, color: '#667085' }} />} summary={benefitSummary} />
      </Box>
    </Box>
  );
};
