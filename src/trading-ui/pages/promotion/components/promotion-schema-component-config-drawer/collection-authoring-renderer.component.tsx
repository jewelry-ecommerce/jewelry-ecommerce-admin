import { Box, Stack, Typography } from '@mui/material';
import { isCollectionAuthoringV2, type CollectionAuthoringV2 } from '../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PromotionSchemaDefinitionForm, type SchemaDefinitionImageUploadHandlers } from './promotion-schema-definition-form.component';

interface CollectionAuthoringRendererProps {
  authoring: CollectionAuthoringV2 | null | unknown;
  collectionValues: Record<string, unknown>;
  itemValues: Record<string, unknown>;
  validationErrors?: Record<string, string>;
  disabled?: boolean;
  imageUpload?: SchemaDefinitionImageUploadHandlers;
  itemUiSchema?: CollectionAuthoringV2['item']['uiSchema'] | null;
  collectionUiSchema?: CollectionAuthoringV2['collection']['uiSchema'] | null;
  onCollectionValuesChange: (nextValues: Record<string, unknown>) => void;
  onItemValuesChange: (nextValues: Record<string, unknown>) => void;
  onAddItem?: () => void;
  onRemoveActiveItem?: () => void;
  showAddAction?: boolean;
  showRemoveAction?: boolean;
}

const UnsupportedState = ({ message }: { message: string }) => (
  <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 2, p: 1.5 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B91C1C' }}>{message}</Typography>
  </Box>
);

export const CollectionAuthoringRenderer = ({
  authoring,
  collectionValues,
  itemValues,
  validationErrors = {},
  disabled = false,
  imageUpload,
  itemUiSchema = null,
  collectionUiSchema = null,
  onCollectionValuesChange,
  onItemValuesChange,
}: CollectionAuthoringRendererProps) => {
  if (!isCollectionAuthoringV2(authoring)) {
    return <UnsupportedState message="Loại editor hoặc metadata authoring không được hỗ trợ (yêu cầu COLLECTION V2)." />;
  }

  const collectionSchema = authoring.collection.schema;
  const itemSchema = authoring.item.schema;
  const formDisabled = disabled || !authoring.capabilities.canEdit;
  const resolvedItemUiSchema = itemUiSchema ?? authoring.item.uiSchema;
  const resolvedCollectionUiSchema = collectionUiSchema ?? authoring.collection.uiSchema;

  return (
    <Stack>
      <PromotionSchemaDefinitionForm schema={itemSchema} value={itemValues} errors={validationErrors} onChange={onItemValuesChange} uiSchema={resolvedItemUiSchema} disabled={formDisabled} />
      <PromotionSchemaDefinitionForm
        schema={collectionSchema}
        value={collectionValues}
        onChange={onCollectionValuesChange}
        uiSchema={resolvedCollectionUiSchema}
        disabled={formDisabled}
        imageUpload={imageUpload}
      />
    </Stack>
  );
};
