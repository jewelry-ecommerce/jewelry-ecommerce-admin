import { Box, Stack, Typography } from '@mui/material';
import { Clock, User01 } from '@untitledui/icons';
import { useEffect, useMemo, useState } from 'react';
import { getOrderAuditLogs, OrderAuditEntityName, OrderTimeFilter, OrderType, type IOrderAuditLogItem, type IOrderAuditLogListRequest } from '../../../apis/order';
import { mapOrderAuditFieldLabel } from '../../../common/constant/order/order-audit-log-field-label.constant';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { formatDate, formatTime } from '../../../common/utils/date-format.util';
import { normalizeAuditItem, normalizeAuditResponseToList, sourceSxByLabel, type OrderAuditLogViewItem } from '../../../common/utils/order/order-audit-log.utils';
import { DataTableToolbar, type DataTableToolbarAction } from '../../../components/data-table';
import { DrawerComponent } from '../../../components/drawer/drawer.component';
import { EmptyComponent } from '../../../components/empty/empty.component';
import {
  buildOrderTimeFilterPayload,
  createSharedTimeFilterToolbarAction,
  formatTimeFilterLabel,
  OrderTimeCustomRangeDialog,
  type SharedTimeRange,
} from '../../../components/time-filter/shared-time-filter';

const AuditLogCard = ({ item, fieldLabelMapper }: { item: OrderAuditLogViewItem; fieldLabelMapper: (field?: string) => string }) => {
  const sourceSx = sourceSxByLabel[item.source];
  return (
    <Stack
      gap={1.25}
      sx={{
        p: 2,
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        bgcolor: '#FFFFFF',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{item.title}</Typography>
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.sm.medium,
            color: sourceSx.color,
            bgcolor: sourceSx.bg,
            border: `1px solid ${sourceSx.border}`,
            borderRadius: '6px',
            px: 1,
            py: 0.25,
          }}
        >
          {item.source}
        </Typography>
      </Stack>

      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Clock size={14} color="#6A7282" />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>
            {formatDate(item.at)} {formatTime(item.at)}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <User01 size={14} color="#6A7282" />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>{item.actorLabel}</Typography>
        </Stack>
      </Stack>

      {item.changeRows.map((change, idx) => (
        <Stack key={`${item.id}-${idx}`} gap={0.75}>
          {change.field ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>Trường: {fieldLabelMapper(change.field)}</Typography> : null}
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282', minWidth: 62 }}>Giá trị cũ:</Typography>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.sm.regular,
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                bgcolor: '#FEF2F2',
                color: '#101828',
                width: '100%',
              }}
            >
              {change.oldValue ?? '—'}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282', minWidth: 62 }}>Giá trị mới:</Typography>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.sm.regular,
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                bgcolor: '#F0FDF4',
                color: '#101828',
                width: '100%',
              }}
            >
              {change.newValue ?? '—'}
            </Typography>
          </Stack>
        </Stack>
      ))}

      {item.description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#4B5565', pt: 1, borderTop: '1px solid #EAECF0' }}>{item.description}</Typography> : null}
    </Stack>
  );
};

const asChangeRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});

const mergeAuditItemsByCorrelation = (rawItems: IOrderAuditLogItem[]): IOrderAuditLogItem[] => {
  const merged = new Map<string, IOrderAuditLogItem>();
  const result: IOrderAuditLogItem[] = [];

  for (const item of rawItems) {
    const correlationId = typeof item.correlationId === 'string' ? item.correlationId.trim() : '';
    if (!correlationId) {
      result.push(item);
      continue;
    }

    const primary = merged.get(correlationId);
    if (!primary) {
      const clone = { ...item };
      merged.set(correlationId, clone);
      result.push(clone);
      continue;
    }

    primary.diff = { ...asChangeRecord(item.diff), ...asChangeRecord(primary.diff) };
    primary.before = { ...asChangeRecord(item.before), ...asChangeRecord(primary.before) };
    primary.after = { ...asChangeRecord(item.after), ...asChangeRecord(primary.after) };
  }

  return result;
};

