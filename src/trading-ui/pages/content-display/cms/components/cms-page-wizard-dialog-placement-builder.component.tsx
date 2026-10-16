import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { arrayMove } from "@dnd-kit/sortable";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  bannerApi,
  BannerMediaType,
  MediaVisibility,
  type MobileOddFullWidthItem,
  PlacementDisplayType,
  PlacementLayoutStatus,
  type Placement,
  type PlacementLayout,
  type PlacementLayoutDisplayMetadata,
  type UpdatePlacementLayoutItemDto,
} from "../../../../apis";
import { DialogComponent } from "../../../../components/dialog/dialog.component";
import { CustomButton } from "../../../../components/button/custom-button";

import { SelectInput, TextInput } from "../../../../components/form";
import { TYPOGRAPHY_STYLES } from "../../../../common/constant/typography.constant";
import { uploadSingleImage } from "../../../../common/utils/image-upload.utils";
import { getErrorMessage } from "../../../../common/utils";
import { SnackbarType, useSnackbar } from "../../../../hooks/use-snackbar.hook";
import { StackAlignJustCenter, StackRowJustBetween, StackRowJustEnd } from "../../../../components/styled";
import type { BannerPlacementDraftInput, BannerPlacementDraftResult } from "../cms-page.interface";
import {
  CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT,
  CMS_GRID_MOBILE_ODD_FULL_WIDTH_OPTIONS,
  resolveCmsGridMobileOddFullWidthItem,
} from "../cms-page.constants";
import {
  BannerSlotContentFormFields,
  CmsPageWizardDialogBannerPlacementEditor,
} from "./cms-page-wizard-dialog-banner-placement-editor.component";
import {
  buildBannerCreatePayload,
  buildBannerPatchPayload,
  buildBannerSlotFromFormValues as buildSlotFromFormValues,
  captureBannerSlotSnapshot,
  createDefaultBannerSlots,
  DEFAULT_BANNER_SLOT_FORM_VALUES as DEFAULT_SLOT_FORM_VALUES,
  getNonGridDimensions,
  getSlotDisplayLabel,
  isSequentialBannerPlacement,
  isReorderableBannerPlacement,
  mapBannerFieldsFromLayoutItem,
  mapLayoutToBannerSlots,
  normalizeBannerSlots,
  type BannerSlotFormValues as SlotContentFormValues,
  type BannerSlotSnapshot,
  type PlacementBuilderSlotItem as GridSlotItem,
  bannerSlotFormSchema as slotFormSchema,
  toBannerSlotFormValues as toSlotFormValues,
} from "./cms-banner-slot.utils";

interface PlacementFormValues {
  code: string;
  name: string;
  displayType: PlacementDisplayType;
  columns?: number;
  rows?: number;
}

const rowHeightPx = 76;

const placementFormSchema: yup.ObjectSchema<PlacementFormValues> = yup
  .object({
    code: yup.string().trim().optional().default(""),
    name: yup.string().trim().required("Vui lòng nhập tên vị trí hiển thị"),
    displayType: yup
      .mixed<PlacementDisplayType>()
      .oneOf(Object.values(PlacementDisplayType) as PlacementDisplayType[])
      .required("Vui lòng chọn kiểu hiển thị"),
    columns: yup.number().optional(),
    rows: yup.number().optional(),
  })
  .required();

/** Phiên bản hiện tại chỉ hỗ trợ lưới banner 4x2. */
const PLACEMENT_GRID_COLUMNS = 4;
const PLACEMENT_GRID_ROWS = 2;

const DEFAULT_VALUES: PlacementFormValues = {
  code: "",
  name: "",
  displayType: PlacementDisplayType.GRID,
  columns: PLACEMENT_GRID_COLUMNS,
  rows: PLACEMENT_GRID_ROWS,
};

const DISPLAY_TYPE_OPTIONS = [
  { value: PlacementDisplayType.GRID, label: "Lưới" },
  { value: PlacementDisplayType.SLIDER, label: "Trượt ngang" },
  // { value: PlacementDisplayType.CAROUSEL, label: 'Băng chuyền' },
  { value: PlacementDisplayType.DOUBLE_BANNER, label: "Hai khung" },
];

type SlotMediaPreviewField = keyof Pick<GridSlotItem, "mediaUrl" | "mediaMobileUrl" | "mediaPosterUrl" | "mediaMobilePosterUrl">;

const getSlotKey = (x: number, y: number, width: number, height: number) => `${x}-${y}-${width}-${height}`;

const rectsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);

