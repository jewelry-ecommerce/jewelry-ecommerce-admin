import { Avatar, AvatarGroup, Grid, Link, Stack, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import useSWR from 'swr';
import { posShiftApi } from '../../../../apis';
import type { IOrder } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getPosShiftDetailPath } from '@/trading-ui/router/route.path';
import type { PosShiftXReportShift } from '../../../../apis/pos/pos-shift.interface';
import { POS_SHIFT_NOW_LABEL } from '../../../pos/pos-shift/pos-shift.constants';
import { formatPosShiftDeviceName, formatPosShiftTimeRange, isPosShiftId } from '../../../pos/pos-shift/pos-shift.utils';
import { formatPosStaffLabel } from '../order-detail.helpers';
import { OrderDetailColumn } from './order-detail-row-column.part';

const LABEL_SX = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280' };
const VALUE_SX = { ...TYPOGRAPHY_STYLES.base.medium, color: '#111827' };
const STAFF_AVATAR_SX = { width: 20, height: 20, fontSize: 9, fontWeight: 600, color: '#1F2937' };
const SELLER_LIST_AVATAR_SX = { width: 32, height: 32, fontSize: 13, fontWeight: 600, color: '#1F2937' };
const SELLER_AVATAR_MAX = 4;
/** Mỗi nhân viên một màu cố định (theo tên) để phân biệt avatar, giống màn chi tiết đơn trên POS. */
const STAFF_AVATAR_COLORS = ['#4ADE80', '#60A5FA', '#F9A8D4', '#FCD34D', '#C4B5FD', '#5EEAD4', '#FDBA74', '#FCA5A5'];

const getStaffName = (label: string): string => label.split(' - ').pop()?.trim() || label;

/** 2 chữ cái làm avatar: chữ đầu của từ đầu + từ cuối (`Hương pick hàng` → `HH`); tên 1 từ lấy 2 chữ đầu (`Emee` → `EM`). */
const getStaffInitial = (label: string): string => {
  const words = getStaffName(label).split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  const initials = words.length > 1 ? `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}` : words[0].slice(0, 2);
  return initials.toUpperCase();
};

const getStaffAvatarColor = (label: string): string => {
  const name = getStaffName(label);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return STAFF_AVATAR_COLORS[hash % STAFF_AVATAR_COLORS.length];
};

/** Khoảng trắng không ngắt dòng. */
const NBSP = String.fromCharCode(160);

/** Giữ `HH:mm DD/MM` trên cùng một dòng — cột hẹp thì chỉ xuống dòng sau dấu ` - `. */
const keepTimeTogether = (range: string): string =>
  range
    .split(' - ')
    .map((part) => part.replace(/ /g, NBSP))
    .join(' - ');

/**
 * Định danh ca = giờ mở - giờ đóng thực tế (AC2 danh sách phiên ca): `16:00 15/09 - 01:00 16/09`;
 * ca chưa đóng (đang mở / đang đóng ca) → `16:00 15/09 - Hiện tại`.
 */
const formatShiftIdentity = (shift: Pick<PosShiftXReportShift, 'openedAt' | 'closedAt' | 'lifecycleStatus'>): string =>
  keepTimeTogether(shift.lifecycleStatus === 'CLOSED' ? formatPosShiftTimeRange(shift.openedAt, shift.closedAt, '—') : formatPosShiftTimeRange(shift.openedAt, null, POS_SHIFT_NOW_LABEL));

/** Avatar + tên nhân viên; mã nhân viên (nếu có) xem khi rê chuột. */
function StaffLabel({ label }: { label: string }) {
  if (label === '—') return <Typography sx={VALUE_SX}>—</Typography>;
  const name = getStaffName(label);
  return (
    <Tooltip title={label === name ? '' : label}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, width: 'fit-content' }}>
        <Avatar sx={{ ...STAFF_AVATAR_SX, bgcolor: getStaffAvatarColor(label) }}>{getStaffInitial(label)}</Avatar>
        <Typography sx={{ ...VALUE_SX, minWidth: 0, overflowWrap: 'anywhere' }}>{name}</Typography>
      </Stack>
    </Tooltip>
  );
}

