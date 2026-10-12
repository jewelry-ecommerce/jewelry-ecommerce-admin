import { useCallback, useState, type ChangeEvent } from 'react';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { QuantityNumberSpinner, TextInput } from '../../../../components/form';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { resolveTenantBrandProductDefaultImageSrc } from '../../../../common/config/runtime-config';
import { formatMinorAmount, formatVnd, parseMinorInput } from '../../components/promotion-runtime-evaluate-panel/promotion-simulation.helpers';
import { SANDBOX_INNER_CARD_SX } from '../sandbox-panel.shared';

const LINE_IMAGE_SX = { width: 56, height: 76, borderRadius: 1, flexShrink: 0 } as const;
const productDefaultImageSrc = resolveTenantBrandProductDefaultImageSrc();

export interface SandboxCartLineView {
  readonly lineId: string;
  readonly skuId: string;
  readonly skuCode: string;
  readonly skuName: string;
  readonly skuImageUrl: string | null;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly categoryIds: readonly string[];
  readonly collectionIds: readonly string[];
}

const computeLineSubtotalMinor = (quantity: number, unitPriceMinor: string): string => {
  const parsedPrice = Number(unitPriceMinor);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return '0';
  return String(Math.max(1, quantity) * Math.trunc(parsedPrice));
};

interface SandboxCartLinesProps {
  lines: readonly SandboxCartLineView[];
  subtotalMinor: string;
  onBack: () => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onUnitPriceChange: (lineId: string, unitPriceMinor: string) => void;
  onRemoveLine: (lineId: string) => void;
}

export const SandboxCartLines = ({ lines, subtotalMinor, onBack, onQuantityChange, onUnitPriceChange, onRemoveLine }: SandboxCartLinesProps) => {
  const [editingPriceByLineId, setEditingPriceByLineId] = useState<Record<string, boolean>>({});

  const handleTogglePriceEdit = useCallback((lineId: string) => {
    setEditingPriceByLineId((prev) => ({ ...prev, [lineId]: !prev[lineId] }));
  }, []);

  return (
    <Stack sx={{ gap: 1.5, flex: 1, minHeight: 0 }}>
      <StackRowAlignCenterJustBetween sx={{ gap: 1, flexWrap: 'wrap' }}>
        <StackRowAlignCenter sx={{ gap: 0.5 }}>
          <IconButton size="small" aria-label="Quay lại danh sách sản phẩm" onClick={onBack} sx={{ color: '#344054' }}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#344054' }}>Giỏ hàng giả lập</Typography>
        </StackRowAlignCenter>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Tổng tạm tính: {formatVnd(subtotalMinor)}</Typography>
      </StackRowAlignCenterJustBetween>

      <Stack sx={{ gap: 1, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {lines.length === 0 ? (
          <Box sx={{ p: 2.5, border: '1px dashed #D0D5DD', borderRadius: '8px', textAlign: 'center' }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Giỏ hàng trống. Quay lại để thêm sản phẩm.</Typography>
          </Box>
        ) : (
          lines.map((line) => {
            const isEditingPrice = Boolean(editingPriceByLineId[line.lineId]);
            const lineSubtotalMinor = computeLineSubtotalMinor(line.quantity, line.unitPriceMinor);
            return (
              <Box key={line.lineId} sx={SANDBOX_INNER_CARD_SX}>
                <StackRowAlignCenter sx={{ gap: 1.25, alignItems: 'flex-start' }}>
                  <Box component="img" src={line.skuImageUrl || productDefaultImageSrc} alt="" sx={{ ...LINE_IMAGE_SX, objectFit: 'contain', bgcolor: '#F3F4F6' }} />
                  <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
                    <StackRowAlignCenterJustBetween sx={{ gap: 1 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }} noWrap>
                        {line.skuName}
                      </Typography>
                      <IconButton size="small" onClick={() => onRemoveLine(line.lineId)} sx={{ color: '#F04438', flexShrink: 0 }}>
                        <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </StackRowAlignCenterJustBetween>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Mã biến thể: {line.skuCode}</Typography>
                    <QuantityNumberSpinner value={line.quantity} min={1} max={999_999} onCommit={(qty) => onQuantityChange(line.lineId, qty)} />
                  </Stack>
                </StackRowAlignCenter>
                <Box sx={{ mt: 1, p: 1, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #EAECF0' }}>
                  <StackRowAlignCenterJustBetween sx={{ gap: 1, flexWrap: 'wrap' }}>
                    <Stack sx={{ gap: 0.25 }}>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Đơn giá x số lượng</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
                        {formatVnd(line.unitPriceMinor)} x {line.quantity} = {formatVnd(lineSubtotalMinor)}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      aria-label="Sửa giá kiểm thử"
                      title="Sửa giá kiểm thử"
                      onClick={() => handleTogglePriceEdit(line.lineId)}
                      sx={{ color: isEditingPrice ? '#175CD3' : '#667085', flexShrink: 0 }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </StackRowAlignCenterJustBetween>
                  {isEditingPrice ? (
                    <Box sx={{ mt: 1 }}>
                      <TextInput
                        label="Đơn giá kiểm thử đặc biệt"
                        value={formatMinorAmount(line.unitPriceMinor)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onUnitPriceChange(line.lineId, parseMinorInput(e.target.value))}
                        size="small"
                        fullWidth
                      />
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085', mt: 0.5 }}>Chỉ sửa khi cần kiểm thử giá khác giá sản phẩm hiện tại.</Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            );
          })
        )}
      </Stack>
    </Stack>
  );
};
