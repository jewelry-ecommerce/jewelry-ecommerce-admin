import { DeleteOutlineRounded, ImageOutlined } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement, IconButtonElement } from "@/components/button/button-element.component";
import { FormFieldShell } from "@/components/form/form-field-shell.component";
import type { FormFieldBaseProps } from "@/components/form/form-field.interface";
import { COLOR, STYLE } from "@/theme/design-tokens";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/gif,image/webp,image/svg+xml";
const REMOVE_ICON_SIZE = 16;
const EMPTY_ICON_SIZE = 24;

export interface ImageUploadInputProps extends Omit<FormFieldBaseProps, "placeholder"> {
  /** A picked `File`, an existing URL, or null. No upload happens — the caller owns persistence. */
  value: File | string | null;
  onChange: (value: File | null) => void;
  buttonLabel?: string;
  previewHeight?: number;
  id?: string;
}

export const ImageUploadInput = ({
  label,
  requiredMark,
  value,
  onChange,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  buttonLabel = "Choose image",
  previewHeight = 140,
  id,
  fullWidth = true,
}: ImageUploadInputProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => (value instanceof File ? URL.createObjectURL(value) : value), [value]);

  useEffect(() => {
    // Object URLs leak until revoked; only the ones this component created are ours to release.
    if (!(value instanceof File) || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [value, previewUrl]);

  const handlePick = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return;
    onChange(file);
  };

  return (
    <FormFieldShell
      label={label}
      requiredMark={requiredMark}
      error={error}
      errorMessage={errorMessage}
      helperText={helperText}
      fullWidth={fullWidth}
    >
      <Stack
        spacing={1.5}
        sx={{
          p: 2,
          border: `1px dashed ${error ? COLOR.STATUS.dangerFg : COLOR.NEUTRAL[300]}`,
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
          bgcolor: COLOR.NEUTRAL[25],
        }}
      >
        {previewUrl ? (
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              component="img"
              src={previewUrl}
              alt={value instanceof File ? value.name : "Selected image"}
              sx={{
                height: previewHeight,
                width: previewHeight,
                objectFit: "cover",
                borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
                flexShrink: 0,
              }}
            />
            <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: COLOR.NEUTRAL[900], wordBreak: "break-all" }}>
                {value instanceof File ? value.name : previewUrl}
              </Typography>
              {value instanceof File ? (
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
                  {Math.round(value.size / 1024)} KB
                </Typography>
              ) : null}
            </Stack>
            <IconButtonElement aria-label="Remove image" disabled={disabled} onClick={() => onChange(null)}>
              <DeleteOutlineRounded sx={{ fontSize: REMOVE_ICON_SIZE }} />
            </IconButtonElement>
          </Stack>
        ) : (
          <Stack spacing={0.5} alignItems="center" sx={{ py: 2, color: COLOR.NEUTRAL[400] }}>
            <ImageOutlined sx={{ fontSize: EMPTY_ICON_SIZE }} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>
              PNG, JPG, WEBP or SVG up to {MAX_FILE_SIZE_MB} MB
            </Typography>
          </Stack>
        )}

        <Box>
          <ButtonElement
            variant="outline"
            size="sm"
            disabled={disabled}
            content={buttonLabel}
            onClick={() => fileInputRef.current?.click()}
          />
          <Box
            component="input"
            ref={fileInputRef}
            id={id}
            type="file"
            accept={ACCEPTED_TYPES}
            sx={{ display: "none" }}
            onChange={(event) => {
              const input = event.target as HTMLInputElement;
              handlePick(input.files?.[0]);
              // Reset so picking the same file twice still fires a change event.
              input.value = "";
            }}
          />
        </Box>
      </Stack>
    </FormFieldShell>
  );
};
