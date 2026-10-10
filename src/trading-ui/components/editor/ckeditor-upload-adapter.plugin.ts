import { uploadSingleImage } from '../../common/utils/image-upload.utils';
import { MediaVisibility } from '../../apis/file';

type CkFileLoader = {
  file: Promise<File | null>;
};

class CmsMediaUploadAdapter {
  constructor(private readonly loader: CkFileLoader) {}

  upload(): Promise<{ default: string }> {
    return this.loader.file.then((file) => {
      if (!file) {
        return Promise.reject(new Error('Không đọc được file upload.'));
      }

      return uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC }).then((response) => ({
        default: response.asset.publicUrl,
      }));
    });
  }

  abort(): void {
    // No-op: uploadSingleImage does not expose cancel handle.
  }
}

/** Gắn upload ảnh CKEditor vào API media/file của hệ thống. */
export function CKEditorUploadAdapterPlugin(editor: { plugins: { get: (name: string) => { createUploadAdapter: (loader: CkFileLoader) => CmsMediaUploadAdapter } } }): void {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => new CmsMediaUploadAdapter(loader);
}
