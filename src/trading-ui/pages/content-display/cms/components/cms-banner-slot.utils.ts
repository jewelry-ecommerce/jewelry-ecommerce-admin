import { type UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import {
  BannerActionType,
  BannerActionsLayout,
  type Banner,
  BannerLayout,
  BannerMediaType,
  BannerStatus,
  type CreateBannerDto,
  PlacementDisplayType,
  type PlacementLayout,
  type UpdateBannerDto,
} from "../../../../apis";
export interface PlacementBuilderSlotAction {
  actionType: BannerActionType;
  actionTarget?: string;
  ctaText?: string;
  ctaBg?: string;
  ctaColor?: string;
}

export interface PlacementBuilderSlotItem {
  id?: string;
  slotKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  bannerId?: string;
  internalName?: string;
  mediaType?: BannerMediaType;
  mediaUrl?: string;
  mediaMobileUrl?: string;
  mediaPosterUrl?: string;
  mediaMobilePosterUrl?: string;
  mediaLinkUrl?: string;
  layout?: BannerLayout;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  actionsLayout?: BannerActionsLayout;
  actions?: PlacementBuilderSlotAction[];
  actionTarget?: string;
  status?: BannerStatus;
}

export interface BannerSlotFormValues {
  internalName: string;
  mediaType: BannerMediaType;
  mediaUrl: string;
  mediaMobileUrl: string;
  mediaPosterUrl: string;
  mediaMobilePosterUrl: string;
  mediaLinkUrl: string;
  layout: BannerLayout;
  title: string;
  subtitle: string;
  titleColor: string;
  actionsLayout: BannerActionsLayout;
  primaryActionType: BannerActionType;
  primaryActionTarget: string;
  primaryActionText: string;
  primaryActionBg: string;
  primaryActionColor: string;
  secondaryActionType: BannerActionType;
  secondaryActionTarget: string;
  secondaryActionText: string;
  secondaryActionBg: string;
  secondaryActionColor: string;
  status: BannerStatus;
}

export const bannerSlotFormSchema: yup.ObjectSchema<BannerSlotFormValues> = yup
  .object({
    internalName: yup.string().trim().optional().default(""),
    mediaType: yup
      .mixed<BannerMediaType>()
      .oneOf([BannerMediaType.IMAGE, BannerMediaType.GIF, BannerMediaType.VIDEO] as BannerMediaType[])
      .required(),
    mediaUrl: yup.string().trim().required("Vui lòng nhập đường dẫn hình ảnh/video"),
    mediaMobileUrl: yup.string().trim().required("Vui lòng nhập đường dẫn hình ảnh/video (điện thoại)"),
    mediaPosterUrl: yup.string().trim().optional().default(""),
    mediaMobilePosterUrl: yup.string().trim().optional().default(""),
    mediaLinkUrl: yup.string().trim().optional().default(""),
    layout: yup
      .mixed<BannerLayout>()
      .oneOf(Object.values(BannerLayout) as BannerLayout[])
      .required(),
    title: yup.string().trim().optional().default(""),
    subtitle: yup.string().trim().optional().default(""),
    titleColor: yup.string().trim().optional().default("#FFFFFF"),
    actionsLayout: yup
      .mixed<BannerActionsLayout>()
      .oneOf(Object.values(BannerActionsLayout) as BannerActionsLayout[])
      .required(),
    primaryActionType: yup
      .mixed<BannerActionType>()
      .oneOf(Object.values(BannerActionType) as BannerActionType[])
      .required(),
    primaryActionTarget: yup.string().trim().optional().default(""),
    primaryActionText: yup.string().trim().optional().default(""),
    primaryActionBg: yup.string().trim().optional().default("#FFFFFF"),
    primaryActionColor: yup.string().trim().optional().default("#171717"),
    secondaryActionType: yup
      .mixed<BannerActionType>()
      .oneOf(Object.values(BannerActionType) as BannerActionType[])
      .required(),
    secondaryActionTarget: yup.string().trim().optional().default(""),
    secondaryActionText: yup.string().trim().optional().default(""),
    secondaryActionBg: yup.string().trim().optional().default("#111827"),
    secondaryActionColor: yup.string().trim().optional().default("#FFFFFF"),
    status: yup
      .mixed<BannerStatus>()
      .oneOf(Object.values(BannerStatus) as BannerStatus[])
      .required(),
  })
  .required();

export const DEFAULT_BANNER_SLOT_FORM_VALUES: BannerSlotFormValues = {
  internalName: "",
  mediaType: BannerMediaType.IMAGE,
  mediaUrl: "",
  mediaMobileUrl: "",
  mediaPosterUrl: "",
  mediaMobilePosterUrl: "",
  mediaLinkUrl: "",
  layout: BannerLayout.LEFT_BOTTOM,
  title: "",
  subtitle: "",
  titleColor: "#FFFFFF",
  actionsLayout: BannerActionsLayout.INLINE,
  primaryActionType: BannerActionType.URL,
  primaryActionTarget: "",
  primaryActionText: "",
  primaryActionBg: "#FFFFFF",
  primaryActionColor: "#171717",
  secondaryActionType: BannerActionType.URL,
  secondaryActionTarget: "",
  secondaryActionText: "",
  secondaryActionBg: "#111827",
  secondaryActionColor: "#FFFFFF",
  status: BannerStatus.ACTIVE,
};

export const BANNER_LAYOUT_OPTIONS = [
  { value: BannerLayout.LEFT_TOP, label: "Trái trên" },
  { value: BannerLayout.CENTER_TOP, label: "Giữa trên" },
  { value: BannerLayout.RIGHT_TOP, label: "Phải trên" },
  { value: BannerLayout.LEFT_CENTER, label: "Trái giữa" },
  { value: BannerLayout.CENTER, label: "Chính giữa" },
  { value: BannerLayout.RIGHT_CENTER, label: "Phải giữa" },
  { value: BannerLayout.LEFT_BOTTOM, label: "Trái dưới" },
  { value: BannerLayout.CENTER_BOTTOM, label: "Giữa dưới" },
  { value: BannerLayout.RIGHT_BOTTOM, label: "Phải dưới" },
];

export const ACTION_LAYOUT_OPTIONS = [
  { value: BannerActionsLayout.INLINE, label: "Nằm ngang" },
  { value: BannerActionsLayout.STACK, label: "Xếp dọc" },
];

export type BannerMediaFieldName = "mediaUrl" | "mediaMobileUrl" | "mediaPosterUrl" | "mediaMobilePosterUrl";

export const VIDEO_POSTER_ACCEPT = "image/*";

export interface BannerSlotContentFormFieldsProps {
  slotForm: UseFormReturn<BannerSlotFormValues>;
  slotMediaTypeWatch?: BannerMediaType;
  getAcceptByMediaType: (mediaType: BannerMediaType) => string;
  onUploadSlotMedia: (fieldName: BannerMediaFieldName, file: File) => Promise<void>;
  onFileReject: (reason: string) => void;
  onClearSlotMedia?: (fieldName: BannerMediaFieldName) => void;
  previewOverrides?: Partial<Record<BannerMediaFieldName, string>>;
  contentMode?: "default" | "double_banner" | "grid";
}

export const isSequentialBannerPlacement = (displayType?: PlacementDisplayType | null) =>
  displayType === PlacementDisplayType.SLIDER || displayType === PlacementDisplayType.CAROUSEL;

export const isReorderableBannerPlacement = (displayType?: PlacementDisplayType | null) =>
  displayType === PlacementDisplayType.SLIDER ||
  displayType === PlacementDisplayType.CAROUSEL ||
  displayType === PlacementDisplayType.DOUBLE_BANNER;

export const getNonGridDimensions = (displayType: PlacementDisplayType) =>
  displayType === PlacementDisplayType.DOUBLE_BANNER ? { columns: 2, rows: 1 } : { columns: 1, rows: 1 };

export const getSlotDisplayLabel = (displayType: PlacementDisplayType, index: number) => {
  if (displayType === PlacementDisplayType.DOUBLE_BANNER) return `Banner ${index + 1}`;
  if (displayType === PlacementDisplayType.CAROUSEL) return `Mục băng chuyền ${index + 1}`;
  return `Trang trượt ${index + 1}`;
};

export const createBannerSlot = (
  displayType: PlacementDisplayType,
  index: number,
  slot?: Partial<PlacementBuilderSlotItem>,
): PlacementBuilderSlotItem => ({
  ...slot,
  slotKey: String(index + 1),
  x: displayType === PlacementDisplayType.DOUBLE_BANNER ? index : 0,
  y: 0,
  width: 1,
  height: 1,
  order: index + 1,
});

export const normalizeBannerSlots = (displayType: PlacementDisplayType, slots: PlacementBuilderSlotItem[]) => {
  const sortedSlots = [...slots].sort((a, b) => a.order - b.order);
  const targetCount = displayType === PlacementDisplayType.DOUBLE_BANNER ? 2 : Math.max(sortedSlots.length, 1);
  return Array.from({ length: targetCount }, (_, index) => createBannerSlot(displayType, index, sortedSlots[index]));
};

export const createDefaultBannerSlots = (displayType: PlacementDisplayType) => normalizeBannerSlots(displayType, []);

export const getActionTarget = (banner?: Banner) => banner?.actions?.find((action) => action.actionTarget?.trim())?.actionTarget ?? "";

export const mapBannerFieldsFromLayoutItem = (
  banner?: Banner,
): Pick<
  PlacementBuilderSlotItem,
  | "internalName"
  | "mediaType"
  | "mediaUrl"
  | "mediaMobileUrl"
  | "mediaPosterUrl"
  | "mediaMobilePosterUrl"
  | "mediaLinkUrl"
  | "layout"
  | "title"
  | "subtitle"
  | "titleColor"
  | "actionsLayout"
  | "actions"
  | "actionTarget"
  | "status"
> => ({
  internalName: banner?.internalName,
  mediaType: banner?.mediaType,
  mediaUrl: banner?.mediaUrl,
  mediaMobileUrl: banner?.mediaMobileUrl,
  mediaPosterUrl: banner?.mediaPosterUrl,
  mediaMobilePosterUrl: banner?.mediaMobilePosterUrl,
  mediaLinkUrl: banner?.mediaLinkUrl,
  layout: banner?.layout,
  title: banner?.title,
  subtitle: banner?.subtitle,
  titleColor: banner?.titleColor,
  actionsLayout: banner?.actionsLayout,
  actions: banner?.actions?.map((action) => ({
    actionType: action.actionType ?? BannerActionType.URL,
    actionTarget: action.actionTarget,
    ctaText: action.ctaText,
    ctaBg: action.ctaBg,
    ctaColor: action.ctaColor,
  })),
  actionTarget: getActionTarget(banner),
  status: banner?.status,
});

export const getBannerActionAt = (slot?: PlacementBuilderSlotItem | null, index = 0): PlacementBuilderSlotAction | undefined => {
  const action = slot?.actions?.[index];
  if (action) return action;
  if (index === 0 && slot?.actionTarget?.trim()) {
    return { actionType: BannerActionType.URL, actionTarget: slot.actionTarget.trim() };
  }
  return undefined;
};

export const toBannerSlotFormValues = (slot?: PlacementBuilderSlotItem | null): BannerSlotFormValues => {
  if (!slot) return DEFAULT_BANNER_SLOT_FORM_VALUES;
  const primaryAction = getBannerActionAt(slot, 0);
  const secondaryAction = getBannerActionAt(slot, 1);
  return {
    internalName: slot.internalName ?? "",
    mediaType: slot.mediaType ?? BannerMediaType.IMAGE,
    mediaUrl: slot.mediaUrl ?? "",
    mediaMobileUrl: slot.mediaMobileUrl ?? "",
    mediaPosterUrl: slot.mediaPosterUrl ?? "",
    mediaMobilePosterUrl: slot.mediaMobilePosterUrl ?? "",
    mediaLinkUrl: slot.mediaLinkUrl ?? "",
    layout: slot.layout ?? BannerLayout.LEFT_BOTTOM,
    title: slot.title ?? "",
    subtitle: slot.subtitle ?? "",
    titleColor: slot.titleColor ?? "#FFFFFF",
    actionsLayout: slot.actionsLayout ?? BannerActionsLayout.INLINE,
    primaryActionType: primaryAction?.actionType ?? BannerActionType.URL,
    primaryActionTarget: primaryAction?.actionTarget ?? "",
    primaryActionText: primaryAction?.ctaText ?? "",
    primaryActionBg: primaryAction?.ctaBg ?? "#FFFFFF",
    primaryActionColor: primaryAction?.ctaColor ?? "#171717",
    secondaryActionType: secondaryAction?.actionType ?? BannerActionType.URL,
    secondaryActionTarget: secondaryAction?.actionTarget ?? "",
    secondaryActionText: secondaryAction?.ctaText ?? "",
    secondaryActionBg: secondaryAction?.ctaBg ?? "#111827",
    secondaryActionColor: secondaryAction?.ctaColor ?? "#FFFFFF",
    status: slot.status ?? BannerStatus.ACTIVE,
  };
};

export const buildActionsFromForm = (values: BannerSlotFormValues): PlacementBuilderSlotAction[] | undefined => {
  const actions = [
    {
      actionType: values.primaryActionType,
      actionTarget: values.primaryActionTarget.trim() || undefined,
      ctaText: values.primaryActionText.trim() || undefined,
      ctaBg: values.primaryActionBg.trim() || undefined,
      ctaColor: values.primaryActionColor.trim() || undefined,
    },
    {
      actionType: values.secondaryActionType,
      actionTarget: values.secondaryActionTarget.trim() || undefined,
      ctaText: values.secondaryActionText.trim() || undefined,
      ctaBg: values.secondaryActionBg.trim() || undefined,
      ctaColor: values.secondaryActionColor.trim() || undefined,
    },
  ].filter((action) => Boolean(action.actionTarget || action.ctaText));

  return actions.length > 0 ? actions : undefined;
};

export const trimBannerText = (value?: string | null) => (value == null ? "" : value.trim());

export interface BannerSlotSnapshot {
  internalName?: string;
  mediaType?: BannerMediaType;
  mediaUrl?: string;
  mediaMobileUrl?: string;
  mediaPosterUrl?: string;
  mediaMobilePosterUrl?: string;
  mediaLinkUrl?: string;
  layout?: BannerLayout;
  title?: string | null;
  subtitle?: string | null;
  titleColor?: string;
  actionsLayout?: BannerActionsLayout;
  actions?: PlacementBuilderSlotAction[];
  status?: BannerStatus;
}

export const captureBannerSlotSnapshot = (slot: PlacementBuilderSlotItem): BannerSlotSnapshot => ({
  internalName: slot.internalName,
  mediaType: slot.mediaType,
  mediaUrl: slot.mediaUrl,
  mediaMobileUrl: slot.mediaMobileUrl,
  mediaPosterUrl: slot.mediaPosterUrl,
  mediaMobilePosterUrl: slot.mediaMobilePosterUrl,
  mediaLinkUrl: slot.mediaLinkUrl,
  layout: slot.layout,
  title: slot.title,
  subtitle: slot.subtitle,
  titleColor: slot.titleColor,
  actionsLayout: slot.actionsLayout,
  actions: slot.actions?.map((action) => ({ ...action })),
  status: slot.status,
});

export const normalizeSlotActions = (actions?: PlacementBuilderSlotAction[]) =>
  (actions ?? [])
    .map((action) => ({
      actionType: action.actionType,
      actionTarget: trimBannerText(action.actionTarget) || undefined,
      ctaText: trimBannerText(action.ctaText) || undefined,
      ctaBg: trimBannerText(action.ctaBg) || undefined,
      ctaColor: trimBannerText(action.ctaColor) || undefined,
    }))
    .filter((action) => Boolean(action.actionTarget || action.ctaText));

export const serializeSlotActions = (actions?: PlacementBuilderSlotAction[]) => JSON.stringify(normalizeSlotActions(actions));

export const assignPatchIfChanged = <K extends keyof UpdateBannerDto>(
  patch: UpdateBannerDto,
  key: K,
  nextValue: UpdateBannerDto[K],
  originalValue: UpdateBannerDto[K],
) => {
  if (nextValue !== originalValue) {
    patch[key] = nextValue;
  }
};

export const getVideoPosterValue = (mediaType: BannerMediaType, value?: string) =>
  mediaType === BannerMediaType.VIDEO ? trimBannerText(value) || undefined : undefined;

export const buildBannerCreatePayload = (slot: PlacementBuilderSlotItem, fallbackName: string): CreateBannerDto => ({
  internalName: trimBannerText(slot.internalName) || trimBannerText(slot.title) || fallbackName,
  mediaType: slot.mediaType ?? BannerMediaType.IMAGE,
  mediaUrl: trimBannerText(slot.mediaUrl),
  mediaMobileUrl: trimBannerText(slot.mediaMobileUrl),
  mediaPosterUrl: getVideoPosterValue(slot.mediaType ?? BannerMediaType.IMAGE, slot.mediaPosterUrl),
  mediaMobilePosterUrl: getVideoPosterValue(slot.mediaType ?? BannerMediaType.IMAGE, slot.mediaMobilePosterUrl),
  mediaLinkUrl: trimBannerText(slot.mediaLinkUrl) || undefined,
  layout: slot.layout ?? BannerLayout.LEFT_BOTTOM,
  title: trimBannerText(slot.title) || undefined,
  subtitle: trimBannerText(slot.subtitle) || undefined,
  titleColor: trimBannerText(slot.titleColor) || undefined,
  actionsLayout: slot.actionsLayout ?? BannerActionsLayout.INLINE,
  actions: (() => {
    const actions = normalizeSlotActions(slot.actions);
    return actions.length > 0 ? actions : undefined;
  })(),
  status: slot.status ?? BannerStatus.ACTIVE,
});

export const buildBannerPatchPayload = (current: PlacementBuilderSlotItem, original: BannerSlotSnapshot): UpdateBannerDto => {
  const patch: UpdateBannerDto = {};

  assignPatchIfChanged(patch, "internalName", trimBannerText(current.internalName), trimBannerText(original.internalName));
  assignPatchIfChanged(patch, "mediaUrl", trimBannerText(current.mediaUrl), trimBannerText(original.mediaUrl));
  assignPatchIfChanged(patch, "mediaMobileUrl", trimBannerText(current.mediaMobileUrl), trimBannerText(original.mediaMobileUrl));
  assignPatchIfChanged(patch, "mediaLinkUrl", trimBannerText(current.mediaLinkUrl), trimBannerText(original.mediaLinkUrl));
  assignPatchIfChanged(patch, "title", trimBannerText(current.title), trimBannerText(original.title));
  assignPatchIfChanged(patch, "subtitle", trimBannerText(current.subtitle), trimBannerText(original.subtitle));
  assignPatchIfChanged(patch, "titleColor", trimBannerText(current.titleColor), trimBannerText(original.titleColor));

  const nextMediaType = current.mediaType ?? BannerMediaType.IMAGE;
  const originalMediaType = original.mediaType ?? BannerMediaType.IMAGE;
  assignPatchIfChanged(patch, "mediaType", nextMediaType, originalMediaType);

  if (nextMediaType === BannerMediaType.VIDEO) {
    assignPatchIfChanged(patch, "mediaPosterUrl", trimBannerText(current.mediaPosterUrl), trimBannerText(original.mediaPosterUrl));
    assignPatchIfChanged(
      patch,
      "mediaMobilePosterUrl",
      trimBannerText(current.mediaMobilePosterUrl),
      trimBannerText(original.mediaMobilePosterUrl),
    );
  }

  const nextLayout = current.layout ?? BannerLayout.LEFT_BOTTOM;
  const originalLayout = original.layout ?? BannerLayout.LEFT_BOTTOM;
  assignPatchIfChanged(patch, "layout", nextLayout, originalLayout);

  const nextActionsLayout = current.actionsLayout ?? BannerActionsLayout.INLINE;
  const originalActionsLayout = original.actionsLayout ?? BannerActionsLayout.INLINE;
  assignPatchIfChanged(patch, "actionsLayout", nextActionsLayout, originalActionsLayout);

  const nextStatus = current.status ?? BannerStatus.ACTIVE;
  const originalStatus = original.status ?? BannerStatus.ACTIVE;
  assignPatchIfChanged(patch, "status", nextStatus, originalStatus);

  if (serializeSlotActions(current.actions) !== serializeSlotActions(original.actions)) {
    patch.actions = normalizeSlotActions(current.actions);
  }

  return patch;
};

export const buildBannerSlotFromFormValues = (
  slot: PlacementBuilderSlotItem,
  values: BannerSlotFormValues,
  options?: { doubleBanner?: boolean },
): PlacementBuilderSlotItem => {
  if (options?.doubleBanner) {
    const actionTarget = trimBannerText(values.primaryActionTarget);
    return {
      ...slot,
      internalName: trimBannerText(values.internalName) || undefined,
      mediaType: values.mediaType,
      mediaUrl: trimBannerText(values.mediaUrl),
      mediaMobileUrl: trimBannerText(values.mediaMobileUrl),
      mediaPosterUrl: getVideoPosterValue(values.mediaType, values.mediaPosterUrl),
      mediaMobilePosterUrl: getVideoPosterValue(values.mediaType, values.mediaMobilePosterUrl),
      mediaLinkUrl: trimBannerText(values.mediaLinkUrl) || undefined,
      layout: BannerLayout.LEFT_BOTTOM,
      title: trimBannerText(values.title) || undefined,
      subtitle: undefined,
      titleColor: trimBannerText(values.titleColor) || undefined,
      actionsLayout: BannerActionsLayout.INLINE,
      actions: actionTarget ? [{ actionType: BannerActionType.URL, actionTarget }] : undefined,
      actionTarget: actionTarget || undefined,
      status: values.status,
    };
  }

  const actions = buildActionsFromForm(values);
  return {
    ...slot,
    internalName: values.internalName.trim() || undefined,
    mediaType: values.mediaType,
    mediaUrl: values.mediaUrl.trim(),
    mediaMobileUrl: values.mediaMobileUrl.trim(),
    mediaPosterUrl: getVideoPosterValue(values.mediaType, values.mediaPosterUrl),
    mediaMobilePosterUrl: getVideoPosterValue(values.mediaType, values.mediaMobilePosterUrl),
    mediaLinkUrl: trimBannerText(values.mediaLinkUrl) || undefined,
    layout: values.layout,
    title: values.title.trim() || undefined,
    subtitle: values.subtitle.trim() || undefined,
    titleColor: values.titleColor.trim() || undefined,
    actionsLayout: values.actionsLayout,
    actions,
    actionTarget: actions?.[0]?.actionTarget ?? undefined,
    status: values.status,
  };
};

export const getNumberValue = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const mapLayoutToBannerSlots = (layout: PlacementLayout, displayType: PlacementDisplayType) =>
  normalizeBannerSlots(
    displayType,
    (layout.items ?? [])
      .sort(
        (a, b) =>
          getNumberValue(a.displayMetadata?.order, Number.MAX_SAFE_INTEGER) -
          getNumberValue(b.displayMetadata?.order, Number.MAX_SAFE_INTEGER),
      )
      .map((item, index) => ({
        id: item.id,
        slotKey: item.slotKey ?? String(index + 1),
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        order: getNumberValue(item.displayMetadata?.order, index + 1),
        bannerId: item.bannerId,
        ...mapBannerFieldsFromLayoutItem(item.banner),
      })),
  );

export const getSlotSortableId = (slot: PlacementBuilderSlotItem) => slot.id ?? slot.bannerId ?? slot.slotKey;

export interface SortableBannerSlotCardProps {
  sortableId: string;
  slot: PlacementBuilderSlotItem;
  index: number;
  displayType: PlacementDisplayType;
  selected: boolean;
  previewMode: "desktop" | "mobile";
  slotPreviewOverride?: Partial<Record<BannerMediaFieldName, string>>;
  slotsCount: number;
  onSelectSlot: (slotKey: string) => void;
  onRemoveSlot: (slotKey: string) => void;
}

export interface CmsPageWizardDialogBannerPlacementEditorProps {
  displayType: PlacementDisplayType;
  previewMode: "desktop" | "mobile";
  setPreviewMode: (mode: "desktop" | "mobile") => void;
  slots: PlacementBuilderSlotItem[];
  slotPreviewOverrides: Record<string, Partial<Record<BannerMediaFieldName, string>>>;
  selectedSlotKey: string | null;
  selectedSlot: PlacementBuilderSlotItem | null;
  slotForm: UseFormReturn<BannerSlotFormValues>;
  slotMediaTypeWatch: BannerMediaType | undefined;
  getAcceptByMediaType: (mediaType: BannerMediaType) => string;
  onSelectSlot: (slotKey: string) => void;
  onAddSlot: () => void;
  onRemoveSlot: (slotKey: string) => void;
  onUploadSlotMedia: (fieldName: BannerMediaFieldName, file: File) => Promise<void>;
  onClearSlotMedia?: (fieldName: BannerMediaFieldName) => void;
  onFileReject: (reason: string) => void;
  onSaveSlotContent: () => void;
  onReorderSlots: (fromIndex: number, toIndex: number) => void;
}
