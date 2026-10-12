import { PhoneOutlined } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CustomButton } from '../../../../components/button';

import type { IRefundProposalCustomerInfo } from '../../../../apis/refund-proposal';

const cardSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: '12px',
  border: '1px solid #EAECF0',
  bgcolor: '#FFFFFF',
  boxShadow: 'none',
} as const;

const labelSx = { ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mb: 0.5 };
const valueSx = { ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' };

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <Box>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value?.trim() || '—'}</Typography>
  </Box>
);

interface Props {
  customer?: IRefundProposalCustomerInfo;
  customerNote?: string | null;
  onCallCustomer?: () => void;
}

export function RefundProposalDetailCustomerCard({ customer, customerNote, onCallCustomer }: Props) {
  const phone = customer?.phone?.trim();
  return (
    <Paper sx={cardSx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Thông tin khách hàng</Typography>
        {phone ? (
          <CustomButton
            fullWidth={false}
            variant="outline"
            onClick={onCallCustomer}
            startIcon={<PhoneOutlined sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              px: 1.25,
              borderRadius: '999px',
              borderColor: '#D0D5DD',
              color: '#1849A9',
              bgcolor: '#F0F9FF',
              boxShadow: 'none',
              ...TYPOGRAPHY_STYLES.sm.medium,
              textTransform: 'none',
              '&:hover': { bgcolor: '#E0F2FE', borderColor: '#7DD3FC' },
            }}
          >
            Gọi ngay
          </CustomButton>
        ) : null}
      </Stack>

      <Stack gap={2}>
        <Field label="Họ tên" value={customer?.fullName} />
        <Field label="Email" value={customer?.email} />
        <Field label="Địa chỉ kho giao/nhận" value={customer?.pickupAddress} />
        <Field label="Địa chỉ khách hàng" value={customer?.customerAddress} />
        <Field label="Số điện thoại" value={customer?.phone} />
        <Field label="Ghi chú khách hàng" value={customerNote} />
      </Stack>
    </Paper>
  );
}
