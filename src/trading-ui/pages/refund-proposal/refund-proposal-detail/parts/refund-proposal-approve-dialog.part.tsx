import CloseRounded from '@mui/icons-material/CloseRounded';
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { Upload01 } from '@untitledui/icons';
import { useEffect, useId, useRef, useState } from 'react';
import { MediaVisibility } from '../../../../apis/file';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { TEXT_FIELD_UPLOAD_ACCEPT_PDF, UPLOAD_ACCEPT_TYPES } from '../../../../components/text-field-upload/text-field-upload.utils';

const REFUND_ATTACHMENT_ACCEPT = `${UPLOAD_ACCEPT_TYPES.image},${TEXT_FIELD_UPLOAD_ACCEPT_PDF}`;
const REFUND_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (attachmentUrl: string) => void;
}

export function RefundProposalApproveDialog({ open, submitting, onClose, onConfirm }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!open) {
      setAttachmentUrl('');
      setUploading(false);
      setUploadedFileName('');
      setUploadError('');
    }
  }, [open]);

  const validateFile = (file: File): string | null => {
    if (file.size > REFUND_ATTACHMENT_MAX_BYTES) {
      return 'Tệp tin không hợp lệ hoặc vượt quá dung lượng cho phép. Vui lòng kiểm tra lại.';
    }
    const mime = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    const allowed = mime.startsWith('image/') || mime === 'application/pdf' || /\.(jpe?g|png|pdf)$/i.test(name);
    if (!allowed) {
      return 'Tệp tin không hợp lệ hoặc vượt quá dung lượng cho phép. Vui lòng kiểm tra lại.';
    }
    return null;
  };

  const handlePickFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setAttachmentUrl('');
      setUploadedFileName('');
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadedFileName(file.name);
    try {
      const { asset } = await uploadSingleImage({
        file,
        visibility: MediaVisibility.PUBLIC,
        pathPrefix: 'refund-proposals',
      });
      const url = asset.publicUrl?.trim();
      if (!url) {
        throw new Error('Không nhận được URL tệp sau khi tải lên.');
      }
      setAttachmentUrl(url);
    } catch (e) {
      setAttachmentUrl('');
      setUploadError((e as { message?: string })?.message || 'Không tải được tệp lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDisabled = !attachmentUrl.trim() || uploading || submitting;

  return (
    <Dialog open={open} onClose={submitting || uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#101828' }}>
          Xác nhận hoàn tiền
        </Typography>
        <PermissionIconButton size="small" onClick={onClose} disabled={submitting || uploading} sx={{ color: '#667085' }}>
          <CloseRounded sx={{ fontSize: 20 }} />
        </PermissionIconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack gap={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>Đính kèm chứng từ</Typography>

          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={REFUND_ATTACHMENT_ACCEPT}
            style={{ display: 'none' }}
            disabled={submitting || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void handlePickFile(file);
            }}
          />

          <CustomButton
            fullWidth={false}
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={submitting || uploading}
            startIcon={uploading ? <CircularProgress size={16} thickness={5} sx={{ color: '#667085' }} /> : <Upload01 size={18} />}
            sx={{
              height: 40,
              px: 1.5,
              borderRadius: '10px',
              borderColor: '#D0D5DD',
              color: '#101828',
              ...TYPOGRAPHY_STYLES.base.medium,
              textTransform: 'none',
              boxShadow: 'none',
              width: 'fit-content',
              '&:hover': { bgcolor: '#F9FAFB', borderColor: '#98A2B3', boxShadow: 'none' },
            }}
          >
            Upload tệp
          </CustomButton>

          {uploadedFileName ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>{uploadedFileName}</Typography> : null}

          {uploadError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#DC2626' }}>{uploadError}</Typography> : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
        <CustomButton
          fullWidth={false}
          variant="outline"
          onClick={onClose}
          disabled={submitting || uploading}
          sx={{ height: 40, px: 2, borderColor: '#D0D5DD', borderRadius: '10px', color: '#101828' }}
        >
          Quay lại
        </CustomButton>
        <CustomButton
          fullWidth={false}
          variant="primary"
          onClick={() => onConfirm(attachmentUrl)}
          disabled={confirmDisabled}
          sx={{
            height: 40,
            px: 2,
            minWidth: 120,
            borderRadius: '10px',
            bgcolor: '#101828',
            color: '#FFFFFF',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1F2937', boxShadow: 'none' },
            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
          }}
        >
          {submitting ? (
            <Stack direction="row" spacing={1} alignItems="center" component="span">
              <CircularProgress size={16} thickness={5} sx={{ color: 'inherit' }} />
              Đang xử lý…
            </Stack>
          ) : (
            'Xác nhận'
          )}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
