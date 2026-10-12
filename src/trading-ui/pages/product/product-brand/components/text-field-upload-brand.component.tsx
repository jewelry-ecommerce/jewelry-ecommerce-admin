import { TextFieldUpload, type TextFieldUploadProps } from '../../../../components/text-field-upload/text-field-upload.component';

const BRAND_ACCEPT = 'image/png,image/jpeg';
const BRAND_MAX_BYTES = 50 * 1024 * 1024;
const BRAND_HINT = 'Hỗ trợ file .png và .jpg (tối đa 50MB)';

export type TextFieldUploadBrandProps = Omit<TextFieldUploadProps, 'accept' | 'maxFileSizeBytes' | 'hintText' | 'previewMode'> & {
  accept?: string;
  maxFileSizeBytes?: number;
  hintText?: string;
};

export const TextFieldUploadBrand = ({ accept = BRAND_ACCEPT, maxFileSizeBytes = BRAND_MAX_BYTES, hintText = BRAND_HINT, ...rest }: TextFieldUploadBrandProps) => (
  <TextFieldUpload accept={accept} maxFileSizeBytes={maxFileSizeBytes} hintText={hintText} {...rest} previewMode="image" />
);
