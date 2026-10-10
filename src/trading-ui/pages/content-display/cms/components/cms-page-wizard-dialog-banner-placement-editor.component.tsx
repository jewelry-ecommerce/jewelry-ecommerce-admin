import React from "react";
import {
  BANNER_LAYOUT_OPTIONS,
  ACTION_LAYOUT_OPTIONS,
  VIDEO_POSTER_ACCEPT,
  type BannerSlotContentFormFieldsProps,
  isSequentialBannerPlacement,
  isReorderableBannerPlacement,
  getSlotDisplayLabel,
  getSlotSortableId,
  type SortableBannerSlotCardProps,
  type CmsPageWizardDialogBannerPlacementEditorProps,
} from "./cms-banner-slot.utils";
import { Box, Link, Stack, Typography } from "@mui/material";
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Controller, useWatch } from "react-hook-form";
import { BannerMediaType, PlacementDisplayType } from "../../../../apis";
import { CustomButton } from "../../../../components/button/custom-button";

import { SelectInput, TextInput } from "../../../../components/form";
import { StackAlignJustCenter, StackRow, StackRowJustBetween, StackRowJustEnd } from "../../../../components/styled";
import { TextFieldUploadContent as TextFieldUpload } from "../../components/text-field-upload-content.component";
import {
  CONTENT_DISPLAY_UPLOAD_MAX_FILE_BYTES,
  CONTENT_DISPLAY_UPLOAD_MAX_FILE_MB,
  CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_BYTES,
  CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB,
} from "../../content-display-upload.constants";
import { TYPOGRAPHY_STYLES } from "../../../../common/constant/typography.constant";
import IconDrag02 from "../../../../assets/icon/icon-drag-02";

const MediaUrlLink = ({ value }: { value?: string }) => {
  const url = value?.trim();
  if (!url) return null;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      underline="hover"
      sx={{
        display: "block",
        mt: 0.5,
        color: "#1D4ED8",
        overflowWrap: "anywhere",
        ...TYPOGRAPHY_STYLES.xs.regular,
      }}
    >
      {url}
    </Link>
  );
};

