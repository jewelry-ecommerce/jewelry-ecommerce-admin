import { ChevronLeftRounded, ChevronRightRounded, CloseRounded, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { Box, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';

export interface PreviewImageMetadata {
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number | null;
  height?: number | null;
  exif?: Record<string, string | number | boolean | null>;
}

export interface EvidenceImagePreviewDialogProps {
  images: string[];
  activeIndex: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  title?: string;
  metadataByUrl?: Record<string, PreviewImageMetadata>;
  defaultShowInfo?: boolean;
}

const EXIF_LABELS: Record<string, string> = {
  Make: 'Hãng máy',
  Model: 'Mẫu thiết bị',
  Software: 'Phần mềm',
  ModifyDate: 'Ngày chỉnh sửa',
  DateTimeOriginal: 'Ngày chụp',
  LensModel: 'Ống kính',
  GPSLatitudeRef: 'Vĩ độ (hướng)',
  GPSLatitude: 'Vĩ độ',
  GPSLongitudeRef: 'Kinh độ (hướng)',
  GPSLongitude: 'Kinh độ',
  ExifVersion: 'Phiên bản EXIF',
  ExifIFDPointer: 'Con trỏ EXIF',
  GPSInfoIFDPointer: 'Con trỏ GPS',
};

const formatExifValue = (value: string | number | boolean | null): string => {
  if (value == null) return '—';
  if (typeof value !== 'string') return String(value);

  const byteListPattern = /^\d+(,\s*\d+)+$/;
  if (!byteListPattern.test(value.trim())) return value;

  const bytes = value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 255);
  if (bytes.length === 0) return value;

  const decoded = new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, '').trim();
  if (decoded && /^[\x20-\x7EÀ-ỹ\s]+$/.test(decoded)) {
    return `${decoded} (${value})`;
  }
  return value;
};

const getExifLabel = (key: string): string => EXIF_LABELS[key] ?? key.replace(/^Tag_/i, 'Thẻ ');

const getFileNameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split('/').filter(Boolean).pop();
    return name ? decodeURIComponent(name) : 'Ảnh đã tải lên';
  } catch {
    const name = url.split('/').filter(Boolean).pop();
    return name || 'Ảnh đã tải lên';
  }
};

const EvidenceImagePreviewDialog = ({ images, activeIndex, onClose, onPrev, onNext, title = 'Bằng chứng giao hàng', metadataByUrl, defaultShowInfo = true }: EvidenceImagePreviewDialogProps) => {
  const [showInfo, setShowInfo] = React.useState(defaultShowInfo);
  const open = activeIndex !== null && activeIndex >= 0 && activeIndex < images.length;
  const imageUrl = open ? images[activeIndex] : '';
  const metadata = imageUrl ? metadataByUrl?.[imageUrl] : undefined;
  const exifEntries = Object.entries(metadata?.exif ?? {});

  React.useEffect(() => {
    if (open) {
      setShowInfo(defaultShowInfo);
    }
  }, [defaultShowInfo, open, imageUrl]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0, bgcolor: '#FFFFFF', position: 'relative' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES['2xl'].semibold, color: '#111827' }}>{title}</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <IconButton onClick={() => setShowInfo((prev) => !prev)} aria-label={showInfo ? 'Ẩn thông tin' : 'Hiện thông tin'}>
              {showInfo ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </IconButton>
            <IconButton onClick={onClose} aria-label="Đóng">
              <CloseRounded />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Box
            sx={{
              width: '100%',
              border: '1px solid #E5E7EB',
              borderRadius: 1.5,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: '#F9FAFB',
            }}
          >
            {imageUrl ? <Box component="img" src={imageUrl} alt="evidence-preview" sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }} /> : null}

            {showInfo ? (
              <Box
                sx={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 12,
                  maxHeight: '55%',
                  overflowY: 'auto',
                  borderRadius: 1.5,
                  p: 1.25,
                  bgcolor: 'rgba(17, 24, 39, 0.72)',
                  color: '#FFFFFF',
                }}
              >
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 0.5 }}>{metadata?.fileName || (imageUrl ? getFileNameFromUrl(imageUrl) : 'Ảnh bằng chứng')}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#D1D5DB', mb: 0.5 }}>
                  {metadata
                    ? `${metadata.mimeType || 'image/*'} • ${metadata.sizeBytes ? `${(metadata.sizeBytes / 1024).toFixed(1)} KB` : '—'} • ${metadata.width ?? '—'}x${metadata.height ?? '—'}`
                    : 'Không có metadata cục bộ cho ảnh này'}
                </Typography>

                {exifEntries.length > 0 ? (
                  <Stack gap={0.25}>
                    {exifEntries.map(([key, exifValue]) => (
                      <Typography key={key} sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#E5E7EB' }}>
                        {getExifLabel(key)}: {formatExifValue(exifValue)}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#E5E7EB' }}>Không có thông tin EXIF.</Typography>
                )}
              </Box>
            ) : null}

            {images.length > 1 ? (
              <React.Fragment>
                <IconButton
                  onClick={onPrev}
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(17, 24, 39, 0.45)',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: 'rgba(17, 24, 39, 0.62)' },
                  }}
                >
                  <ChevronLeftRounded />
                </IconButton>
                <IconButton
                  onClick={onNext}
                  sx={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(17, 24, 39, 0.45)',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: 'rgba(17, 24, 39, 0.62)' },
                  }}
                >
                  <ChevronRightRounded />
                </IconButton>
              </React.Fragment>
            ) : null}
          </Box>
          {open ? (
            <Typography sx={{ mt: 1.25, textAlign: 'center', ...TYPOGRAPHY_STYLES.base.regular, color: '#6B7280' }}>
              Ảnh {activeIndex + 1}/{images.length}
            </Typography>
          ) : null}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceImagePreviewDialog;
