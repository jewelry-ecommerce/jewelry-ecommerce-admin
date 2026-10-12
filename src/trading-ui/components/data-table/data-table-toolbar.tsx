import { Button, Checkbox, Divider, ListItemText, Menu, MenuItem, Stack, TextField, type SxProps, type Theme } from '@mui/material';
import { Fragment, type MouseEvent, useMemo, useState } from 'react';
import { type DataTableToolbarAction, type DataTableToolbarFilterSelect } from './data-table.types';
import { SearchInput } from '../form';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { usePermissionContext } from '@/permissions/use-permission-context.hook';

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions: DataTableToolbarAction[];
  searchDebounceMs?: number;
  /** Tắt autofill trình duyệt cho ô tìm kiếm (tránh lẫn SĐT/email đăng nhập). */
  searchAutoComplete?: string;
  /** Bỏ viền/padding ngoài — dùng khi bọc trong khung (vd. card filter có sẵn p:16). */
  embedded?: boolean;
  sx?: SxProps<Theme>;
  filterSelect?: DataTableToolbarFilterSelect;
  hideSearch?: boolean;
}

const outlinedButtonSx = {
  height: 40,
  px: 1.5,
  borderColor: '#D0D5DD',
  color: '#111827',
  backgroundColor: '#FFFFFF',
  textTransform: 'none',
  borderRadius: 2,
  ...TYPOGRAPHY_STYLES.base.medium,
  whiteSpace: 'nowrap',
  '&:hover': {
    borderColor: '#94A3B8',
    backgroundColor: '#F8FAFC',
  },
};

const containedButtonSx = {
  height: 40,
  px: 1.75,
  backgroundColor: '#111827',
  color: '#FFFFFF',
  textTransform: 'none',
  borderRadius: 2,
  ...TYPOGRAPHY_STYLES.base.medium,
  boxShadow: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#0B1220',
    boxShadow: 'none',
  },
};

export const DataTableToolbar = ({
  searchValue = '',
  onSearchChange = () => {},
  searchPlaceholder = '',
  actions,
  searchDebounceMs = 500,
  searchAutoComplete = 'off',
  embedded = false,
  sx = {},
  filterSelect,
  hideSearch = false,
}: DataTableToolbarProps) => {
  const { hasApiAccess, canAccessAction } = usePermissionContext();
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const activeAction = useMemo(() => actions.find((action) => action.key === activeMenuKey && action.options?.length), [actions, activeMenuKey]);

  const openMenu = (event: MouseEvent<HTMLElement>, actionKey: string) => {
    setActiveMenuKey(actionKey);
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setActiveMenuKey(null);
    setMenuAnchor(null);
  };

  const canUseAction = (action: DataTableToolbarAction): boolean => {
    const hasActionPermission = action.menuCode && action.tabCode && action.actionCode ? canAccessAction(action.menuCode, action.tabCode, action.actionCode) : true;
    const hasApiPermission = action.apiCode ? hasApiAccess(action.apiCode) : true;
    return hasActionPermission && hasApiPermission;
  };

  const shouldRenderAction = (action: DataTableToolbarAction): boolean => {
    if (canUseAction(action)) return true;
    return !action.actionCode && !action.apiCode;
  };

  const handleActionClick = (event: MouseEvent<HTMLElement>, action: DataTableToolbarAction) => {
    if (!canUseAction(action)) return;
    if (action.options?.length) {
      openMenu(event, action.key);
      return;
    }

    action.onClick?.();
  };

  const handleSelectOption = (value: string) => {
    if (activeAction?.multiSelect) {
      activeAction.onToggleOption?.(value);
      return;
    }
    activeAction?.onSelectOption?.(value);
    closeMenu();
  };

  const getActionSx = (action: DataTableToolbarAction): SxProps<Theme> => {
    const baseSx = action.variant === 'contained' ? containedButtonSx : outlinedButtonSx;
    return action.sx ? ([baseSx, action.sx] as SxProps<Theme>) : (baseSx as SxProps<Theme>);
  };

  return (
    <>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        alignItems={{ xs: 'stretch', lg: 'center' }}
        sx={{
          width: '100%',
          ...(embedded ? { px: 0, py: 0, borderBottom: 'none' } : { px: { xs: 2 }, py: 1.75, borderBottom: '1px solid #E5E7EB' }),
          ...sx,
        }}
      >
        {!hideSearch && (
          <SearchInput
            value={searchValue}
            onDebouncedChange={onSearchChange}
            debounceMs={searchDebounceMs}
            placeholder={searchPlaceholder}
            autoComplete={searchAutoComplete}
            name="data-table-search"
            size="small"
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              '& .MuiOutlinedInput-root': {
                height: 40,
                backgroundColor: '#FFFFFF',
              },
            }}
            slotProps={{
              input: {
                sx: {
                  fontSize: 13,
                  color: '#111827',
                },
              },
            }}
          />
        )}

        <Stack direction="row" useFlexGap flexWrap="wrap" sx={{ flexShrink: 0, ml: { lg: 'auto' }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
          {filterSelect && (
            <TextField
              select
              value={filterSelect.value}
              onChange={(e) => filterSelect.onChange(String((e.target as HTMLInputElement).value))}
              size="small"
              sx={{ width: filterSelect.width ?? 140, flexShrink: 0 }}
            >
              {filterSelect.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {actions.filter(shouldRenderAction).map((action) => {
            if (action.customNode) {
              return <Fragment key={action.key}>{action.customNode}</Fragment>;
            }
            const allowed = canUseAction(action);
            const isDisabled = Boolean(action.disabled || !allowed);
            return (
              <Button
                key={action.key}
                fullWidth={false}
                variant={action.variant ?? 'outlined'}
                startIcon={action.icon}
                endIcon={action.endIcon}
                disabled={isDisabled}
                onClick={(event) => handleActionClick(event, action)}
                sx={getActionSx(action)}
              >
                {action.selectedOptionLabel ?? action.label}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && activeAction)}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 0.5,
            minWidth: activeAction?.menuMinWidth ?? 180,
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        {activeAction?.options?.map((option) => {
          const isMulti = Boolean(activeAction.multiSelect);
          const checked = Boolean(activeAction.selectedOptionValues?.includes(option.value));
          return (
            <Fragment key={option.value}>
              {option.dividerBefore ? <Divider sx={{ my: 0.5 }} /> : null}
              <MenuItem onClick={() => handleSelectOption(option.value)} sx={{ fontSize: 13, color: '#111827', ...(isMulti ? { py: 0.5 } : {}) }}>
                {isMulti ? (
                  <>
                    <Checkbox size="small" checked={checked} tabIndex={-1} disableRipple sx={{ p: 0.5, mr: 0.75 }} />
                    <ListItemText primary={option.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </>
                ) : (
                  option.label
                )}
              </MenuItem>
            </Fragment>
          );
        })}
      </Menu>
    </>
  );
};
