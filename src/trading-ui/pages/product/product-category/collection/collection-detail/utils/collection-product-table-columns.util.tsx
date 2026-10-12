import { Box, Tooltip, Typography } from '@mui/material';
import { Trash01 } from '@untitledui/icons';

import { CollectionProductThumbCell } from '../components/collection-product-thumb-cell.component';
import type { CollectionDetailRow } from '../collection-detail.interface';
import { getProductCategoryName } from './collection-detail.util';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { StackRowAlignJustCenter } from '../../../../../../components/styled';
import { type DataTableColumn } from '../../../../../../components/data-table';
import { TagCommonComponent } from '../../../../../../components/tag';
import { getProductApprovalStatusLabelVi, getProductLifecycleStatusLabelVi } from '../../../../product-spu/product-spu.constant';

/** Tổng width cột dữ liệu (+ checkbox 52px trong DataTable). */
export const COLLECTION_PRODUCT_TABLE_MIN_WIDTH = 1040;

export interface CollectionProductTableActions {
  onView?: (row: CollectionDetailRow) => void;
  onDelete: (row: CollectionDetailRow) => void;
}

export const buildCollectionProductTableColumns = ({ onDelete }: CollectionProductTableActions): Array<DataTableColumn<CollectionDetailRow>> => [
  {
    id: 'image',
    label: 'Hình ảnh',
    width: 100,
    align: 'center',
    renderCell: (row) => <CollectionProductThumbCell product={row.product} />,
  },
  {
    id: 'sku',
    label: 'Mã sản phẩm',
    width: 250,
    renderCell: (row) => (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }} noWrap>
        {row.product.spuCode || '—'}
      </Typography>
    ),
  },
  {
    id: 'name',
    label: 'Tên sản phẩm',
    width: 280,
    renderCell: (row) => (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }} noWrap>
        {row.product.name}
      </Typography>
    ),
  },
  {
    id: 'categoryName',
    label: 'Danh mục',
    width: 240,
    renderCell: (row) => (
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }} noWrap>
        {getProductCategoryName({ category: row.product.category })}
      </Typography>
    ),
  },
  {
    id: 'status',
    label: 'Trạng thái sản phẩm',
    width: 240,
    renderCell: (row) => <TagCommonComponent content={getProductLifecycleStatusLabelVi(row.product.status)} border />,
  },
  {
    id: 'approval',
    label: 'Trạng thái yêu cầu',
    width: 240,
    renderCell: (row) => <TagCommonComponent content={getProductApprovalStatusLabelVi(row.product.approval, row.product.status)} />,
  },
  {
    id: 'actions',
    label: 'Thao tác',
    width: 100,
    align: 'center',
    sticky: 'right',
    renderCell: (row) => (
      <StackRowAlignJustCenter sx={{ gap: 1 }}>
        <Tooltip title="Xoá sản phẩm">
          <Box
            component="span"
            sx={{ display: 'inline-flex', cursor: 'pointer', lineHeight: 0 }}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row);
            }}
          >
            <Trash01 size={18} color="#374151" />
          </Box>
        </Tooltip>
      </StackRowAlignJustCenter>
    ),
  },
];
