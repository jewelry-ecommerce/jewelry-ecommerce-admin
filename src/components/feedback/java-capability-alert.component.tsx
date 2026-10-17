import { Alert, AlertTitle, Typography } from '@mui/material';
import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { isJavaBackend } from '@/common/config/app.config';
import { JAVA_FORM_LIMITATIONS } from '@/apis/java/java-ui-policy';
import { getJavaCapabilityGaps, subscribeJavaCapabilityGaps } from '@/apis/java/java-capability-gaps';

export function JavaCapabilityAlert() {
  const { pathname } = useLocation();
  const gaps = useSyncExternalStore(subscribeJavaCapabilityGaps, getJavaCapabilityGaps, getJavaCapabilityGaps);
  const current = gaps.filter(gap => gap.route === pathname);
  const limitation = JAVA_FORM_LIMITATIONS.find(entry => entry.route.test(pathname));
  if (!isJavaBackend() || (!current.length && !limitation)) return null;
  return <Alert severity="warning" sx={{ m: 2 }}>
    <AlertTitle>{current.length ? 'Chưa đủ API Java cho một số thao tác trên trang này' : 'Lưu ý phạm vi tích hợp Java'}</AlertTitle>
    {limitation?.message ?? "Các thao tác bên dưới chưa thực hiện được. Không có dữ liệu không đồng nghĩa danh sách đang trống."}
    {current.length > 0 && <details><summary>Xem API cần bổ sung</summary>
      {current.map(gap => <Typography component="div" variant="body2" key={gap.method + gap.endpoint}>
        {gap.method} {gap.endpoint}
      </Typography>)}
    </details>}
  </Alert>;
}
