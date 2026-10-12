 
import { Box, LinearProgress } from '@mui/material';
import { EmptyComponent } from '../../../../components/empty';
import { DetailPageBackBar } from '../../../../components/page-header';

export function OrderDetailLoadingState() {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress sx={{ height: 3 }} />
    </Box>
  );
}

export interface OrderDetailErrorStateProps {
  message?: string | null;
  onBackToList: () => void;
}

/** Lỗi load / không có đơn → UI empty, không hiện raw message kiểu Internal server error. */
export function OrderDetailErrorState({ message: _message, onBackToList }: OrderDetailErrorStateProps) {
  return (
    <Box sx={{ width: '100%', minHeight: 360 }}>
      <DetailPageBackBar onBack={onBackToList} />
      <EmptyComponent variant="empty" title="Không có dữ liệu" description="Không tìm thấy thông tin đơn hàng hoặc dữ liệu tạm thời không khả dụng." sxContent={{ py: 8 }} />
    </Box>
  );
}