export const BannerSlotContentFormFields: React.FC<BannerSlotContentFormFieldsProps> = ({
  slotForm,
  slotMediaTypeWatch,
  getAcceptByMediaType,
  onUploadSlotMedia,
  onFileReject,
  onClearSlotMedia,
  previewOverrides,
  contentMode = "default",
}) => {
  const isDoubleBanner = contentMode === "double_banner";
  const isGridBanner = contentMode === "grid";
  const isVideoMedia = slotMediaTypeWatch === BannerMediaType.VIDEO;
  const mediaUploadMaxBytes = isVideoMedia ? CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_BYTES : CONTENT_DISPLAY_UPLOAD_MAX_FILE_BYTES;
  const mediaUploadHintMb = isVideoMedia ? CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB : CONTENT_DISPLAY_UPLOAD_MAX_FILE_MB;

  return (
    <Stack gap={1.5}>
      <StackRow gap={1.5}>
        <Box sx={{ flex: 1 }}>
          <Controller
            name="mediaType"
            control={slotForm.control}
            render={({ field }) => (
              <SelectInput
                label="Loại nội dung"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: BannerMediaType.IMAGE, label: "Ảnh" },
                  { value: BannerMediaType.VIDEO, label: "Video" },
                  { value: BannerMediaType.GIF, label: "GIF" },
                ]}
              />
            )}
          />
        </Box>
      </StackRow>

      <StackRow>
        <Controller
          name="mediaUrl"
          control={slotForm.control}
          render={({ field }) => (
            <Box sx={{ width: "100%" }}>
              <TextFieldUpload
                label="Đường dẫn hình ảnh/video"
                requiredMark
                previewMode="image"
                value={previewOverrides?.mediaUrl || field.value}
                onChange={(next) => field.onChange(next)}
                onPickFile={(file) => onUploadSlotMedia("mediaUrl", file)}
                accept={getAcceptByMediaType(slotMediaTypeWatch ?? BannerMediaType.IMAGE)}
                maxFileSizeBytes={mediaUploadMaxBytes}
                onFileReject={onFileReject}
                error={Boolean(slotForm.formState.errors.mediaUrl)}
                errorMessage={slotForm.formState.errors.mediaUrl?.message}
                hintText={`Tải ảnh/video/gif lên hoặc chọn file từ máy (tối đa ${mediaUploadHintMb}MB).`}
              />
              <MediaUrlLink value={field.value} />
            </Box>
          )}
        />

        <Controller
          name="mediaMobileUrl"
          control={slotForm.control}
          render={({ field }) => (
            <Box sx={{ width: "100%" }}>
              <TextFieldUpload
                label="Đường dẫn hình ảnh/video (điện thoại)"
                requiredMark
                previewMode="image"
                value={previewOverrides?.mediaMobileUrl || field.value}
                onChange={(next) => field.onChange(next)}
                onPickFile={(file) => onUploadSlotMedia("mediaMobileUrl", file)}
                accept={getAcceptByMediaType(slotMediaTypeWatch ?? BannerMediaType.IMAGE)}
                maxFileSizeBytes={mediaUploadMaxBytes}
                onFileReject={onFileReject}
                error={Boolean(slotForm.formState.errors.mediaMobileUrl)}
                errorMessage={slotForm.formState.errors.mediaMobileUrl?.message}
                hintText={`Tải phiên bản điện thoại lên (tối đa ${mediaUploadHintMb}MB).`}
              />
              <MediaUrlLink value={field.value} />
            </Box>
          )}
        />
      </StackRow>

      {isGridBanner && !isVideoMedia ? (
        <Box sx={{ flex: 1 }}>
          <Controller
            name="mediaLinkUrl"
            control={slotForm.control}
            render={({ field }) => (
              <TextInput
                label="Đường dẫn đích hình ảnh"
                value={field.value}
                placeholder="https://www.google.com"
                onChange={field.onChange}
              />
            )}
          />
        </Box>
      ) : null}

      {isVideoMedia ? (
        <StackRow gap={1.5}>
          <Controller
            name="mediaPosterUrl"
            control={slotForm.control}
            render={({ field }) => (
              <Box sx={{ width: "100%" }}>
                <TextFieldUpload
                  label="Poster video"
                  previewMode="image"
                  value={previewOverrides?.mediaPosterUrl || field.value}
                  onChange={(next) => field.onChange(next)}
                  onPickFile={(file) => onUploadSlotMedia("mediaPosterUrl", file)}
                  onClear={() => {
                    slotForm.setValue("mediaPosterUrl", "", { shouldDirty: true, shouldValidate: true });
                    onClearSlotMedia?.("mediaPosterUrl");
                  }}
                  accept={VIDEO_POSTER_ACCEPT}
                  onFileReject={onFileReject}
                  hintText="Tải ảnh poster cho video desktop (tối đa 5MB)."
                />
                <MediaUrlLink value={field.value} />
              </Box>
            )}
          />

          <Controller
            name="mediaMobilePosterUrl"
            control={slotForm.control}
            render={({ field }) => (
              <Box sx={{ width: "100%" }}>
                <TextFieldUpload
                  label="Poster video (điện thoại)"
                  previewMode="image"
                  value={previewOverrides?.mediaMobilePosterUrl || field.value}
                  onChange={(next) => field.onChange(next)}
                  onPickFile={(file) => onUploadSlotMedia("mediaMobilePosterUrl", file)}
                  onClear={() => {
                    slotForm.setValue("mediaMobilePosterUrl", "", { shouldDirty: true, shouldValidate: true });
                    onClearSlotMedia?.("mediaMobilePosterUrl");
                  }}
                  accept={VIDEO_POSTER_ACCEPT}
                  onFileReject={onFileReject}
                  hintText="Nếu bỏ trống, storefront dùng poster desktop (tối đa 5MB)."
                />
                <MediaUrlLink value={field.value} />
              </Box>
            )}
          />
        </StackRow>
      ) : null}

      {isDoubleBanner ? (
        <React.Fragment>
          <Controller
            name="title"
            control={slotForm.control}
            render={({ field }) => <TextInput label="Tiêu đề" value={field.value} onChange={field.onChange} />}
          />
          <Controller
            name="titleColor"
            control={slotForm.control}
            render={({ field }) => (
              <TextInput label="Màu chữ tiêu đề" value={field.value} placeholder="#FFFFFF" onChange={field.onChange} />
            )}
          />
          <Controller
            name="primaryActionTarget"
            control={slotForm.control}
            render={({ field }) => (
              <TextInput label="Đường dẫn đích" value={field.value} placeholder="/bo-suu-tap" onChange={field.onChange} />
            )}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <StackRow gap={1.5}>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="title"
                control={slotForm.control}
                render={({ field }) => <TextInput label="Tiêu đề" value={field.value} onChange={field.onChange} />}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Controller
                name="subtitle"
                control={slotForm.control}
                render={({ field }) => <TextInput label="Phụ đề" value={field.value} onChange={field.onChange} />}
              />
            </Box>
          </StackRow>

          <Controller
            name="titleColor"
            control={slotForm.control}
            render={({ field }) => (
              <TextInput label="Màu chữ tiêu đề" value={field.value} placeholder="#FFFFFF" onChange={field.onChange} />
            )}
          />
        </React.Fragment>
      )}
      {!isDoubleBanner ? (
        <StackRow gap={1.5}>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="layout"
              control={slotForm.control}
              render={({ field }) => (
                <SelectInput label="Vị trí chữ/nút" value={field.value} onChange={field.onChange} options={BANNER_LAYOUT_OPTIONS} />
              )}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Controller
              name="actionsLayout"
              control={slotForm.control}
              render={({ field }) => (
                <SelectInput label="Bố cục nút" value={field.value} onChange={field.onChange} options={ACTION_LAYOUT_OPTIONS} />
              )}
            />
          </Box>
        </StackRow>
      ) : null}

      {!isDoubleBanner ? (
        <React.Fragment>
          <Box sx={{ borderTop: "1px solid #EAECF0", pt: 1.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#101828", mb: 1 }}>Nút 1</Typography>
            <Stack gap={1.5}>
              <StackRow gap={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="primaryActionText"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Nhãn nút" value={field.value} placeholder="Xem ngay" onChange={field.onChange} />
                    )}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="primaryActionTarget"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput
                        label="Đường dẫn đích"
                        value={field.value}
                        placeholder="https://www.google.com"
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>
              </StackRow>

              <StackRow gap={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="primaryActionBg"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Màu nền nút" value={field.value} placeholder="#FFFFFF" onChange={field.onChange} />
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="primaryActionColor"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Màu chữ nút" value={field.value} placeholder="#171717" onChange={field.onChange} />
                    )}
                  />
                </Box>
              </StackRow>
            </Stack>
          </Box>

          <Box sx={{ borderTop: "1px solid #EAECF0", pt: 1.5 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#101828", mb: 1 }}>Nút 2</Typography>
            <Stack gap={1.5}>
              <StackRow gap={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="secondaryActionText"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Nhãn nút" value={field.value} placeholder="Khám phá thêm" onChange={field.onChange} />
                    )}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="secondaryActionTarget"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput
                        label="Đường dẫn đích"
                        value={field.value}
                        placeholder="https://www.google.com"
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>
              </StackRow>

              <StackRow gap={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="secondaryActionBg"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Màu nền nút" value={field.value} placeholder="#111827" onChange={field.onChange} />
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="secondaryActionColor"
                    control={slotForm.control}
                    render={({ field }) => (
                      <TextInput label="Màu chữ nút" value={field.value} placeholder="#FFFFFF" onChange={field.onChange} />
                    )}
                  />
                </Box>
              </StackRow>
            </Stack>
          </Box>
        </React.Fragment>
      ) : null}
    </Stack>
  );
};

