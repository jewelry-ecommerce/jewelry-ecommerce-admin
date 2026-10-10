
import { useState } from 'react';
import useSWR from 'swr';
import { productApi,ProductSpuStatus } from '@/trading-ui/apis/pim';
import { PIM_QUERY_POLICY } from '@/trading-ui/apis/pim.config';
import { useSnackbar,SnackbarType } from '@/trading-ui/hooks/use-snackbar.hook';
export function useProductList() {
  const [query,setQuery]=useState<{page:number;take:number;search:string;status:ProductSpuStatus}>({page:PIM_QUERY_POLICY.firstPage,take:PIM_QUERY_POLICY.defaultTake,search:'',status:ProductSpuStatus.ALL});
  const [busy,setBusy]=useState(false);
  const result=useSWR(['pim/products',JSON.stringify(query)],()=>productApi.getAdminProductList(query));
  const {showSnackbar}=useSnackbar();
  async function changeStatus(id:string,status:ProductSpuStatus):Promise<void> {
    if(busy) return;
    setBusy(true);
    try {await productApi.patchAdminProductStatus(id,status);await result.mutate();
      showSnackbar({message:status===ProductSpuStatus.PUBLISHED?'Đã xuất bản sản phẩm.':'Đã ngừng xuất bản sản phẩm.',type:SnackbarType.SUCCESS});}
    catch(error) {showSnackbar({message:error instanceof Error?error.message:'Không thể cập nhật trạng thái.',type:SnackbarType.ERROR});}
    finally {setBusy(false);}
  }
  return {query,setQuery,result,busy,changeStatus};
}
