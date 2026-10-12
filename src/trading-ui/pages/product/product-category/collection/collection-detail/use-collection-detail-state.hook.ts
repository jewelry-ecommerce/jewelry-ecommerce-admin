import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';

import { collectionApi, CollectionStatus, UpdateCollectionAction } from '../../../../../apis';
import type { Collection } from '../../../../../apis/collection/collection.entities';
import type { Product } from '../../../../../apis/product/product.entities';
import { getErrorMessage } from '../../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { DEFAULT_COLLECTION_PAGE_SIZE } from './collection-detail.constant';
import { buildCollectionDetailRows, buildCollectionHeader, matchesCollectionRow } from './utils/collection-detail.util';
import type { CollectionDetailHeaderInfo, CollectionDetailRow } from './collection-detail.interface';

export interface UseCollectionDetailStateParams {
  initialHeader?: CollectionDetailHeaderInfo | null;
}

const buildCollectionDetailKey = (collectionId: string) => `product/admin/collections/${collectionId}`;

const collectProductIds = (collection: Collection | null | undefined): string[] => (collection?.productCollections ?? []).map((pc) => pc.productId);

const rowIdToProductId = (rowId: string, collection: Collection | null | undefined): string | undefined => {
  if (!collection) return undefined;
  if (rowId.startsWith('draft-')) return rowId.slice('draft-'.length);
  const pc = (collection.productCollections ?? []).find((p) => p.id === rowId);
  return pc?.productId;
};

const buildPendingRow = (collection: Collection, product: Product, order: number): CollectionDetailRow =>
  ({
    id: `draft-${product.id}`,
    collectionId: collection.id,
    productId: product.id,
    order,
    product,
    createdAt: new Date() as unknown as Date,
    updatedAt: new Date() as unknown as Date,
  }) as CollectionDetailRow;

