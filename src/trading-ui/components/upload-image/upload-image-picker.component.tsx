import { PhotoCameraOutlined } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import { useEffect, useId, useMemo, useState } from 'react';
import { MediaVisibility } from '../../apis/file';
import { readImageMetadata, uploadMultipleImages, type ImageMetadata } from '../../common/utils/image-upload.utils';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import EvidenceImagePreviewDialog from './evidence-image-preview-dialog.component';

export interface UploadedImageInfo extends ImageMetadata {
  url: string;
}

export interface UploadImagePickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  onMetadataChange?: (next: UploadedImageInfo[]) => void;
  label?: string;
  requiredMark?: boolean;
  error?: string;
  maxFiles?: number;
  containerSx?: SxProps<Theme>;
}

export const UploadImagePicker = ({ value, onChange, onMetadataChange, label = 'Ảnh/Video bằng chứng', requiredMark = false, error, maxFiles = 10, containerSx }: UploadImagePickerProps) => {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [metadataList, setMetadataList] = useState<UploadedImageInfo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const remaining = Math.max(0, maxFiles - value.length);
  const metadataByUrl = useMemo(
    () =>
      metadataList.reduce<Record<string, UploadedImageInfo>>((acc, item) => {
        if (item.url) {
          acc[item.url] = item;
        }
        return acc;
      }, {}),
    [metadataList],
  );

  useEffect(() => {
    setMetadataList((prev) => prev.filter((item) => value.includes(item.url)));
  }, [value]);

  useEffect(() => {
    onMetadataChange?.(metadataList);
  }, [metadataList, onMetadataChange]);

  const handlePickFiles = async (files: FileList | null) => {
    if (!files?.length || remaining === 0) return;
    const picked = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remaining);
    if (picked.length === 0) return;
    setUploading(true);
    try {
      const [uploaded, parsedMetadata] = await Promise.all([
        uploadMultipleImages(
          picked.map((file) => ({
            file,
            visibility: MediaVisibility.PUBLIC,
          })),
        ),
        Promise.all(picked.map((file) => readImageMetadata(file))),
      ]);
      const uploadedUrls = uploaded.map((item) => item.asset.publicUrl);
      onChange([...value, ...uploadedUrls]);
      setMetadataList((prev) => [
        ...prev.filter((item) => value.includes(item.url)),
        ...parsedMetadata.map((meta, index) => ({
          ...meta,
          url: uploadedUrls[index] ?? '',
        })),
      ]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    const removedUrl = value[index];
    onChange(value.filter((_, i) => i !== index));
    setMetadataList((prev) => prev.filter((item) => item.url !== removedUrl));
  };

  return (
    <Box sx={{ ...containerSx }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 1 }}>
        {label}
        {requiredMark ? (
          <Box component="span" sx={{ color: '#F04438', ml: 0.5 }}>
            *
          </Box>
        ) : null}
      </Typography>

      <Stack direction="row" gap={1} flexWrap="wrap">
        {value.map((url, index) => (
          <Box key={`${url}-${index}`} sx={{ position: 'relative', width: 84, height: 84 }}>
            <Box
              component="img"
              src={url}
              alt=""
              onClick={() => setPreviewIndex(index)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 1.5,
                border: '1px solid #E4E7EC',
                cursor: 'pointer',
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleRemoveItem(index)}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                bgcolor: '#FFFFFF',
                border: '1px solid #E4E7EC',
              }}
            >
              <Typography sx={{ fontSize: 12, lineHeight: 1 }}>x</Typography>
            </IconButton>
          </Box>
        ))}

        {remaining > 0 ? (
          <Box
            component="label"
            htmlFor={inputId}
            sx={{
              width: 84,
              height: 84,
              border: '1px dashed #D0D5DD',
              borderRadius: 1.5,
              bgcolor: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {uploading ? <CircularProgress size={20} /> : <PhotoCameraOutlined sx={{ color: '#98A2B3' }} />}
          </Box>
        ) : null}
      </Stack>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (event) => {
          await handlePickFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <EvidenceImagePreviewDialog
        images={value}
        activeIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onPrev={() =>
          setPreviewIndex((prev) => {
            if (prev == null || value.length <= 0) return prev;
            return prev === 0 ? value.length - 1 : prev - 1;
          })
        }
        onNext={() =>
          setPreviewIndex((prev) => {
            if (prev == null || value.length <= 0) return prev;
            return prev === value.length - 1 ? 0 : prev + 1;
          })
        }
        metadataByUrl={metadataByUrl}
        defaultShowInfo
      />

      {error ? <Typography sx={{ mt: 0.75, color: '#F04438', fontSize: 12 }}>{error}</Typography> : null}
    </Box>
  );
};
