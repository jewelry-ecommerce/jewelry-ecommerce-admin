import { Box, Stack, Typography } from '@mui/material';
import type { CollectionAuthoringV2, DraftVoucherCodeResponseDto, PromotionAuthoringUiSchema } from '../../../../apis';
import { CustomButton } from '../../../../components/button';
import { CollectionAuthoringRenderer } from '../promotion-schema-component-config-drawer/collection-authoring-renderer.component';

interface VoucherCodeAuthoringPanelProps {
  authoring: CollectionAuthoringV2 | null;
  voucherCode: DraftVoucherCodeResponseDto | null;
  itemValues: Record<string, unknown>;
  collectionValues: Record<string, unknown>;
  itemUiSchema?: PromotionAuthoringUiSchema | null;
  collectionUiSchema?: PromotionAuthoringUiSchema | null;
  validationErrors: Record<string, string>;
  imageError: string | null;
  loading: boolean;
  loadError: string | null;
  saving: boolean;
  imageUploading: boolean;
  isEditable: boolean;
  canAdd?: boolean;
  canRemove?: boolean;
  onItemValuesChange: (nextValues: Record<string, unknown>) => void;
  onCollectionValuesChange: (nextValues: Record<string, unknown>) => void;
  onPickImage: (file: File) => Promise<void>;
  onImageFileReject: (reason: string) => void;
  onClearImage: () => void;
  onRetryLoad: () => void;
}

export const VoucherCodeAuthoringPanel = ({
  authoring,
  voucherCode,
  itemValues,
  collectionValues,
  itemUiSchema = null,
  collectionUiSchema = null,
  validationErrors,
  imageError,
  loading,
  loadError,
  saving,
  imageUploading,
  isEditable,
  canAdd = false,
  canRemove = false,
  onItemValuesChange,
  onCollectionValuesChange,
  onPickImage,
  onImageFileReject,
  onClearImage,
  onRetryLoad,
}: VoucherCodeAuthoringPanelProps) => {
  const formDisabled = !isEditable || saving || imageUploading;

  if (loading) {
    return (
      <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
        <Typography sx={{ fontSize: 13, color: '#98A2B3' }}>Đang tải...</Typography>
      </Box>
    );
  }

  if (loadError && !voucherCode && !authoring) {
    return (
      <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
        <Stack spacing={1.5}>
          <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '8px', p: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: '#B91C1C' }}>{loadError}</Typography>
          </Box>
          <Box>
            <CustomButton fullWidth={false} variant="outline" onClick={onRetryLoad} sx={{ textTransform: 'none', color: '#344054', borderColor: '#D0D5DD', minWidth: 112 }}>
              Thử lại
            </CustomButton>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
      <CollectionAuthoringRenderer
        authoring={authoring}
        collectionValues={collectionValues}
        itemValues={itemValues}
        itemUiSchema={itemUiSchema}
        collectionUiSchema={collectionUiSchema}
        validationErrors={validationErrors}
        disabled={formDisabled}
        showAddAction={canAdd}
        showRemoveAction={canRemove}
        onCollectionValuesChange={onCollectionValuesChange}
        onItemValuesChange={onItemValuesChange}
        imageUpload={
          isEditable
            ? {
                uploading: imageUploading,
                error: imageError,
                onPick: onPickImage,
                onReject: onImageFileReject,
                onClear: onClearImage,
              }
            : undefined
        }
      />
    </Box>
  );
};
