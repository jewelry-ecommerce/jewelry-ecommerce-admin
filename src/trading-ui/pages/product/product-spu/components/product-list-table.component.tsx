
import { IconButton,Stack } from '@mui/material';
import { Globe01,Eye,Edit02 } from '@untitledui/icons';
import { useNavigate } from 'react-router-dom';
import { DataTable,type DataTableColumn } from '@/components/data-table';
import type { Product } from '@/trading-ui/apis/pim';
import { ProductSpuStatus } from '@/trading-ui/apis/pim';
import { getProductDetailPath,getProductEditPath } from '@/router/route.path';
import { TooltipOnHoverComponent } from '@/components/tooltip/tooltip-on-hover.component';
import { productListColumns } from './product-list-columns';
interface ProductListTableProps {rows:Product[];busy:boolean;changeStatus:(id:string,status:ProductSpuStatus)=>Promise<void>}
function ProductRowActions({row,busy,changeStatus}:Omit<ProductListTableProps,'rows'> & {row:Product}) {
  const navigate=useNavigate();
  const status=row.status===ProductSpuStatus.PUBLISHED?ProductSpuStatus.UNPUBLISHED:ProductSpuStatus.PUBLISHED;
  return <Stack direction="row" justifyContent="center" gap={1}>
    <TooltipOnHoverComponent content="Xem chi tiết"><IconButton size="small" onClick={()=>navigate(getProductDetailPath(row.id))}><Eye size={18}/></IconButton></TooltipOnHoverComponent>
    <TooltipOnHoverComponent content="Chỉnh sửa"><IconButton size="small" onClick={()=>navigate(getProductEditPath(row.id))}><Edit02 size={18}/></IconButton></TooltipOnHoverComponent>
    <TooltipOnHoverComponent content={status===ProductSpuStatus.PUBLISHED?'Xuất bản':'Ngừng xuất bản'}>
      <IconButton size="small" disabled={busy} onClick={()=>void changeStatus(row.id,status)}><Globe01 size={18}/></IconButton>
    </TooltipOnHoverComponent>
  </Stack>;
}
export function ProductListTable({rows,busy,changeStatus}:ProductListTableProps) {
  const actions:DataTableColumn<Product>={id:'actions',label:'',width:140,align:'center',sticky:'right',
    renderCell:row=><ProductRowActions row={row} busy={busy} changeStatus={changeStatus}/>};
  return <DataTable rows={rows} columns={[...productListColumns,actions]} getRowId={row=>row.id}
    containerSx={{flex:1,minHeight:0,height:'100%'}} emptyTitle="Không có sản phẩm phù hợp"
    emptyDescription="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."/>;
}
