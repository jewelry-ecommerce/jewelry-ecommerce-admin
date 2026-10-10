import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { TextInput } from "@/trading-ui/components/form";

/** Màu gốc (1 ô / nhóm). Mã lệch preset → dùng ô chọn tùy chỉnh. */
export const BASE_COLOR_SWATCHES = [
  "#171717",
  "#6B7280",
  "#E11D48",
  "#F97316",
  "#EAB308",
  "#34C759",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#FFFFFF",
] as const;

const normalizeHexColor = (color: string) => color.trim().toLowerCase();

const isPresetSwatch = (color: string) => BASE_COLOR_SWATCHES.some((swatch) => normalizeHexColor(swatch) === normalizeHexColor(color));

type ColorInputMode = "palette" | "hex";

export type ColorPaletteFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export const ColorPaletteField = ({ label, value, onChange, disabled = false }: ColorPaletteFieldProps) => {
  const hasValue = Boolean(value?.trim());
  const normalizedValue = hasValue ? normalizeHexColor(value) : "";
  const isPresetValue = hasValue && isPresetSwatch(normalizedValue);
  const [mode, setMode] = useState<ColorInputMode>("palette");

  return (
    <Stack gap={1.5}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#374151" }}>{label}</Typography>
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          p: 1.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {[
            { value: "palette", label: "Chọn màu" },
            { value: "hex", label: "Nhập mã màu" },
          ].map((item) => {
            const active = mode === item.value;
            return (
              <Box
                key={item.value}
                component="button"
                type="button"
                onClick={() => !disabled && setMode(item.value as ColorInputMode)}
                disabled={disabled}
                sx={{
                  border: "none",
                  bgcolor: active ? "#EFF6FF" : "#FFFFFF",
                  color: active ? "#1D4ED8" : "#6B7280",
                  py: 1,
                  ...TYPOGRAPHY_STYLES.sm.medium,
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {item.label}
              </Box>
            );
          })}
        </Box>

        {mode === "palette" ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 24px)",
              gap: 1,
              alignItems: "center",
            }}
          >
            {BASE_COLOR_SWATCHES.map((color) => {
              const active = hasValue && normalizedValue === normalizeHexColor(color);
              return (
                <Box
                  key={color}
                  component="button"
                  type="button"
                  onClick={() => !disabled && onChange(color)}
                  disabled={disabled}
                  aria-label={`${label} ${color}`}
                  sx={{
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    minHeight: 24,
                    p: 0,
                    borderRadius: "50%",
                    bgcolor: color,
                    border: active ? "2px solid #111827" : color === "#FFFFFF" ? "1px solid #D0D5DD" : "none",
                    boxShadow: active ? "0 0 0 2px #EFF6FF" : "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                />
              );
            })}

            <Box
              sx={{
                position: "relative",
                width: 24,
                height: 24,
                minWidth: 24,
                minHeight: 24,
                flexShrink: 0,
                borderRadius: "50%",
                overflow: "hidden",
                bgcolor: !isPresetValue && hasValue ? value : undefined,
                background: !isPresetValue && hasValue ? value : "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                border: !isPresetValue && hasValue ? "2px solid #111827" : "1px solid #E5E7EB",
                boxShadow: !isPresetValue && hasValue ? "0 0 0 2px #EFF6FF" : "none",
              }}
            >
              <input
                type="color"
                value={value || "#000000"}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                aria-label={`${label} tùy chỉnh`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: 0,
                  border: "none",
                  opacity: 0,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              />
            </Box>
          </Box>
        ) : (
          <TextInput label="" placeholder="#F97316" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        )}
      </Box>
    </Stack>
  );
};
