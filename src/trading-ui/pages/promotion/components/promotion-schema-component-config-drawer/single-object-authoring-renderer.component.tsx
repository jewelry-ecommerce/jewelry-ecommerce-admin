import { Box, Stack, Typography } from '@mui/material';
import { isSingleObjectDefinitionV2, type SingleObjectDefinitionV2 } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import { PromotionSchemaDefinitionForm } from './promotion-schema-definition-form.component';

interface SingleObjectAuthoringRendererProps {
  definition: SingleObjectDefinitionV2 | null | unknown;
  values: Record<string, unknown>;
  validationErrors?: Record<string, string>;
  disabled?: boolean;
  arrayItemButtonPermission?: PageButtonPermissionProps;
  onValuesChange: (nextValues: Record<string, unknown>) => void;
  emptyMessage?: string;
}

const UnsupportedState = ({ message }: { message: string }) => (
  <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 2, p: 1.5 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B91C1C' }}>{message}</Typography>
  </Box>
);

/**
 * Renders a V2 SINGLE_OBJECT catalog definition.
 * Values are owned by the caller (condition/benefit flow); this renderer never fabricates selected values.
 */
export const SingleObjectAuthoringRenderer = ({
  definition,
  values,
  validationErrors = {},
  disabled = false,
  arrayItemButtonPermission,
  onValuesChange,
  emptyMessage = 'Không có schema cấu hình hợp lệ để hiển thị.',
}: SingleObjectAuthoringRendererProps) => {
  if (!isSingleObjectDefinitionV2(definition)) {
    return <UnsupportedState message="Loại editor hoặc metadata authoring không được hỗ trợ (yêu cầu SINGLE_OBJECT V2)." />;
  }

  if (!definition.configSchema || definition.configSchema.type !== 'object') {
    return <UnsupportedState message={emptyMessage} />;
  }

  return (
    <Stack spacing={1.5}>
      {definition.description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{definition.description}</Typography> : null}
      <PromotionSchemaDefinitionForm
        schema={definition.configSchema}
        value={values}
        errors={validationErrors}
        onChange={onValuesChange}
        arrayItemButtonPermission={arrayItemButtonPermission}
        disabled={disabled}
      />
    </Stack>
  );
};
