import { useCallback } from 'react';
import { Box } from '@mui/material';
import { type DraftVoucherCodeResponseDto, type PromotionDraftStatus } from '../../../../apis';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { VoucherCodeAuthoringPanel } from './voucher-code-authoring-panel.component';
import { useVoucherCodeAuthoring } from './use-voucher-code-authoring.hook';

interface VoucherCodeCardProps {
  draftId: string;
  schemaId: string;
  draftStatus: PromotionDraftStatus;
  onSaved?: (voucherCode: DraftVoucherCodeResponseDto) => void;
}

export const VoucherCodeCard = ({ draftId, schemaId, draftStatus, onSaved }: VoucherCodeCardProps) => {
  const { showSnackbar } = useSnackbar();

  const notifyError = useCallback(
    (message: string) => {
      showSnackbar({ message, type: SnackbarType.ERROR });
    },
    [showSnackbar],
  );

  const authoring = useVoucherCodeAuthoring({
    draftId,
    schemaId,
    draftStatus,
    onSaved,
    onError: notifyError,
  });

  return (
    <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: '8px', bgcolor: '#FFFFFF' }}>
      <VoucherCodeAuthoringPanel
        authoring={authoring.authoring}
        voucherCode={authoring.voucherCode}
        itemValues={authoring.itemValues}
        collectionValues={authoring.collectionValues}
        itemUiSchema={authoring.itemUiSchema}
        collectionUiSchema={authoring.collectionUiSchema}
        validationErrors={authoring.validationErrors}
        imageError={authoring.imageError}
        loading={authoring.loading}
        loadError={authoring.loadError}
        saving={authoring.saving}
        imageUploading={authoring.imageUploading}
        isEditable={authoring.isEditable}
        canAdd={authoring.canAdd}
        canRemove={authoring.canRemove}
        onItemValuesChange={authoring.updateItemValues}
        onCollectionValuesChange={authoring.updateCollectionValues}
        onPickImage={authoring.uploadVoucherImage}
        onImageFileReject={authoring.rejectVoucherImageFile}
        onClearImage={authoring.clearInputImageUrl}
        onRetryLoad={() => void authoring.reloadVoucherCode()}
      />
    </Box>
  );
};
