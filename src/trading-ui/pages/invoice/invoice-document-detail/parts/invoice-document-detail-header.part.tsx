import { ArrowBack, OpenInNew } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import type { IInvoiceDocumentItem } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate } from '../../../../common/utils';
import { CustomButton } from '../../../../components/button';
import { getInvoiceDocumentStatusMeta } from '../invoice-document-detail.helpers';

const PAGE_PADDING_X = { xs: 2, md: 3 } as const;

interface Props {
  detail: IInvoiceDocumentItem;
  onBack: () => void;
  onOpenDocumentLink?: () => void;
}

export function InvoiceDocumentDetailHeader({ detail, onBack, onOpenDocumentLink }: Props) {
  const statusMeta = getInvoiceDocumentStatusMeta(detail.status);
  const title = detail.invoiceCode?.trim() || detail.orderCode?.trim() || 'Chi tiết chứng từ';

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box
        sx={{
          overflow: 'hidden',
          border: '1px solid #EAECF0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        }}
      >
        <Box sx={{ px: PAGE_PADDING_X, pt: { xs: 1.75, md: 1.5 }, pb: { xs: 2, md: 1.75 } }}>
          <Stack spacing={{ xs: 2, md: 2.25 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1.25} columnGap={2}>
              <CustomButton
                fullWidth={false}
                variant="outline"
                onClick={onBack}
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  border: 'none',
                  boxShadow: 'none',
                  borderRadius: 0,
                  bgcolor: 'transparent',
                  color: '#4A5565',
                  ...TYPOGRAPHY_STYLES.base.regular,
                  '&:hover': { bgcolor: 'transparent', color: '#4A5565' },
                }}
              >
                Quay lại danh sách
              </CustomButton>

              {detail.linkUrl && onOpenDocumentLink ? (
                <CustomButton
                  fullWidth={false}
                  variant="outline"
                  onClick={onOpenDocumentLink}
                  startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                  sx={{
                    height: 36,
                    px: 1.5,
                    borderRadius: '10px',
                    borderColor: '#D0D5DD',
                    color: '#1849A9',
                    bgcolor: '#FFFFFF',
                    boxShadow: 'none',
                    ...TYPOGRAPHY_STYLES.sm.medium,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#F9FAFB', borderColor: '#98A2B3' },
                  }}
                >
                  Mở chứng từ
                </CustomButton>
              ) : null}
            </Stack>

            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="h1" sx={{ color: '#101828', ...TYPOGRAPHY_STYLES['2xl'].bold, lineHeight: 1.25 }}>
                  {title}
                </Typography>
                <Typography sx={{ mt: 0.5, color: '#6B7280', ...TYPOGRAPHY_STYLES.base.regular }}>{detail.issuedAt ? `Phát hành ${formatDate(detail.issuedAt)}` : 'Chưa có ngày phát hành'}</Typography>
              </Box>
              <Chip
                label={statusMeta.label}
                size="small"
                sx={{
                  height: 28,
                  borderRadius: '999px',
                  ...statusMeta.sx,
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
