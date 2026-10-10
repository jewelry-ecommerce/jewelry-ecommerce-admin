
import { Alert } from '@mui/material';
import { useParams,useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { productApi } from '@/trading-ui/apis/pim';
import { LoadingComponent } from '@/trading-ui/components/loading/loading.component';
import ProductSpuCreatePage from '../product-spu-create/product-spu-create.page';
export default function ProductSpuEditPage() {
  const {id}=useParams<{id:string}>(),location=useLocation();
  const {data,error,isLoading}=useSWR(id?['pim/product/form',id]:null,()=>{
    if(!id) throw new Error('Thiếu ID sản phẩm.');
    return productApi.getProductForm(id);
  },{revalidateOnFocus:false});
  if(error) return <Alert severity="error">{error instanceof Error?error.message:'Không thể tải sản phẩm.'}</Alert>;
  if(isLoading||!data) return <LoadingComponent/>;
  return <ProductSpuCreatePage key={data.id} initial={data} readOnly={!location.pathname.endsWith('/edit')}/>;
}
