import { Box, Typography } from '@mui/material';
import type { BadgeActivateViolationItem } from '../../../../apis/badge/badge.interface';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { DialogConfirmComponent } from '../../../../components/dialog';

type LabelActivateViolationDialogProps = {
  open: boolean;
  message: string;
  violationCount: number;
  violations: BadgeActivateViolationItem[];
  onClose: () => void;
};

const formatViolationLine = (item: BadgeActivateViolationItem): string => {
  const sku = item.skuCode?.trim() || item.productVariantId || item.productId || '(SKU không xác định)';
  const detail = item.message?.trim();
  return detail ? `${sku}: ${detail}` : sku;
};

export const LabelActivateViolationDialog = ({ open, message, violationCount, violations, onClose }: LabelActivateViolationDialogProps) => (
  <DialogConfirmComponent
    open={open}
    onClose={onClose}
    title="Không thể kích hoạt cấu hình Label này"
    maxWidth="sm"
    highlight={{
      tone: 'warning',
      title: `Phát hiện SKU vi phạm khi kích hoạt (${violationCount}):`,
      description: message,
    }}
    omitActions
    cancelLabel="Đóng"
    confirmLabel="Đóng"
    onCancel={onClose}
    onConfirm={onClose}
  >
    <Box
      sx={{
        width: '100%',
        maxHeight: 280,
        overflowY: 'auto',
        boxSizing: 'border-box',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        px: 1.5,
        py: 1,
      }}
    >
      {violations.map((item, index) => (
        <Typography
          key={`${item.productVariantId ?? item.productId ?? item.skuCode ?? index}`}
          sx={{
            ...TYPOGRAPHY_STYLES.sm.regular,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            py: 0.25,
          }}
        >
          - {formatViolationLine(item)}
        </Typography>
      ))}
    </Box>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>Vui lòng điều chỉnh phạm vi, label hoặc vị trí hiển thị trước khi kích hoạt lại.</Typography>
  </DialogConfirmComponent>
);