/** Danh sách nhân viên tư vấn hiện khi rê chuột vào nhóm avatar: avatar + `Mã - Tên` từng người. */
function SellerList({ labels }: { labels: string[] }) {
  return (
    <Stack gap={1} sx={{ py: 0.5 }}>
      {labels.map((label, index) => (
        <Stack key={`${label}-${index}`} direction="row" alignItems="center" gap={1.5}>
          <Avatar sx={{ ...SELLER_LIST_AVATAR_SX, bgcolor: getStaffAvatarColor(label) }}>{getStaffInitial(label)}</Avatar>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#111827', whiteSpace: 'nowrap' }}>{label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

/** 1 người tư vấn → hiện hẳn tên; nhiều người → chỉ hiện avatar, rê chuột xem danh sách tên. */
function SellerAvatars({ labels }: { labels: string[] }) {
  if (!labels.length) return <Typography sx={VALUE_SX}>—</Typography>;
  if (labels.length === 1) return <StaffLabel label={labels[0]} />;
  return (
    <Tooltip
      title={<SellerList labels={labels} />}
      placement="bottom-start"
      slotProps={{
        tooltip: {
          sx: { bgcolor: '#FFFFFF', color: '#111827', border: '1px solid #E5E7EB', borderRadius: 2, boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)', p: 2, maxWidth: 'none' },
        },
      }}
    >
      <AvatarGroup
        max={SELLER_AVATAR_MAX}
        slotProps={{ surplus: { sx: { bgcolor: '#E5E7EB' } } }}
        sx={{ width: 'fit-content', cursor: 'pointer', '& .MuiAvatar-root': { ...STAFF_AVATAR_SX, border: '2px solid #FFFFFF' } }}
      >
        {labels.map((label, index) => (
          <Avatar key={`${label}-${index}`} alt={label} sx={{ bgcolor: getStaffAvatarColor(label) }}>
            {getStaffInitial(label)}
          </Avatar>
        ))}
      </AvatarGroup>
    </Tooltip>
  );
}

/** Khối thông tin POS trong "Thông tin đơn hàng": cửa hàng, máy, ca, thu ngân, nhân viên tư vấn. */
export function OrderDetailPosInfo({ order }: { order: IOrder }) {
  const pos = order.metadata?.pos;
  const shiftId = pos?.shiftId?.trim() ?? '';
  const validShiftId = isPosShiftId(shiftId);

  // Đơn chỉ lưu id ca và tên thu ngân — giờ ca, máy POS và mã thu ngân lấy từ chi tiết ca (dùng chung cache với trang chi tiết ca).
  const { data, error, isLoading } = useSWR(validShiftId ? (['pos-shift-admin-detail', shiftId] as const) : null, () => posShiftApi.getPosShiftDetail(shiftId), {
    revalidateOnFocus: false,
  });
  const shift = data?.shift ?? null;
  const pendingLabel = isLoading ? 'Đang tải...' : '—';

  const shiftLabel = shift ? formatShiftIdentity(shift) : isLoading ? 'Đang tải...' : error ? 'Xem chi tiết ca' : '—';
  const deviceLabel = shift ? formatPosShiftDeviceName(shift.deviceName, shift.terminalCode) : pendingLabel;

  // Ca thuộc về một thu ngân — chỉ mượn mã khi đúng người.
  const shiftCashierCode = shift && pos?.cashierId && shift.cashierId === pos.cashierId ? shift.cashierCode : null;
  const cashierLabel = formatPosStaffLabel(pos?.cashierName || (shiftCashierCode ? shift?.cashierName : null), shiftCashierCode);
  const sellerLabels = (pos?.sellers ?? [])
    .map((seller) => (!seller.code?.trim() && shift && seller.id === shift.cashierId ? { ...seller, code: shift.cashierCode ?? '' } : seller))
    .map((seller) => formatPosStaffLabel(seller.name, seller.code))
    .filter((label) => label !== '—');

  return (
    <>
      <OrderDetailColumn label="Nguồn đơn" value="POS" />
      <OrderDetailColumn label="Tên cửa hàng" value={order.warehouseName || shift?.warehouseName || '—'} />
      <Grid container rowSpacing={1.25} columnSpacing={2}>
        <Grid size={5}>
          <OrderDetailColumn label="Máy POS" value={deviceLabel} />
        </Grid>
        <Grid size={7}>
          <Stack gap={0.25}>
            <Typography sx={LABEL_SX}>Ca làm việc</Typography>
            {validShiftId ? (
              <Link component={RouterLink} to={getPosShiftDetailPath(shiftId)} underline="hover" sx={{ ...VALUE_SX, color: '#155DFC', width: 'fit-content' }}>
                {shiftLabel}
              </Link>
            ) : (
              <Typography sx={VALUE_SX}>—</Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
      <Stack gap={0.25}>
        <Typography sx={LABEL_SX}>Nhân viên thu ngân</Typography>
        <StaffLabel label={cashierLabel} />
      </Stack>
      <Stack gap={0.5}>
        <Typography sx={LABEL_SX}>Nhân viên tư vấn</Typography>
        <SellerAvatars labels={sellerLabels} />
      </Stack>
    </>
  );
}
