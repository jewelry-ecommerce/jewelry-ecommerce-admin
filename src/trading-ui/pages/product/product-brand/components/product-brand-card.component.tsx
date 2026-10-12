import { Box, Link, Menu, MenuItem, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackAlignStartJustBetween, StackRowAlignCenter, StackRowAlignJustCenter } from '../../../../components/styled';
import type { ProductBrand } from '../product-brand.interface';
import { DotsHorizontal, Edit02 } from '@untitledui/icons';
import { SwitchContentElement } from '../../../../components/switch/switch-content.element';
import { type DataTableRowMenuItem } from '../../../../components/data-table/data-table.types';
import { BrandStatus } from '../../../../apis';
import { PermissionIconButton } from '../../../../components/button';
import { productListButtonPermission } from '../../product-permission.constants';
import { usePermissionGate } from '../../../../permissions/use-permission-gate.hook';

export interface ProductBrandCardProps {
  brand: ProductBrand;
  onEdit?: (brand: ProductBrand) => void;
  onToggleStatus?: (brand: ProductBrand, nextIsActive: boolean) => void;
  onDelete?: (brand: ProductBrand) => void;
}

const CARD_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#000000';
const TEXT_MUTED = '#6B7280';
/** Fallback logo (same as mock "HEARTLOCK"). */
const DEFAULT_BRAND_LOGO_SRC = '/images/icon/brand.svg';

type BrandRowMenuItemProps = {
  item: DataTableRowMenuItem;
  onSelect: () => void;
};

const BrandRowMenuItem = ({ item, onSelect }: BrandRowMenuItemProps) => {
  const canAccess = usePermissionGate({
    apiCode: item.apiCode,
    actionCode: item.actionCode,
    menuCode: item.menuCode,
    tabCode: item.tabCode,
  });

  if (!canAccess) return null;

  return (
    <MenuItem key={item.content} onClick={onSelect} sx={{ ...(item.destructive ? { color: '#EF4444' } : {}) }}>
      {item.content}
    </MenuItem>
  );
};

export const ProductBrandCard = ({ brand, onEdit, onToggleStatus, onDelete }: ProductBrandCardProps) => {
  const canToggleBrandStatus = true;
  // state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const initialLogoSrc = useMemo(() => brand.logoUrl ?? DEFAULT_BRAND_LOGO_SRC, [brand.logoUrl]);
  const [logoSrc, setLogoSrc] = useState<string | null>(initialLogoSrc);

  useEffect(() => {
    setLogoSrc(initialLogoSrc);
  }, [initialLogoSrc]);

  // function
  const getRowMenu = useCallback(
    (row: ProductBrand): DataTableRowMenuItem[] => [
      {
        content: 'Xem chi tiết',
        onClick: () => onEdit?.(row),
        ...productListButtonPermission('edit_brand', 'Xem chi tiết thương hiệu', 'api_brand_update'),
      },
      {
        content: 'Chỉnh sửa thương hiệu',
        onClick: () => onEdit?.(row),
        ...productListButtonPermission('edit_brand', 'Chỉnh sửa thương hiệu', 'api_brand_update'),
      },
      {
        content: 'Xóa thương hiệu',
        destructive: true,
        onClick: () => onDelete?.(row),
        ...productListButtonPermission('delete_brand', 'Xóa thương hiệu', 'api_brand_delete'),
      },
    ],
    [onDelete, onEdit],
  );

  return (
    <StackRowAlignCenter
      sx={{
        border: `1px solid ${CARD_BORDER}`,
        bgcolor: '#FFFFFF',
        borderRadius: '10px',
        p: '16px 18px',
        gap: 2.5,
        minWidth: 0,
      }}
    >
      <StackRowAlignJustCenter
        sx={{
          width: 120,
          height: 'auto',
          maxHeight: 80,
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        {logoSrc ? (
          <Box
            component="img"
            src={logoSrc}
            alt={brand.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }}
            onError={() => {
              setLogoSrc((prev) => {
                if (!prev) return null;
                if (prev !== DEFAULT_BRAND_LOGO_SRC) return DEFAULT_BRAND_LOGO_SRC;
                return null;
              });
            }}
          />
        ) : (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: TEXT_MUTED }}>LOGO</Typography>
        )}
      </StackRowAlignJustCenter>

      <StackAlignStartJustBetween sx={{ gap: 1, flex: 1, minWidth: 0 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          Mã thương hiệu:{' '}
          <Typography component="span" sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: TEXT_PRIMARY }}>
            {brand.code}
          </Typography>
        </Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: TEXT_PRIMARY }} noWrap>
          {brand.name}
        </Typography>

        {brand.websiteUrl ? (
          <Link href={brand.websiteUrl} target="_blank" rel="noreferrer" sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#2563EB' }}>
            URL
          </Link>
        ) : null}
      </StackAlignStartJustBetween>

      <StackRowAlignCenter sx={{ gap: 2, flexShrink: 0, cursor: 'pointer' }}>
        {canToggleBrandStatus ? (
          <SwitchContentElement
            content={brand.status === BrandStatus.ACTIVE ? 'Kích hoạt' : 'Vô hiệu hóa'}
            value={brand.status === BrandStatus.ACTIVE}
            onChange={() => onToggleStatus?.(brand, brand.status === BrandStatus.ACTIVE ? false : true)}
          />
        ) : null}
        <PermissionIconButton size="small" onClick={() => onEdit?.(brand)} sx={{ p: 0 }} {...productListButtonPermission('edit_brand', 'Chỉnh sửa thương hiệu', 'api_brand_update')}>
          <Edit02 size={20} />
        </PermissionIconButton>
        <PermissionIconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }} {...productListButtonPermission('view', 'Menu thao tác thương hiệu', 'api_brand_list')}>
          <DotsHorizontal size={20} />
        </PermissionIconButton>
        <Menu
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { borderRadius: '8px', minWidth: 180 } }}
        >
          {getRowMenu(brand).map((item) => (
            <BrandRowMenuItem
              key={item.content}
              item={item}
              onSelect={() => {
                item.onClick();
                setAnchorEl(null);
              }}
            />
          ))}
        </Menu>
      </StackRowAlignCenter>
    </StackRowAlignCenter>
  );
};
