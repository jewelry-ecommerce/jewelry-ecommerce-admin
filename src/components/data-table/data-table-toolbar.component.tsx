import { Divider, Menu, MenuItem, Stack, type SxProps, type Theme } from "@mui/material";
import { Fragment, useMemo, useState, type MouseEvent } from "react";

import { CustomButton } from "@/components/button/custom-button.component";
import type { DataTableToolbarAction, DataTableToolbarFilterSelect } from "@/components/data-table/data-table.types";
import { SearchInput } from "@/components/form/search-input.component";
import { SelectInput } from "@/components/form/select-input.component";
import { usePermissionContext } from "@/permissions/use-permission-context.hook";
import { COLOR } from "@/theme/design-tokens";

const SEARCH_DEBOUNCE_MS = 500;

export interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  hideSearch?: boolean;
  actions?: DataTableToolbarAction[];
  /** Up to two selects sit beside the actions; anything more belongs in a filter drawer. */
  filterSelects?: [DataTableToolbarFilterSelect?, DataTableToolbarFilterSelect?];
  /** Removes the outer padding and border when the toolbar already sits inside a filter card. */
  embedded?: boolean;
  sx?: SxProps<Theme>;
}

export const DataTableToolbar = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  searchDebounceMs = SEARCH_DEBOUNCE_MS,
  hideSearch = false,
  actions = [],
  filterSelects,
  embedded = false,
  sx,
}: DataTableToolbarProps) => {
  const { hasApiAccess, canAccessAction } = usePermissionContext();
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const activeAction = useMemo(
    () => actions.find((action) => action.key === activeMenuKey && action.options?.length),
    [actions, activeMenuKey],
  );

  const canUseAction = (action: DataTableToolbarAction): boolean => {
    const hasActionAccess =
      action.menuCode && action.tabCode && action.actionCode ? canAccessAction(action.menuCode, action.tabCode, action.actionCode) : true;
    const hasApiPermission = action.apiCode ? hasApiAccess(action.apiCode) : true;
    return hasActionAccess && hasApiPermission;
  };

  /** A denied action disappears when it declares permission metadata; ungated ones always render. */
  const shouldRenderAction = (action: DataTableToolbarAction): boolean =>
    canUseAction(action) || (action.unauthorizedMode === "disable" ? true : !action.actionCode && !action.apiCode);

  const closeMenu = () => {
    setActiveMenuKey(null);
    setMenuAnchor(null);
  };

  const handleActionClick = (event: MouseEvent<HTMLElement>, action: DataTableToolbarAction) => {
    if (!canUseAction(action)) return;
    if (action.options?.length) {
      setActiveMenuKey(action.key);
      setMenuAnchor(event.currentTarget);
      return;
    }
    action.onClick?.();
  };

  const visibleFilterSelects = (filterSelects ?? []).filter((entry): entry is DataTableToolbarFilterSelect => Boolean(entry)).slice(0, 2);

  return (
    <>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", lg: "flex-end" }}
        sx={{
          width: "100%",
          ...(embedded ? {} : { px: 2, py: 1.75, borderBottom: `1px solid ${COLOR.NEUTRAL[200]}` }),
          ...sx,
        }}
      >
        {hideSearch ? null : (
          <SearchInput
            value={searchValue}
            debounceMs={searchDebounceMs}
            placeholder={searchPlaceholder}
            onDebouncedChange={(value) => onSearchChange?.(value)}
            sx={{ flex: 1, minWidth: 0 }}
          />
        )}

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ flexShrink: 0, ml: { lg: "auto" }, alignItems: "flex-end" }}>
          {visibleFilterSelects.map((filterSelect, index) => (
            <Stack key={filterSelect.label ?? `filter-${index}`} sx={{ width: filterSelect.width ?? 180, flexShrink: 0 }}>
              <SelectInput
                label={filterSelect.label}
                value={filterSelect.value}
                options={filterSelect.options}
                onChange={(value) => filterSelect.onChange(String(value))}
              />
            </Stack>
          ))}

          {actions.filter(shouldRenderAction).map((action) => {
            if (action.customNode) return <Fragment key={action.key}>{action.customNode}</Fragment>;

            return (
              <CustomButton
                key={action.key}
                variant={action.variant ?? "outline"}
                startIcon={action.icon}
                endIcon={action.endIcon}
                disabled={action.disabled}
                loading={action.loading}
                menuCode={action.menuCode}
                tabCode={action.tabCode}
                actionCode={action.actionCode}
                actionLabel={action.actionLabel ?? action.label}
                apiCode={action.apiCode}
                unauthorizedMode={action.unauthorizedMode ?? "disable"}
                onClick={(event) => handleActionClick(event, action)}
                sx={action.sx}
              >
                {action.label}
              </CustomButton>
            );
          })}
        </Stack>
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && activeAction)}
        onClose={closeMenu}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0.5,
              minWidth: activeAction?.menuMinWidth ?? 180,
              border: `1px solid ${COLOR.NEUTRAL[200]}`,
              borderRadius: 2,
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
            },
          },
        }}
      >
        {activeAction?.options?.map((option) => (
          <Fragment key={option.value}>
            {option.dividerBefore ? <Divider sx={{ my: 0.5 }} /> : null}
            <MenuItem
              onClick={() => {
                activeAction.onSelectOption?.(option.value);
                closeMenu();
              }}
            >
              {option.label}
            </MenuItem>
          </Fragment>
        ))}
      </Menu>
    </>
  );
};