export function useCollectionDetailState({ initialHeader }: UseCollectionDetailStateParams) {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { showSnackbar } = useSnackbar();

  const {
    data: collection,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Collection | null>(collectionId ? buildCollectionDetailKey(collectionId) : null, () => (collectionId ? collectionApi.getCollectionDetail(collectionId) : null), {
    revalidateOnFocus: false,
  });

  const [searchValue, setSearchValueState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_COLLECTION_PAGE_SIZE);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isMutating, setIsMutating] = useState(false);

  const [draftIsActive, setDraftIsActive] = useState(true);
  const [draftProductIds, setDraftProductIds] = useState<string[]>([]);
  const [pendingProductsById, setPendingProductsById] = useState<Record<string, Product>>({});

  const serverSyncKey = useMemo(() => {
    if (!collection) return '';
    return `${collection.id}:${String(collection.status)}:${collectProductIds(collection).join(',')}`;
  }, [collection]);

  useEffect(() => {
    if (!collection) return;
    setDraftIsActive(collection.status === CollectionStatus.ACTIVE);
    setDraftProductIds(collectProductIds(collection));
    setPendingProductsById({});
  }, [serverSyncKey, collection]);

  const header = useMemo(() => buildCollectionHeader(collection, initialHeader), [collection, initialHeader]);

  const rows = useMemo((): CollectionDetailRow[] => {
    if (!collection) return [];
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
        return buildPendingRow(collection, pending, index);
      })
      .filter((r): r is CollectionDetailRow => r != null);
  }, [collection, draftProductIds, pendingProductsById]);

  const isDraftDirty = useMemo(() => {
    if (!collection) return false;
    const serverActive = collection.status === CollectionStatus.ACTIVE;
    const serverIds = collectProductIds(collection);
    if (draftIsActive !== serverActive) return true;
    if (serverIds.length !== draftProductIds.length) return true;
    const s = new Set(serverIds);
    for (const id of draftProductIds) {
      if (!s.has(id)) return true;
    }
    const d = new Set(draftProductIds);
    for (const id of serverIds) {
      if (!d.has(id)) return true;
    }
    return false;
  }, [collection, draftIsActive, draftProductIds]);

  const filteredRows = useMemo<CollectionDetailRow[]>(() => rows.filter((row) => matchesCollectionRow(row, searchValue)), [rows, searchValue]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  useEffect(() => {
    setSelectedRowIds((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  useEffect(() => {
    const totalPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    if (page > totalPage) setPage(totalPage);
  }, [filteredRows.length, page, pageSize]);

  const setSearchValue = useCallback((next: string) => {
    setSearchValueState(next);
    setPage(1);
  }, []);

  const runCollectionProductMutations = useCallback(
    async (execute: () => Promise<unknown>, successMessage: string) => {
      if (!collectionId) return;
      setIsMutating(true);
      try {
        await execute();
        await mutate();
        showSnackbar({ type: SnackbarType.SUCCESS, message: successMessage });
      } catch (error) {
        showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      } finally {
        setIsMutating(false);
      }
    },
    [collectionId, mutate, showSnackbar],
  );

  const discardDraft = useCallback(() => {
    if (!collection) return;
    setDraftIsActive(collection.status === CollectionStatus.ACTIVE);
    setDraftProductIds(collectProductIds(collection));
    setPendingProductsById({});
  }, [collection]);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (!collectionId || !collection || !isDraftDirty) return true;
    setIsMutating(true);
    try {
      const serverActive = collection.status === CollectionStatus.ACTIVE;
      if (draftIsActive !== serverActive) {
        await collectionApi.updateCollection(collectionId, {
          status: draftIsActive ? CollectionStatus.ACTIVE : CollectionStatus.INACTIVE,
        });
      }

      const serverIds = collectProductIds(collection);
      const serverSet = new Set(serverIds);
      const draftSet = new Set(draftProductIds);
      const toAdd = draftProductIds.filter((id) => !serverSet.has(id));
      const toRemove = serverIds.filter((id) => !draftSet.has(id));

      if (toRemove.length > 0) {
        await collectionApi.updateCollectionByProductId(collectionId, {
          action: UpdateCollectionAction.REMOVE,
          productIds: toRemove,
        });
      }
      if (toAdd.length > 0) {
        await collectionApi.updateCollectionByProductId(collectionId, {
          action: UpdateCollectionAction.ADD,
          productIds: toAdd,
        });
      }

      await mutate();
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu thay đổi' });
      return true;
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [collection, collectionId, draftIsActive, draftProductIds, isDraftDirty, mutate, showSnackbar]);

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

  const addProduct = useCallback(
    async (product: Product) => {
      stageAddProducts([product]);
    },
    [stageAddProducts],
  );

  const removeRowsFromDraft = useCallback(
    (rowIds: string[]) => {
      if (rowIds.length === 0 || !collection) return;
      const idSet = new Set(rowIds);
      const pids = new Set<string>();
      for (const rid of rowIds) {
        const pid = rowIdToProductId(rid, collection);
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

  const replaceProductInCollection = useCallback(
    async (oldProductId: string, newProductId: string) => {
      if (!collectionId || !oldProductId || !newProductId || oldProductId === newProductId) return;
      await runCollectionProductMutations(
        () =>
          collectionApi.updateCollectionByProductId(collectionId, {
            action: UpdateCollectionAction.REPLACE,
            productIds: [oldProductId, newProductId],
          }),
        'Thay thế sản phẩm trong bộ sưu tập thành công',
      );
    },
    [collectionId, runCollectionProductMutations],
  );

  const handleDeleteRow = useCallback(
    async (row: CollectionDetailRow) => {
      removeRowsFromDraft([row.id]);
    },
    [removeRowsFromDraft],
  );

  const handleDeleteSelected = useCallback(async () => {
    removeRowsFromDraft(selectedRowIds);
  }, [removeRowsFromDraft, selectedRowIds]);

  return {
    header,
    isLoading,
    isMutating,
    isValidating,

    searchValue,
    setSearchValue,

    page,
    setPage,
    pageSize,
    setPageSize,

    selectedRowIds,
    setSelectedRowIds,

    rows,
    filteredRows,
    pagedRows,

    draftIsActive,
    setDraftIsActive,
    isDraftDirty,
    discardDraft,
    saveDraft,
    stageAddProducts,

    addProduct,
    replaceProductInCollection,
    handleDeleteRow,
    handleDeleteSelected,
    refetch: mutate,
  };
}
