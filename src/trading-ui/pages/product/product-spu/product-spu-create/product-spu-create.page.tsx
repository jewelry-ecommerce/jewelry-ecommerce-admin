
import { Box,Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HEIGHT_HEADER } from '@/trading-ui/adapters/style-tokens';
import { LabelFormPageHeader } from '@/trading-ui/pages/content-display/label/components/label-form-page-header.component';
import { ROUTE_PATH } from '@/router/route.path';
import { ProductSpuPageSectionsFrame } from '../components/product-spu-page-sections.component';
import { ProductSpuSidebarKey } from '../product-spu.constant';
import { useProductCreateForm } from '../hooks/use-product-create-form.hook';
import { ProductCreateActions } from '../components/product-create-actions.component';
import { ProductCreateGeneral,ProductCreateVariants,ProductCreateSeo } from '../components/product-create-sections.component';
import type { ProductFormSnapshot } from '@/trading-ui/apis/product/product-form.mapper';
export default function ProductSpuCreatePage({initial,readOnly=false}:{initial?:ProductFormSnapshot;readOnly?:boolean}) {
  const navigate=useNavigate(),model=useProductCreateForm(initial,readOnly);
  const sections=[
    {key:ProductSpuSidebarKey.GENERAL,content:<ProductCreateGeneral model={model}/>},
    {key:ProductSpuSidebarKey.VARIANTS,content:<ProductCreateVariants model={model}/>},
    {key:ProductSpuSidebarKey.SEO,content:<ProductCreateSeo model={model}/>},
  ];
  return <Stack sx={{height:'calc(100vh - '+HEIGHT_HEADER+'px)',boxSizing:'border-box',minHeight:0,bgcolor:'#F9FAFB',gap:0}}>
    <LabelFormPageHeader variant="backOnly" onBack={()=>navigate(ROUTE_PATH.PRODUCT_LIST)}/>
    <ProductCreateActions model={model}/>
    <Box sx={{flex:1,minHeight:0,p:3,pt:0}}>
      <ProductSpuPageSectionsFrame sections={sections} scrollAreaMaxHeight="calc(100vh - 220px)" sx={{pt:2}}/>
    </Box>
  </Stack>;
}
