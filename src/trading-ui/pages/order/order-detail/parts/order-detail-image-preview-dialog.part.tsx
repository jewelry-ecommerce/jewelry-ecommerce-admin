import { Box, Dialog, DialogContent } from '@mui/material';

export interface OrderDetailImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function OrderDetailImagePreviewDialog({ imageUrl, onClose }: OrderDetailImagePreviewDialogProps) {
  return (
    <Dialog open={Boolean(imageUrl)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0, bgcolor: '#000' }}>
        {imageUrl ? <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', height: 'auto', display: 'block', maxHeight: '85vh', objectFit: 'contain' }} /> : null}
      </DialogContent>
    </Dialog>
  );
}