const normalizeSlots = (columns: number, rows: number, slots: GridSlotItem[]) => {
  const occupied = new Set<string>();
  const accepted: GridSlotItem[] = [];
  for (const slot of slots.sort((a, b) => a.y - b.y || a.x - b.x)) {
    const x = Math.max(0, Math.min(columns - 1, slot.x));
    const y = Math.max(0, Math.min(rows - 1, slot.y));
    const width = Math.max(1, Math.min(columns - x, slot.width));
    const height = Math.max(1, Math.min(rows - y, slot.height));
    let overlap = false;
    for (let r = y; r < y + height; r += 1) {
      for (let c = x; c < x + width; c += 1) {
        if (occupied.has(`${c}:${r}`)) overlap = true;
      }
    }
    if (overlap) continue;
    for (let r = y; r < y + height; r += 1) {
      for (let c = x; c < x + width; c += 1) {
        occupied.add(`${c}:${r}`);
      }
    }
    accepted.push({ ...slot, x, y, width, height, slotKey: getSlotKey(x, y, width, height) });
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cell = `${x}:${y}`;
      if (occupied.has(cell)) continue;
      accepted.push({ slotKey: getSlotKey(x, y, 1, 1), x, y, width: 1, height: 1, order: accepted.length + 1 });
    }
  }
  return accepted.sort((a, b) => a.order - b.order).map((slot, index) => ({ ...slot, order: index + 1 }));
};

const createEmptySlots = (columns: number, rows: number) => normalizeSlots(columns, rows, []);

const getNumberValue = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getGridDimension = (placement: Placement, key: "columns" | "rows", fallback: number) => {
  const raw = placement.settings && typeof placement.settings === "object" ? placement.settings[key] : undefined;
  return Math.max(1, Math.floor(getNumberValue(raw, fallback)));
};

const getPlacementSettingsSnapshot = (placement: Placement): Record<string, unknown> =>
  placement.settings && typeof placement.settings === "object" ? { ...placement.settings } : {};

const getAcceptByMediaType = (mediaType: BannerMediaType) => {
  switch (mediaType) {
    case BannerMediaType.VIDEO:
      return "video/*";
    case BannerMediaType.GIF:
      return "image/gif";
    case BannerMediaType.IMAGE:
    default:
      return "image/*";
  }
};

const isEditableBannerPlacement = (displayType?: PlacementDisplayType | null) =>
  displayType === PlacementDisplayType.GRID ||
  displayType === PlacementDisplayType.SLIDER ||
  displayType === PlacementDisplayType.CAROUSEL ||
  displayType === PlacementDisplayType.DOUBLE_BANNER;

const buildDisplayMetadata = (slot: GridSlotItem, index: number, displayType: PlacementDisplayType): PlacementLayoutDisplayMetadata => ({
  x: displayType === PlacementDisplayType.GRID ? slot.x : displayType === PlacementDisplayType.DOUBLE_BANNER ? index : 0,
  y: displayType === PlacementDisplayType.GRID ? slot.y : 0,
  width: displayType === PlacementDisplayType.GRID ? slot.width : 1,
  height: displayType === PlacementDisplayType.GRID ? slot.height : 1,
  order: index + 1,
  slotType: displayType,
});

const buildLayoutItemPatchPayload = (
  slot: GridSlotItem,
  index: number,
  displayType: PlacementDisplayType,
  slotCount: number,
): UpdatePlacementLayoutItemDto => {
  const payload: UpdatePlacementLayoutItemDto = {
    bannerId: slot.bannerId,
    isActive: true,
    priority: slotCount - index,
    displayMetadata: buildDisplayMetadata(slot, index, displayType),
  };

  if (displayType === PlacementDisplayType.GRID) {
    payload.slotKey = slot.slotKey;
  }

  return payload;
};

function normalizePlacementSlots(displayType: PlacementDisplayType, columns: number, rows: number, slots: GridSlotItem[]): GridSlotItem[] {
  if (displayType !== PlacementDisplayType.GRID) return slots;
  return normalizeSlots(columns, rows, slots);
}
const mapLayoutToSlots = (layout: PlacementLayout, columns: number, rows: number) =>
  normalizePlacementSlots(
    layout.placement.displayType,
    columns,
    rows,
    (layout.items ?? []).map((item, index) => {
      const metadata = item.displayMetadata;
      return {
        id: item.id,
        slotKey:
          item.slotKey ??
          getSlotKey(
            getNumberValue(metadata?.x, 0),
            getNumberValue(metadata?.y, 0),
            getNumberValue(metadata?.width, 1),
            getNumberValue(metadata?.height, 1),
          ),
        x: getNumberValue(metadata?.x, 0),
        y: getNumberValue(metadata?.y, 0),
        width: getNumberValue(metadata?.width, 1),
        height: getNumberValue(metadata?.height, 1),
        order: getNumberValue(metadata?.order, index + 1),
        bannerId: item.bannerId,
        ...mapBannerFieldsFromLayoutItem(item.banner),
      };
    }),
  );

const getPreferredLayout = (layouts: PlacementLayout[]) => {
  const sortedLayouts = [...layouts].sort((a, b) => getNumberValue(b.revision, 0) - getNumberValue(a.revision, 0));
  return sortedLayouts.find((layout) => layout.status === PlacementLayoutStatus.ACTIVE) ?? sortedLayouts[0] ?? null;
};

export interface CmsPageWizardDialogPlacementBuilderProps {
  open: boolean;
  initialPlacementCode?: string;
  onClose: () => void;
  onCreatePlacementDraft: (input: BannerPlacementDraftInput) => Promise<BannerPlacementDraftResult>;
  onUsePlacementCode: (code: string) => void;
}

