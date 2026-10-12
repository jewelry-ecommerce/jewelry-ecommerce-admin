import { useCallback, useEffect, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { useSandboxSimulation } from '../../components/promotion-runtime-evaluate-panel/sandbox-simulation.context';

import type { WmsSkuSearchListItem } from '../../../../apis';

import { StackRowAlignStartJustBetween, StackRowJustEnd } from '../../../../components/styled';

import { SANDBOX_COLUMN_BODY_SX, SANDBOX_COLUMN_HEADER_SX, SANDBOX_COLUMN_SX, SANDBOX_SECTION_TITLE_SX } from '../sandbox-panel.shared';

import { SandboxCartLines, type SandboxCartLineView } from './sandbox-cart-lines.component';

import { SandboxProductPicker } from './sandbox-product-picker.component';

import { SandboxVoucherModal } from './sandbox-voucher-modal.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';

type MiddlePanelView = 'products' | 'cart';

export const SandboxCartColumn = () => {
  const { selectedDraftId, lines, simulatedSubtotal, evaluating, handleAddSku, handleQuantityChange, handleUnitPriceChange, handleRemoveLineById } = useSandboxSimulation();

  const [view, setView] = useState<MiddlePanelView>('products');

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (lines.length === 0) {
      setView('products');
    }
  }, [lines.length]);

  const handleAddToCart = useCallback(
    (item: WmsSkuSearchListItem) => {
      handleAddSku(item);

      setView('cart');
    },

    [handleAddSku],
  );

  const cartLines: SandboxCartLineView[] = lines.map((line) => ({
    lineId: line.lineId,

    skuId: line.skuId,

    skuCode: line.skuCode ?? '',

    skuName: line.skuName ?? '',

    skuImageUrl: line.skuImageUrl ?? null,

    quantity: line.quantity,

    unitPriceMinor: line.unitPriceMinor,

    categoryIds: line.categoryIds,

    collectionIds: line.collectionIds,
  }));
  return (
    <Stack sx={SANDBOX_COLUMN_SX}>
      <Box sx={SANDBOX_COLUMN_HEADER_SX}>
        <StackRowAlignStartJustBetween gap={1}>
          <Typography sx={SANDBOX_SECTION_TITLE_SX}>Giỏ hàng & tính giá</Typography>
          {evaluating ? (
            <StackRowJustEnd>
              <LoadingComponent size="small" />
            </StackRowJustEnd>
          ) : null}
        </StackRowAlignStartJustBetween>
      </Box>

      <Box sx={{ ...SANDBOX_COLUMN_BODY_SX, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <SandboxProductPicker hideGrid={view === 'cart'} selectedDraftId={selectedDraftId} onAddSku={handleAddToCart} onOpenVoucherModal={() => setVoucherModalOpen(true)} />

        {view === 'cart' ? (
          <SandboxCartLines
            lines={cartLines}
            subtotalMinor={simulatedSubtotal}
            onBack={() => setView('products')}
            onQuantityChange={handleQuantityChange}
            onUnitPriceChange={handleUnitPriceChange}
            onRemoveLine={handleRemoveLineById}
          />
        ) : null}
      </Box>

      <SandboxVoucherModal open={voucherModalOpen} onClose={() => setVoucherModalOpen(false)} />
    </Stack>
  );
};
