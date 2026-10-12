import { Box, Stack } from '@mui/material';
import { OrderStatus, ShippingMethod, type IOrder, type IOrderProductDetail } from '../../../../apis/order';
import { isPosOrder } from '../order-detail.helpers';
import { OrderDetailCancellationCard } from './order-detail-cancellation-card.part';
import { OrderDetailCustomerCard } from './order-detail-customer-card.part';
import { OrderDetailInternalNotesCard } from './order-detail-internal-notes-card.part';
import { OrderDetailItemsCard } from './order-detail-items-card.part';
import { OrderDetailShippingCard } from './order-detail-shipping-card.part';

export interface OrderDetailMainColumnProps {
  order: IOrder;
  productDetails: Map<string, IOrderProductDetail>;
  addressMismatch3pl: boolean;
  shippingFeeWarning: boolean;
  shipStatusLabel: string;
  onPreviewImage: (url: string) => void;
  subtotal: number;
  discount: number;
  ship: number;
  grand: number;
}

export function OrderDetailMainColumn({ order, productDetails, addressMismatch3pl, shippingFeeWarning, shipStatusLabel, onPreviewImage, subtotal, discount, ship, grand }: OrderDetailMainColumnProps) {
  const cancellation = order.status === OrderStatus.CANCELLED ? order.metadata?.cancellation : null;
  // Đơn POS bán tại quầy không đi vận chuyển — chỉ hiện thẻ vận chuyển khi đơn POS có giao hàng.
  const showShippingCard = !isPosOrder(order) || order.shippingMethod === ShippingMethod.STANDARD;

  return (
    <Box sx={{ flex: '1 1 auto', minWidth: 0, width: { xs: '100%', lg: 'auto' } }}>
      <Stack>
        {cancellation ? <OrderDetailCancellationCard cancellation={cancellation} /> : null}
        <OrderDetailCustomerCard order={order} addressMismatch3pl={addressMismatch3pl} />
        <OrderDetailItemsCard
          order={order}
          productDetails={productDetails}
          shippingFeeWarning={shippingFeeWarning}
          onPreviewImage={onPreviewImage}
          subtotal={subtotal}
          discount={discount}
          ship={ship}
          grand={grand}
        />
        {showShippingCard ? <OrderDetailShippingCard order={order} shipStatusLabel={shipStatusLabel} /> : null}
        <OrderDetailInternalNotesCard orderId={order.id} />
      </Stack>
    </Box>
  );
}
