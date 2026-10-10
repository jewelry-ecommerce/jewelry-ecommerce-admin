
import { Stack,Box,Alert } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WrapperComponent } from '@/components/wrapper/wrapper.component';
import { DataTableStatusTabs,DataTableToolbar,DataTablePagination } from '@/components/data-table';
import { ProductSpuStatus } from '@/trading-ui/apis/pim';
import { HEIGHT_HEADER } from '@/trading-ui/adapters/style-tokens';
import { ROUTE_PATH } from '@/router/route.path';
import { useProductList } from '../hooks/use-product-list.hook';
import { ProductListTable } from '../components/product-list-table.component';
import { LoadingComponent } from '@/trading-ui/components/loading/loading.component';
import type { ProductListCountsDto } from '@/trading-ui/apis/product/product.interface';
function statusTabs(counts:ProductListCountsDto|undefined) {
  return [{value:ProductSpuStatus.ALL,label:'Tất cả',count:counts?.all},
    {value:ProductSpuStatus.DRAFT,label:'Bản nháp',count:counts?.draft},
    {value:ProductSpuStatus.PUBLISHED,label:'Xuất bản',count:counts?.published},
    {value:ProductSpuStatus.UNPUBLISHED,label:'Ngừng xuất bản',count:counts?.unpublished},
    {value:ProductSpuStatus.DISCONTINUED,label:'Ngừng kinh doanh',count:counts?.discontinued},
    {value:ProductSpuStatus.ARCHIVED,label:'Lưu trữ',count:counts?.archived}];
}
export default function ProductSpuListPage() {
  const navigate=useNavigate(),model=useProductList();
  const {query,setQuery,result}=model;
  return <Stack sx={{height:'calc(100vh - '+HEIGHT_HEADER+'px)',boxSizing:'border-box',minHeight:0}}>
    <WrapperComponent label="Danh sách sản phẩm" tabs={<DataTableStatusTabs tabs={statusTabs(result.data?.counts)} activeValue={query.status}
      onChange={status=>setQuery(previous=>({...previous,status,page:1}))}/>}>
      <Box sx={{p:2,border:'1px solid #E5E7EB',bgcolor:'#FFFFFF',borderRadius:'10px'}}>
        <DataTableToolbar embedded searchValue={query.search} onSearchChange={search=>setQuery(previous=>({...previous,search,page:1}))}
          searchPlaceholder="Tìm theo tên sản phẩm, mã sản phẩm..."
          actions={[{key:'add',label:'Tạo sản phẩm',variant:'primary',icon:<AddRounded sx={{fontSize:18}}/>,onClick:()=>navigate(ROUTE_PATH.PRODUCT_CREATE)}]}/>
      </Box>
      {result.error?<Alert severity="error">{result.error instanceof Error?result.error.message:'Không thể tải sản phẩm.'}</Alert>:null}
      {result.isLoading?<LoadingComponent/>:<ProductListTable rows={result.data?.list??[]} busy={model.busy} changeStatus={model.changeStatus}/>}
      <DataTablePagination page={query.page} pageSize={query.take} totalItems={result.data?.total??0}
        onPageChange={page=>setQuery(previous=>({...previous,page}))} onPageSizeChange={take=>setQuery(previous=>({...previous,take,page:1}))}/>
    </WrapperComponent>
  </Stack>;
}
