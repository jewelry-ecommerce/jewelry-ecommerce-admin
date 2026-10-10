import { Box, Collapse, Stack, Typography } from '@mui/material';
import { PermissionIconButton } from '../../../../components/button';

import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash01 } from '@untitledui/icons';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { type Control, Controller } from 'react-hook-form';
import IconDrag02 from '../../../../assets/icon/icon-drag-02';
import { TextInput } from '../../../../components/form';
import { RichTextEditor } from '../../../../components/editor/rich-text-editor.component';
import { StackRowAlignCenter } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { ProductInfoFormItem } from '../../../../apis/product/product.interface';

type ProductSpuInfosFormValues = { productInfos?: ProductInfoFormItem[] };

export type ProductSpuInfoRowProps = {
  id: string;
  index: number;
  control: Control<ProductSpuInfosFormValues>;
  collapseAllSignal?: number;
  disabled?: boolean;
  onRemove: () => void;
};

export const ProductSpuInfoRow = ({ id, index, control, collapseAllSignal, disabled = false, onRemove }: ProductSpuInfoRowProps) => {
  const [expanded, setExpanded] = useState(true);
  const prevCollapseAllSignalRef = useRef(collapseAllSignal);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

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

  return (
    <Stack
      ref={setNodeRef}
      style={style}
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        px: 1.5,
        py: 1.25,
        bgcolor: '#FFF',
        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)',
      }}
    >
      <StackRowAlignCenter>
        <Box
          {...attributes}
          {...listeners}
          aria-label="Kéo để sắp xếp"
          sx={{
            cursor: disabled ? 'default' : 'grab',
            display: 'flex',
            alignItems: 'center',
            color: '#9CA3AF',
            pr: 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <IconDrag02 />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Mục {index + 1}</Typography>
        </Box>
        <PermissionIconButton size="small" disabled={disabled} onClick={() => setExpanded((prev) => !prev)} sx={{ color: '#667085', ml: 0.5 }}>
          <KeyboardArrowDownRounded
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </PermissionIconButton>
        <PermissionIconButton size="small" aria-label="Xóa mục thông tin" disabled={disabled} onClick={onRemove} sx={{ ml: 0.5 }}>
          <Trash01 size={18} />
        </PermissionIconButton>
      </StackRowAlignCenter>

      <Collapse in={expanded}>
        <Stack gap={2} sx={{ pt: 1.5, pl: 4 }}>
          <Controller
            control={control}
            name={`productInfos.${index}.title`}
            render={({ field: titleField, fieldState }) => (
              <TextInput
                {...titleField}
                value={titleField.value ?? ''}
                label="Tiêu đề"
                placeholder="VD: Chi tiết sản phẩm"
                disabled={disabled}
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name={`productInfos.${index}.description`}
            render={({ field: descField, fieldState }) => (
              <RichTextEditor label="Nội dung" value={descField.value ?? ''} onChange={descField.onChange} disabled={disabled} error={!!fieldState.error} errorMessage={fieldState.error?.message} />
            )}
          />
        </Stack>
      </Collapse>
    </Stack>
  );
};
