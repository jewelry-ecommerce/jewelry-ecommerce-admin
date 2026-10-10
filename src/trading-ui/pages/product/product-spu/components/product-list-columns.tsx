import { Box,Typography } from '@mui/material';
import type { DataTableColumn } from '@/components/data-table';
import type { Product } from '@/trading-ui/apis/pim';
import { TYPOGRAPHY_STYLES } from '@/trading-ui/common/constant/typography.constant';
import { TagCommonComponent } from '@/trading-ui/components/tag/tag-common.component';
import { getProductLifecycleStatusLabelVi,PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../product-spu.constant';
export const productListColumns:DataTableColumn<Product>[]=[      {
        id: 'image',
        label: 'Ảnh',
        width: 100,
        renderCell: (row) =>
          row.image ? (
            <Box component="img" src={row.image} alt={row.name} sx={{ width: 48, height: 48, objectFit: 'contain' }} />
          ) : (
            <Box component="img" src={PRODUCT_SPU_DEFAULT_IMAGE_SRC} alt="product-default" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
          ),
      },
      {
        id: 'spuCode',
        label: 'Mã sản phẩm',
        width: 180,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.spuCode}</Typography>,
      },
      {
        id: 'name',
        label: 'Tên sản phẩm',
        width: 250,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.name}</Typography>,
      },
      {
        id: 'category',
        label: 'Danh mục',
        width: 200,
        renderCell: (row) => <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' }}>{row.category?.name ?? '—'}</Typography>,
      },
      {
        id: 'status',
        label: 'Trạng thái sản phẩm',
        width: 180,
        renderCell: (row) => <TagCommonComponent content={getProductLifecycleStatusLabelVi(row.status)} border />,
      },
];
