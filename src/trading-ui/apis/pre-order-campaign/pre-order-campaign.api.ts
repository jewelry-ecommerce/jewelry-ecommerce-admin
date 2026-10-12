import { axiosRequest } from '../../common/config';
import type { ResList } from '../../common/constant/api.interface';
import type {
  CreatePreOrderCampaignDto,
  QueryPreOrderCampaignDto,
  QueryPreOrderCampaignSkuSearchDto,
  QueryPreOrderCampaignStatisticsDetailDto,
  QueryPreOrderCampaignStatisticsDto,
  ResListPreOrderCampaign,
  ResListPreOrderCampaignBadgeTemplate,
  ResListPreOrderCampaignSkuSearch,
  ResListPreOrderCampaignStatistics,
  PreOrderCampaignSkuSearchItem,
  PreOrderCampaignStatisticsDetail,
  PreOrderCampaignStatisticsListItem,
  PreOrderCampaignStatusCounts,
  UpdatePreOrderCampaignDto,
} from './pre-order-campaign.interface';
import type { PreOrderCampaign, PreOrderCampaignBadgeTemplate } from './pre-order-campaign.entities';
import { PreOrderCampaignStatus } from './pre-order-campaign.enum';

const BASE_PATH = 'order/pre-order/campaigns';

const STATUS_COUNT_KEYS: Array<'all' | PreOrderCampaignStatus> = [
  'all',
  PreOrderCampaignStatus.DRAFT,
  PreOrderCampaignStatus.SCHEDULED,
  PreOrderCampaignStatus.ACTIVE,
  PreOrderCampaignStatus.PAUSED,
  PreOrderCampaignStatus.ENDED,
];

const toCountNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

/** Map BE `summary.ALL` / `summary.Draft`… hoặc `counts.all` / `counts.Draft`… sang shape FE. */
const normalizeStatusCounts = (raw: unknown): PreOrderCampaignStatusCounts | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const record = raw as Record<string, unknown>;
  const counts: PreOrderCampaignStatusCounts = {};

  const all = toCountNumber(record.ALL ?? record.all);
  if (all != null) counts.all = all;

  for (const status of Object.values(PreOrderCampaignStatus)) {
    const value = toCountNumber(record[status]);
    if (value != null) counts[status] = value;
  }

  return STATUS_COUNT_KEYS.some((key) => counts[key] != null) ? counts : undefined;
};

const normalizeListResponse = <T>(raw: unknown): ResList<T> => {
  if (Array.isArray(raw)) {
    return { list: raw as T[], total: raw.length };
  }
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const list = (record.list ?? record.data ?? record.items) as unknown;
    if (Array.isArray(list)) {
      return {
        list: list as T[],
        total: typeof record.total === 'number' ? record.total : list.length,
      };
    }
  }
  return { list: [], total: 0 };
};

const normalizeCampaignListResponse = (raw: unknown): ResListPreOrderCampaign => {
  const base = normalizeListResponse<PreOrderCampaign>(raw);
  if (!raw || typeof raw !== 'object') return base;

  const record = raw as Record<string, unknown>;
  const counts = normalizeStatusCounts(record.summary ?? record.counts);
  return counts ? { ...base, counts } : base;
};

const normalizeBadgeTemplateList = (raw: unknown): ResListPreOrderCampaignBadgeTemplate => normalizeListResponse<PreOrderCampaignBadgeTemplate>(raw);

const normalizeSkuSearchList = (raw: unknown): ResListPreOrderCampaignSkuSearch => normalizeListResponse<PreOrderCampaignSkuSearchItem>(raw);

/** BE nhận `statuses=Active,Scheduled` hoặc lặp query; FE gửi mảng thì join CSV. */
const buildListParams = (params: Partial<QueryPreOrderCampaignDto | QueryPreOrderCampaignStatisticsDto>): Record<string, unknown> => {
  const { statuses, ...rest } = params;
  const next: Record<string, unknown> = { ...rest };

  if (statuses == null || statuses === '') {
    return next;
  }

  if (Array.isArray(statuses)) {
    const joined = statuses.map(String).filter(Boolean).join(',');
    if (joined) next.statuses = joined;
    return next;
  }

  next.statuses = String(statuses);
  return next;
};

export const getPreOrderCampaignList = async (params: Partial<QueryPreOrderCampaignDto>): Promise<ResListPreOrderCampaign> =>
  normalizeCampaignListResponse(await axiosRequest.get(BASE_PATH, { params: buildListParams(params) }));

export const getPreOrderCampaignDetail = async (id: string): Promise<PreOrderCampaign> => await axiosRequest.get(`${BASE_PATH}/${encodeURIComponent(id)}`);

/** Danh sách label CMS khả dụng để gắn chiến dịch đặt trước. */
export const getPreOrderCampaignBadgeTemplates = async (): Promise<ResListPreOrderCampaignBadgeTemplate> => normalizeBadgeTemplateList(await axiosRequest.get(`${BASE_PATH}/badge-templates`));

/** Tìm SKU theo phạm vi sản phẩm (collectionIds / categoryIds / skuCodes...). */
export const searchPreOrderCampaignSkus = async (dto: Partial<QueryPreOrderCampaignSkuSearchDto>): Promise<ResListPreOrderCampaignSkuSearch> =>
  normalizeSkuSearchList(await axiosRequest.post(`${BASE_PATH}/skus/search`, dto));

export const createPreOrderCampaign = async (dto: CreatePreOrderCampaignDto): Promise<PreOrderCampaign> => await axiosRequest.post(BASE_PATH, dto);

export const updatePreOrderCampaign = async (id: string, dto: UpdatePreOrderCampaignDto): Promise<PreOrderCampaign> => await axiosRequest.patch(`${BASE_PATH}/${encodeURIComponent(id)}`, dto);

export const deletePreOrderCampaign = async (id: string): Promise<void> => await axiosRequest.delete(`${BASE_PATH}/${encodeURIComponent(id)}`);

export const getPreOrderCampaignStatisticsList = async (params: Partial<QueryPreOrderCampaignStatisticsDto>): Promise<ResListPreOrderCampaignStatistics> =>
  normalizeListResponse<PreOrderCampaignStatisticsListItem>(await axiosRequest.get(`${BASE_PATH}/statistics`, { params: buildListParams(params) }));

export const getPreOrderCampaignStatisticsDetail = async (id: string, params?: QueryPreOrderCampaignStatisticsDetailDto): Promise<PreOrderCampaignStatisticsDetail> => {
  const raw = (await axiosRequest.get(`${BASE_PATH}/${encodeURIComponent(id)}/statistics`, { params })) as unknown;
  if (!raw || typeof raw !== 'object') {
    return {
      id,
      name: '',
      status: PreOrderCampaignStatus.DRAFT,
      statusLabel: '',
      startAt: null,
      endAt: null,
      expectedStockAt: null,
      skuCount: 0,
      orderCount: null,
      orderedQuantity: null,
      readyQuantity: null,
      progressPercent: null,
      skus: [],
    };
  }
  const record = raw as PreOrderCampaignStatisticsDetail & { skus?: unknown };
  return {
    ...record,
    skus: Array.isArray(record.skus) ? record.skus : [],
  };
};
