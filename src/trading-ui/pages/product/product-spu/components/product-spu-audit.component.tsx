import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, User01 } from '@untitledui/icons';
import { OrderTimeFilter, OrderType } from '../../../../apis/order';
import type { ProductAuditLogItem } from '../../../../apis/product/product.interface';
import { productApi } from '../../../../apis';
import { formatDateTime } from '../../../../common/utils/date-format.util';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { DataTableToolbar, type DataTableToolbarAction } from '../../../../components/data-table';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import {
  buildOrderTimeFilterPayload,
  createSharedTimeFilterToolbarAction,
  formatTimeFilterLabel,
  OrderTimeCustomRangeDialog,
  type SharedTimeRange,
} from '../../../../components/time-filter/shared-time-filter';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { EmptyComponent } from '../../../../components/empty/empty.component';
import { buildProductAuditUsersLookup, normalizeProductAuditItem, normalizeProductAuditResponseToList } from '../../../../common/utils/product/product-audit-log.utils';

const META_COLOR = '#6A7282';

export type ProductSpuAuditSourceLabel = 'Hệ thống' | 'Thủ công' | 'Webhook';

export interface ProductSpuAuditEntry {
  id: string;
  actionTitle: string;
  source: ProductSpuAuditSourceLabel;
  at: string;
  userLine: string;
  fieldLine?: { prefix: 'Trường'; name: string };
  oldValue?: string;
  newValue?: string;
  footNote?: string;
}

const DEMO_AUDIT_ENTRIES: ProductSpuAuditEntry[] = [
  {
    id: '1',
    actionTitle: 'Thay đổi thông tin sản phẩm',
    source: 'Hệ thống',
    at: '2026-03-30T15:15:00.000Z',
    userLine: 'Lê Thị Hoa • Warehouse Staff',
    fieldLine: { prefix: 'Trường', name: 'Giá' },
    oldValue: '300,000',
    newValue: '400,000',
  },
  {
    id: '2',
    actionTitle: 'Sửa biến thể',
    source: 'Thủ công',
    at: '2026-03-28T10:00:00.000Z',
    userLine: 'Admin • System',
    fieldLine: { prefix: 'Trường', name: 'Biến thể sản phẩm #1' },
    oldValue: 'RG-OLD',
    newValue: 'RG-NEW-001',
    footNote: 'Khách yêu cầu đổi size từ S sang M',
  },
  {
    id: '3',
    actionTitle: 'Cập nhật tồn kho',
    source: 'Webhook',
    at: '2026-03-25T08:30:00.000Z',
    userLine: 'Kết nối • Ngoài',
  },
];

const ProductSpuAuditEntryCard = ({ entry }: { entry: ProductSpuAuditEntry }) => {
  return (
    <Stack
      gap={1.5}
      sx={{
        p: 2,
        bgcolor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 1.5,
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <StackRowAlignCenterJustBetween gap={1} alignItems="flex-start" useFlexGap flexWrap="wrap">
        <StackRowAlignCenter gap={1} useFlexGap flexWrap="wrap" sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828', wordBreak: 'break-word' }}>{entry.actionTitle}</Typography>
          <Typography
            component="span"
            sx={{
              ...TYPOGRAPHY_STYLES.sm.medium,
              color: '#364153',
              px: 1,
              py: 0.25,
              bgcolor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
            }}
          >
            {entry.source}
          </Typography>
        </StackRowAlignCenter>
      </StackRowAlignCenterJustBetween>

      <StackRowAlignCenter>
        <StackRowAlignCenter gap="6px">
          <Clock size={14} color="#6A7282" />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: META_COLOR, wordBreak: 'break-word' }}>{formatDateTime(entry.at)}</Typography>
        </StackRowAlignCenter>
        <StackRowAlignCenter gap="6px">
          <User01 size={16} color={META_COLOR} style={{ flexShrink: 0 }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: META_COLOR, wordBreak: 'break-word' }}>{entry.userLine}</Typography>
        </StackRowAlignCenter>
      </StackRowAlignCenter>

      {entry.fieldLine && (
        <StackRowAlignCenter gap={0.5} useFlexGap flexWrap="wrap">
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: META_COLOR }}>{entry.fieldLine.prefix}:</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: META_COLOR }}>{entry.fieldLine.name}</Typography>
        </StackRowAlignCenter>
      )}

      {entry.oldValue && entry.newValue && (
        <Stack gap={1}>
          <StackRowAlignCenter gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: META_COLOR, flexShrink: 0, minWidth: 62 }}>Giá trị cũ:</Typography>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.sm.regular,
                color: '#101828',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                bgcolor: '#FFE2E2',
                border: '1px solid #FEF2F2',
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {entry.oldValue}
            </Typography>
          </StackRowAlignCenter>
          <StackRowAlignCenter gap={1}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: META_COLOR, flexShrink: 0, minWidth: 62 }}>Giá trị mới:</Typography>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.sm.regular,
                color: '#101828',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                bgcolor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {entry.newValue}
            </Typography>
          </StackRowAlignCenter>
        </Stack>
      )}

      {entry.footNote && entry.footNote !== '' ? (
        <Typography
          sx={{
            ...TYPOGRAPHY_STYLES.sm.regular,
            color: META_COLOR,
            pt: 1.5,
            borderTop: '1px solid #E5E7EB',
            mt: 0.5,
          }}
        >
          {entry.footNote}
        </Typography>
      ) : null}
    </Stack>
  );
};

