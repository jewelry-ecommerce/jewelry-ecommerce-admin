import { AddRounded, RemoveRounded } from '@mui/icons-material';
import { Checkbox, Stack, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatCurrency } from '../../../../common/utils/number.utils';
import { CHECKED_COLOR } from '../../../../common/constant';
import { ReturnExchangeItemRow } from '../../../../components/order/return-exchange-item-row.component';

interface ReturnableOrderLineValue {
  lineId: string;
  productId: string;
  productName: string;
  sku: string;
  variantId: string;
  imageUrl: string;
  quantityPurchased: number;
  priceSnapshot: number;
}

export interface ReturnExchangeStepReturnPartProps {
  orderLines: ReturnableOrderLineValue[];
  selectedReturnQtyByLineId: Record<string, number>;
  onSelectReturnLine: (line: ReturnableOrderLineValue, checked: boolean) => void;
  onUpdateReturnQty: (line: ReturnableOrderLineValue, next: number) => void;
}

export const ReturnExchangeStepReturnPart = ({ orderLines, selectedReturnQtyByLineId, onSelectReturnLine, onUpdateReturnQty }: ReturnExchangeStepReturnPartProps) => {
  return (
    <Stack gap={1.5} sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: 1.5, border: '1px solid #E4E7EC' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#6B7280', mb: 1 }}>Vui lòng chọn sản phẩm trả hàng</Typography>
      {orderLines.map((line) => {
        const qty = selectedReturnQtyByLineId[line.lineId] ?? 0;
        const checked = qty > 0;
        const lineSubtotal = line.priceSnapshot * (checked ? qty : 1);
        return (
          <Stack
            key={line.lineId}
            sx={{
              border: checked ? '1px solid #B2DDFF' : '1px solid #E4E7EC',
              borderRadius: 1.5,
              px: 1.5,
              py: 1.25,
            }}
          >
            <ReturnExchangeItemRow
              imageUrl={line.imageUrl}
              productName={line.productName}
              sku={line.sku}
              quantity={Math.max(1, qty || 1)}
              priceSnapshot={line.priceSnapshot}
              imageSize={64}
              leadingSlot={<Checkbox checked={checked} onChange={(e) => onSelectReturnLine(line, e.target.checked)} sx={{ '&.Mui-checked': { color: CHECKED_COLOR } }} />}
              rightSlot={
                <Stack direction="row" alignItems="center" gap={2}>
                  <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F9FAFB', borderRadius: 1.5 }}>
                    <PermissionIconButton size="small" disabled={!checked || qty <= 1} onClick={() => onUpdateReturnQty(line, qty - 1)}>
                      <RemoveRounded fontSize="small" />
                    </PermissionIconButton>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, minWidth: 32, textAlign: 'center' }}>{Math.max(1, qty || 1)}</Typography>
                    <PermissionIconButton size="small" disabled={!checked || qty >= line.quantityPurchased} onClick={() => onUpdateReturnQty(line, (qty || 1) + 1)}>
                      <AddRounded fontSize="small" />
                    </PermissionIconButton>
                  </Stack>
                  <Stack alignItems="flex-end" gap={0}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>{formatCurrency(lineSubtotal)} ₫</Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#98A2B3' }}>{checked ? 'thành tiền' : 'đơn giá'}</Typography>
                  </Stack>
                </Stack>
              }
              containerSx={{ borderBottom: 'none', mb: 0, pb: 0 }}
            />
          </Stack>
        );
      })}
    </Stack>
  );
};
