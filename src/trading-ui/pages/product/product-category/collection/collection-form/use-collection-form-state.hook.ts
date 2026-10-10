import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { collectionApi, UpdateCollectionAction } from '@/trading-ui/apis/pim';
import type { Collection } from '../../../../../apis/collection/collection.entities';
import type { Product } from '../../../../../apis/product/product.entities';
import { SnackbarType, useSnackbar } from '../../../../../hooks/use-snackbar.hook';
import { DEFAULT_COLLECTION_PAGE_SIZE } from '../collection-detail/collection-detail.constant';
import { buildCollectionDetailRows, matchesCollectionRow } from '../collection-detail/utils/collection-detail.util';
import type { CollectionDetailRow } from '../collection-detail/collection-detail.interface';
import type { CollectionFormMode } from './collection-form.interface';

const buildCollectionDetailKey = (collectionId: string) => `product/admin/collections/${collectionId}`;

const collectProductIds = (collection: Collection | null | undefined): string[] => (collection?.productCollections ?? []).map((pc) => pc.productId);

const buildPendingRow = (collectionId: string, product: Product, order: number): CollectionDetailRow =>
  ({
    id: `draft-${product.id}`,
    collectionId,
    productId: product.id,
    order,
    product,
    createdAt: new Date() as unknown as Date,
    updatedAt: new Date() as unknown as Date,
  }) as CollectionDetailRow;

const rowIdToProductId = (rowId: string, collection: Collection | null | undefined): string | undefined => {
  if (!collection) {
    if (rowId.startsWith('draft-')) return rowId.slice('draft-'.length);
    return undefined;
  }
  if (rowId.startsWith('draft-')) return rowId.slice('draft-'.length);
  const pc = (collection.productCollections ?? []).find((p) => p.id === rowId);
  return pc?.productId;
};

export interface UseCollectionFormStateParams {
  mode: CollectionFormMode;
  collectionId?: string;
}

