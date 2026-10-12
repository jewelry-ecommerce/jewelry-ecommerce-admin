import { LocationOnOutlined, PhoneOutlined } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import type { IOrder } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';

import { StackRowAlignCenterJustBetween } from '@/trading-ui/adapters/library';
import { getOrderCustomerContact, getOrderPickupAddressDisplay } from '../order-detail.helpers';
import { isVatInvoiceRequested, OrderDetailVatInvoiceSection } from './order-detail-vat-invoice-card.part';

export interface OrderDetailCustomerCardProps {
  order: IOrder;
  addressMismatch3pl: boolean;
}

export function OrderDetailCustomerCard({ order, addressMismatch3pl }: OrderDetailCustomerCardProps) {
  const customer = getOrderCustomerContact(order);
  const shipping = order.shippingAddressSnapshot;
  const customerAddress = [shipping?.addressLine, shipping?.wardName, shipping?.provinceName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  const hasVat = isVatInvoiceRequested(order.vatInvoice);

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <StackRowAlignCenterJustBetween gap={1} sx={{ mb: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827' }}>Thông tin khách hàng</Typography>
          <CustomButton
            variant="outline"
            fullWidth={false}
            size="small"
            startIcon={<PhoneOutlined sx={{ fontSize: 18 }} />}
            component={customer.phone ? Link : 'span'}
            href={customer.phone ? `tel:${customer.phone}` : undefined}
            disabled={!customer.phone}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              ...TYPOGRAPHY_STYLES.sm.medium,
              border: 'none',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              borderRadius: 2,
              '&:hover': {
                border: 'none',
                bgcolor: '#DBEAFE',
              },
              '&:disabled': {
                border: 'none',
                color: '#6B7280',
                bgcolor: '#F3F4F6',
              },
            }}
          >
            Gọi ngay
          </CustomButton>
        </StackRowAlignCenterJustBetween>

        <Stack>
          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Họ tên</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{customer.fullName || '—'}</Typography>
          </Box>

          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Email</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{customer.email || '—'}</Typography>
          </Box>

          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Địa chỉ kho giao/nhận</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{getOrderPickupAddressDisplay(order.pickupAddressSnapshot)}</Typography>
          </Box>

          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Địa chỉ khách hàng</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{customerAddress || '—'}</Typography>
            {addressMismatch3pl ? (
              <Alert
                severity="error"
                icon={<LocationOnOutlined sx={{ fontSize: 20 }} />}
                sx={{
                  mt: 1,
                  py: 1,
                  alignItems: 'center',
                  bgcolor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#DC2626' },
                }}
              >
                Địa chỉ chưa validate hoặc không khớp dữ liệu hành chính / 3PL.
              </Alert>
            ) : null}
          </Box>

          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Số điện thoại</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{customer.phone || '—'}</Typography>
          </Box>

          <Box>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Xuất VAT</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{hasVat ? 'Có' : 'Không'}</Typography>
          </Box>

          <OrderDetailVatInvoiceSection vatInvoice={order.vatInvoice} />

          {order.note ? (
            <Box>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 }}>Ghi chú khách hàng</Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                }}
              >
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>{order.note}</Typography>
              </Box>
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
