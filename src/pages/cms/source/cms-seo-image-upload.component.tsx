import { useState } from 'react';
import { TextFieldUploadContent } from '@/trading-ui/pages/content-display/components/text-field-upload-content.component';
import { uploadSingleImage } from '@/trading-ui/common/utils/image-upload.utils';
import { MediaVisibility } from '@/trading-ui/apis/file/file.enum';
import { useSnackbar, SnackbarType } from '@/hooks/use-snackbar.hook';
interface Props { value: string; onChange: (value: string) => void; disabled: boolean; error?: boolean; errorMessage?: string }
export function CmsSeoImageUpload({ value, onChange, disabled, error, errorMessage }: Props) {
  const { showSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);
  async function upload(file: File): Promise<void> {
    setUploading(true);
    try {
      const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
      onChange(asset.publicUrl);
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: error instanceof Error ? error.message : 'Không thể upload ảnh.' });
    } finally { setUploading(false); }
  }
  return <TextFieldUploadContent label="Ảnh chia sẻ (OG Image)" value={value}
    onChange={onChange} error={error} errorMessage={errorMessage} accept="image/*"
    hintText="Khuyến nghị 1200×630 (tỷ lệ ~1.91:1). Hỗ trợ mọi định dạng ảnh (tối đa 5MB)."
    previewMode="image" disabled={disabled || uploading} processing={uploading}
    onPickFile={disabled ? undefined : upload} />;
}
