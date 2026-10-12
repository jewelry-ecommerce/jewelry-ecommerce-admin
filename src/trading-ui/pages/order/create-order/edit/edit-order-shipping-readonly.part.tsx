import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import { Box, Chip, Link, Paper, Typography } from '@mui/material';
import { memo } from 'react';
import { ShippingMethod } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from '../parts/create-order-form.shared';

const SHIPPING_METHOD_LABEL: Record<string, string> = {
  [ShippingMethod.STANDARD]: 'Giao hàng tiêu chuẩn',
  [ShippingMethod.STORE_PICKUP]: 'Bán tại quầy',
};

const labelSx = {
  ...TYPOGRAPHY_STYLES.sm.regular,
  color: '#6A7282',
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  mb: 0.75,
} as const;

export interface EditOrderShippingReadonlyPartProps {
  shippingMethod?: ShippingMethod | string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  /** Hiển thị badge "Chưa lấy hàng" khi đơn chờ xử lý vận chuyển */
  orderPending?: boolean;
}

export const EditOrderShippingReadonlyPart = memo(function EditOrderShippingReadonlyPart({ shippingMethod, trackingCode, trackingUrl, orderPending = true }: EditOrderShippingReadonlyPartProps) {
  const hasCarrier = Boolean(shippingMethod);
  const carrierLabel = hasCarrier ? (SHIPPING_METHOD_LABEL[String(shippingMethod)] ?? String(shippingMethod)) : 'Chưa chọn';

  const showPickupBadge = orderPending;

  return (
    <Paper
      elevation={0}
      sx={{
        ...ORDER_FORM_CARD_SX,
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        bgcolor: '#FFFFFF',
      }}
    >
      <Typography sx={{ ...ORDER_FORM_SECTION_TITLE_SX, mb: 2.5 }}>Thông tin vận chuyển</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          columnGap: 3,
          rowGap: 2.5,
        }}
      >
        {/* Đơn vị vận chuyển */}
        <Box>
          <Typography sx={labelSx}>
            <LocalShippingOutlined sx={{ ...TYPOGRAPHY_STYLES.lg.regular, color: '#6A7282' }} />
            Đơn vị vận chuyển
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 500 }}>{carrierLabel}</Typography>
        </Box>

        {/* Trạng thái vận chuyển */}
        <Box>
          <Typography sx={labelSx}>
            <Inventory2Outlined sx={{ fontSize: 18, color: '#9CA3AF' }} />
            Trạng thái vận chuyển
          </Typography>
          <Box>
            {showPickupBadge ? (
              <Chip
                label="Chưa lấy hàng"
                size="small"
                sx={{
                  height: 28,
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  color: '#3538CD',
                  bgcolor: '#EEF2FF',
                  border: 'none',
                  borderRadius: '8px',
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            ) : (
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 500 }}>—</Typography>
            )}
          </Box>
        </Box>

        {/* Link giao vận */}
        <Box>
          <Typography sx={{ ...labelSx, pl: 0 }}>Link giao vận</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 500, pl: 0 }}>
            {trackingUrl ? (
              <Link href={trackingUrl} target="_blank" rel="noreferrer" underline="none" sx={{ color: '#111827', fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#374151' } }}>
                Link
              </Link>
            ) : (
              '—'
            )}
          </Typography>
        </Box>

        {/* Mã vận đơn */}
        <Box>
          <Typography sx={labelSx}>
            <DescriptionOutlined sx={{ fontSize: 18, color: '#9CA3AF' }} />
            Mã vận đơn
          </Typography>
          <Box sx={{ pl: 3.25 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 500 }}>{trackingCode?.trim() || '—'}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
});
