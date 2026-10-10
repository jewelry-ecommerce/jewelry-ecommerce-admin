import { Stack, Typography } from '@mui/material';
import { Plus } from '@untitledui/icons';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Control, useFieldArray, useWatch } from 'react-hook-form';
import { useCallback, useState, useMemo } from 'react';
import { ButtonIconContentComponent } from '../../../../components/button';

import { StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { ProductInfoFormItem } from '../../../../apis/product/product.interface';
import { ProductSpuInfoRow } from './product-spu-info-row.component';

type ProductSpuInfosFormValues = { productInfos?: ProductInfoFormItem[] };

type ProductSpuInfosFormProps = {
  control: Control<ProductSpuInfosFormValues>;
  disabled?: boolean;
};

const emptyInfoItem = (sortOrder: number): ProductInfoFormItem => ({
  title: '',
  description: '',
  sortOrder,
});

export const ProductSpuInfosForm = ({ control, disabled = false }: ProductSpuInfosFormProps) => {
  const [collapseAllSignal, setCollapseAllSignal] = useState(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'productInfos' });
  const watchedInfos = useWatch({ control, name: 'productInfos' });
  const productInfos = useMemo(()=>watchedInfos??[],[watchedInfos]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (disabled) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove([...(productInfos as ProductInfoFormItem[])], oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
      replace(reordered);
    },
    [disabled, fields, productInfos, replace],
  );

  return (
    <Stack gap={1.5}>
      <StackRowAlignCenterJustBetween>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#6B7280' }}>Thông tin bổ sung (tab trên trang chi tiết)</Typography>
        <ButtonIconContentComponent
          content="Thu gọn tất cả"
          disabled={disabled || fields.length === 0}
          onClick={() => setCollapseAllSignal(Date.now())}
          sx={{ px: 1.25, py: 0.5, flexShrink: 0, color: '#374151', border: '1px solid #E5E7EB' }}
        />
      </StackRowAlignCenterJustBetween>

      {fields.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            <Stack gap={1.5}>
              {fields.map((field, index) => (
                <ProductSpuInfoRow key={field.id} id={field.id} index={index} control={control} collapseAllSignal={collapseAllSignal} disabled={disabled} onRemove={() => remove(index)} />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
      ) : null}

      <ButtonIconContentComponent
        content="Thêm mục thông tin"
        icon={<Plus size={20} color="#101828" />}
        disabled={disabled}
        onClick={() => append(emptyInfoItem(fields.length))}
        sx={{ color: '#111827', border: '1px solid #111827', padding: '6px 12px', width: 'fit-content' }}
      />
    </Stack>
  );
};
