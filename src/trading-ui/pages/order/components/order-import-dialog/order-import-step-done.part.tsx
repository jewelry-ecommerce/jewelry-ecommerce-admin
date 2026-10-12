import { Box, Stack, Typography } from '@mui/material';
import { AlertTriangle, CheckCircle, InfoCircle } from '@untitledui/icons';
import type { OrderImportJobResult } from '../../../../apis/order/order-import.interface';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

const formatCount = (value: number | null): string => (value == null ? '—' : String(value));

const SummaryCard = ({ value, label, tone }: { value: string; label: string; tone: 'neutral' | 'success' | 'error' }) => {
  const toneSx =
    tone === 'success'
      ? { bgcolor: '#ECFDF3', borderColor: '#ABEFC6', color: '#067647' }
      : tone === 'error'
        ? { bgcolor: '#FEF3F2', borderColor: '#FECDCA', color: '#B42318' }
        : { bgcolor: '#FFFFFF', borderColor: '#E5E7EB', color: '#101828' };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 2,
        borderRadius: '10px',
        border: '1px solid',
        ...toneSx,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].semibold, color: toneSx.color, lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: toneSx.color, mt: 0.5 }}>{label}</Typography>
    </Box>
  );
};

export interface OrderImportStepDonePartProps {
  result: OrderImportJobResult;
}

export const OrderImportStepDonePart = ({ result }: OrderImportStepDonePartProps) => {
  const hasFailures = result.hasImportStats && (result.failedRows ?? 0) > 0;
  const allSuccess = result.hasImportStats && (result.failedRows ?? 0) === 0 && (result.successRows ?? 0) > 0;
  const statsUnknown = !result.hasImportStats;

  const title = allSuccess ? 'Import đơn hàng thành công' : 'Import đơn hàng đã hoàn tất';
  const description = allSuccess
    ? `Đã import thành công ${result.successRows} đơn hàng vào hệ thống.`
    : hasFailures
      ? `Có ${result.successRows}/${result.totalRows} đơn thành công. Kiểm tra file kết quả để xem chi tiết lỗi.`
      : statsUnknown
        ? `Tác vụ đã hoàn tất (${result.totalRows} đơn được gửi import). Chi tiết thành công/thất bại chưa có từ worker — tải file kết quả nếu cần.`
        : `Tác vụ đã hoàn tất với ${result.totalRows} đơn.`;

  return (
    <Stack gap={2.5}>
      <Stack direction="row" alignItems="flex-start" gap={1.25}>
        {allSuccess ? <CheckCircle size={28} color="#067647" /> : <InfoCircle size={28} color="#175CD3" />}
        <Stack gap={0.5} sx={{ minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.semibold, color: '#101828' }}>{title}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{description}</Typography>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        <SummaryCard value={formatCount(result.totalRows)} label="Tổng dòng" tone="neutral" />
        <SummaryCard value={formatCount(result.successRows)} label="Thành công" tone="success" />
        <SummaryCard value={formatCount(result.failedRows)} label="Thất bại" tone="error" />
      </Stack>

      {hasFailures ? (
        <Box
          sx={{
            p: 2,
            border: '1px solid #FEDF89',
            borderRadius: '10px',
            bgcolor: '#FFFAEB',
          }}
        >
          <Stack direction="row" alignItems="flex-start" gap={1.25}>
            <AlertTriangle size={20} color="#F79009" />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#93370D' }}>
              Có {result.failedRows} dòng thất bại. Dùng nút &quot;Tải file kết quả&quot; để xem chi tiết và xử lý lại.
            </Typography>
          </Stack>
        </Box>
      ) : null}

      {statsUnknown ? (
        <Box
          sx={{
            p: 2,
            border: '1px solid #B2DDFF',
            borderRadius: '10px',
            bgcolor: '#EFF8FF',
          }}
        >
          <Stack direction="row" alignItems="flex-start" gap={1.25}>
            <InfoCircle size={20} color="#175CD3" />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#175CD3' }}>Worker chưa trả về thống kê import chi tiết. Không mặc định coi tất cả đơn là thành công.</Typography>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
};
