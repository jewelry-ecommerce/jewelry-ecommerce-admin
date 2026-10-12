import { Box, Stack, Typography } from '@mui/material';
import { AlertTriangle, CheckCircle, File05, AlignBottom01 } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ButtonIconContentComponent } from '../../../../components/button';
import { StackRowAlignStartJustBetween } from '../../../../components/styled/stack.style';
import { TEXT_FIELD_UPLOAD_ACCEPT_EXCEL, TextFieldUpload } from '../../../../components/text-field-upload/text-field-upload.component';

const IMPORT_ACCEPT_EXCEL_CSV = `${TEXT_FIELD_UPLOAD_ACCEPT_EXCEL},text/csv,.csv`;

const REQUIRED_FIELDS = ['Mã đơn gốc: Mã từ kênh bán hàng', 'Nguồn đơn: TikTok, Facebook, Livestream...', 'Khách hàng: Tên và SĐT', 'SKU: Mã sản phẩm'] as const;

const IMPORTANT_NOTES = [
  'Hệ thống chấp nhận import cả đơn có lỗi — sẽ gắn cờ để xử lý sau',
  'Đơn hàng vào tab "Chờ xác nhận", không đẩy thẳng kho',
  'Cần làm sạch dữ liệu trước khi confirm đơn hàng',
] as const;

export interface OrderImportStepUploadPartProps {
  fileValue: string;
  uploadError: string;
  disabled?: boolean;
  onFileValueChange: (next: string) => void;
  onPickFile: (file: File) => void;
  onFileReject: (reason: string) => void;
  onDownloadTemplate: () => void;
}

export const OrderImportStepUploadPart = ({ fileValue, uploadError, disabled = false, onFileValueChange, onPickFile, onFileReject, onDownloadTemplate }: OrderImportStepUploadPartProps) => {
  return (
    <Stack gap={3}>
      <Box
        sx={{
          p: 2,
          border: '1px solid #BEDBFF',
          borderRadius: '10px',
          bgcolor: '#EFF6FF',
        }}
      >
        <StackRowAlignStartJustBetween>
          <File05 size={20} color="#155DFC" />
          <Stack gap={1} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#1C398E' }}>File mẫu và hướng dẫn</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#1447E6' }}>
              Import đơn từ Social / Affiliate / TikTok / Facebook / Livestream. Sau khi import, đơn sẽ chuyển vào tab &quot;Chờ xác nhận&quot;.
            </Typography>
            <ButtonIconContentComponent
              content="Tải file mẫu (.xlsx)"
              icon={<AlignBottom01 size={20} color="#fff" />}
              onClick={onDownloadTemplate}
              disabled={disabled}
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
          </Stack>
        </StackRowAlignStartJustBetween>
      </Box>

      <TextFieldUpload
        value={fileValue}
        onChange={(next) => {
          onFileValueChange(next);
        }}
        onPickFile={async (file) => {
          onPickFile(file);
        }}
        accept={IMPORT_ACCEPT_EXCEL_CSV}
        error={!!uploadError}
        errorMessage={uploadError}
        onFileReject={onFileReject}
        previewMode="file"
        disabled={disabled}
        hintText="Hỗ trợ file .xlsx và .csv (tối đa 50MB)"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Stack gap={1.25}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Trường dữ liệu bắt buộc</Typography>
          {REQUIRED_FIELDS.map((label) => (
            <Stack key={label} direction="row" alignItems="flex-start" gap={1}>
              <CheckCircle size={18} color="#17B26A" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>

        <Box
          sx={{
            p: 2,
            border: '1px solid #FEC84B',
            borderRadius: '10px',
            bgcolor: '#FFFAEB',
          }}
        >
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#B54708', mb: 1.25 }}>Lưu ý quan trọng</Typography>
          <Stack gap={1}>
            {IMPORTANT_NOTES.map((note) => (
              <Stack key={note} direction="row" alignItems="flex-start" gap={1}>
                <AlertTriangle size={16} color="#F79009" />
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#93370D' }}>{note}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
};
