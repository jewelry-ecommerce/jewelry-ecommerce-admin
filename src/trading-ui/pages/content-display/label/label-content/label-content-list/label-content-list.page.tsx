import { Alert,Box,IconButton,Stack,Typography } from '@mui/material';
import { AddRounded,DeleteOutline,EditOutlined,VisibilityOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { DataTable,DataTablePagination,DataTableToolbar,type DataTableColumn } from '@/components/data-table';
import { WrapperComponent } from '@/components/wrapper/wrapper.component';
import { HEIGHT_HEADER } from '@/trading-ui/adapters/style-tokens';
import { badgeApi,type BadgeTemplate } from '@/trading-ui/apis/badge';
import { ROUTE_PATH,getLabelContentDetailPath,getLabelContentUpdatePath } from '@/router/route.path';
import { badgePositionLabelVi,badgeTemplateBadgeTypeLabelVi } from '../label-content.utils';
import { getBadgeStatusLabelVi } from '../label-content.constants';
import { LabelDesignPreviewCell } from '../../components/label-design-preview-cell.component';
import { LoadingComponent } from '@/trading-ui/components/loading/loading.component';
import { LabelDeleteDialog } from '../../components/label-delete-dialog.component';
import { useDeleteLabel } from '../hooks/use-delete-label.hook';

function labelColumns(navigate:ReturnType<typeof useNavigate>,remove:(row:BadgeTemplate)=>void):DataTableColumn<BadgeTemplate>[] {
  return [
    {id:'name',label:'Tên labels',width:180,renderCell:row=><Typography>{row.name}</Typography>},
    {id:'preview',label:'Ảnh labels',width:200,renderCell:row=><LabelDesignPreviewCell badgeTemplate={row}/>},
    {id:'badgeType',label:'Phân loại',minWidth:112,renderCell:row=><Typography>{badgeTemplateBadgeTypeLabelVi(row.badgeType)}</Typography>},
    {id:'slot',label:'Vị trí',width:140,renderCell:row=><Typography>{row.defaultPosition?badgePositionLabelVi(row.defaultPosition):'—'}</Typography>},
    {id:'updatedAt',label:'Cập nhật lần cuối',width:160,renderCell:row=><Typography>{row.updatedAt.toLocaleString('vi-VN')}</Typography>},
    {id:'status',label:'Trạng thái',width:140,renderCell:row=><Typography>{getBadgeStatusLabelVi(row.status)}</Typography>},
    {id:'actions',label:'',width:100,renderCell:row=><Stack direction="row">
      <IconButton aria-label="Xem nhãn" onClick={()=>navigate(getLabelContentDetailPath(row.id))}><VisibilityOutlined fontSize="small"/></IconButton>
      <IconButton aria-label="Sửa nhãn" onClick={()=>navigate(getLabelContentUpdatePath(row.id))}><EditOutlined fontSize="small"/></IconButton>
      <IconButton aria-label="Xóa nhãn" onClick={()=>remove(row)}><DeleteOutline fontSize="small"/></IconButton>
    </Stack>},
  ];
}
export default function LabelContentListPage() {
  const navigate=useNavigate(),[query,setQuery]=useState({page:1,take:20,search:''});
  const result=useSWR(['badge-templates',query],()=>badgeApi.getListBadgeTemplate(query));
  const deletion=useDeleteLabel(()=>result.mutate());
  return <Stack sx={{height:'calc(100vh - '+HEIGHT_HEADER+'px)',minHeight:0}}>
    <WrapperComponent label="Danh sách nhãn dán">
      <Box sx={{p:2,border:'1px solid #E5E7EB',bgcolor:'#FFFFFF',borderRadius:'10px'}}>
        <DataTableToolbar embedded searchValue={query.search} onSearchChange={search=>setQuery(previous=>({...previous,search,page:1}))}
          searchPlaceholder="Tìm theo tên, mã nhãn..."
          actions={[{key:'add',label:'Tạo Labels',variant:'primary',icon:<AddRounded/>,onClick:()=>navigate(ROUTE_PATH.LABEL_CONTENT_CREATE)}]}/>
      </Box>
      {result.error?<Alert severity="error">{result.error instanceof Error?result.error.message:'Không thể tải nhãn.'}</Alert>:null}
      {result.isLoading?<LoadingComponent/>:<DataTable rows={result.data?.list??[]} columns={labelColumns(navigate,deletion.setSelected)} getRowId={row=>row.id}
        emptyTitle="Chưa có nhãn dán" emptyDescription="Tạo mẫu nhãn để cấu hình hiển thị trên sản phẩm."/>}
      <DataTablePagination page={query.page} pageSize={query.take} totalItems={result.data?.total??0}
        onPageChange={page=>setQuery(previous=>({...previous,page}))} onPageSizeChange={take=>setQuery(previous=>({...previous,take,page:1}))}/>
    </WrapperComponent>
    <LabelDeleteDialog open={Boolean(deletion.selected)} title="Xóa nhãn dán" itemName={deletion.selected?.name}
      loading={deletion.loading} onClose={()=>deletion.setSelected(null)} onConfirm={()=>void deletion.confirm()}/>
  </Stack>;
}
