/**
 * DEV-ONLY — Seed bộ sưu tập Anh Trai Say Hi (Heartlock / Tinh Hà).
 * Xóa file + import trong collection-list.page.tsx khi không cần nữa.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { collectionApi } from '../../../../../../apis';
import { OrderType } from '../../../../../../apis/order';
import type { Collection } from '../../../../../../apis/collection/collection.entities';
import type { QueryCollectionDto } from '../../../../../../apis/collection/collection.interface';
import { CollectionStatus, UpdateCollectionAction } from '../../../../../../apis/collection/collection.enum';
import { getErrorMessage } from '../../../../../../common/utils';
import { useDefaultCollectionBrandId } from '../use-default-collection-brand-id.hook';
import { ANH_TRAI_SAY_HI_COLLECTION_SEEDS, type AnhTraiSayHiCollectionSeed } from '../anh-trai-say-hi-collection.seed';
import { autoAssignProductsSequential, buildArtistProductMap, formatProductCatalogLine, loadAllBrandProducts, normalizeCatalogSlug } from '../anh-trai-say-hi-product-resolver.util';

interface Props {
  onSeeded?: () => void;
}

type SeedScenario = {
  id: string;
  label: string;
  seeds: AnhTraiSayHiCollectionSeed[];
  productsOnly?: boolean;
  dumpCatalogOnly?: boolean;
  skipAutoAssign?: boolean;
};

const formatLogTimestamp = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const appendLog = (prev: string[], message: string): string[] => [...prev, `[${formatLogTimestamp()}] ${message}`];

const getUniqueCollectionsFromIndex = (index: Map<string, Collection>): Collection[] => [...new Map([...index.values()].map((item) => [item.id, item])).values()];

const upsertCollectionInIndex = (map: Map<string, Collection>, item: Collection): void => {
  const slugKey = normalizeCatalogSlug(item.slug ?? '');
  if (slugKey) map.set(`slug:${slugKey}`, item);

  const nameKey = normalizeCatalogSlug(item.name ?? '');
  if (nameKey) map.set(`name:${nameKey}`, item);

  if (item.id) map.set(`id:${item.id}`, item);
};

const fetchAllCollectionPages = async (params: Partial<QueryCollectionDto>): Promise<Collection[]> => {
  const results: Collection[] = [];
  let page = 1;

  while (page <= 50) {
    const response = await collectionApi.getCollectionList({
      page,
      take: 100,
      isPagination: true,
      orderType: OrderType.ASC,
      orderBy: 'name',
      ...params,
    });

    const list = response.list ?? [];
    results.push(...list);

    const total = response.pagination?.total ?? response.total ?? results.length;
    if (list.length === 0 || results.length >= total) break;
    page += 1;
  }

  return results;
};

const loadExistingCollectionsIndex = async (brandId?: string): Promise<Map<string, Collection>> => {
  const map = new Map<string, Collection>();
  const queryVariants: Partial<QueryCollectionDto>[] = [{ brandId }, {}];
  const seenIds = new Set<string>();

  for (const params of queryVariants) {
    const list = await fetchAllCollectionPages(params);
    for (const item of list) {
      if (!item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      upsertCollectionInIndex(map, item);
    }
  }

  return map;
};

const findExistingCollection = (seed: AnhTraiSayHiCollectionSeed, index: Map<string, Collection>): Collection | undefined =>
  index.get(`name:${normalizeCatalogSlug(seed.name)}`) ?? index.get(`slug:${normalizeCatalogSlug(seed.slug)}`);

const findInListBySlug = (list: Collection[], slug: string): Collection | undefined => {
  const normalized = normalizeCatalogSlug(slug);
  return list.find((item) => {
    const itemSlug = normalizeCatalogSlug(item.slug ?? '');
    return itemSlug === normalized || itemSlug.includes(normalized) || normalized.includes(itemSlug);
  });
};

const findInListByName = (list: Collection[], name: string): Collection | undefined => {
  const normalized = normalizeCatalogSlug(name);
  return list.find((item) => normalizeCatalogSlug(item.name ?? '') === normalized);
};

const findExistingCollectionBySlug = async (slug: string, brandId?: string, artistName?: string): Promise<Collection | undefined> => {
  const normalized = normalizeCatalogSlug(slug);
  const searchTerms = [...new Set([slug, normalized, slug.replace(/-/g, ' ')])];

  for (const term of searchTerms) {
    for (const params of [{ brandId, search: term }, { search: term }, { brandId }]) {
      const list = await fetchAllCollectionPages({ ...params, take: 100 });
      const found = findInListBySlug(list, normalized);
      if (found) return found;
    }
  }

  if (artistName) {
    const list = await fetchAllCollectionPages({ brandId });
    const byName = findInListByName(list, artistName);
    if (byName) return byName;
  }

  const globalList = await fetchAllCollectionPages({});
  const fromGlobal = findInListBySlug(globalList, normalized) ?? (artistName ? findInListByName(globalList, artistName) : undefined);
  if (fromGlobal) return fromGlobal;

  const index = await loadExistingCollectionsIndex(brandId);
  return index.get(`slug:${normalized}`) ?? (artistName ? index.get(`name:${normalizeCatalogSlug(artistName)}`) : undefined);
};

const resolveCollectionForSeed = (seed: AnhTraiSayHiCollectionSeed, index: Map<string, Collection>): Collection | undefined => findExistingCollection(seed, index);

const createSeedCollection = async (seed: AnhTraiSayHiCollectionSeed, brandId: string, productIds: string[]): Promise<{ id: string; slugLabel: string }> => {
  const created = await collectionApi.createCollection({
    name: seed.name,
    description: seed.description,
    brandId,
    status: CollectionStatus.ACTIVE,
    productIds,
  });
  return {
    id: created.id,
    slugLabel: created.slug ?? normalizeCatalogSlug(seed.name),
  };
};

const attachProductsToCollection = async (collectionId: string, productIds: string[]): Promise<void> => {
  await collectionApi.updateCollectionByProductId(collectionId, {
    action: UpdateCollectionAction.REPLACE,
    productIds,
  });
};

export const AnhTraiSayHiCollectionSeederButton = ({ onSeeded }: Props) => {
  const [open, setOpen] = useState(false);
  // Chỉ fetch brands khi mở panel seeder — tránh gọi /brands khi vào collection list.
  const { defaultBrandId, headerTenantCode, isLoading: isLoadingBrand } = useDefaultCollectionBrandId(open);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [scenarioId, setScenarioId] = useState('all-artists');
  const logEndRef = useRef<HTMLDivElement>(null);

  const scenarios = useMemo<SeedScenario[]>(
    () => [
      {
        id: 'all-artists',
        label: 'Tất cả 24 nghệ sĩ — tạo collection + gắn SP',
        seeds: ANH_TRAI_SAY_HI_COLLECTION_SEEDS,
      },
      {
        id: 'sync-products-only',
        label: 'Gắn SP vào collection đã tạo (PATCH products)',
        seeds: ANH_TRAI_SAY_HI_COLLECTION_SEEDS,
        productsOnly: true,
      },
      {
        id: 'dump-catalog',
        label: 'In catalog SP (id | spu | slug | name) — copy vào seed',
        seeds: ANH_TRAI_SAY_HI_COLLECTION_SEEDS,
        dumpCatalogOnly: true,
      },
      {
        id: 'ali-only',
        label: 'Chỉ Ali Hoàng Dương',
        seeds: ANH_TRAI_SAY_HI_COLLECTION_SEEDS.filter((item) => item.slug === 'ali-hoang-duong'),
        skipAutoAssign: true,
      },
    ],
    [],
  );

  const pushLog = useCallback((message: string) => {
    setLogs((prev) => {
      const next = appendLog(prev, message);
      requestAnimationFrame(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const runScenario = useCallback(
    async (scenario: SeedScenario): Promise<void> => {
      if (!defaultBrandId) {
        pushLog('❌ Chưa xác định brandId — kiểm tra tenant header và danh sách brand.');
        return;
      }

      pushLog(`🚀 "${scenario.label}" — tenant ${headerTenantCode}, brand ${defaultBrandId.slice(0, 8)}…`);
      pushLog('📦 Đang tải toàn bộ sản phẩm brand…');
      const productCatalog = await loadAllBrandProducts(defaultBrandId);
      pushLog(`📦 Catalog: ${productCatalog.length} sản phẩm`);

      if (scenario.dumpCatalogOnly) {
        pushLog('—— Danh sách SP (copy productIds vào anh-trai-say-hi-collection.seed.ts) ——');
        for (const product of productCatalog) {
          pushLog(formatProductCatalogLine(product));
        }
        pushLog('—— Hết danh sách ——');
        return;
      }

      let productMap = buildArtistProductMap(scenario.seeds, productCatalog);
      const matchedByHint = scenario.seeds.filter((seed) => {
        const ids = productMap.get(seed.slug) ?? [];
        return ids.length > 0 && !seed.productIds?.length;
      });

      if (matchedByHint.length > 0) {
        pushLog(`✓ Match slug/tên PIM: ${matchedByHint.length} nghệ sĩ`);
      }

      if (!scenario.skipAutoAssign) {
        const beforeEmpty = scenario.seeds.filter((seed) => (productMap.get(seed.slug) ?? []).length === 0).length;
        if (beforeEmpty > 0) {
          const auto = autoAssignProductsSequential(scenario.seeds, productCatalog, productMap);
          productMap = auto.map;
          if (auto.autoAssigned.length > 0) {
            pushLog(`📌 Tự phân bổ tuần tự ${auto.autoAssigned.length} nghệ sĩ (dev) — kiểm tra lại SP trước production`);
            for (const row of auto.autoAssigned.slice(0, 6)) {
              pushLog(`   · ${row.slug}: ${row.names.join(', ')}`);
            }
            if (auto.autoAssigned.length > 6) pushLog(`   · … +${auto.autoAssigned.length - 6} nghệ sĩ`);
          }
        }
      }

      const stillMissing = scenario.seeds.filter((seed) => (productMap.get(seed.slug) ?? []).length === 0);
      if (stillMissing.length > 0) {
        pushLog(`⚠️ ${stillMissing.length} nghệ sĩ vẫn chưa có SP — thêm productIds vào seed file`);
      }

      const collectionIndex = await loadExistingCollectionsIndex(defaultBrandId);
      const listedCollections = getUniqueCollectionsFromIndex(collectionIndex);
      pushLog(`📂 ${listedCollections.length} collection thấy trên list API:`);
      for (const item of listedCollections) {
        pushLog(`   · ${item.slug} | ${item.name}`);
      }
      if (listedCollections.length === 0) {
        pushLog('ℹ️ List trống — nếu POST báo slug trùng thì BE đang giữ slug orphan (không hiện trên admin).');
      }

      let created = 0;
      let synced = 0;
      let skipped = 0;
      let failed = 0;

      for (const seed of scenario.seeds) {
        const productIds = productMap.get(seed.slug) ?? [];

        if (productIds.length === 0) {
          skipped += 1;
          pushLog(`⚠️ "${seed.name}" — không có productIds, bỏ qua`);
          continue;
        }

        try {
          let existing = resolveCollectionForSeed(seed, collectionIndex);

          if (scenario.productsOnly) {
            if (!existing) {
              existing = await findExistingCollectionBySlug(normalizeCatalogSlug(seed.name), defaultBrandId, seed.name);
            }
            if (!existing) {
              skipped += 1;
              pushLog(`↷ "${seed.name}" — chưa có collection`);
              continue;
            }
            pushLog(`🔗 PATCH ${productIds.length} SP → "${seed.name}"…`);
            await attachProductsToCollection(existing.id, productIds);
            synced += 1;
            pushLog(`✅ ${seed.slug} · ${productIds.length} SP`);
            continue;
          }

          if (existing) {
            pushLog(`🔗 Collection đã có — PATCH ${productIds.length} SP → "${seed.name}"…`);
            await attachProductsToCollection(existing.id, productIds);
            synced += 1;
            pushLog(`✅ Đồng bộ ${existing.slug ?? seed.slug} · ${productIds.length} SP`);
            continue;
          }

          pushLog(`⏳ POST "${seed.name}" + ${productIds.length} SP (không gửi slug)…`);
          const createdResult = await createSeedCollection(seed, defaultBrandId, productIds);
          created += 1;
          pushLog(`✅ POST ${createdResult.slugLabel} → ${createdResult.id} · ${productIds.length} SP`);
        } catch (error) {
          failed += 1;
          pushLog(`❌ "${seed.name}": ${getErrorMessage(error)}`);
        }
      }

      pushLog(`✔️ Xong: tạo ${created}, gắn SP ${synced}, bỏ qua ${skipped}, lỗi ${failed} / ${scenario.seeds.length}`);
    },
    [defaultBrandId, headerTenantCode, pushLog],
  );

  const runSeeding = useCallback(async () => {
    if (running) return;
    const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
    if (!scenario) return;

    setRunning(true);
    try {
      await runScenario(scenario);
      onSeeded?.();
    } catch (error) {
      pushLog(`❌ Thất bại: ${getErrorMessage(error)}`);
    } finally {
      setRunning(false);
    }
  }, [onSeeded, pushLog, runScenario, running, scenarioId, scenarios]);

  const runDeleteSeeded = useCallback(async () => {
    if (running) return;
    if (!defaultBrandId) {
      pushLog('❌ Chưa xác định brandId — không thể xóa seed.');
      return;
    }
    const confirmed = window.confirm('⚠️ Xóa tất cả bộ sưu tập seed Anh Trai Say Hi (theo slug)?\nChỉ dùng trên dev/test.');
    if (!confirmed) return;

    setRunning(true);
    pushLog('🗑️ Đang xóa collection seed theo slug…');

    try {
      const index = await loadExistingCollectionsIndex(defaultBrandId);
      const resolved = await Promise.all(
        ANH_TRAI_SAY_HI_COLLECTION_SEEDS.map(async (seed) => {
          const fromIndex = resolveCollectionForSeed(seed, index);
          if (fromIndex) return fromIndex;
          return findExistingCollectionBySlug(normalizeCatalogSlug(seed.name), defaultBrandId, seed.name);
        }),
      );
      const targets = [...new Map(resolved.filter(Boolean).map((item) => [item!.id, item!])).values()];

      if (targets.length === 0) {
        pushLog('ℹ️ Không có collection seed nào để xóa.');
        return;
      }

      let deleted = 0;
      let failed = 0;

      for (const item of targets) {
        try {
          await collectionApi.deleteCollection(item.id);
          deleted += 1;
          pushLog(`✅ Đã xóa ${item.name} (${item.slug})`);
        } catch (error) {
          failed += 1;
          pushLog(`⚠️ Không xóa được ${item.slug}: ${getErrorMessage(error)}`);
        }
      }

      pushLog(`🏁 Xóa xong: ${deleted} thành công, ${failed} lỗi / ${targets.length} tổng.`);
      onSeeded?.();
    } catch (error) {
      pushLog(`❌ Thất bại: ${getErrorMessage(error)}`);
    } finally {
      setRunning(false);
    }
  }, [defaultBrandId, onSeeded, pushLog, running]);

  const selectedScenario = scenarios.find((item) => item.id === scenarioId);

  return (
    <>
      <style>{`
        .atsayhi-seeder-fab {
          position: fixed; right: 24px; bottom: 24px; z-index: 9999;
          width: 56px; height: 56px; border: none; border-radius: 9999px;
          background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
          color: #fff; font-size: 22px; cursor: pointer;
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .atsayhi-seeder-fab:hover { transform: scale(1.08); }
        .atsayhi-seeder-panel {
          position: fixed; right: 24px; bottom: 92px; z-index: 9999;
          width: min(520px, calc(100vw - 32px)); border-radius: 12px; overflow: hidden;
          background: #111827; border: 1px solid #374151; box-shadow: 0 20px 40px rgba(0,0,0,0.45);
        }
        .atsayhi-seeder-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; background: #1f2937; color: #f9fafb; font-size: 13px; font-weight: 600;
        }
        .atsayhi-seeder-scenario { padding: 10px 12px; background: #0f172a; border-bottom: 1px solid #374151; }
        .atsayhi-seeder-scenario label { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
        .atsayhi-seeder-scenario select {
          width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #4b5563;
          background: #1f2937; color: #f3f4f6; font-size: 11px;
        }
        .atsayhi-seeder-meta { font-size: 10px; color: #6b7280; margin-top: 6px; line-height: 1.4; }
        .atsayhi-seeder-actions {
          display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px;
          background: #111827; border-top: 1px solid #374151;
        }
        .atsayhi-seeder-btn {
          flex: 1; min-width: 100px; border: none; border-radius: 8px;
          padding: 8px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
        }
        .atsayhi-seeder-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .atsayhi-seeder-btn-primary { background: #16a34a; color: #fff; }
        .atsayhi-seeder-btn-danger { background: #dc2626; color: #fff; }
        .atsayhi-seeder-btn-secondary { background: #374151; color: #e5e7eb; }
        .atsayhi-seeder-btn-ghost { background: transparent; color: #9ca3af; border: 1px solid #4b5563; }
        .atsayhi-seeder-console {
          height: 300px; overflow-y: auto; padding: 10px 12px; background: #000; color: #f472b6;
          font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
          font-size: 10px; line-height: 1.45; white-space: pre-wrap; word-break: break-word;
        }
        .atsayhi-seeder-console-empty { color: #6b7280; }
      `}</style>

      <button type="button" className="atsayhi-seeder-fab" title="Anh Trai Say Hi Collection Seeder" aria-label="Anh Trai Say Hi Collection Seeder" onClick={() => setOpen((value) => !value)}>
        🎤
      </button>

      {open ? (
        <div className="atsayhi-seeder-panel" role="dialog" aria-label="Anh Trai Say Hi Collection Seeder">
          <div className="atsayhi-seeder-panel-header">
            <span>🎤 Anh Trai Say Hi — Collection Seeder (Dev)</span>
            <button type="button" className="atsayhi-seeder-btn-ghost atsayhi-seeder-btn" style={{ flex: 'unset', padding: '4px 8px' }} onClick={() => setOpen(false)}>
              Đóng
            </button>
          </div>

          <div className="atsayhi-seeder-scenario">
            <label htmlFor="atsayhi-seeder-scenario">Kịch bản</label>
            <select id="atsayhi-seeder-scenario" value={scenarioId} disabled={running} onChange={(event) => setScenarioId(event.target.value)}>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <div className="atsayhi-seeder-meta">
              {selectedScenario ? `${selectedScenario.seeds.length} collection` : ''} · tenant {headerTenantCode || '—'} · brand{' '}
              {isLoadingBrand ? 'đang tải…' : defaultBrandId ? `${defaultBrandId.slice(0, 8)}…` : 'chưa có'}
            </div>
          </div>

          <div className="atsayhi-seeder-console">
            {logs.length === 0 ? (
              <div className="atsayhi-seeder-console-empty">Match tên collection → nếu thiếu SP sẽ phân bổ tuần tự từ catalog (dev). POST không gửi slug — BE tự sinh từ name.</div>
            ) : null}
            {logs.map((line, index) => (
              <div key={`${index}-${line}`}>{line}</div>
            ))}
            <div ref={logEndRef} />
          </div>

          <div className="atsayhi-seeder-actions">
            <button type="button" className="atsayhi-seeder-btn atsayhi-seeder-btn-primary" disabled={running || isLoadingBrand || !defaultBrandId} onClick={() => void runSeeding()}>
              {running ? 'Đang chạy…' : `Chạy (${selectedScenario?.seeds.length ?? 0})`}
            </button>
            <button type="button" className="atsayhi-seeder-btn atsayhi-seeder-btn-danger" disabled={running} onClick={() => void runDeleteSeeded()}>
              Xóa seed
            </button>
            <button type="button" className="atsayhi-seeder-btn atsayhi-seeder-btn-secondary" disabled={running} onClick={clearLogs}>
              Xóa log
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AnhTraiSayHiCollectionSeederButton;
