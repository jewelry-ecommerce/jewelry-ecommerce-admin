import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { AlignBottom01, File05, InfoCircle, Upload01 } from '@untitledui/icons';
import { ButtonIconContentComponent } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';
import { StackRowAlignStartJustBetween } from '../../../../components/styled/stack.style';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TextFieldUpload, TEXT_FIELD_UPLOAD_ACCEPT_EXCEL } from '../../../../components/text-field-upload/text-field-upload.component';

export interface ProductSetImportDialogProps {
  open: boolean;
  onClose: () => void;
  submitting?: boolean;
  onDownloadTemplate?: () => void;
  onStartImport?: (file: File) => Promise<void> | void;
}

export const ProductSetImportDialog = ({ open, onClose, submitting = false, onDownloadTemplate, onStartImport }: ProductSetImportDialogProps) => {
  const [fileValue, setFileValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!open) {
      setFileValue('');
      setSelectedFile(null);
      setUploadError('');
    }
  }, [open]);

  const handleStartImport = async () => {
    if (!selectedFile || submitting) return;
    await onStartImport?.(selectedFile);
  };

  const canStart = Boolean(selectedFile) && !submitting;

  return (
    <DialogComponent
      maxWidth="md"
      fullWidth
      title="Import Bộ sản phẩm từ Excel"
      icon={<Upload01 size={20} color="#fff" />}
      open={open}
      onClose={submitting ? undefined : onClose}
      sxBottom={{
        boxSizing: 'border-box',
        borderTop: '1px solid #E5E7EB',
        bgcolor: '#fff',
        pt: 3,
      }}
      buttonLeft={{
        content: 'Huỷ',
        variant: 'outlined',
        disabled: submitting,
        onClick: onClose,
      }}
      buttonRight={{
        content: submitting ? 'Đang import...' : 'Bắt đầu import',
        variant: 'contained',
        disabled: !canStart || submitting,
        onClick: () => void handleStartImport(),
      }}
    >
      <Stack gap={3}>
        {submitting && <LinearProgress sx={{ borderRadius: 1 }} />}

        <Box
          sx={{
            p: 2,
            border: '1px solid #BEDBFF',
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
          }}
        >
          <StackRowAlignStartJustBetween>
            <Box sx={{ mt: '2px', flexShrink: 0, display: 'flex' }}>
              <File05 size={20} color="#155DFC" />
            </Box>
            <Stack gap={1} sx={{ flex: 1, minWidth: 0, ml: 1.5 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1C398E' }}>File mẫu và hướng dẫn</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#1447E6' }}>Import file danh sách Bộ sản phẩm theo mẫu chuẩn định dạng .xlsx.</Typography>
              {onDownloadTemplate && (
                <ButtonIconContentComponent
                  content="Tải file mẫu (.xlsx)"
                  icon={<AlignBottom01 size={20} color="#fff" />}
                  onClick={onDownloadTemplate}
                  sx={{
                    color: '#fff',
                    backgroundColor: '#155DFC',
                    border: 'none',
                    borderRadius: '10px',
                    px: 2,
                    py: 1.25,
                    '&:hover': { backgroundColor: '#0f4fc7' },
                    width: 'max-content',
                    mt: 0.5,
                    '& .MuiTypography-root': { color: '#fff' },
                  }}
                />
              )}
            </Stack>
          </StackRowAlignStartJustBetween>
        </Box>

        <TextFieldUpload
          value={fileValue}
          onChange={(next) => {
            setUploadError('');
            setFileValue(next);
          }}
          onPickFile={async (file) => {
            setUploadError('');
            setSelectedFile(file);
            setFileValue(file.name);
          }}
          accept={TEXT_FIELD_UPLOAD_ACCEPT_EXCEL}
          error={!!uploadError}
          errorMessage={uploadError}
          onFileReject={(reason) => {
            setSelectedFile(null);
            setUploadError(reason);
            setFileValue('');
          }}
          previewMode="file"
          disabled={submitting}
          hintText="Chỉ chấp nhận file Excel (.xlsx) tối đa 25MB"
        />

        <Box
          sx={{
            p: 2,
            border: '1px solid #D5D7DA',
            borderRadius: '10px',
            bgcolor: '#F8FAFC',
          }}
        >
          <StackRowAlignStartJustBetween>
            <Box sx={{ mt: '2px', flexShrink: 0, display: 'flex' }}>
              <InfoCircle size={20} color="#155DFC" />
            </Box>
            <Stack gap={0.5} sx={{ flex: 1, minWidth: 0, ml: 1.5 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>Xử lý bất đồng bộ qua Queue</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>
                Hệ thống sẽ đẩy tác vụ vào hàng đợi để import ngầm. Dữ liệu sẽ tự động cập nhật sau khi worker hoàn tất.
              </Typography>
            </Stack>
          </StackRowAlignStartJustBetween>
        </Box>
      </Stack>
    </DialogComponent>
  );
};
