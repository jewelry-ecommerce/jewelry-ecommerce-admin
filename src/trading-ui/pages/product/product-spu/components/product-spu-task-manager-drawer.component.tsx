import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { CheckCircle, RefreshCcw01 } from '@untitledui/icons';
import React, { useCallback, useState } from 'react';
import { importExportApi, type JobProcess, type JobStatusResponseDto } from '../../../../apis';
import { JobProcessStatus, JobProcessType } from '../../../../apis/import-export/import-export.enum';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { formatDateTime } from '../../../../common/utils/date-format.util';
import { CustomButton } from '../../../../components/button';

import { DialogComponent } from '../../../../components/dialog';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackAlignCenter, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { type ResList } from '../../../../common/constant/api.interface';

const isHttpUrl = (value?: string): boolean => /^https?:\/\//i.test(value ?? '');

const getTaskTypeLabel = (type: JobProcess['type']) => (type === 'EXPORT' ? 'Export sản phẩm' : 'Import sản phẩm');

const getTaskStatusMeta = (status: JobProcessStatus): { label: string; textColor: string; backgroundColor: string; borderColor: string } => {
  switch (status) {
    case JobProcessStatus.DONE:
      return {
        label: 'Hoàn tất',
        textColor: '#067647',
        backgroundColor: '#ECFDF3',
        borderColor: '#ABEFC6',
      };
    case JobProcessStatus.FAILED:
      return {
        label: 'Có lỗi xảy ra',
        textColor: '#B42318',
        backgroundColor: '#FEF3F2',
        borderColor: '#FECDCA',
      };
    case JobProcessStatus.PENDING:
      return {
        label: 'Đang chờ xử lý',
        textColor: '#175CD3',
        backgroundColor: '#EFF8FF',
        borderColor: '#B2DDFF',
      };
    case JobProcessStatus.PROCESSING:
    default:
      return {
        label: 'Đang tải lên...',
        textColor: '#175CD3',
        backgroundColor: '#EFF8FF',
        borderColor: '#B2DDFF',
      };
  }
};

const getTaskDisplayName = (job: JobProcess, knownFileNames: Readonly<Record<string, string>>) => knownFileNames[job.id] ?? `${getTaskTypeLabel(job.type)} #${job.id.slice(0, 8)}`;

export interface ProductSpuTaskManagerDrawerProps {
  open: boolean;
  onClose: () => void;
  jobs: ResList<JobProcess>;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  knownFileNames?: Readonly<Record<string, string>>;
  /** Label Display: chỉ hiện «Áp dụng vào form» khi job.id === applyImportJobId && DONE. */
  applyImportJobId?: string | null;
  onApplyImportJob?: (jobId: string) => void | Promise<void>;
  applyingJobId?: string | null;
}