export function useCollectionFormState({ mode, collectionId }: UseCollectionFormStateParams) {
  const { showSnackbar } = useSnackbar();
  const isEdit = mode === 'edit';

  const {
    data: collection,
    isLoading,
    mutate,
  } = useSWR<Collection | null>(isEdit && collectionId ? buildCollectionDetailKey(collectionId) : null, () => (collectionId ? collectionApi.getCollectionDetail(collectionId) : null), {
    revalidateOnFocus: false,
  });

  const [searchValue, setSearchValueState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_COLLECTION_PAGE_SIZE);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isMutating, setIsMutating] = useState(false);

  const [draftProductIds, setDraftProductIds] = useState<string[]>([]);
  const [pendingProductsById, setPendingProductsById] = useState<Record<string, Product>>({});
  const [initialProductIds, setInitialProductIds] = useState<string[]>([]);

  const serverSyncKey = useMemo(() => {
    if (!collection) return '';
    return `${collection.id}:${collectProductIds(collection).join(',')}`;
  }, [collection]);

  const [synchronizedKey, setSynchronizedKey] = useState("");
  if (isEdit && collection && synchronizedKey !== serverSyncKey) {
    setSynchronizedKey(serverSyncKey);
    const ids = collectProductIds(collection);
    setDraftProductIds(ids);
    setInitialProductIds(ids);
    setPendingProductsById({});
  }

  const brandId = collection?.brandId;

  const rows = useMemo((): CollectionDetailRow[] => {
    const effectiveCollectionId = collectionId ?? 'new';
    if (isEdit && collection) {
      const serverRows = buildCollectionDetailRows(collection);
      const byProductId = new Map(serverRows.map((r) => [r.productId, r]));
      return draftProductIds
        .map((productId, index) => {
          const existing = byProductId.get(productId);
          if (existing) {
            return { ...existing, order: index } as CollectionDetailRow;
          }
          const pending = pendingProductsById[productId];
          if (!pending) return null;
          return buildPendingRow(collection.id, pending, index);
        })
        .filter((r): r is CollectionDetailRow => r != null);
    }

    return draftProductIds
      .map((productId, index) => {
        const pending = pendingProductsById[productId];
        if (!pending) return null;
        return buildPendingRow(effectiveCollectionId, pending, index);
      })
      .filter((r): r is CollectionDetailRow => r != null);
  }, [collection, collectionId, draftProductIds, isEdit, pendingProductsById]);

  const isProductDraftDirty = useMemo(() => {
    if (!isEdit) return draftProductIds.length > 0;
    if (initialProductIds.length !== draftProductIds.length) return true;
    const initialSet = new Set(initialProductIds);
    for (const id of draftProductIds) {
      if (!initialSet.has(id)) return true;
    }
    const draftSet = new Set(draftProductIds);
    for (const id of initialProductIds) {
      if (!draftSet.has(id)) return true;
    }
    return false;
  }, [draftProductIds, initialProductIds, isEdit]);

  const filteredRows = useMemo(() => rows.filter((row) => matchesCollectionRow(row, searchValue)), [rows, searchValue]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);


  const totalPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  if (page > totalPage) setPage(totalPage);

  const setSearchValue = useCallback((next: string) => {
    setSearchValueState(next);
    setPage(1);
  }, []);

  const stageAddProducts = useCallback(
    (products: Product[]) => {
      const incoming = products.filter((p) => Boolean(p?.id));
      if (incoming.length === 0) return;
      setDraftProductIds((prev) => {
        const seen = new Set(prev);
        const newly = incoming.filter((p) => !seen.has(p.id));
        if (newly.length === 0) {
          showSnackbar({ type: SnackbarType.WARNING, message: 'Sản phẩm đã có trong bộ sưu tập' });
          return prev;
        }
        const nextPending: Record<string, Product> = {};
        newly.forEach((p) => {
          nextPending[p.id] = p;
        });
        setPendingProductsById((pp) => ({ ...pp, ...nextPending }));
        return [...prev, ...newly.map((p) => p.id)];
      });
    },
    [showSnackbar],
  );

  const removeRowsFromDraft = useCallback(
    (rowIds: string[]) => {
      if (rowIds.length === 0) return;
      const idSet = new Set(rowIds);
      const pids = new Set<string>();
      for (const rid of rowIds) {
        const pid = rowIdToProductId(rid, collection ?? null);
        if (pid) pids.add(pid);
      }
      if (pids.size === 0) return;
      setDraftProductIds((prev) => prev.filter((id) => !pids.has(id)));
      setPendingProductsById((prev) => {
        const n = { ...prev };
        pids.forEach((pid) => {
          delete n[pid];
        });
        return n;
      });
      setSelectedRowIds((prev) => prev.filter((id) => !idSet.has(id)));
    },
    [collection],
  );

  const handleDeleteRow = useCallback(
    (row: CollectionDetailRow) => {
      removeRowsFromDraft([row.id]);
    },
    [removeRowsFromDraft],
  );

  const handleDeleteSelected = useCallback(async () => {
    removeRowsFromDraft(selectedRowIds);
  }, [removeRowsFromDraft, selectedRowIds]);

  const resetProductDraft = useCallback(() => {
    if (isEdit && collection) {
      const ids = collectProductIds(collection);
      setDraftProductIds(ids);
      setInitialProductIds(ids);
      setPendingProductsById({});
      setSelectedRowIds([]);
      return;
    }
    setDraftProductIds([]);
    setInitialProductIds([]);
    setPendingProductsById({});
    setSelectedRowIds([]);
  }, [collection, isEdit]);

  const syncProductsAfterSave = useCallback(
    async (targetCollectionId: string, serverCollection: Collection | null) => {
      const serverIds = collectProductIds(serverCollection);
      const serverSet = new Set(serverIds);
      const draftSet = new Set(draftProductIds);
      const toAdd = draftProductIds.filter((id) => !serverSet.has(id));
      const toRemove = serverIds.filter((id) => !draftSet.has(id));

      if (toRemove.length > 0) {
        await collectionApi.updateCollectionByProductId(targetCollectionId, {
          action: UpdateCollectionAction.REMOVE,
          productIds: toRemove,
        });
      }
      if (toAdd.length > 0) {
        await collectionApi.updateCollectionByProductId(targetCollectionId, {
          action: UpdateCollectionAction.ADD,
          productIds: toAdd,
        });
      }
    },
    [draftProductIds],
  );

  const selectedProductIdsSet = useMemo(() => new Set(draftProductIds), [draftProductIds]);

  return {
    collection,
    brandId,
    isLoading: isEdit && isLoading,
    isMutating,
    setIsMutating,
    mutate,

    searchValue,
    setSearchValue,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedRowIds: selectedRowIds.filter(id => rows.some(row => row.id === id)),
    setSelectedRowIds,
    pagedRows,
    filteredRows,
    totalRows: filteredRows.length,

    draftProductIds,
    selectedProductIdsSet,
    isProductDraftDirty,
    stageAddProducts,
    handleDeleteRow,
    handleDeleteSelected,
    resetProductDraft,
    syncProductsAfterSave,
  };
}
