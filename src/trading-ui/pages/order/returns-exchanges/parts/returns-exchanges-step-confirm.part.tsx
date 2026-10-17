import { InfoOutlined, ShoppingBasketOutlined } from '@mui/icons-material';
import { isJavaBackend } from '@/common/config/app.config';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { Archive, FlipBackward } from '@untitledui/icons';
import { StackRowAlignCenter } from '@/trading-ui/adapters/library';
import { OrderReturnType } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { calculateReturnPickupCodTotal, isSellerPaysReturnShipping } from '../../../../common/constant/order/order.constants';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { SelectInput, TextInput } from '../../../../components/form';
import { ReturnExchangeItemRow } from '../../../../components/order/return-exchange-item-row.component';
import { UploadImagePicker } from '../../../../components/upload-image/upload-image-picker.component';
import { type ReturnExchangeStepConfirmPartProps } from '../../order.types';
import { ReturnExchangeShippingInfoPart } from './returns-exchanges-shipping-info.part';
import { StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { getOrderReturnQuoteDisplay } from '../order-return-quote-display.util';

export const ReturnExchangeStepConfirmPart = ({
  exchangeOnly = false,
  quote = null,
  quoteLoading = false,
  quoteError = false,
  returnItems,
  exchangeItems,
  returnReasonOptions,
  requestTypeOptions,
  priceDiff,
  returnReason,
  requestType,
  returnReasonError,
  requestTypeError,
  evidenceImageUrls,
  evidenceImageUrlsError,
  bankAccountHolder = '',
  bankAccountNumber = '',
  bankName = '',
  bankBranch = '',
  bankAccountHolderError,
  bankAccountNumberError,
  bankNameError,
  bankBranchError,
  shouldShowBankFields = false,
  pickupAddress,
  shippingAddress,
  shippingMethod,
  shippingCarrier,
  carrierServiceId,
  warehouseOptions,
  shippingServiceLoading,
  shippingServiceOptions,
  returnShippingFee,
  returnShippingFeeLoading,
  shipperNote,
  internalNote,
  onChangeReturnReason,
  onChangeRequestType,
  onChangeEvidenceImageUrls,
  onChangeBankAccountHolder,
  onChangeBankAccountNumber,
  onChangeBankName,
  onChangeBankBranch,
  onChangePickupWarehouseId,
  onChangePickupAddress,
  onChangeShippingAddress,
  onChangeShippingMethod,
  onChangeCarrierServiceId,
  onChangeShipperNote,
  onChangeInternalNote,
}: ReturnExchangeStepConfirmPartProps) => {
  const returnActualAmount = returnItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const exchangeTotalAmount = exchangeItems.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const isRefundRequest = requestType === OrderReturnType.REFUND;
  /** Doanh thu khác (No Refund) — chỉ khi đổi hàng và SP trả cao hơn SP đổi. */
  const otherRevenue = isRefundRequest ? 0 : Math.max(0, -priceDiff);
  /** Tiền bù chênh lệch COD — chỉ khi đổi hàng và SP đổi cao hơn SP trả. */
  const priceCompensation = isRefundRequest ? 0 : Math.max(0, exchangeTotalAmount - returnActualAmount);
  const sellerPaysReturnShipping = isSellerPaysReturnShipping(returnReason);
  const shippingPayerLabel = sellerPaysReturnShipping ? 'Bên bán chịu phí vận chuyển thu hồi.' : 'Khách hàng chịu phí vận chuyển thu hồi.';
  const totalPickupCod = calculateReturnPickupCodTotal({
    returnShippingFee,
    returnReason,
  });
  const priceDiffLabel = `${priceDiff >= 0 ? '' : '-'}${formatCurrency(Math.abs(priceDiff))}đ`;
  const quoteDisplay = getOrderReturnQuoteDisplay(quote, quoteLoading, quoteError);
  const useServerQuote = exchangeOnly || isJavaBackend();
  return (
    <Stack gap={1.5} sx={{ mt: 2 }}>
      <Stack direction="column" gap={1.5}>
        <Box
          sx={{
            border: '1px solid #E4E7EC',
            borderRadius: 1.5,
            p: 1.5,
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StackRowAlignCenter gap={1} sx={{ mb: 2 }}>
            <FlipBackward size={16} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Sản phẩm trả</Typography>
          </StackRowAlignCenter>
          <Stack gap={1}>
            {returnItems.map((item) => (
              <ReturnExchangeItemRow key={item.lineId} imageUrl={item.imageUrl} productName={item.productName} sku={item.sku} quantity={item.quantity} priceSnapshot={item.priceSnapshot} />
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            border: '1px solid #E4E7EC',
            borderRadius: 1.5,
            p: 1.5,
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StackRowAlignCenter gap={1} sx={{ mb: 2 }}>
            <Archive size={16} color="#6B7280" />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Sản phẩm đổi</Typography>
          </StackRowAlignCenter>
          <Stack gap={1}>
            {exchangeItems.map((item, idx) => (
              <ReturnExchangeItemRow
                key={`${item.variantId}-${idx}`}
                imageUrl={item.imageUrl}
                productName={item.productName}
                sku={item.sku}
                quantity={item.quantity}
                priceSnapshot={item.priceSnapshot}
                textMaxWidth={480}
              />
            ))}
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, p: 1.5, bgcolor: '#FFFFFF' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#CA8A04', mb: 1.25 }}>
          <ShoppingBasketOutlined sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
          Phân loại lý do
        </Typography>
        <StackRowAlignCenter gap={2} mb={2}>
          <SelectInput
            fullWidth
            label="Lý do đổi/trả hàng"
            value={returnReason}
            onChange={(e) => onChangeReturnReason(e.target.value)}
            placeholder="Chọn lý do đổi/trả hàng"
            options={returnReasonOptions}
            requiredMark
            error={Boolean(returnReasonError)}
            errorMessage={returnReasonError}
          />
          {exchangeOnly ? null : (
            <SelectInput
              fullWidth
              label="Loại yêu cầu"
              value={requestType}
              onChange={(e) => onChangeRequestType(e.target.value)}
              placeholder="Chọn loại yêu cầu"
              options={requestTypeOptions}
              requiredMark
              error={Boolean(requestTypeError)}
              errorMessage={requestTypeError}
            />
          )}
        </StackRowAlignCenter>

        {shouldShowBankFields ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              columnGap: 2,
              rowGap: 2,
              mb: 2,
            }}
          >
            <TextInput
              fullWidth
              label="Tên chủ tài khoản"
              placeholder="Nguyễn Văn A"
              requiredMark
              value={bankAccountHolder}
              onChange={(e) => onChangeBankAccountHolder?.(e.target.value)}
              error={Boolean(bankAccountHolderError)}
              errorMessage={bankAccountHolderError}
            />
            <TextInput
              fullWidth
              label="Số tài khoản ngân hàng"
              placeholder="0123456789"
              requiredMark
              value={bankAccountNumber}
              onChange={(e) => onChangeBankAccountNumber?.(e.target.value)}
              error={Boolean(bankAccountNumberError)}
              errorMessage={bankAccountNumberError}
            />
            <TextInput
              fullWidth
              label="Tên ngân hàng"
              placeholder="Vietcombank"
              requiredMark
              value={bankName}
              onChange={(e) => onChangeBankName?.(e.target.value)}
              error={Boolean(bankNameError)}
              errorMessage={bankNameError}
            />
            <TextInput
              fullWidth
              label="Chi nhánh ngân hàng"
              placeholder="TPHCM"
              requiredMark
              value={bankBranch}
              onChange={(e) => onChangeBankBranch?.(e.target.value)}
              error={Boolean(bankBranchError)}
              errorMessage={bankBranchError}
            />
          </Box>
        ) : null}

        <Box sx={{ mb: 2 }}>
          <UploadImagePicker value={evidenceImageUrls} onChange={onChangeEvidenceImageUrls} error={evidenceImageUrlsError} requiredMark />
        </Box>

        <TextInput multiline minRows={3} fullWidth label="Ghi chú nội bộ" placeholder="Ghi chú" value={internalNote} onChange={(e) => onChangeInternalNote(e.target.value)} />
      </Box>

      {!isJavaBackend() && <ReturnExchangeShippingInfoPart
        pickupAddress={pickupAddress}
        shippingAddress={shippingAddress}
        shippingMethod={shippingMethod}
        shippingCarrier={shippingCarrier}
        carrierServiceId={carrierServiceId}
        warehouseOptions={warehouseOptions}
        shippingServiceLoading={shippingServiceLoading}
        shippingServiceOptions={shippingServiceOptions}
        shipperNote={shipperNote}
        onChangePickupWarehouseId={onChangePickupWarehouseId}
        onChangePickupAddress={onChangePickupAddress}
        onChangeShippingAddress={onChangeShippingAddress}
        onChangeShippingMethod={onChangeShippingMethod}
        onChangeCarrierServiceId={onChangeCarrierServiceId}
        onChangeShipperNote={onChangeShipperNote}
      />}

      <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.5, p: 1.5, bgcolor: '#FFFFFF' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 1.25 }}>Phí thu hồi và Thanh toán đa phương thức</Typography>
        <Stack gap={0.75}>
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Chênh lệch giá (SP đổi − SP trả)</Typography>
            <Typography sx={TYPOGRAPHY_STYLES.base.semibold} title={useServerQuote ? quoteDisplay.differenceHint : undefined}>
              {useServerQuote ? quoteDisplay.priceDifference : priceDiffLabel}
            </Typography>
          </StackRowAlignCenterJustBetween>
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Tiền thực thu đơn gốc</Typography>
            <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>{useServerQuote ? quoteDisplay.returnAmount : `${formatCurrency(returnActualAmount)}đ`}</Typography>
          </StackRowAlignCenterJustBetween>
          {isRefundRequest ? (
            <StackRowAlignCenterJustBetween>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Số tiền hoàn trả khách</Typography>
              <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>{useServerQuote ? quoteDisplay.returnAmount : `${formatCurrency(returnActualAmount)}đ`}</Typography>
            </StackRowAlignCenterJustBetween>
          ) : null}
          {!isRefundRequest ? (
            <>
              <StackRowAlignCenterJustBetween>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Tiền bù chênh lệch (COD thu thêm)</Typography>
                <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>{useServerQuote ? quoteDisplay.compensation : `${formatCurrency(priceCompensation)}đ`}</Typography>
              </StackRowAlignCenterJustBetween>
              <StackRowAlignCenterJustBetween>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>{isJavaBackend() ? 'Số tiền hoàn chênh lệch' : 'Doanh thu khác'}</Typography>
                <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>{isJavaBackend() ? quoteDisplay.refund : exchangeOnly ? quoteDisplay.otherRevenue : `${formatCurrency(otherRevenue)}đ`}</Typography>
              </StackRowAlignCenterJustBetween>
            </>
          ) : null}
          <StackRowAlignCenterJustBetween>
            <StackRowAlignCenter gap={0.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Phí vận chuyển thu hồi</Typography>
              <Tooltip title={useServerQuote ? quoteDisplay.shippingHint : shippingPayerLabel} placement="top">
                <InfoOutlined sx={{ fontSize: 16, color: '#98A2B3' }} />
              </Tooltip>
            </StackRowAlignCenter>
            <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>
              {useServerQuote ? quoteDisplay.returnShipping : returnShippingFeeLoading ? 'Đang tính...' : `${formatCurrency(returnShippingFee)}đ`}
            </Typography>
          </StackRowAlignCenterJustBetween>
          <StackRowAlignCenterJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>Tổng thu thêm khi thu hồi (COD)</Typography>
            <Typography sx={TYPOGRAPHY_STYLES.base.semibold}>{useServerQuote ? quoteDisplay.pickupCod : returnShippingFeeLoading ? 'Đang tính...' : `${formatCurrency(totalPickupCod)}đ`}</Typography>
          </StackRowAlignCenterJustBetween>
        </Stack>
      </Box>
    </Stack>
  );
};
