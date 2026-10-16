import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { isJavaBackend } from '@/common/config/app.config';
import { useEffect, useState } from 'react';
import { File05, AlignBottom01, Upload01, InfoCircle } from '@untitledui/icons';
import { ButtonIconContentComponent } from '../../../../components/button';
import { DialogComponent } from '../../../../components/dialog';
import { StackRowAlignStartJustBetween } from '../../../../components/styled/stack.style';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { TextFieldUpload, TEXT_FIELD_UPLOAD_ACCEPT_EXCEL } from '../../../../components/text-field-upload/text-field-upload.component';

const IMPORT_ACCEPT_EXCEL_CSV = `${TEXT_FIELD_UPLOAD_ACCEPT_EXCEL},text/csv,.csv`;

const ProductSpuImportStatsCard = ({
  label,
  description,
  onDownloadTemplate,
  icon,
  button = false,
}: {
  label: string;
  description: string;
  onDownloadTemplate?: () => void;
  icon: React.ReactNode;
  button?: boolean;
}) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #BEDBFF',
        borderRadius: '10px',
        bgcolor: '#EFF6FF',
      }}
    >
      <StackRowAlignStartJustBetween>
        {icon}
        <Stack gap={1} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1C398E' }}>{label}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#1447E6' }}>{description}</Typography>
          {button && (
            <ButtonIconContentComponent
              content={isJavaBackend() ? 'Tải file mẫu (.csv)' : 'Tải file mẫu (.xlsx)'}
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
  );
};

export interface ProductSpuImportDialogProps {
  open: boolean;
  onClose: () => void;
  submitting?: boolean;
  onDownloadTemplate?: () => void;
  onStartImport?: (file: File) => Promise<void> | void;
}

export const ProductSpuImportDialog = ({ open, onClose, submitting = false, onDownloadTemplate, onStartImport }: ProductSpuImportDialogProps) => {
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
      title={isJavaBackend() ? 'Import sản phẩm từ CSV' : 'Import sản phẩm từ Excel'}
      icon={<Upload01 size={20} color="#fff" />}
      open={open}
      onClose={submitting ? undefined : onClose}
      sxBottom={{
        boxSizing: 'border-box',
        borderTop: '1px solid #E5E7EB',
        bgcolor: 'fff',
        pt: 3,
      }}
      // buttonStart={{
      //   content: 'Trình quản lý tác vụ',
      //   variant: 'outlined',
      //   startIcon: <LayersThree01 size={16} color="#364153" />,
      //   onClick: onOpenTaskManager,
      //   ...productListButtonPermission('task_manager', 'Trình quản lý tác vụ', 'api_product_list'),
      // }}
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
        <ProductSpuImportStatsCard
          label="File mẫu và hướng dẫn"
          description={isJavaBackend() ? 'Import file CSV theo mẫu Java.' : 'Import file theo mẫu, định dạng .xlsx / .csv.'}
          onDownloadTemplate={onDownloadTemplate}
          icon={<File05 size={20} color="#155DFC" />}
          button
        />

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
          accept={isJavaBackend() ? 'text/csv,.csv' : IMPORT_ACCEPT_EXCEL_CSV}
          error={!!uploadError}
          errorMessage={uploadError}
          onFileReject={(reason) => {
            setSelectedFile(null);
            setUploadError(reason);
            setFileValue('');
          }}
          previewMode="file"
          disabled={submitting}
          hintText={isJavaBackend() ? 'csv (theo giới hạn upload của backend)' : 'xlsx, csv (tối đa 50MB)'}
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
            <InfoCircle size={20} color="#155DFC" />
            <Stack gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827' }}>Import sẽ chạy nền sau khi gửi file</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>
                Sau khi nhấn import, cửa sổ này sẽ đóng. Bạn có thể tiếp tục thao tác và theo dõi tiến trình ở{' '}
                <Box component="span" sx={{ color: '#155DFC' }}>
                  Trình quản lý tác vụ
                </Box>
                .
              </Typography>
            </Stack>
          </StackRowAlignStartJustBetween>
        </Box>
      </Stack>
    </DialogComponent>
  );
};
