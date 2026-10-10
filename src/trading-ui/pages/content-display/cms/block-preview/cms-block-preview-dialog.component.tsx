import { Box } from '@mui/material';
import { DialogComponent } from '../../../../components/dialog/dialog.component';
import { CmsBlockPreview } from './cms-block-preview.component';

export type CmsBlockPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  blockCode: string;
  blockName: string;
};

export const CmsBlockPreviewDialog = ({ open, onClose, blockCode, blockName }: CmsBlockPreviewDialogProps) => (
  <DialogComponent
    open={open}
    onClose={onClose}
    title={`Xem trước: ${blockName}`}
    maxWidth={false}
    fullWidth
    PaperProps={{
      sx: {
        width: 'min(1280px, 96vw)',
        maxWidth: '96vw',
      },
    }}
    buttonRight={{
      content: 'Đóng',
      variant: 'contained',
      onClick: onClose,
    }}
  >
    <Box sx={{ bgcolor: '#fff', borderRadius: 1, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
      <CmsBlockPreview blockCode={blockCode} />
    </Box>
  </DialogComponent>
);