const SortableBannerSlotCard: React.FC<SortableBannerSlotCardProps> = ({
  sortableId,
  slot,
  index,
  displayType,
  selected,
  previewMode,
  slotPreviewOverride,
  slotsCount,
  onSelectSlot,
  onRemoveSlot,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });
  const previewUrl =
    previewMode === "mobile"
      ? slotPreviewOverride?.mediaMobileUrl || slot.mediaMobileUrl || slotPreviewOverride?.mediaUrl || slot.mediaUrl
      : slotPreviewOverride?.mediaUrl || slot.mediaUrl;
  const hasPreview = Boolean(previewUrl && slot.mediaType !== BannerMediaType.VIDEO);
  const canDrag = isReorderableBannerPlacement(displayType) && slotsCount > 1;

  return (
    <Box
      ref={setNodeRef}
      {...(canDrag ? attributes : {})}
      {...(canDrag ? listeners : {})}
      aria-label={canDrag ? "Kéo để sắp xếp banner" : undefined}
      onClick={() => onSelectSlot(slot.slotKey)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.92 : 1,
      }}
      sx={{
        border: selected ? "2px solid #101828" : "1px solid #E5E7EB",
        borderRadius: 2,
        p: 1,
        cursor: canDrag ? (isDragging ? "grabbing" : "grab") : "pointer",
        bgcolor: "#FFF",
        touchAction: canDrag ? "none" : "auto",
      }}
    >
      <Box
        sx={{
          height: 96,
          borderRadius: 1.5,
          bgcolor: "#F3F4F6",
          backgroundImage: hasPreview ? `url(${previewUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid #E5E7EB",
        }}
      >
        {!hasPreview ? (
          <StackAlignJustCenter sx={{ width: "100%", height: "100%" }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#344054" }}>
              {slot.mediaType === BannerMediaType.VIDEO ? "Video" : "Chưa có hình ảnh/video"}
            </Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#667085" }}>{getSlotDisplayLabel(displayType, index)}</Typography>
          </StackAlignJustCenter>
        ) : null}
      </Box>

      <StackRowJustBetween sx={{ alignItems: "center", mt: 1 }}>
        <StackRow sx={{ alignItems: "center", minWidth: 0, flex: 1 }}>
          {canDrag ? (
            <Box
              aria-hidden
              sx={{ display: "flex", alignItems: "center", color: "#9CA3AF", pr: 0.75, flexShrink: 0, pointerEvents: "none" }}
            >
              <IconDrag02 />
            </Box>
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: "#101828" }}>{getSlotDisplayLabel(displayType, index)}</Typography>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.xs.regular,
                color: "#667085",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {slot.title || slot.internalName || "Chưa nhập tiêu đề"}
            </Typography>
          </Box>
        </StackRow>

        {isSequentialBannerPlacement(displayType) && slotsCount > 1 ? (
          <CustomButton
            variant="outline"
            fullWidth={false}
            sx={{ px: 1, py: 0.5, minWidth: 72 }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveSlot(slot.slotKey);
            }}
          >
            Xóa
          </CustomButton>
        ) : null}
      </StackRowJustBetween>
    </Box>
  );
};

export const CmsPageWizardDialogBannerPlacementEditor: React.FC<CmsPageWizardDialogBannerPlacementEditorProps> = ({
  displayType,
  previewMode,
  setPreviewMode,
  slots,
  slotPreviewOverrides,
  selectedSlotKey,
  selectedSlot,
  slotForm,
  slotMediaTypeWatch,
  getAcceptByMediaType,
  onSelectSlot,
  onAddSlot,
  onRemoveSlot,
  onUploadSlotMedia,
  onClearSlotMedia,
  onFileReject,
  onSaveSlotContent,
  onReorderSlots,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const watchedMediaUrl = useWatch({ control: slotForm.control, name: "mediaUrl" });
  const watchedMediaMobileUrl = useWatch({ control: slotForm.control, name: "mediaMobileUrl" });
  const watchedMediaType = useWatch({ control: slotForm.control, name: "mediaType" });
  const selectedSlotPreviewOverride = selectedSlot ? slotPreviewOverrides[selectedSlot.slotKey] : undefined;
  const selectedSlotIndex = Math.max(
    slots.findIndex((slot) => slot.slotKey === selectedSlot?.slotKey),
    0,
  );
  const selectedPreviewUrl =
    previewMode === "mobile"
      ? selectedSlotPreviewOverride?.mediaMobileUrl || watchedMediaMobileUrl || selectedSlotPreviewOverride?.mediaUrl || watchedMediaUrl
      : selectedSlotPreviewOverride?.mediaUrl || watchedMediaUrl;

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isReorderableBannerPlacement(displayType) || slots.length <= 1) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sortableIds = slots.map(getSlotSortableId);
    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onReorderSlots(oldIndex, newIndex);
  };

  return (
    <Stack gap={2}>
      <StackRowJustBetween sx={{ alignItems: "center", gap: 1.5 }}>
        <Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828" }}>
            {displayType === PlacementDisplayType.DOUBLE_BANNER
              ? "Bố cục 2 banner"
              : `${slots.length} ${displayType === PlacementDisplayType.CAROUSEL ? "mục băng chuyền" : "trang trượt"}`}
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#667085", mt: 0.25 }}>
            {displayType === PlacementDisplayType.DOUBLE_BANNER
              ? "Nhập hình ảnh/video, tiêu đề, màu chữ và đường dẫn đích cho từng banner."
              : "Nhập hình ảnh/video, nội dung hiển thị và tối đa 2 nút hành động cho từng banner. Độ mờ lớp phủ giữ mặc định."}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <SelectInput
            value={previewMode}
            options={[
              { value: "desktop", label: "Máy tính" },
              { value: "mobile", label: "Điện thoại" },
            ]}
            onChange={(event) => setPreviewMode(String(event.target.value) as "desktop" | "mobile")}
          />
        </Box>
      </StackRowJustBetween>

      <StackRow gap={2} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ width: 280, minWidth: 280 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
            <SortableContext items={slots.map(getSlotSortableId)} strategy={verticalListSortingStrategy}>
              <Stack gap={1}>
                {slots.map((slot, index) => (
                  <SortableBannerSlotCard
                    key={getSlotSortableId(slot)}
                    sortableId={getSlotSortableId(slot)}
                    slot={slot}
                    index={index}
                    displayType={displayType}
                    selected={selectedSlotKey === slot.slotKey}
                    previewMode={previewMode}
                    slotPreviewOverride={slotPreviewOverrides[slot.slotKey]}
                    slotsCount={slots.length}
                    onSelectSlot={onSelectSlot}
                    onRemoveSlot={onRemoveSlot}
                  />
                ))}

                {isSequentialBannerPlacement(displayType) ? (
                  <CustomButton variant="outline" onClick={onAddSlot}>
                    Thêm {displayType === PlacementDisplayType.CAROUSEL ? "mục" : "trang trượt"}
                  </CustomButton>
                ) : null}
              </Stack>
            </SortableContext>
          </DndContext>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            p: 2,
            bgcolor: "#FCFCFD",
          }}
        >
          {selectedSlot ? (
            <Stack gap={1.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828" }}>
                {getSlotDisplayLabel(displayType, selectedSlotIndex)}
              </Typography>

              <Box
                sx={{
                  minHeight: 180,
                  borderRadius: 2,
                  border: "1px solid #E5E7EB",
                  bgcolor: "#F9FAFB",
                  backgroundImage: selectedPreviewUrl && watchedMediaType !== BannerMediaType.VIDEO ? `url(${selectedPreviewUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!watchedMediaUrl || watchedMediaType === BannerMediaType.VIDEO ? (
                  <StackAlignJustCenter sx={{ width: "100%", height: "100%", px: 2, textAlign: "center" }}>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#344054" }}>
                      {watchedMediaType === BannerMediaType.VIDEO ? "Xem trước bằng đường dẫn video" : "Chưa có nội dung xem trước"}
                    </Typography>
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#667085", mt: 0.5 }}>
                      {previewMode === "mobile" ? "Đang xem bản điện thoại nếu có." : "Đang xem bản máy tính."}
                    </Typography>
                  </StackAlignJustCenter>
                ) : null}
              </Box>

              <BannerSlotContentFormFields
                slotForm={slotForm}
                slotMediaTypeWatch={slotMediaTypeWatch}
                getAcceptByMediaType={getAcceptByMediaType}
                onUploadSlotMedia={onUploadSlotMedia}
                onClearSlotMedia={onClearSlotMedia}
                onFileReject={onFileReject}
                previewOverrides={selectedSlotPreviewOverride}
                contentMode={displayType === PlacementDisplayType.DOUBLE_BANNER ? "double_banner" : "default"}
              />

              <StackRowJustEnd gap={1}>
                <CustomButton variant="outline" fullWidth={false} onClick={onSaveSlotContent} sx={{ px: 2 }}>
                  Lưu banner này
                </CustomButton>
              </StackRowJustEnd>
            </Stack>
          ) : null}
        </Box>
      </StackRow>
    </Stack>
  );
};
