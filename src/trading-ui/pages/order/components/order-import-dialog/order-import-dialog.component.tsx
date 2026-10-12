import { AlignBottom01, Upload01 } from '@untitledui/icons';
import { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { DialogComponent } from '../../../../components/dialog';
import { StepperComponent, type StepperComponentItem } from '../../../../components/stepper/stepper.component';
import { OrderImportStepDonePart } from './order-import-step-done.part';
import { OrderImportStepProcessingPart } from './order-import-step-processing.part';
import { OrderImportStepResultPart } from './order-import-step-result.part';
import { OrderImportStepUploadPart } from './order-import-step-upload.part';
import { useOrderImportDialog } from './use-order-import-dialog.hook';

export interface OrderImportDialogProps {
  open: boolean;
  onClose: () => void;
}

const STEP_LABELS = ['Upload file', 'Validate dữ liệu', 'Xem trước', 'Hoàn tất'] as const;

const SUBTITLE_BY_STEP = [
  'Nhập đơn hàng từ nhiều kênh: Social / Affiliate / TikTok / Facebook / Livestream',
  'Đang xử lý file và mapping dữ liệu...',
  'Kết quả kiểm tra dữ liệu',
  'Kết quả import đơn hàng',
] as const;

export const OrderImportDialog = ({ open, onClose }: OrderImportDialogProps) => {
  const d = useOrderImportDialog(open);

  const steps = useMemo<StepperComponentItem[]>(() => {
    return STEP_LABELS.map((label, index) => ({
      id: `order-import-step-${index}`,
      label,
      completed: index < d.activeStep && !(d.isImportProcessing && index === 3),
      loading: (d.activeStep === 1 && index === 1 && d.submitting) || (d.isImportProcessing && index === 3),
    }));
  }, [d.activeStep, d.isImportProcessing, d.submitting]);

  const busy = d.submitting || d.confirming;
  const canClose = !busy;
  const processingDescription = d.isImportProcessing ? 'Đang xác nhận import và chờ worker xử lý...' : 'Hệ thống đang đọc và validate dữ liệu từ Excel...';
  const stepSubtitle = d.isImportProcessing ? 'Đang import đơn hàng...' : SUBTITLE_BY_STEP[d.activeStep];

  const handleClose = () => {
    if (!canClose) return;
    onClose();
  };

  const footerProps =
    d.activeStep === 0
      ? {
          buttonLeft: {
            content: 'Huỷ',
            variant: 'outlined' as const,
            disabled: busy,
            onClick: handleClose,
          },
          buttonRight: {
            content: d.submitting ? 'Đang import...' : 'Bắt đầu import',
            variant: 'contained' as const,
            disabled: !d.selectedFile || busy,
            onClick: () => void d.handleStartImport(),
          },
        }
      : d.activeStep === 2 && d.validateResult
        ? {
            buttonStart: {
              content: 'Tải file lỗi',
              variant: 'outlined' as const,
              startIcon: <AlignBottom01 size={18} color="#101828" />,
              disabled: busy || d.downloadingErrorFile || d.validateResult.summary.errorCount === 0,
              onClick: () => void d.handleDownloadErrorFile(),
            },
            buttonRight: {
              content: `Xác nhận import ${d.validateResult.summary.totalOrders} đơn hàng`,
              variant: 'contained' as const,
              disabled: busy,
              onClick: () => void d.handleConfirmImport(),
            },
          }
        : d.activeStep === 3 && d.importJobResult
          ? {
              buttonStart: {
                content: 'Tải file kết quả',
                variant: 'outlined' as const,
                startIcon: <AlignBottom01 size={18} color="#101828" />,
                disabled: d.downloadingErrorFile || !d.importJobResult.fileUrl?.trim(),
                onClick: () => void d.handleDownloadErrorFile(),
              },
              buttonRight: {
                content: 'Hoàn tất',
                variant: 'contained' as const,
                onClick: handleClose,
              },
            }
          : undefined;

  return (
    <DialogComponent
      open={open}
      onClose={canClose ? handleClose : undefined}
      maxWidth="lg"
      fullWidth
      title="Import đơn hàng từ Excel"
      icon={<Upload01 size={20} color="#fff" />}
      sxBottom={{
        boxSizing: 'border-box',
        borderTop: '1px solid #E5E7EB',
        bgcolor: '#fff',
        pt: 3,
      }}
      {...footerProps}
    >
      <Stack gap={3}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{stepSubtitle}</Typography>
        <StepperComponent activeStep={d.activeStep} steps={steps} />

        {d.activeStep === 0 ? (
          <OrderImportStepUploadPart
            fileValue={d.fileValue}
            uploadError={d.uploadError}
            disabled={busy}
            onFileValueChange={(next) => {
              d.setUploadError('');
              d.setFileValue(next);
            }}
            onPickFile={(file) => {
              d.setUploadError('');
              d.setSelectedFile(file);
              d.setFileValue(file.name);
            }}
            onFileReject={(reason) => {
              d.setSelectedFile(null);
              d.setUploadError(reason);
              d.setFileValue('');
            }}
            onDownloadTemplate={() => void d.handleDownloadTemplate()}
          />
        ) : null}

        {d.activeStep === 1 || d.isImportProcessing ? <OrderImportStepProcessingPart percent={d.processingPercent} title={d.processingLabel} description={processingDescription} /> : null}

        {d.activeStep === 2 && d.validateResult && !d.isImportProcessing ? <OrderImportStepResultPart result={d.validateResult} /> : null}

        {d.activeStep === 3 && d.importJobResult && !d.isImportProcessing ? <OrderImportStepDonePart result={d.importJobResult} /> : null}
      </Stack>
    </DialogComponent>
  );
};
