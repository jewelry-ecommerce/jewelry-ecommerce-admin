
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/trading-ui/components/button';
import { StackRowAlignCenter,StackRowAlignCenterJustBetween } from '@/trading-ui/components/styled';
import { TYPOGRAPHY_STYLES } from '@/trading-ui/common/constant/typography.constant';
import { ROUTE_PATH } from '@/router/route.path';
import type { ProductCreateModel } from './product-create-sections.component';
export function ProductCreateActions({model}:{model:ProductCreateModel}) {
  const navigate=useNavigate();
  return <StackRowAlignCenterJustBetween sx={{px:3,py:2,backgroundColor:'#FFFFFF',borderBottom:'1px solid #E5E7EB'}}>
    <Typography sx={{...TYPOGRAPHY_STYLES['2xl'].bold,color:'#101828'}}>{model.readOnly?'Chi tiết sản phẩm':model.isUpdate?'Chỉnh sửa sản phẩm':'Tạo sản phẩm'}</Typography>
    <StackRowAlignCenter gap={1}>
      <CustomButton variant="outline" fullWidth={false} disabled={model.saving} onClick={()=>navigate(ROUTE_PATH.PRODUCT_LIST)}
        sx={{textTransform:'none',borderColor:'#101828',color:'#101828'}}>Hủy</CustomButton>
      {model.readOnly?null:<CustomButton variant="outline" fullWidth={false} disabled={model.saving}
        onClick={()=>void model.form.handleSubmit(values=>model.persist(values,false))()}
        sx={{textTransform:'none',borderColor:'#101828',color:'#101828'}}>{model.isUpdate?'Lưu thay đổi':'Lưu nháp'}</CustomButton>}
      {model.readOnly?null:<CustomButton variant="primary" fullWidth={false} disabled={model.saving}
        onClick={()=>void model.form.handleSubmit(values=>model.persist(values,true))()}
        sx={{textTransform:'none',bgcolor:'#101828',boxShadow:'none','&:hover':{bgcolor:'#101828',opacity:0.92}}}>Xuất bản</CustomButton>}
    </StackRowAlignCenter>
  </StackRowAlignCenterJustBetween>;
}
