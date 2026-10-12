import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Fragment } from 'react';
import { AlertCircle, AlertTriangle, Check, InfoCircle } from '@untitledui/icons';
import type { OrderImportPreviewRow, OrderImportValidateResult } from '../../../../apis/order/order-import.interface';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';

const formatVnd = (value: number | null): string => {
  if (value == null || Number.isNaN(value)) return '—';
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
};

const StatusPill = ({ status }: { status: OrderImportPreviewRow['status'] }) => {
  if (status === 'valid') {
    return (
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        sx={{
          display: 'inline-flex',
          px: 1,
          py: 0.25,
          borderRadius: '999px',
          bgcolor: '#ECFDF3',
          color: '#067647',
          width: 'fit-content',
        }}
      >
        <Check size={14} color="#067647" />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#067647' }}>Hợp lệ</Typography>
      </Stack>
    );
  }

  if (status === 'error') {
    return (
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        sx={{
          display: 'inline-flex',
          px: 1,
          py: 0.25,
          borderRadius: '999px',
          bgcolor: '#FEF3F2',
          color: '#B42318',
          width: 'fit-content',
        }}
      >
        <AlertCircle size={14} color="#B42318" />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#B42318' }}>Lỗi</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{
        display: 'inline-flex',
        px: 1,
        py: 0.25,
        borderRadius: '999px',
        bgcolor: '#FFFAEB',
        color: '#B54708',
        width: 'fit-content',
      }}
    >
      <AlertTriangle size={14} color="#B54708" />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: '#B54708' }}>Cảnh báo</Typography>
    </Stack>
  );
};

const SummaryCard = ({ value, label, tone }: { value: number; label: string; tone: 'neutral' | 'success' | 'error' | 'warning' }) => {
  const toneSx =
    tone === 'success'
      ? { bgcolor: '#ECFDF3', borderColor: '#ABEFC6', color: '#067647' }
      : tone === 'error'
        ? { bgcolor: '#FEF3F2', borderColor: '#FECDCA', color: '#B42318' }
        : tone === 'warning'
          ? { bgcolor: '#FFFAEB', borderColor: '#FEDF89', color: '#B54708' }
          : { bgcolor: '#FFFFFF', borderColor: '#E5E7EB', color: '#101828' };

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 2,
        borderRadius: '10px',
        border: '1px solid',
        ...toneSx,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].semibold, color: toneSx.color, lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: toneSx.color, mt: 0.5 }}>{label}</Typography>
    </Box>
  );
};

export interface OrderImportStepResultPartProps {
  result: OrderImportValidateResult;
}

export const OrderImportStepResultPart = ({ result }: OrderImportStepResultPartProps) => {
  const { summary, previewRows, previewTotal } = result;
  const previewCount = previewRows.length;

  return (
    <Stack gap={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
        <SummaryCard value={summary.totalOrders} label="Tổng đơn hàng" tone="neutral" />
        <SummaryCard value={summary.validCount} label="Hợp lệ" tone="success" />
        <SummaryCard value={summary.errorCount} label="Có lỗi" tone="error" />
        <SummaryCard value={summary.warningCount} label="Cảnh báo" tone="warning" />
      </Stack>

      <Box
        sx={{
          p: 2,
          border: '1px solid #B2DDFF',
          borderRadius: '10px',
          bgcolor: '#EFF8FF',
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap={1.25}>
          <InfoCircle size={20} color="#175CD3" />
          <Stack gap={0.5} sx={{ minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#194185' }}>Đơn hàng sẽ được chuyển vào tab &quot;Chờ xác nhận&quot;</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#175CD3' }}>
              Tất cả {summary.totalOrders} đơn hàng (bao gồm cả đơn có lỗi) sẽ được đưa vào Validation Gateway. Các đơn lỗi sẽ được gắn cờ để admin xử lý trước khi confirm.
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Stack gap={1}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>
          Preview dữ liệu ({previewCount} / {previewTotal} dòng đầu)
        </Typography>

        <TableContainer sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', maxHeight: 360 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {['STT', 'MÃ ĐƠN GỐC', 'NGUỒN', 'KHÁCH HÀNG', 'SKU', 'TỔNG TIỀN', 'TRẠNG THÁI'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      ...TYPOGRAPHY_STYLES.xs.medium,
                      color: '#667085',
                      bgcolor: '#F9FAFB',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #E5E7EB',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRows.map((row) => (
                <Fragment key={row.stt}>
                  <TableRow sx={{ '& td': { borderBottom: row.issues?.length ? 'none' : '1px solid #F2F4F7' } }}>
                    <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{row.stt}</TableCell>
                    <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>{row.originalOrderCode || '—'}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          px: 1,
                          py: 0.25,
                          borderRadius: '999px',
                          bgcolor: '#F2F4F7',
                          ...TYPOGRAPHY_STYLES.xs.medium,
                          color: '#344054',
                        }}
                      >
                        {row.source || '—'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{row.customerName || '—'}</TableCell>
                    <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#344054' }}>{row.sku || '—'}</TableCell>
                    <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828', whiteSpace: 'nowrap' }}>{formatVnd(row.totalAmount)}</TableCell>
                    <TableCell>
                      <StatusPill status={row.status} />
                    </TableCell>
                  </TableRow>
                  {row.issues?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{
                          py: 1.25,
                          px: 2,
                          bgcolor: row.status === 'error' ? '#FEF3F2' : '#FFFAEB',
                          borderBottom: '1px solid #F2F4F7',
                        }}
                      >
                        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                          {row.issues.map((issue) => (
                            <Typography
                              key={issue.message}
                              component="li"
                              sx={{
                                ...TYPOGRAPHY_STYLES.sm.regular,
                                color: row.status === 'error' ? '#B42318' : '#B54708',
                              }}
                            >
                              {issue.message}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {summary.errorCount > 0 ? (
        <Box
          sx={{
            p: 2,
            border: '1px solid #FEDF89',
            borderRadius: '10px',
            bgcolor: '#FFFAEB',
          }}
        >
          <Stack direction="row" alignItems="flex-start" gap={1.25}>
            <AlertTriangle size={20} color="#F79009" />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#93370D' }}>
              <Box component="span" sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#93370D' }}>
                Có {summary.errorCount} đơn hàng có lỗi.
              </Box>{' '}
              Tất cả đơn (kể cả đơn lỗi) vẫn sẽ được import vào tab &quot;Chờ xác nhận&quot; để admin xử lý thủ công.
            </Typography>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
};
