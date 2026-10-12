import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import useSWR from 'swr';
import { badgeApi, BadgeCampaignDisplayStatus, type BadgePosition } from '../../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../../common/constant/typography.constant';
import { formatDateTime } from '../../../../../../common/utils';
import { TagCommonComponent } from '../../../../../../components/tag';
import { DialogComponent } from '../../../../../../components/dialog';
import { LoadingComponent } from '../../../../../../components/loading/loading.component';
import { LabelDesignPreviewCell } from '../../../components';
import type { LabelContentPositionDialogRow } from '../../label-content.interface';
import { getBadgeCampaignDisplayStatusLabelVi } from '../../label-content.constants';
import { badgeFlowsToPositionDialogRows } from '../../label-content.utils';

export type { LabelContentPositionDialogRow as LabelContentDialogTopLeftRow };

const DIALOG_COLUMN_COUNT = 6;

const formatActiveRange = (activeFrom?: string, activeTo?: string): string => {
  const from = activeFrom ? formatDateTime(activeFrom) : 'Chưa xác định';
  const to = activeTo ? formatDateTime(activeTo) : 'Chưa xác định';
  return `${from} – ${to}`;
};

interface LabelContentDialogTopLeftPartProps {
  open: boolean;
  positionTitle: string;
  onClose: () => void;
  /** Gọi GET badge-flows và lọc rule theo `template.defaultPosition`. */
  defaultPosition?: BadgePosition | null;
  /** Fallback khi không có vị trí (không gọi API). */
  rows?: LabelContentPositionDialogRow[];
}

export const LabelContentDialogTopLeftPart = ({ open, positionTitle, onClose, defaultPosition, rows = [] }: LabelContentDialogTopLeftPartProps) => {
  const positionQuery = defaultPosition ?? undefined;
  const swrKey = open && positionQuery ? (['badge-flows', 'by-position', positionQuery] as const) : null;

  const { data, isLoading } = useSWR(swrKey, () =>
    badgeApi.getListBadgeFlow({
      isPagination: false,
    }),
  );

  const apiRows = positionQuery ? badgeFlowsToPositionDialogRows(data?.list ?? [], positionQuery) : [];
  const tableRows = positionQuery ? apiRows : rows;
  const filteredTableRows = tableRows.filter((row) => [BadgeCampaignDisplayStatus.RUNNING, BadgeCampaignDisplayStatus.SCHEDULED].includes(row.displayStatus));
  return (
    <DialogComponent maxWidth="md" fullWidth open={open} onClose={onClose} title={positionTitle}>
      {isLoading && positionQuery ? (
        <LoadingComponent size="medium" />
      ) : (
        <Table size="small" sx={{ borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Tên Labels</TableCell>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Ảnh Labels</TableCell>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Trạng thái</TableCell>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Thời gian bắt đầu / kết thúc</TableCell>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Loại Labels</TableCell>
              <TableCell sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#475467' }}>Tên cấu hình</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={DIALOG_COLUMN_COUNT}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', py: 2 }}>Không có cấu hình hiển thị label tại vị trí này.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTableRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>{row.labelName}</Typography>
                  </TableCell>
                  <TableCell>
                    <LabelDesignPreviewCell badgeTemplate={row.badgeTemplate} />
                  </TableCell>
                  <TableCell>
                    <TagCommonComponent content={getBadgeCampaignDisplayStatusLabelVi(row.displayStatus)} border />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827', whiteSpace: 'nowrap' }}>{formatActiveRange(row.activeFrom, row.activeTo)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>{row.typeLabel}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827' }}>{row.configName}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </DialogComponent>
  );
};
