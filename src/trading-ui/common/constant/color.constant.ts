import { PromotionDraftStatus } from '../../apis';
import { BadgeCampaignDisplayStatus, BadgeTemplateBadgeType } from '../../apis/badge/badge.enum';
import { BadgeStatus, LabelTemplateClassification } from '../../apis/cms/cms.enum';
import { PosStoreStatus, PosStoreType } from '../../apis/pos/pos.enum';
import { ProductApprovalStatus, ProductSpuStatus } from '../../apis/product/product.enum';

export interface ColorSystem {
  tag: Record<string, string>;
  button: Record<string, string>;
}

export const COLOR_CONSTANT = {
  error: '#FF4444',
  successLight: '#3CB353',
  success: '#3DAF42',
  main: '#07554B',
  mainLight: '#11B6AF',
  info: '#1570EF',
  warning: '#CA8A03',
  secondary: '#BF00E0',
  primary: '#2563EB',
  red: '#961208e0',
  green: '#16A34A',
  yellow: '#FFF59D',
  blue: '#2D9CDB',
  gray: '#7A7A7A',
  gray2: '#BEBEBE',
  gray3: '#525252',
  gray4: '#4B5563',
  gray5: '#737373',
  gray6: '#221e1eff',
  gray7: '#E3E3E3',
  gray8: '#F4F4F7',
  gray9: '#FAFAFA',
};

export const CHECKED_COLOR = '#101828';

export const COLOR_SYSTEM: ColorSystem = {
  tag: {
    error: COLOR_CONSTANT.error,
    warning: COLOR_CONSTANT.warning,
    success: COLOR_CONSTANT.success,
    info: COLOR_CONSTANT.info,
    primary: COLOR_CONSTANT.primary,
    secondary: COLOR_CONSTANT.secondary,

    [BadgeStatus.DRAFT]: COLOR_CONSTANT.gray3,
    [BadgeStatus.ACTIVE]: COLOR_CONSTANT.green,
    [BadgeStatus.INACTIVE]: COLOR_CONSTANT.error,
    [BadgeStatus.ARCHIVED]: COLOR_CONSTANT.error,
    [BadgeTemplateBadgeType.BEST_SELLER]: COLOR_CONSTANT.error,
    [BadgeTemplateBadgeType.NEW_ARRIVAL]: COLOR_CONSTANT.success,
    [BadgeTemplateBadgeType.PRICE_DIFF]: COLOR_CONSTANT.primary,
    [BadgeTemplateBadgeType.OUT_OF_STOCK]: COLOR_CONSTANT.blue,
    [BadgeTemplateBadgeType.CAMPAIGN]: COLOR_CONSTANT.primary,
    [BadgeTemplateBadgeType.LOW_STOCK]: COLOR_CONSTANT.warning,

    [LabelTemplateClassification.SOLD_OUT]: COLOR_CONSTANT.blue,

    [ProductApprovalStatus.PENDING]: COLOR_CONSTANT.warning,
    [ProductApprovalStatus.APPROVED]: COLOR_CONSTANT.green,
    [ProductApprovalStatus.REJECTED]: COLOR_CONSTANT.error,
    [ProductApprovalStatus.CANCELLED]: COLOR_CONSTANT.gray4,

    [ProductSpuStatus.UNPUBLISHED]: COLOR_CONSTANT.warning,
    [ProductSpuStatus.PUBLISHED]: COLOR_CONSTANT.green,
    [ProductSpuStatus.DISCONTINUED]: COLOR_CONSTANT.gray4,

    [BadgeCampaignDisplayStatus.SCHEDULED]: COLOR_CONSTANT.blue,
    [BadgeCampaignDisplayStatus.RUNNING]: COLOR_CONSTANT.green,
    [BadgeCampaignDisplayStatus.PAUSED]: COLOR_CONSTANT.warning,
    [BadgeCampaignDisplayStatus.ENDED]: COLOR_CONSTANT.error,

    // promotion
    [PromotionDraftStatus.EDITING]: COLOR_CONSTANT.warning,
    [PromotionDraftStatus.READY_TO_PUBLISH]: COLOR_CONSTANT.green,
    [PromotionDraftStatus.DISCARDED]: COLOR_CONSTANT.error,
    /** CMS header / logo / top-banner workflow */
    DEACTIVE: COLOR_CONSTANT.gray4,
    label_sale: '#E11D8C',

    // POS — cửa hàng (hex theo design pill)
    POS_ACTIVE: '#027A48',
    POS_MAINTENANCE: '#B42318',
    POS_INACTIVE: '#344054',
    POS_FIXED: '#175CD3',
    POS_TEMPORARY: '#C11574',
    [PosStoreStatus.MAINTENANCE]: '#B42318',
    [PosStoreType.FIXED]: '#175CD3',
    [PosStoreType.POPUP]: '#C11574',
  },
  button: {},
};

