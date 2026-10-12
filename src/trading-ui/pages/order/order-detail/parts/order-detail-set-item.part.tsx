import { Box, Divider, Stack, Typography } from '@mui/material';
import { Stars02 } from '@untitledui/icons';
import type { IOrderProductDetail, IOrderSetLine, IOrderSetLineComponent } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { StackAlignEnd, StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';
import { parseOrderAmount, resolveOrderDisplayLineTotal } from '../order-detail.helpers';

const SET_IMAGE_SIZE = 72;
const SET_COMPONENT_IMAGE_SIZE = 48;

interface OrderDetailSetItemProps {
  line: IOrderSetLine;
  productDetails: Map<string, IOrderProductDetail>;
  onPreviewImage: (url: string) => void;
}

interface SetComponentProps {
  item: IOrderSetLineComponent;
  productDetails: Map<string, IOrderProductDetail>;
  onPreviewImage: (url: string) => void;
}

const resolveSetSellingPrice = (line: IOrderSetLine): number => line.customerDisplayPrice?.sellingPriceAfterTaxMinor ?? parseOrderAmount(line.subtotalMinor);

const resolveSetOriginalPrice = (line: IOrderSetLine): number => line.customerDisplayPrice?.compareAtPriceAfterTaxMinor ?? parseOrderAmount(line.originalSubtotalMinor);

function SetImage({ src, size, onPreview }: { src: string; size: number; onPreview: (url: string) => void }) {
  return (
    <Box onClick={() => onPreview(src)} sx={{ width: size, height: size, border: '1px solid #E5E7EB', borderRadius: 1.5, bgcolor: '#F8FAFC', cursor: 'zoom-in', flexShrink: 0, overflow: 'hidden' }}>
      <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </Box>
  );
}

function SetComponent({ item, productDetails, onPreviewImage }: SetComponentProps) {
  const image = item.image || productDetails.get(item.productId || '')?.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC;
  return (
    <StackRowAlignCenter sx={{ gap: 1.5, alignItems: 'flex-start', py: 1 }}>
      <SetImage src={image} size={SET_COMPONENT_IMAGE_SIZE} onPreview={onPreviewImage} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {item.isKey ? (
          <StackRowAlignCenter sx={{ width: 'fit-content', gap: 0.5, mb: 0.5, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: '#ECECFE', color: '#6762BC' }}>
            <Stars02 size={14} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: 'inherit' }}>Chữ ký độc quyền</Typography>
          </StackRowAlignCenter>
        ) : null}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{item.productName || item.variationName || 'Sản phẩm'}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>SKU: {item.skuCode}</Typography>
      </Box>
      <StackAlignEnd gap={0.25}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>SL: {item.quantity}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold }}>{formatCurrency(resolveOrderDisplayLineTotal(item))} đ</Typography>
      </StackAlignEnd>
    </StackRowAlignCenter>
  );
}

function SetHeader({ line, onPreviewImage }: Pick<OrderDetailSetItemProps, 'line' | 'onPreviewImage'>) {
  const image = line.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC;
  const sellingPrice = resolveSetSellingPrice(line);
  const originalPrice = resolveSetOriginalPrice(line);
  return (
    <StackRowAlignCenter sx={{ gap: 1.5, alignItems: 'flex-start' }}>
      <SetImage src={image} size={SET_IMAGE_SIZE} onPreview={onPreviewImage} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.25, bgcolor: '#EDE9FE', color: '#6D28D9', borderRadius: 1, ...TYPOGRAPHY_STYLES.sm.bold }}>
          Limited Edition- Stella Set
        </Box>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827', mt: 0.5 }}>{line.name || 'Bộ sản phẩm'}</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>
          Mã bộ: {line.code || '—'} · {line.components.length} thành phần
        </Typography>
      </Box>
      <StackAlignEnd gap={0.25}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>SL: {line.quantity}</Typography>
        {originalPrice > sellingPrice ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#94A3B8', textDecoration: 'line-through' }}>{formatCurrency(originalPrice)} đ</Typography> : null}
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold }}>{formatCurrency(sellingPrice)} đ</Typography>
      </StackAlignEnd>
    </StackRowAlignCenter>
  );
}

export function OrderDetailSetItem({ line, productDetails, onPreviewImage }: OrderDetailSetItemProps) {
  return (
    <Stack sx={{ py: 1.5, gap: 1.25 }}>
      <SetHeader line={line} onPreviewImage={onPreviewImage} />
      <Stack divider={<Divider flexItem />} sx={{ ml: 4, pl: 2, pr: 1.5, borderLeft: '3px solid #DDD6FE', borderRadius: 1, bgcolor: '#FAFAFF' }}>
        {line.components.map((item) => (
          <SetComponent key={item.id || item.variationId} item={{ ...item, id: item.id || item.variationId }} productDetails={productDetails} onPreviewImage={onPreviewImage} />
        ))}
      </Stack>
    </Stack>
  );
}
