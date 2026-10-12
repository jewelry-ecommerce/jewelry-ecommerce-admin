const DEFAULT_XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Tải file từ URL (CDN/media) với tên hiển thị đúng UTF-8.
 * `<a download>` bị bỏ qua với cross-origin — cần fetch → blob → object URL.
 */
export async function downloadRemoteFile(fileUrl: string, fileName: string): Promise<void> {
  const normalizedUrl = fileUrl.trim();
  const normalizedName = fileName.trim() || 'download.xlsx';

  if (!normalizedUrl) {
    throw new Error('Thiếu URL tải file.');
  }

  const triggerDownload = (href: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = normalizedName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  try {
    const response = await fetch(normalizedUrl, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: DEFAULT_XLSX_MIME }));

    try {
      triggerDownload(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    triggerDownload(normalizedUrl);
  }
}