export interface OrderAuditLogDrawerProps {
  open: boolean;
  orderId: string;
  entityName?: OrderAuditEntityName;
  subtitle?: string;
  loadAuditLogs?: (params: IOrderAuditLogListRequest) => Promise<unknown>;
  normalizeItem?: (item: IOrderAuditLogItem, index: number) => OrderAuditLogViewItem;
  fieldLabelMapper?: (field?: string) => string;
  onClose: () => void;
}

export const OrderAuditLogDrawer = ({
  open,
  orderId,
  entityName = OrderAuditEntityName.OMS,
  subtitle = 'Theo dõi toàn bộ thay đổi của đơn hàng',
  loadAuditLogs = getOrderAuditLogs,
  normalizeItem = normalizeAuditItem,
  fieldLabelMapper = mapOrderAuditFieldLabel,
  onClose,
}: OrderAuditLogDrawerProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [rawItems, setRawItems] = useState<IOrderAuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const timeFilterPayload = useMemo(() => buildOrderTimeFilterPayload(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  useEffect(() => {
    if (!open || !orderId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await loadAuditLogs({
          orderBy: 'updatedAt',
          orderType: OrderType.DESC,
          page: 1,
          take: 100,
          ...timeFilterPayload,
          entityName,
          entityId: orderId,
        });
        if (cancelled) return;
        setRawItems(normalizeAuditResponseToList(res));
      } catch {
        if (cancelled) return;
        setRawItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [entityName, loadAuditLogs, open, orderId, timeFilterPayload]);

  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange, 'Thời gian'), [customDateRange, selectedTimeOption]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel,
          onSelectCustom: () => setTimeRangeDialogOpen(true),
          onSelectPreset: (value) => {
            setSelectedTimeOption(value);
            if (value !== OrderTimeFilter.CUSTOM) {
              setCustomDateRange(null);
            }
          },
        }),
      },
    ],
    [selectedTimeLabel],
  );

  const mergedItems = useMemo(() => mergeAuditItemsByCorrelation(rawItems), [rawItems]);
  const items = useMemo(() => mergedItems.map(normalizeItem), [mergedItems, normalizeItem]);

  const filteredItems = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const inChanges = item.changeRows.some((c) => {
        const field = (c.field ?? '').toLowerCase();
        const oldValue = (c.oldValue ?? '').toLowerCase();
        const newValue = (c.newValue ?? '').toLowerCase();
        return field.includes(q) || oldValue.includes(q) || newValue.includes(q);
      });
      return item.title.toLowerCase().includes(q) || item.actorLabel.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q) || inChanges;
    });
  }, [items, searchValue]);

  return (
    <>
      <DrawerComponent
        open={open}
        onClose={onClose}
        title="Lịch sử thao tác"
        subtitle={subtitle}
        footer={<Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282' }}>Tổng số: {filteredItems.length} thao tác</Typography>}
      >
        <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          <DataTableToolbar embedded searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Tìm kiếm" actions={toolbarActions} />
        </Box>

        {loading ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#6A7282', p: 2 }}>Đang tải lịch sử thao tác...</Typography> : null}

        {!loading && filteredItems.length === 0 ? (
          <EmptyComponent />
        ) : (
          <Stack sx={{ p: 2, gap: 1.5, bgcolor: '#FFFFFF' }}>
            {filteredItems.map((item) => (
              <AuditLogCard key={item.id} item={item} fieldLabelMapper={fieldLabelMapper} />
            ))}
          </Stack>
        )}
      </DrawerComponent>

      <OrderTimeCustomRangeDialog
        open={timeRangeDialogOpen}
        initialRange={customDateRange}
        onClose={() => setTimeRangeDialogOpen(false)}
        onApply={(range) => {
          setCustomDateRange(range);
          setSelectedTimeOption(OrderTimeFilter.CUSTOM);
          setTimeRangeDialogOpen(false);
        }}
      />
    </>
  );
};
