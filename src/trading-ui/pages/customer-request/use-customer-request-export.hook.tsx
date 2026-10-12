import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import { useCallback, useMemo, useState } from 'react';
import * as importExportApi from '../../apis/import-export/import-export.api';
import type { OrderTimeFilter } from '../../apis/order';
import { downloadRemoteFile } from '../../common/helpers';
import { getErrorMessage } from '../../common/utils';
import type { DataTableToolbarAction } from '../../components/data-table';
import type { SharedTimeRange } from '../../components/time-filter/shared-time-filter';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import type { PageButtonPermissionProps } from '../../permissions/page-button-permission.utils';
import {
  buildCustomerRequestExportFiltersFromListState,
  resolveCustomerRequestExportTopicConfigId,
  type CustomerRequestExportKind,
  type CustomerRequestListExportScope,
} from './customer-request-export.util';

const EXPORT_FILE_NAME: Record<CustomerRequestExportKind, string> = {
  'back-in-stock': 'export-lien-he-co-hang.xlsx',
  'order-support': 'export-ho-tro-don-hang.xlsx',
  newsletter: 'export-dang-ky-nhan-tin.xlsx',
};

export const useCustomerRequestExport = ({
  kind,
  page,
  pageSize,
  keyword,
  status,
  orderType,
  selectedTimeOption,
  customDateRange,
  selectedRowIds,
  visibleRowCount,
  exportPermission,
}: {
  kind: CustomerRequestExportKind;
  page: number;
  pageSize: number;
  keyword: string;
  status: string;
  orderType?: string;
  selectedTimeOption: OrderTimeFilter | null;
  customDateRange: SharedTimeRange;
  selectedRowIds: string[];
  visibleRowCount: number;
  exportPermission: PageButtonPermissionProps;
}) => {
  const { showSnackbar } = useSnackbar();
  const [exportSubmitting, setExportSubmitting] = useState(false);

  const handleExport = useCallback(
    async (scope: CustomerRequestListExportScope) => {
      if (exportSubmitting) return;

      if (scope === 'selected' && !selectedRowIds.length) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Vui lòng chọn ít nhất một yêu cầu để export' });
        return;
      }
      if (scope === 'current-page' && visibleRowCount <= 0) {
        showSnackbar({ type: SnackbarType.WARNING, message: 'Không có dữ liệu để export ở trang hiện tại' });
        return;
      }

      setExportSubmitting(true);
      try {
        const topicConfigId = await resolveCustomerRequestExportTopicConfigId(kind);
        const job = await importExportApi.postExportTopicConfigs(topicConfigId, {
          filters: buildCustomerRequestExportFiltersFromListState({
            page,
            pageSize,
            keyword,
            status,
            orderType,
            selectedTimeOption,
            customDateRange,
            scope,
            selectedRowIds,
          }),
        });
        const statusResult = await importExportApi.waitImportExportJobFileUrl(job.jobId);
        const fileUrl = statusResult.fileUrl?.trim();
        if (!fileUrl) throw new Error('Export hoàn tất nhưng chưa có link tải file.');
        await downloadRemoteFile(fileUrl, statusResult.fileName?.trim() || EXPORT_FILE_NAME[kind]);
        showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã tải file export.' });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) || 'Export yêu cầu khách hàng thất bại' });
      } finally {
        setExportSubmitting(false);
      }
    },
    [customDateRange, exportSubmitting, kind, keyword, orderType, page, pageSize, selectedRowIds, selectedTimeOption, status, visibleRowCount],
  );

  const exportToolbarAction = useMemo<DataTableToolbarAction>(
    () => ({
      key: 'export',
      label: 'Export',
      icon: <FileDownloadOutlined sx={{ fontSize: 18 }} />,
      endIcon: <KeyboardArrowDownRounded sx={{ fontSize: 18 }} />,
      disabled: exportSubmitting,
      options: [
        { value: 'all', label: 'Export tất cả' },
        { value: 'current-page', label: 'Export trang hiện tại' },
        { value: 'selected', label: 'Export yêu cầu đã chọn' },
      ],
      onSelectOption: (value) => {
        if (value === 'all' || value === 'current-page' || value === 'selected') {
          void handleExport(value);
        }
      },
      ...exportPermission,
    }),
    [exportPermission, exportSubmitting, handleExport],
  );

  return { exportToolbarAction, exportSubmitting, handleExport };
};
