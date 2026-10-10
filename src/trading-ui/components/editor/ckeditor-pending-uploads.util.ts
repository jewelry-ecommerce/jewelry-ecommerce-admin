type CkFileLoaderStatus = {
  status?: string;
};

type CkFileRepository = {
  loaders?: Iterable<CkFileLoaderStatus> | { [Symbol.iterator]: () => Iterator<CkFileLoaderStatus> };
};

type CkEditorWithFileRepository = {
  plugins: {
    get: (name: string) => CkFileRepository;
  };
};

const PENDING_UPLOAD_STATUSES = new Set(['reading', 'uploading']);

/** True khi CKEditor còn FileLoader đang đọc/upload — không được gọi setData lúc này. */
export function hasPendingEditorUploads(editor: CkEditorWithFileRepository): boolean {
  try {
    const fileRepository = editor.plugins.get('FileRepository');
    const loaders = fileRepository?.loaders;
    if (!loaders) {
      return false;
    }

    for (const loader of loaders) {
      if (loader?.status && PENDING_UPLOAD_STATUSES.has(loader.status)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
