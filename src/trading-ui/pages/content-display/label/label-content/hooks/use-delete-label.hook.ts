import { useState } from 'react';
import { badgeApi,type BadgeTemplate } from '@/trading-ui/apis/badge';
import { SnackbarType,useSnackbar } from '@/trading-ui/hooks/use-snackbar.hook';
export function useDeleteLabel(refresh:()=>Promise<unknown>) {
  const [selected,setSelected]=useState<BadgeTemplate|null>(null),[loading,setLoading]=useState(false);
  const {showSnackbar}=useSnackbar();
  const confirm=async():Promise<void>=>{
    if(!selected||loading) return;
    setLoading(true);
    try {
      await badgeApi.deleteBadgeTemplate(selected.id);
      setSelected(null);await refresh();
      showSnackbar({type:SnackbarType.SUCCESS,message:'Đã xóa nhãn dán.'});
    } catch(error) {
      showSnackbar({type:SnackbarType.ERROR,message:error instanceof Error?error.message:'Không thể xóa nhãn.'});
    } finally {setLoading(false);}
  };
  return {selected,setSelected,loading,confirm};
}
