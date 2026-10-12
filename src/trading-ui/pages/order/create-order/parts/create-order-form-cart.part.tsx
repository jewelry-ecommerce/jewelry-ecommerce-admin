import AddRounded from '@mui/icons-material/AddRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { memo, type ReactNode } from 'react';
import { CustomButton, PermissionIconButton } from '../../../../components/button';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatVnd, resolveCartLineSellingPrice } from '../../../../common/utils/order/create-order.utils';
import { QuantityNumberSpinner } from '../../../../components/form';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../../product/product-spu/product-spu.constant';
import { OrderPackagingRelations } from '../components/order-packaging-relations.component';
import type { CartLine } from '../create-order.interface';
import { ORDER_FORM_CARD_SX } from './create-order-form.shared';
import { orderListButtonPermission } from '../../order-permission.constants';

export interface CreateOrderFormCartPartProps {
  cartLines: CartLine[];
  lineCountLabel: string;
  cartQuantitySyncingLineKey: string | null;
  onRequestRemoveCartLine: (lineKey: string) => void;
  onCommitCartLineQuantity: (lineKey: string, nextQuantity: number) => void;
  formLayout?: 'create' | 'edit';
  onAddProduct?: () => void;
  productPickerOpen?: boolean;
  /** Panel chọn SP (chỉ edit) — hiển thị phía trên danh sách dòng */
  productPickerSlot?: ReactNode;
}

export const CreateOrderFormCartPart = memo(function CreateOrderFormCartPart({
  cartLines,
  cartQuantitySyncingLineKey,
  onRequestRemoveCartLine,
  onCommitCartLineQuantity,
  formLayout = 'create',
  onAddProduct,
  productPickerOpen = false,
  productPickerSlot,
}: CreateOrderFormCartPartProps) {
  const sectionTitle = formLayout === 'edit' ? 'Sản phẩm trong đơn' : 'Sản phẩm đã chọn';

  return (
    <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
      {cartLines.length > 0 || formLayout === 'edit' ? (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.md.medium, fontWeight: 600, mb: 0 }}>{sectionTitle}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            {formLayout === 'edit' && onAddProduct ? (
              <CustomButton
                fullWidth={false}
                size="small"
                variant="outline"
                startIcon={productPickerOpen ? <CloseRounded /> : <AddRounded />}
                onClick={onAddProduct}
                {...orderListButtonPermission('add_product', productPickerOpen ? 'Đóng chọn sản phẩm' : 'Thêm sản phẩm', 'api_order_update')}
                sx={{
                  textTransform: 'none',
                  borderColor: '#D0D5DD',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  bgcolor: '#101828',
                }}
              >
                {productPickerOpen ? 'Đóng' : 'Thêm sản phẩm'}
              </CustomButton>
            ) : null}
          </Stack>
        </Stack>
      ) : null}
      {productPickerSlot}
      {cartLines.length === 0 ? (
        <Box sx={{ py: formLayout === 'edit' ? 3 : 5, textAlign: 'center', color: '#6B7280' }}>
          <ShoppingCartOutlined sx={{ fontSize: 56, color: '#D1D5DB', mb: 1.5 }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.medium, fontWeight: 600, color: '#111827' }}>Chưa có sản phẩm trong đơn hàng</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, mt: 1.25 }}>
            {formLayout === 'edit' ? 'Thêm sản phẩm để tiếp tục chỉnh sửa đơn.' : 'Vui lòng chọn sản phẩm từ danh sách bên trái để bắt đầu'}
          </Typography>
          {formLayout === 'edit' && onAddProduct ? (
            <CustomButton
              fullWidth={false}
              sx={{ mt: 2, textTransform: 'none', width: 'fit-content' }}
              variant="primary"
              startIcon={<AddRounded />}
              onClick={onAddProduct}
              {...orderListButtonPermission('add_product', 'Thêm sản phẩm', 'api_order_update')}
            >
              Thêm sản phẩm
            </CustomButton>
          ) : null}
        </Box>
      ) : (
        <Stack>
          {cartLines.map((line) => {
            const outOfStock = line.variation.stockQuantity <= 0;
            const lineMax = Math.max(0, line.variation.stockQuantity);
            const syncing = cartQuantitySyncingLineKey === line.key;
            const sellingPrice = resolveCartLineSellingPrice(line.variation);
            return (
              <Paper
                key={line.key}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  position: 'relative',
                  opacity: outOfStock ? 0.6 : 1,
                  transition: 'opacity 0.2s ease',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                }}
              >
                <PermissionIconButton size="small" onClick={() => onRequestRemoveCartLine(line.key)} sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }} aria-label="Xóa">
                  <CloseRounded fontSize="small" />
                </PermissionIconButton>
                <Stack direction={formLayout === 'edit' ? 'row' : 'column'} spacing={formLayout === 'edit' ? 2 : 0} alignItems={formLayout === 'edit' ? 'flex-start' : 'stretch'}>
                  {formLayout === 'edit' ? (
                    <Box
                      component="img"
                      src={line.image || PRODUCT_SPU_DEFAULT_IMAGE_SRC}
                      alt=""
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid #E5E7EB',
                        bgcolor: '#F8FAFC',
                      }}
                    />
                  ) : null}
                  <Box sx={{ flex: 1, minWidth: 0, pr: formLayout === 'edit' ? 0 : 0 }}>
                    <Typography fontWeight={700} fontSize={14} pr={3}>
                      {line.productName}
                    </Typography>
                    <Stack direction="row" gap={0.75} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {line.variation.variationValue?.map((value) => (
                        <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: '#F1F5F9' }}>
                          <Typography component="span" fontSize={12} sx={{ color: '#101828' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>
                      {line.variation.skuCode}
                    </Typography>
                    {outOfStock ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#B42318', mt: 0.75 }}>Hết hàng - không thể chỉnh số lượng</Typography> : null}
                    {formLayout === 'edit' ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 1 }}>Đơn giá: {formatVnd(sellingPrice)}</Typography> : null}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                      <QuantityNumberSpinner
                        value={line.quantity}
                        min={1}
                        max={lineMax > 0 ? lineMax : 1}
                        disabled={outOfStock || syncing}
                        incrementLoading={syncing}
                        onCommit={(next) => onCommitCartLineQuantity(line.key, next)}
                      />
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold }}>{formatVnd(sellingPrice * line.quantity)}</Typography>
                    </Stack>
                    {line.variation.packagingRelations?.length ? <OrderPackagingRelations relations={line.variation.packagingRelations} merchandiseQuantity={line.quantity} compact /> : null}
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
});
