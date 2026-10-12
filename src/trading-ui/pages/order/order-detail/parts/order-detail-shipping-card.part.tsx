import { Card, CardContent, Chip, Grid, Link, Typography } from '@mui/material';
import { Cube01, File06, Truck01 } from '@untitledui/icons';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import type { IOrder } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { SHIPPING_CARRIER_OPTIONS } from '../../create-order/shipping-mock.data';
import { resolveShippingTrackingUrl } from '../../order.constant';
import { getShippingMethodLabel } from '../order-detail.helpers';
import { ORDER_FORM_SECTION_TITLE_SX } from '../../create-order/parts/create-order-form.shared';

export interface OrderDetailShippingCardProps {
  order: IOrder;
  shipStatusLabel: string;
}

export function OrderDetailShippingCard({ order, shipStatusLabel }: OrderDetailShippingCardProps) {
  const trackingCode = order.trackingCode?.trim() || '';
  const trackingUrl = resolveShippingTrackingUrl(order.trackingCode, order.shippingTrackingUrl);

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <CardContent sx={{ '&:last-child': { pb: 1 } }}>
        <Typography sx={{ ...ORDER_FORM_SECTION_TITLE_SX, mb: 2 }}>Thông tin vận chuyển</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StackRowAlignCenter gap={1}>
              <Truck01 fontSize="small" size={16} color="#99A1AF" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Đơn vị vận chuyển</Typography>
            </StackRowAlignCenter>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#111827' }}>
              {/* {getShippingMethodLabel(order.shippingMethod)} */} {SHIPPING_CARRIER_OPTIONS[0]?.label}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StackRowAlignCenter gap={1}>
              <Cube01 fontSize="small" size={16} color="#99A1AF" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Hình thức giao</Typography>
            </StackRowAlignCenter>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#111827' }}>{getShippingMethodLabel(order.shippingMethod)}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StackRowAlignCenter gap={1}>
              <Cube01 fontSize="small" size={16} color="#99A1AF" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Trạng thái vận chuyển</Typography>
            </StackRowAlignCenter>
            <Chip size="small" label={shipStatusLabel} sx={{ mt: 0.5, ...TYPOGRAPHY_STYLES.sm.bold, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StackRowAlignCenter gap={1}>
              <File06 fontSize="small" size={16} color="#99A1AF" />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Mã vận đơn</Typography>
            </StackRowAlignCenter>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#111827', mt: 0.5 }}>
              {trackingUrl ? (
                <Link href={trackingUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ color: '#155DFC', fontWeight: 600 }}>
                  {trackingCode}
                </Link>
              ) : (
                '—'
              )}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