export const CmsPageWizardDialogPlacementBuilder: React.FC<CmsPageWizardDialogPlacementBuilderProps> = ({
  open,
  initialPlacementCode,
  onClose,
  onCreatePlacementDraft,
  onUsePlacementCode,
}) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"create" | "builder">("create");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [placementInfo, setPlacementInfo] = useState<BannerPlacementDraftResult | null>(null);
  const [mobileOddFullWidthItem, setMobileOddFullWidthItem] = useState<MobileOddFullWidthItem>(CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT);
  const [slots, setSlots] = useState<GridSlotItem[]>([]);
  const [slotPreviewOverrides, setSlotPreviewOverrides] = useState<Record<string, Partial<Record<SlotMediaPreviewField, string>>>>({});
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [resizingSlotKey, setResizingSlotKey] = useState<string | null>(null);
  const [resizingSize, setResizingSize] = useState<{ width: number; height: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const slotPreviewOverridesRef = useRef(slotPreviewOverrides);
  const slotBannerSnapshotsRef = useRef<Record<string, BannerSlotSnapshot>>({});

  const form = useForm<PlacementFormValues>({
    resolver: yupResolver(placementFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });
  const displayTypeWatch = form.watch("displayType");

  const slotForm = useForm<SlotContentFormValues>({
    resolver: yupResolver(slotFormSchema),
    defaultValues: DEFAULT_SLOT_FORM_VALUES,
    mode: "onSubmit",
  });
  const slotMediaTypeWatch = slotForm.watch("mediaType");

  const selectedSlot = useMemo(() => slots.find((slot) => slot.slotKey === selectedSlotKey) ?? null, [slots, selectedSlotKey]);

  useEffect(() => {
    slotPreviewOverridesRef.current = slotPreviewOverrides;
  }, [slotPreviewOverrides]);

  const revokePreviewUrl = useCallback((url?: string) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const clearAllSlotPreviewOverrides = useCallback(() => {
    Object.values(slotPreviewOverridesRef.current).forEach((override) => {
      revokePreviewUrl(override.mediaUrl);
      revokePreviewUrl(override.mediaMobileUrl);
      revokePreviewUrl(override.mediaPosterUrl);
      revokePreviewUrl(override.mediaMobilePosterUrl);
    });
    slotPreviewOverridesRef.current = {};
    setSlotPreviewOverrides({});
  }, [revokePreviewUrl]);

  useEffect(() => () => clearAllSlotPreviewOverrides(), [clearAllSlotPreviewOverrides]);

  useEffect(() => {
    if (!selectedSlot) {
      slotForm.reset(DEFAULT_SLOT_FORM_VALUES);
      return;
    }

    slotForm.reset(toSlotFormValues(selectedSlot));
  }, [selectedSlot, slotForm]);

  const syncSlotBannerSnapshots = useCallback((slotList: GridSlotItem[]) => {
    slotBannerSnapshotsRef.current = Object.fromEntries(
      slotList.filter((slot) => slot.bannerId).map((slot) => [slot.slotKey, captureBannerSlotSnapshot(slot)]),
    );
  }, []);

  const resetDialog = useCallback(() => {
    clearAllSlotPreviewOverrides();
    form.reset(DEFAULT_VALUES);
    slotForm.reset(DEFAULT_SLOT_FORM_VALUES);
    slotBannerSnapshotsRef.current = {};
    setPhase("create");
    setPreviewMode("desktop");
    setPlacementInfo(null);
    setMobileOddFullWidthItem(CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT);
    setSlots([]);
    setSelectedSlotKey(null);
    setResizingSlotKey(null);
    setResizingSize(null);
  }, [clearAllSlotPreviewOverrides, form, slotForm]);

  const initializeBuilder = useCallback(
    async (placementCode: string) => {
      setLoading(true);
      try {
        const placementRes = await bannerApi.getPlacementList({
          page: 1,
          take: 20,
          isPagination: false,
          code: placementCode.trim(),
        });
        const placement = placementRes.list.find((item) => item.code === placementCode.trim());

        if (!placement) {
          throw new Error(`Không tìm thấy vị trí hiển thị ${placementCode}.`);
        }

        if (!isEditableBannerPlacement(placement.displayType)) {
          throw new Error(`Vị trí hiển thị ${placement.code} hiện chưa hỗ trợ chỉnh nhanh trong trình chỉnh sửa trang.`);
        }

        const settingsSnapshot = getPlacementSettingsSnapshot(placement);
        const { columns, rows } =
          placement.displayType === PlacementDisplayType.GRID
            ? {
                columns: getGridDimension(placement, "columns", 4),
                rows: getGridDimension(placement, "rows", 2),
              }
            : getNonGridDimensions(placement.displayType);
        const layoutList = await bannerApi.getPlacementLayoutList(placement.id);
        const preferredLayout = getPreferredLayout(layoutList);
        const layoutDetail = preferredLayout ? await bannerApi.getPlacementLayoutDetail(placement.id, preferredLayout.id) : null;
        const nextSlots = layoutDetail
          ? placement.displayType === PlacementDisplayType.GRID
            ? mapLayoutToSlots(layoutDetail, columns, rows)
            : mapLayoutToBannerSlots(layoutDetail, placement.displayType)
          : placement.displayType === PlacementDisplayType.GRID
            ? createEmptySlots(columns, rows)
            : createDefaultBannerSlots(placement.displayType);

        setPlacementInfo({
          placementId: placement.id,
          placementCode: placement.code,
          displayType: placement.displayType,
          columns,
          rows,
          layoutId: layoutDetail?.id,
          itemCount: layoutDetail?.items?.length ?? 0,
          settings: settingsSnapshot,
        });
        setMobileOddFullWidthItem(resolveCmsGridMobileOddFullWidthItem(settingsSnapshot.mobileOddFullWidthItem));
        setSlots(nextSlots);
        syncSlotBannerSnapshots(nextSlots);
        setSelectedSlotKey(nextSlots[0]?.slotKey ?? null);
        setPhase("builder");
      } catch (error) {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
        resetDialog();
      } finally {
        setLoading(false);
      }
    },
    [resetDialog, showSnackbar, syncSlotBannerSnapshots],
  );

  useEffect(() => {
    if (!open) return;

    resetDialog();
    if (initialPlacementCode?.trim()) {
      void initializeBuilder(initialPlacementCode);
    }
  }, [open, initialPlacementCode, initializeBuilder, resetDialog]);

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const buildSlotsWithCurrentDraft = useCallback(() => {
    if (!selectedSlot) return slots;

    const draft = slotForm.getValues();
    const doubleBanner = placementInfo?.displayType === PlacementDisplayType.DOUBLE_BANNER;
    return slots.map((slot) => (slot.slotKey === selectedSlot.slotKey ? buildSlotFromFormValues(slot, draft, { doubleBanner }) : slot));
  }, [placementInfo?.displayType, selectedSlot, slotForm, slots]);

  const persistCurrentSlotDraft = useCallback(() => {
    setSlots(buildSlotsWithCurrentDraft());
  }, [buildSlotsWithCurrentDraft]);

  const upsertBannerForSlot = useCallback(
    async (slot: GridSlotItem, index: number) => {
      const fallbackName = `${placementInfo?.placementCode ?? "PLACEMENT"} - ${placementInfo ? getSlotDisplayLabel(placementInfo.displayType, index) : `Slot ${index + 1}`}`;

      if (slot.bannerId) {
        const original = slotBannerSnapshotsRef.current[slot.slotKey] ?? {};
        const patchPayload = buildBannerPatchPayload(slot, original);

        if (Object.keys(patchPayload).length === 0) {
          return slot;
        }

        await bannerApi.patchBanner(slot.bannerId, patchPayload);
        slotBannerSnapshotsRef.current[slot.slotKey] = captureBannerSlotSnapshot(slot);
        return slot;
      }

      const banner = await bannerApi.postBanner(buildBannerCreatePayload(slot, fallbackName));
      const savedSlot = { ...slot, bannerId: banner.id };
      slotBannerSnapshotsRef.current[slot.slotKey] = captureBannerSlotSnapshot(savedSlot);
      return savedSlot;
    },
    [placementInfo],
  );

  const syncExistingLayoutItem = useCallback(
    async (slot: GridSlotItem, index: number) => {
      if (!placementInfo?.layoutId || !slot.id || !slot.bannerId) return;

      await bannerApi.patchPlacementLayoutItem(
        placementInfo.placementId,
        placementInfo.layoutId,
        slot.id,
        buildLayoutItemPatchPayload(slot, index, placementInfo.displayType, slots.length),
      );
    },
    [placementInfo, slots.length],
  );

  const publishLayout = useCallback(
    async (targetSlots: GridSlotItem[]) => {
      if (!placementInfo) return;

      const canPatchCurrentLayout =
        Boolean(placementInfo.layoutId) &&
        placementInfo.itemCount === targetSlots.length &&
        targetSlots.every((slot) => Boolean(slot.id && slot.bannerId));

      if (canPatchCurrentLayout && placementInfo.layoutId) {
        for (let index = 0; index < targetSlots.length; index += 1) {
          await syncExistingLayoutItem(targetSlots[index], index);
        }
        return;
      }

      const createdLayout = await bannerApi.postPlacementLayout(placementInfo.placementId, {
        name: `${placementInfo.placementCode} - CMS publish`,
        status: PlacementLayoutStatus.ACTIVE,
        note: "Grid layout được tạo từ CMS editor",
        items: targetSlots.map((slot, index) => ({
          slotKey: slot.slotKey,
          bannerId: slot.bannerId!,
          isActive: true,
          priority: targetSlots.length - index,
          displayMetadata: buildDisplayMetadata(slot, index, placementInfo.displayType),
        })),
      });

      const nextIds = new Map((createdLayout.items ?? []).map((item) => [item.bannerId + ':' + item.displayMetadata?.order, item.id]));
      setPlacementInfo((prev) =>
        prev
          ? {
              ...prev,
              layoutId: createdLayout.id,
              itemCount: createdLayout.items?.length ?? targetSlots.length,
            }
          : prev,
      );
      setSlots((prev) => prev.map((slot, index) => ({ ...slot, id: nextIds.get(slot.bannerId + ':' + (index + 1)) ?? slot.id })));
    },
    [placementInfo, syncExistingLayoutItem],
  );

  const applyResizeToSlot = (slotKey: string, width: number, height: number) => {
    if (!placementInfo) return;
    setSlots((prev) => {
      const selected = prev.find((slot) => slot.slotKey === slotKey);
      if (!selected) return prev;
      const safeWidth = Math.max(1, Math.min(placementInfo.columns - selected.x, width));
      const safeHeight = Math.max(1, Math.min(placementInfo.rows - selected.y, height));
      const nextSelected: GridSlotItem = {
        ...selected,
        width: safeWidth,
        height: safeHeight,
        slotKey: getSlotKey(selected.x, selected.y, safeWidth, safeHeight),
      };
      const overlaps = (slot: GridSlotItem) =>
        !(
          slot.x + slot.width <= nextSelected.x ||
          nextSelected.x + nextSelected.width <= slot.x ||
          slot.y + slot.height <= nextSelected.y ||
          nextSelected.y + nextSelected.height <= slot.y
        );
      const remaining = prev.filter((slot) => slot.slotKey !== slotKey && !overlaps(slot));
      const normalized = normalizeSlots(placementInfo.columns, placementInfo.rows, [nextSelected, ...remaining]);
      setSelectedSlotKey(nextSelected.slotKey);
      return normalized;
    });
  };

  const beginResize = (slot: GridSlotItem, event: React.MouseEvent<HTMLDivElement>) => {
    if (!placementInfo) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = slot.width;
    const initialHeight = slot.height;
    let latestWidth = slot.width;
    let latestHeight = slot.height;
    setResizingSlotKey(slot.slotKey);
    setResizingSize({ width: slot.width, height: slot.height });

    const onMove = (moveEvent: MouseEvent) => {
      const gridWidth = gridRef.current?.clientWidth ?? 1;
      const cellWidth = gridWidth / placementInfo.columns;
      const widthDelta = Math.round((moveEvent.clientX - startX) / cellWidth);
      const heightDelta = Math.round((moveEvent.clientY - startY) / rowHeightPx);
      latestWidth = Math.max(1, initialWidth + widthDelta);
      latestHeight = Math.max(1, initialHeight + heightDelta);
      setResizingSize({ width: latestWidth, height: latestHeight });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      applyResizeToSlot(slot.slotKey, latestWidth, latestHeight);
      setResizingSlotKey(null);
      setResizingSize(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const createPlacement = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const created = await onCreatePlacementDraft({
        code: values.code.trim() || undefined,
        name: values.name.trim(),
        displayType: values.displayType,
        columns: values.displayType === PlacementDisplayType.GRID ? PLACEMENT_GRID_COLUMNS : values.columns,
        rows: values.displayType === PlacementDisplayType.GRID ? PLACEMENT_GRID_ROWS : values.rows,
      });
      const { columns, rows } =
        created.displayType === PlacementDisplayType.GRID
          ? { columns: created.columns, rows: created.rows }
          : getNonGridDimensions(created.displayType);
      const createdSettings: Record<string, unknown> =
        created.displayType === PlacementDisplayType.GRID ? { columns, rows, gap: 16 } : { ...(created.settings ?? {}) };
      setPlacementInfo({
        ...created,
        columns,
        rows,
        layoutId: created.layoutId,
        itemCount: created.itemCount ?? 0,
        settings: createdSettings,
      });
      setMobileOddFullWidthItem(CMS_GRID_MOBILE_ODD_FULL_WIDTH_DEFAULT);
      const initialSlots =
        created.displayType === PlacementDisplayType.GRID ? createEmptySlots(columns, rows) : createDefaultBannerSlots(created.displayType);
      setSlots(initialSlots);
      syncSlotBannerSnapshots(initialSlots);
      setSelectedSlotKey(initialSlots[0]?.slotKey ?? null);
      setPhase("builder");
      showSnackbar({ message: `Đã tạo vị trí hiển thị ${created.name}.`, type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLoading(false);
    }
  });

  const selectSlot = (slotKey: string) => {
    persistCurrentSlotDraft();
    setSelectedSlotKey(slotKey);
  };

  const uploadSlotMedia = useCallback(
    async (fieldName: SlotMediaPreviewField, file: File) => {
      const currentSlotKey = selectedSlotKey;
      if (!currentSlotKey) return;

      const localPreviewUrl = URL.createObjectURL(file);
      const previousPreviewUrl = slotPreviewOverridesRef.current[currentSlotKey]?.[fieldName];
      if (previousPreviewUrl && previousPreviewUrl !== localPreviewUrl) {
        revokePreviewUrl(previousPreviewUrl);
      }
      setSlotPreviewOverrides((prev) => ({
        ...prev,
        [currentSlotKey]: {
          ...prev[currentSlotKey],
          [fieldName]: localPreviewUrl,
        },
      }));

      try {
        const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
        const persistedUrl = asset.publicUrl?.trim() ?? "";
        slotForm.setValue(fieldName, persistedUrl, { shouldDirty: true, shouldValidate: true });
        setSlotPreviewOverrides((prev) => {
          const current = prev[currentSlotKey];
          const nextOverride = {
            ...(current ?? {}),
            [fieldName]: persistedUrl,
          };

          return {
            ...prev,
            [currentSlotKey]: nextOverride,
          };
        });
        revokePreviewUrl(localPreviewUrl);
      } catch (error) {
        revokePreviewUrl(localPreviewUrl);
        setSlotPreviewOverrides((prev) => {
          const current = prev[currentSlotKey];
          if (!current) return prev;

          const nextOverride = { ...current, [fieldName]: undefined };
          if (
            !nextOverride.mediaUrl &&
            !nextOverride.mediaMobileUrl &&
            !nextOverride.mediaPosterUrl &&
            !nextOverride.mediaMobilePosterUrl
          ) {
            const { [currentSlotKey]: removed, ...rest } = prev;
            void removed;
            return rest;
          }

          return { ...prev, [currentSlotKey]: nextOverride };
        });
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      }
    },
    [revokePreviewUrl, selectedSlotKey, showSnackbar, slotForm],
  );

  const clearSlotMediaPreview = useCallback(
    (fieldName: SlotMediaPreviewField) => {
      if (!selectedSlotKey) return;
      const previousPreviewUrl = slotPreviewOverridesRef.current[selectedSlotKey]?.[fieldName];
      revokePreviewUrl(previousPreviewUrl);
      setSlotPreviewOverrides((prev) => {
        const current = prev[selectedSlotKey];
        if (!current) return prev;
        const next = { ...current, [fieldName]: undefined };
        if (!next.mediaUrl && !next.mediaMobileUrl && !next.mediaPosterUrl && !next.mediaMobilePosterUrl) {
          const { [selectedSlotKey]: removed, ...rest } = prev;
          void removed;
          return rest;
        }
        return { ...prev, [selectedSlotKey]: next };
      });
    },
    [revokePreviewUrl, selectedSlotKey],
  );

  const saveSlotContent = slotForm.handleSubmit(async (values) => {
    if (!placementInfo || !selectedSlot) return;

    setLoading(true);
    try {
      const normalizedSlot = buildSlotFromFormValues(selectedSlot, values, {
        doubleBanner: placementInfo.displayType === PlacementDisplayType.DOUBLE_BANNER,
      });
      const slotIndex = slots.findIndex((slot) => slot.slotKey === selectedSlot.slotKey);
      const savedSlot = await upsertBannerForSlot(normalizedSlot, Math.max(slotIndex, 0));

      setSlots((prev) => prev.map((slot) => (slot.slotKey === selectedSlot.slotKey ? savedSlot : slot)));
      await syncExistingLayoutItem(savedSlot, Math.max(slotIndex, 0));
      showSnackbar({ message: "Đã lưu banner cho ô đang chọn.", type: SnackbarType.SUCCESS });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLoading(false);
    }
  });

  const usePlacement = async () => {
    if (!placementInfo) return;
    const nextSlots = buildSlotsWithCurrentDraft();
    setSlots(nextSlots);
    const incompleteSlots = nextSlots.filter((slot) => !slot.mediaUrl?.trim() || !slot.mediaMobileUrl?.trim());

    if (placementInfo.displayType === PlacementDisplayType.GRID) {
      const expectedCells = placementInfo.columns * placementInfo.rows;
      const coveredCells = nextSlots.reduce((total, slot) => total + slot.width * slot.height, 0);
      if (coveredCells !== expectedCells || incompleteSlots.length > 0) {
        showSnackbar({
          message: `Vui lòng hoàn tất đủ ${expectedCells} ô hiển thị và lưu banner cho tất cả ô trước khi áp dụng.`,
          type: SnackbarType.WARNING,
        });
        return;
      }
    } else if (incompleteSlots.length > 0) {
      showSnackbar({
        message:
          placementInfo.displayType === PlacementDisplayType.DOUBLE_BANNER
            ? "Vui lòng nhập đủ hình ảnh/video cho cả 2 banner trước khi áp dụng."
            : "Vui lòng nhập hình ảnh/video cho tất cả trang trượt trước khi áp dụng.",
        type: SnackbarType.WARNING,
      });
      return;
    }

    setLoading(true);
    try {
      const persistedSlots = await Promise.all(nextSlots.map((slot, index) => upsertBannerForSlot(slot, index)));
      setSlots(persistedSlots);
      await publishLayout(persistedSlots);

      if (placementInfo.displayType === PlacementDisplayType.GRID) {
        const nextSettings: Record<string, unknown> = {
          ...(placementInfo.settings ?? {}),
          columns: placementInfo.columns,
          rows: placementInfo.rows,
          gap: typeof placementInfo.settings?.gap === "number" ? placementInfo.settings.gap : 16,
          mobileOddFullWidthItem,
        };
        delete nextSettings.mobileOddFullWidthMode;
        await bannerApi.patchPlacement(placementInfo.placementId, { settings: nextSettings });
        setPlacementInfo((prev) => (prev ? { ...prev, settings: nextSettings } : prev));
      }

      onUsePlacementCode(placementInfo.placementCode);
      handleClose();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLoading(false);
    }
  };

  const mergePreviewRect = useMemo(() => {
    if (!selectedSlot || !resizingSlotKey || !resizingSize) return null;
    return {
      x: selectedSlot.x,
      y: selectedSlot.y,
      width: resizingSize.width,
      height: resizingSize.height,
    };
  }, [selectedSlot, resizingSlotKey, resizingSize]);

  const addBannerSlot = () => {
    if (!placementInfo || !isSequentialBannerPlacement(placementInfo.displayType)) return;
    const nextSlots = normalizeBannerSlots(placementInfo.displayType, [
      ...buildSlotsWithCurrentDraft(),
      { slotKey: String(slots.length + 1), x: 0, y: 0, width: 1, height: 1, order: slots.length + 1 },
    ]);
    setSlots(nextSlots);
    setSelectedSlotKey(nextSlots[nextSlots.length - 1]?.slotKey ?? null);
  };

  const removeBannerSlot = (slotKey: string) => {
    if (!placementInfo || !isSequentialBannerPlacement(placementInfo.displayType) || slots.length <= 1) return;
    const nextSlots = normalizeBannerSlots(
      placementInfo.displayType,
      buildSlotsWithCurrentDraft().filter((slot) => slot.slotKey !== slotKey),
    );
    setSlots(nextSlots);
    setSelectedSlotKey(nextSlots[0]?.slotKey ?? null);
  };

  const reorderBannerSlots = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!placementInfo || !isReorderableBannerPlacement(placementInfo.displayType)) return;

      const currentSlots = buildSlotsWithCurrentDraft();
      const selectedBannerId = selectedSlot?.bannerId;
      const moved = arrayMove(currentSlots, fromIndex, toIndex).map((slot, index) => ({
        ...slot,
        order: index + 1,
        x: placementInfo.displayType === PlacementDisplayType.DOUBLE_BANNER ? index : slot.x,
      }));
      setSlots(moved);
      const nextSelected =
        (selectedBannerId ? moved.find((slot) => slot.bannerId === selectedBannerId) : null) ?? moved[toIndex] ?? moved[0];
      setSelectedSlotKey(nextSelected?.slotKey ?? null);
    },
    [buildSlotsWithCurrentDraft, placementInfo, selectedSlot?.bannerId],
  );

  return (
    <DialogComponent
      title={
        loading && initialPlacementCode?.trim() && !placementInfo
          ? "Đang tải vị trí hiển thị"
          : phase === "create"
            ? "Tạo nhanh vị trí hiển thị cho khối banner"
            : placementInfo?.displayType === PlacementDisplayType.GRID
              ? `Dựng lưới — ${placementInfo?.placementCode ?? ""}`
              : `Biên tập banner — ${placementInfo?.placementCode ?? ""}`
      }
      open={open}
      onClose={handleClose}
      maxWidth={phase === "create" ? "md" : "lg"}
      buttonLeft={{ content: "Hủy", variant: "outlined", onClick: handleClose, disabled: loading }}
      buttonRight={{
        content:
          loading && initialPlacementCode?.trim() && !placementInfo
            ? "Đang tải..."
            : phase === "create"
              ? "Tạo vị trí hiển thị"
              : "Lưu và áp dụng mã vị trí",
        variant: "contained",
        onClick: phase === "create" ? createPlacement : usePlacement,
        disabled: loading || (Boolean(initialPlacementCode?.trim()) && !placementInfo),
        loading,
      }}
    >
      {loading && initialPlacementCode?.trim() && !placementInfo ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#475467" }}>
          Hệ thống đang lấy thông tin vị trí hiển thị và bố cục hiện tại để mở thẳng màn biên tập.
        </Typography>
      ) : phase === "create" ? (
        <Stack>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <TextInput
                label="Tên vị trí hiển thị"
                requiredMark
                value={field.value}
                placeholder="Hero trang chủ"
                onChange={field.onChange}
                error={Boolean(form.formState.errors.name)}
                errorMessage={form.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            name="displayType"
            control={form.control}
            render={({ field }) => (
              <SelectInput
                label="Kiểu hiển thị"
                requiredMark
                value={field.value}
                options={DISPLAY_TYPE_OPTIONS}
                onChange={field.onChange}
                error={Boolean(form.formState.errors.displayType)}
                errorMessage={form.formState.errors.displayType?.message}
              />
            )}
          />
          {displayTypeWatch === PlacementDisplayType.GRID ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#667085" }}>
              Kích thước lưới cố định: {PLACEMENT_GRID_COLUMNS} cột × {PLACEMENT_GRID_ROWS} hàng
            </Typography>
          ) : null}
        </Stack>
      ) : placementInfo && placementInfo.displayType !== PlacementDisplayType.GRID ? (
        <CmsPageWizardDialogBannerPlacementEditor
          displayType={placementInfo.displayType}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          slots={slots}
          slotPreviewOverrides={slotPreviewOverrides}
          selectedSlotKey={selectedSlotKey}
          selectedSlot={selectedSlot}
          slotForm={slotForm}
          slotMediaTypeWatch={slotMediaTypeWatch}
          getAcceptByMediaType={getAcceptByMediaType}
          onSelectSlot={selectSlot}
          onAddSlot={addBannerSlot}
          onRemoveSlot={removeBannerSlot}
          onUploadSlotMedia={uploadSlotMedia}
          onClearSlotMedia={clearSlotMediaPreview}
          onFileReject={(reason) => showSnackbar({ message: reason, type: SnackbarType.ERROR })}
          onSaveSlotContent={saveSlotContent}
          onReorderSlots={reorderBannerSlots}
        />
      ) : (
        <Stack gap={2}>
          <StackRowJustBetween>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828" }}>
              Lưới {placementInfo?.columns}x{placementInfo?.rows}
            </Typography>
          </StackRowJustBetween>
          <SelectInput
            label="Ảnh chiếm toàn chiều ngang trên mobile khi lẻ hình"
            value={mobileOddFullWidthItem}
            options={CMS_GRID_MOBILE_ODD_FULL_WIDTH_OPTIONS}
            onChange={(event) => setMobileOddFullWidthItem(resolveCmsGridMobileOddFullWidthItem(event.target.value))}
            menuMaxHeight={280}
          />
          <Box
            ref={gridRef}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${placementInfo?.columns ?? 1}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${placementInfo?.rows ?? 1}, ${rowHeightPx}px)`,
              gap: 1,
              p: 1,
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              bgcolor: "#F9FAFB",
            }}
          >
            {slots.map((slot) => {
              const selected = selectedSlotKey === slot.slotKey;
              const isResizing = resizingSlotKey === slot.slotKey;
              const previewUrl = previewMode === "mobile" ? slot.mediaMobileUrl || slot.mediaUrl : slot.mediaUrl;
              const width = isResizing && resizingSize ? resizingSize.width : slot.width;
              const height = isResizing && resizingSize ? resizingSize.height : slot.height;
              const inMergePreview = mergePreviewRect !== null && slot.slotKey !== resizingSlotKey && rectsOverlap(slot, mergePreviewRect);
              const willMerge = isResizing && (width > slot.width || height > slot.height);
              return (
                <Box
                  key={slot.slotKey}
                  onClick={() => selectSlot(slot.slotKey)}
                  sx={{
                    position: "relative",
                    border: (() => {
                      if (isResizing && willMerge) return "3px solid #101828";
                      if (inMergePreview) return "2px dashed #101828";
                      if (selected) return "2px solid #101828";
                      return "1px solid #D0D5DD";
                    })(),
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    gridColumn: `${slot.x + 1} / span ${width}`,
                    gridRow: `${slot.y + 1} / span ${height}`,
                    bgcolor: inMergePreview ? "#E4E7EC" : "#FFF",
                    boxShadow: isResizing && willMerge ? "inset 0 0 0 1px #101828" : "none",
                    backgroundImage: previewUrl ? `url(${previewUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "border-color 120ms ease, background-color 120ms ease",
                  }}
                >
                  {!previewUrl ? (
                    <StackAlignJustCenter sx={{ width: "100%", height: "100%" }}>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.base.semibold,
                          color: inMergePreview || (isResizing && willMerge) ? "#101828" : "#98A2B3",
                          fontWeight: inMergePreview || (isResizing && willMerge) ? 700 : 600,
                        }}
                      >
                        +
                      </Typography>
                      <Typography
                        sx={{
                          ...TYPOGRAPHY_STYLES.xs.regular,
                          color: inMergePreview ? "#344054" : "#98A2B3",
                          fontWeight: inMergePreview ? 700 : 400,
                        }}
                      >
                        {inMergePreview ? "Sẽ gộp" : "Thêm banner"}
                      </Typography>
                    </StackAlignJustCenter>
                  ) : null}
                  {selected ? (
                    <Box
                      role="presentation"
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        beginResize(slot, event);
                      }}
                      title="Kéo để gộp ô"
                      sx={{
                        position: "absolute",
                        right: 2,
                        bottom: 2,
                        width: 14,
                        height: 14,
                        borderRadius: "2px 0 0 0",
                        bgcolor: "#101828",
                        cursor: "nwse-resize",
                      }}
                    />
                  ) : null}
                </Box>
              );
            })}
          </Box>

          {selectedSlot ? (
            <Box sx={{ borderTop: "1px solid #EAECF0", pt: 2 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828", mb: 1 }}>Ô hiển thị {selectedSlot.slotKey}</Typography>
              <BannerSlotContentFormFields
                slotForm={slotForm}
                slotMediaTypeWatch={slotMediaTypeWatch}
                getAcceptByMediaType={getAcceptByMediaType}
                onUploadSlotMedia={uploadSlotMedia}
                onClearSlotMedia={clearSlotMediaPreview}
                onFileReject={(reason) => showSnackbar({ message: reason, type: SnackbarType.ERROR })}
                previewOverrides={slotPreviewOverrides[selectedSlot.slotKey]}
                contentMode="grid"
              />
              <StackRowJustEnd gap={1} sx={{ mt: 1.5 }}>
                <CustomButton variant="outline" fullWidth={false} onClick={saveSlotContent} sx={{ px: 2 }}>
                  Lưu nội dung ô
                </CustomButton>
              </StackRowJustEnd>
            </Box>
          ) : null}
        </Stack>
      )}
    </DialogComponent>
  );
};
