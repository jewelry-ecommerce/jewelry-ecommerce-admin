import type { ReactNode } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { type CampaignSchemaSummaryResponseDto } from '../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { PROMOTION_SCHEMA_TYPE_SHORT_LABEL, PROMOTION_SCHEMA_TYPE_LABEL } from '../promotion.constant';

const MAX_VISIBLE_SCHEMA_TYPES = 3;

const buildSchemaTypeDisplay = (schemas: readonly CampaignSchemaSummaryResponseDto[]): string => {
  const shortLabels = schemas.map((schema) => PROMOTION_SCHEMA_TYPE_SHORT_LABEL[schema.schemaType] ?? schema.schemaType);
  const visibleLabels = shortLabels.slice(0, MAX_VISIBLE_SCHEMA_TYPES);
  const remainingCount = shortLabels.length - visibleLabels.length;

  if (remainingCount > 0) {
    return `${visibleLabels.join(', ')} +${remainingCount}`;
  }

  return visibleLabels.join(', ');
};

const buildSchemaTooltip = (schemas: readonly CampaignSchemaSummaryResponseDto[]): ReactNode => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.25 }}>
    {schemas.map((schema, index) => (
      <Typography key={`${schema.name}-${index}`} sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#000000' }}>
        Schema {index + 1}: {PROMOTION_SCHEMA_TYPE_LABEL[schema.schemaType] ?? schema.schemaType} - {schema.benefitSummary}
      </Typography>
    ))}
  </Box>
);

interface PromotionSchemaListCellProps {
  schemas: readonly CampaignSchemaSummaryResponseDto[];
}

export const PromotionSchemaListCell = ({ schemas }: PromotionSchemaListCellProps) => {
  if (schemas.length === 0) {
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8' }}>—</Typography>;
  }

  const displayText = buildSchemaTypeDisplay(schemas);

  return (
    <Tooltip title={buildSchemaTooltip(schemas)} placement="top" arrow>
      <Box component="span" sx={{ display: 'inline-block', maxWidth: '100%', minWidth: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#000000' }} noWrap>
          {displayText}
        </Typography>
      </Box>
    </Tooltip>
  );
};
