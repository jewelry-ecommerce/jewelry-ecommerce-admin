import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash03 } from '@untitledui/icons';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { CustomButton, PermissionIconButton } from '../../../../../components/button';
import { contentSearchPinnedButtonPermission } from '../../../content-permission.constants';
import { SelectInput, TextDateInput } from '../../../../../components/form';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';
import IconDrag02 from '../../../../../assets/icon/icon-drag-02';
import { SEARCH_PINNED_SLOT_COUNT } from '../search-pinned.constants';
import type { LabelDisplaySelectedProduct } from '../../../label/label-display/label-display.interface';
import { formatStoredDateTimeNow } from '../../../../../common/utils/date-format.util';

export type SearchPinnedRow = {
  rowKey: string;
  pinnedId?: string;
  product: LabelDisplaySelectedProduct | null;
  position: number;
  startDate: string;
  endDate: string;
};

const POSITION_OPTIONS = Array.from({ length: SEARCH_PINNED_SLOT_COUNT }, (_, i) => ({
  value: i,
  label: `Vị trí ${i + 1}`,
}));

export type SearchPinnedRowCardProps = {
  row: SearchPinnedRow;
  viewMode?: boolean;
  displayIndex: number;
  collapseAllSignal: number;
  onRemove: (rowKey: string) => void;
  onPickProduct: (rowKey: string) => void;
  onPositionChange: (rowKey: string, nextPosition: number) => void;
  onStartDateChange: (rowKey: string, next: string) => void;
  onEndDateChange: (rowKey: string, next: string) => void;
};

export const SearchPinnedRowCard = ({
  row,
  viewMode = false,
  displayIndex,
  collapseAllSignal,
  onRemove,
  onPickProduct,
  onPositionChange,
  onStartDateChange,
  onEndDateChange,
}: SearchPinnedRowCardProps) => {
  const [expanded, setExpanded] = useState(true);
  const prevCollapseAllSignalRef = useRef(collapseAllSignal);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.rowKey, disabled: viewMode });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  useEffect(() => {
    if (collapseAllSignal !== undefined && prevCollapseAllSignalRef.current !== undefined && collapseAllSignal !== prevCollapseAllSignalRef.current) {
      setExpanded(false);
    }
    prevCollapseAllSignalRef.current = collapseAllSignal;
  }, [collapseAllSignal]);

  const product = row.product;

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        p: 2,
        gap: 2,
        bgcolor: '#FFFFFF',
      }}
    >
      <StackRowAlignCenterJustBetween>
        <StackRowAlignCenter gap={0.5}>
          {!viewMode ? (
            <Box
              {...attributes}
              {...listeners}
              aria-label="Kéo để sắp xếp"
              sx={{
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                color: '#9CA3AF',
                pr: 0.75,
              }}
            >
              <IconDrag02 />
            </Box>
          ) : null}
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>#{displayIndex + 1}</Typography>
        </StackRowAlignCenter>

        <StackRowAlignCenter>
          <IconButton size="small" aria-label={expanded ? 'Thu gọn' : 'Mở rộng'} onClick={() => setExpanded((prev) => !prev)} sx={{ color: '#667085' }}>
            <KeyboardArrowDownRounded
              sx={{
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
          {!viewMode ? (
            <PermissionIconButton
              aria-label="Xóa dòng"
              size="small"
              onClick={() => onRemove(row.rowKey)}
              {...contentSearchPinnedButtonPermission('search_pinned_remove', 'Xóa dòng', 'api_product_search_pinned_update')}
              sx={{ color: '#6B7280' }}
            >
              <Trash03 size={18} />
            </PermissionIconButton>
          ) : null}
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>

      <StackRowAlignCenter gap={1.5} sx={{ alignItems: 'flex-start' }}>
        {product?.imageUrl?.trim() ? (
          <Box
            component="img"
            src={product.imageUrl}
            alt=""
            sx={{
              width: 64,
              height: 64,
              borderRadius: 1,
              objectFit: 'cover',
              bgcolor: '#F3F4F6',
              flexShrink: 0,
            }}
          />
        ) : (
          <Box sx={{ width: 64, height: 64, borderRadius: 1, bgcolor: '#F3F4F6', flexShrink: 0 }} />
        )}
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827', fontWeight: 600 }}>{product?.name || 'Chưa chọn sản phẩm'}</Typography>
          {product?.skuCode ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' }}>Biến thể: {product.skuCode}</Typography> : null}
        </Stack>
      </StackRowAlignCenter>

      <Collapse in={expanded}>
        <Stack gap={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '160px 1fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <SelectInput label="Vị trí" disabled={viewMode} value={row.position} onChange={(e) => onPositionChange(row.rowKey, Number(e.target.value))} options={POSITION_OPTIONS} />
            <TextDateInput
              minDate={formatStoredDateTimeNow()}
              mode="dateTime"
              label="Ngày bắt đầu"
              requiredMark
              disabled={viewMode}
              value={row.startDate}
              onChange={(next) => onStartDateChange(row.rowKey, next)}
              placeholder="Chọn ngày bắt đầu"
            />
            <TextDateInput
              mode="dateTime"
              label="Ngày kết thúc"
              disabled={viewMode}
              value={row.endDate}
              onChange={(next) => onEndDateChange(row.rowKey, next)}
              placeholder="Để trống = không giới hạn"
            />
          </Box>

          {!viewMode ? (
            <CustomButton
              type="button"
              variant="outline"
              fullWidth={false}
              startIcon={<Plus size={16} />}
              onClick={() => onPickProduct(row.rowKey)}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              {...contentSearchPinnedButtonPermission('search_pinned_pick_product', product ? 'Đổi sản phẩm' : 'Chọn sản phẩm', 'api_product_search_pinned_update')}
            >
              {product ? 'Đổi sản phẩm' : 'Chọn sản phẩm'}
            </CustomButton>
          ) : null}
        </Stack>
      </Collapse>
    </Stack>
  );
};
