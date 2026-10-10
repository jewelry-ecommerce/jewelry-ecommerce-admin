export const DEFAULT_ACCEPT = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
  '.ogv',
  '.ogg',
].join(',');

export const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const TEXT_FIELD_UPLOAD_ACCEPT_EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,.xlsx,.xls';
export const TEXT_FIELD_UPLOAD_ACCEPT_WORD = 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.docx';
export const TEXT_FIELD_UPLOAD_ACCEPT_PDF = 'application/pdf,.pdf';

export const TEXT_FIELD_UPLOAD_ACCEPT_OFFICE_DOCS = [TEXT_FIELD_UPLOAD_ACCEPT_EXCEL, TEXT_FIELD_UPLOAD_ACCEPT_WORD, TEXT_FIELD_UPLOAD_ACCEPT_PDF].join(',');

export const UPLOAD_ACCEPT_TYPES = {
  /** Ảnh tĩnh (logo, thumb SPU…) — có GIF, không video. */
  image: 'image/svg+xml,image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp,.svg',
  /** Ảnh + GIF + video (CMS block: INFO_CARDS, gallery…). */
  imageGifVideo: DEFAULT_ACCEPT,
  excel: TEXT_FIELD_UPLOAD_ACCEPT_EXCEL,
  word: TEXT_FIELD_UPLOAD_ACCEPT_WORD,
  pdf: TEXT_FIELD_UPLOAD_ACCEPT_PDF,
  office: TEXT_FIELD_UPLOAD_ACCEPT_OFFICE_DOCS,
} as const;

export type UploadAcceptKeyword = keyof typeof UPLOAD_ACCEPT_TYPES;

export const resolveAccept = (accept?: UploadAcceptKeyword | string): string => {
  if (!accept) return DEFAULT_ACCEPT;
  return UPLOAD_ACCEPT_TYPES[accept as UploadAcceptKeyword] || accept;
};

// Định dạng bytes sang chuỗi dễ đọc (B, KB, MB)
export const formatMaxLabel = (bytes: number): string => {
  if (bytes >= 1048576) {
    const mb = bytes / 1048576;
    return `${mb % 1 === 0 ? mb : mb.toFixed(1)}MB`;
  }
  return bytes >= 1024 ? `${Math.round(bytes / 1024)}KB` : `${bytes}B`;
};

// Kiểm tra file có khớp với accept string pattern không
export const fileMatchesAccept = (file: File, accept: string): boolean => {
  const tokens = accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.some((t) => {
    if (t === '*/*') return true;
    if (t.startsWith('.')) return name.endsWith(t);
    if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
};

// Kiểm tra chuỗi có khả năng là URL ảnh/GIF hoặc base64 image hay không
export const isLikelyImagePreviewValue = (value: string): boolean => {
  return !!value && (value.startsWith('data:image/') || (/^https?:\/\//i.test(value) && /\.(png|jpe?g|gif|svg|webp)(\?|#|$)/i.test(value)));
};

/** Preview dạng video (URL hoặc data URL). */
export const isLikelyVideoPreviewValue = (value: string): boolean => {
  if (!value) return false;
  if (value.startsWith('data:video/')) return true;
  return /^https?:\/\//i.test(value) && /\.(mp4|webm|mov|ogv|ogg)(\?|#|$)/i.test(value);
};

// Đọc file thành DataURL kèm theo progress "ảo" để UI mượt mà hơn
export const fileToDataUrlWithProgress = (file: File, onProgress?: (pct: number) => void): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    if (!onProgress) {
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(file);
      return;
    }

    const start = performance.now();
    // Ramp nhanh hơn cho file nhỏ, max 1.5s cho file cực lớn
    const ramp = Math.min(1500, Math.max(300, file.size / 51200));
    let last = -1,
      rPct = 0,
      done = false,
      res = '';

    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / ramp);
      const synth = Math.floor(2 + 84 * (1 - (1 - t) * (1 - t)));

      // Nếu đã xong, ép progress lên tối thiểu 90% để chuẩn bị về đích
      let displayPct = Math.max(synth, rPct);
      if (done) displayPct = Math.max(displayPct, 95);

      const pct = Math.min(99, displayPct);
      if (pct !== last) onProgress((last = pct));

      const canFinalize = done && (pct >= 99 || elapsed >= 300);

      if (canFinalize) {
        onProgress(100);
        resolve(res);
      } else {
        requestAnimationFrame(tick);
      }
    };

    reader.onprogress = (e) => e.lengthComputable && (rPct = Math.round((100 * e.loaded) / e.total));
    reader.onload = () => {
      res = String(reader.result ?? '');
      done = true;
    };
    reader.onerror = () => reject(new Error('read_failed'));

    requestAnimationFrame(tick);
    reader.readAsDataURL(file);
  });
};