export interface ProductSpuAuditProps {
  open: boolean;
  onClose: () => void;
  productId?: string;
  entries?: ProductSpuAuditEntry[];
  title?: string;
  subtitle?: string;
}

export const ProductSpuAudit = ({ open, onClose, productId, entries = DEMO_AUDIT_ENTRIES, title, subtitle }: ProductSpuAuditProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [timeRangeDialogOpen, setTimeRangeDialogOpen] = useState(false);
  const [selectedTimeOption, setSelectedTimeOption] = useState<OrderTimeFilter | null>(null);
  const [customDateRange, setCustomDateRange] = useState<SharedTimeRange>(null);
  const [rawAuditItems, setRawAuditItems] = useState<ProductAuditLogItem[]>([]);
  const [auditUsersById, setAuditUsersById] = useState<Record<string, { displayName?: string }>>();
  const [loading, setLoading] = useState(false);

  const timeFilterPayload = useMemo(() => buildOrderTimeFilterPayload(selectedTimeOption, customDateRange), [customDateRange, selectedTimeOption]);

  const selectedTimeLabel = useMemo(() => formatTimeFilterLabel(selectedTimeOption, customDateRange, 'Thời gian'), [customDateRange, selectedTimeOption]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProductAuditLogs({
          orderBy: 'updatedAt',
          orderType: OrderType.DESC,
          page: 1,
          take: 100,
          ...timeFilterPayload,
          entityName: 'pim',
          entityId: productId,
        });
        if (cancelled) return;
        const items = normalizeProductAuditResponseToList(res);
        setRawAuditItems(items);
        setAuditUsersById(buildProductAuditUsersLookup(items, res));
      } catch {
        if (cancelled) return;
        setRawAuditItems([]);
        setAuditUsersById(undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [open, productId, timeFilterPayload]);

  const toolbarActions = useMemo<DataTableToolbarAction[]>(
    () => [
      {
        ...createSharedTimeFilterToolbarAction({
          selectedTimeLabel: selectedTimeLabel,
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

  const auditEntries = useMemo<ProductSpuAuditEntry[]>(() => {
    if (!productId) return entries;
    return rawAuditItems.flatMap((item, index) => {
      const normalized = normalizeProductAuditItem(item, index, auditUsersById);
      if (normalized.changeRows.length === 0) {
        return [
          {
            id: normalized.id,
            actionTitle: normalized.title,
            source: normalized.source,
            at: normalized.at,
            userLine: normalized.actorLabel,
            footNote: normalized.description,
          },
        ];
      }
      return normalized.changeRows.map((change, changeIndex) => ({
        id: `${normalized.id}-${changeIndex}`,
        actionTitle: normalized.title,
        source: normalized.source,
        at: normalized.at,
        userLine: normalized.actorLabel,
        fieldLine: change.field ? { prefix: 'Trường' as const, name: change.field } : undefined,
        oldValue: change.oldValue,
        newValue: change.newValue,
        footNote: normalized.description,
      }));
    });
  }, [entries, productId, rawAuditItems, auditUsersById]);

  const filteredEntries = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return auditEntries;
    return auditEntries.filter((e) => e.actionTitle.toLowerCase().includes(q) || e.userLine.toLowerCase().includes(q) || (e.fieldLine && e.fieldLine.name.toLowerCase().includes(q)));
  }, [auditEntries, searchValue]);

  return (
    <React.Fragment>
      <DrawerComponent
        open={open}
        onClose={onClose}
        title={title ?? 'Lịch sử thao tác'}
        subtitle={subtitle ?? 'Theo dõi toàn bộ thay đổi của sản phẩm'}
        footer={<Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6A7282' }}>Tổng số: {filteredEntries.length} thao tác</Typography>}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            minWidth: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <DataTableToolbar embedded searchValue={searchValue} onSearchChange={handleSearchChange} searchPlaceholder="Tìm kiếm" actions={toolbarActions} sx={{ gap: 0.5 }} />
        </Box>
        {loading ? <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: META_COLOR, p: 2 }}>Đang tải lịch sử thao tác...</Typography> : null}
        {!loading && filteredEntries.length === 0 ? (
          <EmptyComponent />
        ) : (
          <Stack sx={{ p: 3, gap: 1.5, bgcolor: '#FFFFFF', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            {filteredEntries.map((e) => (
              <ProductSpuAuditEntryCard key={e.id} entry={e} />
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
    </React.Fragment>
  );
};
