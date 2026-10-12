import { Box } from '@mui/material';
import { DialogComponent } from '../../../../../components/dialog';
import { FooterPreviewComponent, type FooterPreviewProps } from './footer-preview.component';

export type FooterPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
  preview: FooterPreviewProps;
};

export const FooterPreviewDialog = ({ open, onClose, preview }: FooterPreviewDialogProps) => (
  <DialogComponent
    open={open}
    onClose={onClose}
    title="Xem trước chân trang"
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
    <Box sx={{ bgcolor: '#171717', borderRadius: 1, overflow: 'hidden' }}>
      <FooterPreviewComponent {...preview} />
    </Box>
  </DialogComponent>
);