const TAG_SYNONYM_TO_SYSTEM_KEY: Record<string, string> = {
  'Kích hoạt': BadgeStatus.ACTIVE,
  ACTIVE: BadgeStatus.ACTIVE,
  'Đang chạy': BadgeStatus.ACTIVE,

  'Vô hiệu hóa': BadgeStatus.INACTIVE,
  INACTIVE: BadgeStatus.INACTIVE,
  Ngung: 'DEACTIVE',
  DEACTIVE: 'DEACTIVE',
  Ngừng: 'DEACTIVE',

  Nhap: BadgeStatus.DRAFT,
  Nháp: BadgeStatus.DRAFT,
  DRAFT: BadgeStatus.DRAFT,

  'Hẹn giờ': BadgeCampaignDisplayStatus.SCHEDULED,

  'Lưu trữ': BadgeStatus.ARCHIVED,
  ARCHIVED: BadgeStatus.ARCHIVED,

  'Bản nháp': ProductSpuStatus.DRAFT,
  'Chưa gửi duyệt': ProductSpuStatus.DRAFT,
  UNPUBLISHED: ProductSpuStatus.UNPUBLISHED,
  'Ngừng xuất bản': ProductSpuStatus.UNPUBLISHED,
  PUBLISHED: ProductSpuStatus.PUBLISHED,
  DISCONTINUED: ProductSpuStatus.DISCONTINUED,
  'Ngung kinh doanh': ProductSpuStatus.DISCONTINUED,
  'Xuất bản': ProductSpuStatus.PUBLISHED,
  'Lưu trữ sản phẩm': ProductSpuStatus.ARCHIVED,

  'Đã duyệt': ProductApprovalStatus.APPROVED,
  APPROVED: ProductApprovalStatus.APPROVED,

  'Chờ duyệt': ProductApprovalStatus.PENDING,
  PENDING: ProductApprovalStatus.PENDING,

  'Từ chối': ProductApprovalStatus.REJECTED,
  REJECTED: ProductApprovalStatus.REJECTED,

  'Đã hủy': ProductApprovalStatus.CANCELLED,
  CANCELLED: ProductApprovalStatus.CANCELLED,

  'Chiến dịch': BadgeTemplateBadgeType.CAMPAIGN,
  CAMPAIGN: BadgeTemplateBadgeType.CAMPAIGN,

  'Bán chạy': BadgeTemplateBadgeType.BEST_SELLER,
  BEST_SELLER: BadgeTemplateBadgeType.BEST_SELLER,

  'Chênh lệch giá': BadgeTemplateBadgeType.PRICE_DIFF,
  PRICE_DIFF: BadgeTemplateBadgeType.PRICE_DIFF,

  'Hết hàng': BadgeTemplateBadgeType.OUT_OF_STOCK,
  OUT_OF_STOCK: BadgeTemplateBadgeType.OUT_OF_STOCK,

  Mới: BadgeTemplateBadgeType.NEW_ARRIVAL,
  NEW_ARRIVAL: BadgeTemplateBadgeType.NEW_ARRIVAL,

  'Sắp hết': BadgeTemplateBadgeType.LOW_STOCK,
  LOW_STOCK: BadgeTemplateBadgeType.LOW_STOCK,

  'Đang diễn ra': BadgeCampaignDisplayStatus.RUNNING,
  RUNNING: BadgeCampaignDisplayStatus.RUNNING,

  'Đã lên lịch': BadgeCampaignDisplayStatus.SCHEDULED,
  'Đã đặt lịch': BadgeCampaignDisplayStatus.SCHEDULED,
  'Sắp diễn ra': BadgeCampaignDisplayStatus.SCHEDULED,
  SCHEDULED: BadgeCampaignDisplayStatus.SCHEDULED,

  'Tạm dừng': BadgeCampaignDisplayStatus.PAUSED,
  'Tạm ngưng': BadgeCampaignDisplayStatus.PAUSED,
  PAUSED: BadgeCampaignDisplayStatus.PAUSED,

  'Đã kết thúc': BadgeCampaignDisplayStatus.ENDED,
  ENDED: BadgeCampaignDisplayStatus.ENDED,

  // promotion
  'Đang soạn': PromotionDraftStatus.EDITING,
  EDITING: PromotionDraftStatus.EDITING,
  'Sẵn sàng xuất bản': PromotionDraftStatus.READY_TO_PUBLISH,
  READY_TO_PUBLISH: PromotionDraftStatus.READY_TO_PUBLISH,
  'Đã xuất bản': PromotionDraftStatus.PUBLISHED,
  'Đã xoá': PromotionDraftStatus.DISCARDED,
  DISCARDED: PromotionDraftStatus.DISCARDED,

  // POS — cửa hàng
  'Hoạt động': 'POS_ACTIVE',
  'Bảo trì': 'POS_MAINTENANCE',
  MAINTENANCE: 'POS_MAINTENANCE',
  'Ngừng hoạt động': 'POS_INACTIVE',
  'Cố định': 'POS_FIXED',
  FIXED: 'POS_FIXED',
  'Tạm thời': 'POS_TEMPORARY',
  TEMPORARY: 'POS_TEMPORARY',
};

const normalizeTag = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

const TAG_HEX_BY_ALIAS: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_SYNONYM_TO_SYSTEM_KEY)
    .map(([label, systemKey]) => {
      const hex = COLOR_SYSTEM.tag[systemKey];
      if (!hex) return null;
      return [normalizeTag(label), hex] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null),
);

export const resolveTagHexFromContent = (raw: string): string => {
  const normalized = normalizeTag(raw);
  if (!normalized) return COLOR_CONSTANT.gray5;

  return COLOR_SYSTEM.tag[raw] ?? TAG_HEX_BY_ALIAS[normalized] ?? COLOR_SYSTEM.tag[raw.toUpperCase()] ?? COLOR_CONSTANT.gray5;
};

export const colorMap: Record<string, { backgroundColor: string; color: string }> = {
  success: { backgroundColor: COLOR_CONSTANT.success, color: COLOR_CONSTANT.primary },
  error: { backgroundColor: COLOR_CONSTANT.error, color: COLOR_CONSTANT.primary },
  cancel: { backgroundColor: COLOR_CONSTANT.gray2, color: COLOR_CONSTANT.primary },
};
