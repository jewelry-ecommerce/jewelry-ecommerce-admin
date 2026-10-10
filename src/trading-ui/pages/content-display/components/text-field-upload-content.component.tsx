import { TextFieldUpload, type TextFieldUploadProps } from '../../../components/text-field-upload/text-field-upload.component';
import { CONTENT_DISPLAY_UPLOAD_MAX_FILE_BYTES } from '../content-display-upload.constants';

export const TextFieldUploadContent = ({ maxFileSizeBytes = CONTENT_DISPLAY_UPLOAD_MAX_FILE_BYTES, ...rest }: TextFieldUploadProps) => (
  <TextFieldUpload maxFileSizeBytes={maxFileSizeBytes} {...rest} />
);
