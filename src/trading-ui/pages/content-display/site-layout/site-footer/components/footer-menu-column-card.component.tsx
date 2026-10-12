import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { Box, Collapse, IconButton, Stack } from '@mui/material';
import { CustomButton } from '../../../../../components/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash03 } from '@untitledui/icons';
import { type CSSProperties } from 'react';

import type { FooterMenuColumnInput } from '../../../../../apis';
import { contentFooterButtonPermission } from '../../../content-permission.constants';
import { PermissionIconButton } from '../../../../../components/button/permission-icon-button';
import { getMenuColumnTitleError, getMenuItemFieldError, type FooterFormErrors } from '../site-footer.utils';
import IconDrag02 from '../../../../../assets/icon/icon-drag-02';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { TextInput } from '../../../../../components/form';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../../components/styled';

export type FooterMenuColumnCardProps = {
  column: FooterMenuColumnInput;
  colIndex: number;
  viewMode?: boolean;
  expanded: boolean;
  formErrors?: FooterFormErrors;
  onToggle: () => void;
  onRemove: () => void;
  onTitleChange: (title: string) => void;
  onItemChange: (itemIndex: number, patch: Partial<{ label: string; url: string }>) => void;
  onRemoveItem: (itemIndex: number) => void;
  onAddItem: () => void;
};

export const FooterMenuColumnCard = ({
  column,
  colIndex,
  viewMode = false,
  expanded,
  formErrors = {},
  onToggle,
  onRemove,
  onTitleChange,
  onItemChange,
  onRemoveItem,
  onAddItem,
}: FooterMenuColumnCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(colIndex), disabled: viewMode });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <Stack ref={setNodeRef} style={style} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <StackRowAlignCenterJustBetween
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: '#F9FAFB',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#F3F4F6' },
        }}
        onClick={onToggle}
      >
        <StackRowAlignCenter gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
          {!viewMode ? (
            <Box
              {...attributes}
              {...listeners}
              aria-label="Kéo để đổi thứ tự cột"
              onClick={(e) => e.stopPropagation()}
              sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#9CA3AF' }}
            >
              <IconDrag02 />
            </Box>
          ) : null}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            <KeyboardArrowDownRounded
              sx={{
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease',
                color: '#667085',
              }}
            />
          </IconButton>
          <Box
            component="span"
            sx={{
              ...TYPOGRAPHY_STYLES.sm.semibold,
              color: '#101828',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {column.title || `Cột ${colIndex + 1}`}
          </Box>
        </StackRowAlignCenter>
        {!viewMode ? (
          <PermissionIconButton
            size="small"
            aria-label="Xóa cột footer"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            sx={{ color: '#6B7280', flexShrink: 0 }}
            {...contentFooterButtonPermission('footer_remove_column', 'Xóa cột footer', 'api_cms_footer_update')}
          >
            <Trash03 size={20} />
          </PermissionIconButton>
        ) : null}
      </StackRowAlignCenterJustBetween>

      <Collapse in={expanded}>
        <Stack gap={1.5} sx={{ p: 1.5 }}>
          <TextInput
            requiredMark
            label={`Tiêu đề cột ${colIndex + 1}`}
            disabled={viewMode}
            value={column.title}
            onChange={(e) => onTitleChange(e.target.value)}
            error={Boolean(getMenuColumnTitleError(formErrors, colIndex))}
            errorMessage={getMenuColumnTitleError(formErrors, colIndex)}
          />
          {column.items.map((item, itemIndex) => (
            <StackRowAlignCenter key={item.id ?? itemIndex} gap={1} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  requiredMark
                  label="Nhãn"
                  disabled={viewMode}
                  value={item.label}
                  onChange={(e) => onItemChange(itemIndex, { label: e.target.value })}
                  error={Boolean(getMenuItemFieldError(formErrors, colIndex, itemIndex, 'label'))}
                  errorMessage={getMenuItemFieldError(formErrors, colIndex, itemIndex, 'label')}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextInput
                  requiredMark
                  label="Đường dẫn"
                  disabled={viewMode}
                  value={item.url}
                  onChange={(e) => onItemChange(itemIndex, { url: e.target.value })}
                  error={Boolean(getMenuItemFieldError(formErrors, colIndex, itemIndex, 'url'))}
                  errorMessage={getMenuItemFieldError(formErrors, colIndex, itemIndex, 'url')}
                />
              </Box>
              {!viewMode ? (
                <PermissionIconButton
                  aria-label="Xóa liên kết"
                  onClick={() => onRemoveItem(itemIndex)}
                  sx={{ mt: 2.5, color: '#6B7280' }}
                  {...contentFooterButtonPermission('footer_remove_link', 'Xóa liên kết footer', 'api_cms_footer_update')}
                >
                  <Trash03 size={18} />
                </PermissionIconButton>
              ) : null}
            </StackRowAlignCenter>
          ))}
          {!viewMode ? (
            <CustomButton
              fullWidth={false}
              variant="outline"
              startIcon={<Plus size={16} />}
              onClick={onAddItem}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              {...contentFooterButtonPermission('footer_add_link', 'Thêm liên kết footer', 'api_cms_footer_update')}
            >
              Thêm liên kết
            </CustomButton>
          ) : null}
        </Stack>
      </Collapse>
    </Stack>
  );
};