export const ProductSpuTaskManagerDrawer = ({
  open,
  onClose,
  jobs,
  loading = false,
  refreshing = false,
  onRefresh,
  knownFileNames = {},
  applyImportJobId = null,
  onApplyImportJob,
  applyingJobId = null,
}: ProductSpuTaskManagerDrawerProps) => {
  // hook
  const { showSnackbar } = useSnackbar();

  // state
  const [importReportDialog, setImportReportDialog] = useState<{
    open: boolean;
    loading: boolean;
    status?: JobStatusResponseDto;
  }>({ open: false, loading: false });

  const openImportReport = useCallback(
    async (jobId: string) => {
      setImportReportDialog({ open: true, loading: true });
      try {
        const status = await importExportApi.getImportExportJobStatus(jobId);
        setImportReportDialog({ open: true, loading: false, status });
      } catch (err) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(err) });
        setImportReportDialog({ open: false, loading: false });
      }
    },
    [showSnackbar],
  );

  return (
    <React.Fragment>
      <DrawerComponent
        open={open}
        onClose={onClose}
        title="Trình quản lý tác vụ"
        subtitle="Theo dõi tiến trình import/export sản phẩm đang chạy nền"
        width={{ xs: '100%', sm: 420 }}
        footer={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>Tổng số tác vụ: {jobs.total}</Typography>}
      >
        <Stack sx={{ p: 2, gap: 2, bgcolor: '#F9FAFB', minHeight: '100%' }}>
          {onRefresh ? (
            <CustomButton variant="outline" fullWidth={false} disabled={refreshing} startIcon={<RefreshCcw01 size={16} />} onClick={onRefresh}>
              {refreshing ? 'Đang làm mới...' : 'Làm mới'}
            </CustomButton>
          ) : null}
          {loading && jobs.list.length === 0 ? (
            <LoadingComponent />
          ) : jobs.list.length === 0 ? (
            <EmptyComponent />
          ) : (
            <Stack gap={1.5}>
              {jobs.list.map((job) => {
                const statusMeta = getTaskStatusMeta(job.status);
                const errorMessage = job.status === 'FAILED' && !isHttpUrl(job.errorFileUrl) ? job.errorFileUrl : undefined;
                return (
                  <Stack
                    key={job.id}
                    sx={{
                      p: 1.5,
                      gap: 1.5,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                    }}
                  >
                    <StackRowAlignCenterJustBetween sx={{ gap: 1 }}>
                      <Stack sx={{ minWidth: 0, gap: 0.25 }}>
                        <Typography noWrap title={getTaskDisplayName(job, knownFileNames)} sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>
                          {getTaskDisplayName(job, knownFileNames)}
                        </Typography>
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>
                          {getTaskTypeLabel(job.type)} · {formatDateTime(String(job.updatedAt ?? job.createdAt ?? ''))}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: '999px',
                          border: `1px solid ${statusMeta.borderColor}`,
                          bgcolor: statusMeta.backgroundColor,
                          color: statusMeta.textColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.medium, color: 'inherit' }}>{statusMeta.label}</Typography>
                      </Box>
                    </StackRowAlignCenterJustBetween>

                    {job.status === 'PROCESSING' || job.status === 'PENDING' ? (
                      <Stack gap={0.75}>
                        <LinearProgress sx={{ height: 6, borderRadius: 999 }} />
                        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>Tác vụ đang chạy nền. Bạn có thể tiếp tục thao tác ở màn hình danh sách sản phẩm.</Typography>
                      </Stack>
                    ) : null}

                    {errorMessage ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B42318' }}>{errorMessage}</Typography> : null}

                    <StackRowAlignCenter gap={1} flexWrap="wrap">
                      {job.status === JobProcessStatus.DONE && job.type === JobProcessType.IMPORT ? (
                        <CustomButton variant="primary" fullWidth={false} onClick={() => void openImportReport(job.id)} sx={{ borderRadius: '10px' }}>
                          Xem kết quả
                        </CustomButton>
                      ) : null}

                      {onApplyImportJob && applyImportJobId === job.id && job.status === JobProcessStatus.DONE ? (
                        <CustomButton fullWidth={false} disabled={applyingJobId === job.id} onClick={() => void onApplyImportJob(job.id)} sx={{ borderRadius: '10px' }}>
                          {applyingJobId === job.id ? 'Đang áp dụng...' : 'Áp dụng vào form'}
                        </CustomButton>
                      ) : null}

                      {job.errorFileUrl && isHttpUrl(job.errorFileUrl) ? (
                        <CustomButton fullWidth={false} onClick={() => window.open(job.errorFileUrl, '_blank', 'noopener,noreferrer')} sx={{ borderRadius: '10px' }}>
                          Tải file lỗi
                        </CustomButton>
                      ) : null}
                    </StackRowAlignCenter>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DrawerComponent>

      <DialogComponent
        open={importReportDialog.open}
        onClose={() => setImportReportDialog({ open: false, loading: false, status: undefined })}
        title="Báo cáo kết quả Import"
        maxWidth="sm"
        icon={<CheckCircle size={16} color="#FFFFFF" />}
        buttonRight={{
          variant: 'contained',
          content: 'Đóng',
          onClick: () => setImportReportDialog({ open: false, loading: false, status: undefined }),
        }}
        children={
          <React.Fragment>
            {importReportDialog.loading ? (
              <LoadingComponent />
            ) : (
              <Stack>
                <Stack gap={0.75}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#374151' }}>Tệp xử lý:</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.md.medium, color: '#101828', textDecoration: 'underline' }}>{importReportDialog.status?.fileName || 'Không có tệp'}</Typography>
                </Stack>
                <StackRowAlignCenter gap={1.5}>
                  {[
                    {
                      label: 'TỔNG DÒNG',
                      value: importReportDialog.status?.importStats?.totalRows ?? 0,
                      color: '#101828',
                    },
                    {
                      label: 'THÀNH CÔNG',
                      value: importReportDialog.status?.importStats?.successRows ?? 0,
                      color: '#067647',
                    },
                    {
                      label: 'THẤT BẠI',
                      value: importReportDialog.status?.importStats?.failedRows ?? 0,
                      color: '#B42318',
                    },
                  ].map((item) => (
                    <StackAlignCenter
                      key={item.label}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        bgcolor: '#FAFAFA',
                        gap: 0.5,
                      }}
                    >
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.semibold, color: '#101828' }}>{item.value}</Typography>
                      <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: item.color }}>{item.label}</Typography>
                    </StackAlignCenter>
                  ))}
                </StackRowAlignCenter>

                {importReportDialog.status?.fileUrl && (
                  <CustomButton
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = importReportDialog.status?.fileUrl ?? '';
                      link.download = 'ket-qua-import-san-pham.xlsx';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã kích hoạt tải file kết quả.' });
                    }}
                  >
                    Tải file kết quả (.xlsx)
                  </CustomButton>
                )}
              </Stack>
            )}
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};
