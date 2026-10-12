import { type IUploadMediaFileRequest, type IUploadMediaFileResponse, abortUploadIntent, completeUploadIntent, createUploadIntent, putFileToUploadUrl, uploadMediaFile } from '../../apis/file';
import { MediaVisibility } from '../../apis/file/file.enum';

// ─── Orchestrator: tự chọn multipart hay intent theo loại file ───────────────

/**
 * Upload một file lên storage.
 *
 * - `video/*` → Intent flow (3 bước: create → PUT → complete).
 *   Không bị ràng buộc bởi `MEDIA_SINGLE_UPLOAD_MAX_BYTES` của file-service.
 * - Còn lại (image, GIF, PDF…) → Multipart (`/file/media/upload`).
 *
 * @param onUploadProgress Callback nhận percent 0–100 (tuỳ chọn, chỉ có với video).
 */
export const uploadSingleImage = async (data: IUploadMediaFileRequest, onUploadProgress?: (percent: number) => void): Promise<IUploadMediaFileResponse> => {
  if (data.file.type.startsWith('video/')) {
    return uploadVideoViaIntent(data, onUploadProgress);
  }
  return uploadMediaFile(data);
};

/**
 * Upload nhiều file đồng thời (song song).
 * Video sẽ tự động dùng intent flow, ảnh dùng multipart.
 */
export const uploadMultipleImages = async (data: IUploadMediaFileRequest[]): Promise<IUploadMediaFileResponse[]> => {
  return Promise.all(data.map((item) => uploadSingleImage(item)));
};

// ─── Intent flow (internal) ──────────────────────────────────────────────────

/**
 * Upload video qua 3 bước Intent:
 *  1. POST `file/file` — tạo intent, nhận `uploadUrl` + `requiredHeaders`
 *  2. PUT `uploadUrl` — stream file bytes (không qua gateway, không bị 25 MB cap)
 *  3. POST `file/file/upload-intents/:intentId/complete` — xác nhận, nhận `asset`
 *
 * Nếu bước 2 hoặc 3 thất bại → tự động abort intent để tránh leak object trên storage.
 */
const uploadVideoViaIntent = async (data: IUploadMediaFileRequest, onUploadProgress?: (percent: number) => void): Promise<IUploadMediaFileResponse> => {
  const visibility = data.visibility ?? MediaVisibility.PUBLIC;

  // Bước 1 — Tạo intent
  const intent = await createUploadIntent({
    originalFilename: data.file.name,
    mimeType: data.file.type,
    visibility,
    sizeBytes: data.file.size,
    pathPrefix: data.pathPrefix ?? null,
  });

  // Bước 2 — PUT bytes lên presigned URL
  try {
    await putFileToUploadUrl(intent.uploadUrl, data.file, intent.requiredHeaders, onUploadProgress);
  } catch (putError) {
    // Abort để dọn dẹp object storage — lỗi abort không che lỗi gốc
    void abortUploadIntent(intent.intentId).catch(() => undefined);
    throw putError;
  }

  // Bước 3 — Complete
  try {
    const result = await completeUploadIntent(intent.intentId, { sizeBytes: data.file.size });
    // Normalise về dạng IUploadMediaFileResponse để caller không cần phân biệt
    return { asset: result.asset };
  } catch (completeError) {
    void abortUploadIntent(intent.intentId).catch(() => undefined);
    throw completeError;
  }
};

// ─── Image metadata helpers (giữ nguyên) ─────────────────────────────────────

export interface ImageMetadata {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  exif: Record<string, string | number | boolean | null>;
}

const EXIF_TAG_NAMES: Record<number, string> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'ModifyDate',
  0x8769: 'ExifIFDPointer',
  0x8825: 'GPSInfoIFDPointer',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x8833: 'PhotographicSensitivity',
  0x9000: 'ExifVersion',
  0x9003: 'DateTimeOriginal',
  0x920a: 'FocalLength',
  0xa434: 'LensModel',
  0x0001: 'GPSLatitudeRef',
  0x0002: 'GPSLatitude',
  0x0003: 'GPSLongitudeRef',
  0x0004: 'GPSLongitude',
};

const EXIF_TYPE_SIZES: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  7: 1, // UNDEFINED
  9: 4, // SLONG
  10: 8, // SRATIONAL
};

const readExifValue = (dataView: DataView, littleEndian: boolean, valueOffset: number, type: number, count: number): string | number | boolean | null => {
  const readRational = (offset: number, signed: boolean) => {
    const numerator = signed ? dataView.getInt32(offset, littleEndian) : dataView.getUint32(offset, littleEndian);
    const denominator = signed ? dataView.getInt32(offset + 4, littleEndian) : dataView.getUint32(offset + 4, littleEndian);
    if (!denominator) return 0;
    return numerator / denominator;
  };

  if (type === 2) {
    const bytes: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const val = dataView.getUint8(valueOffset + i);
      if (val === 0) break;
      bytes.push(val);
    }
    return new TextDecoder().decode(new Uint8Array(bytes)) || null;
  }

  if (type === 3) {
    if (count === 1) return dataView.getUint16(valueOffset, littleEndian);
    const values = Array.from({ length: count }, (_, idx) => dataView.getUint16(valueOffset + idx * 2, littleEndian));
    return values.join(', ');
  }

  if (type === 4) {
    if (count === 1) return dataView.getUint32(valueOffset, littleEndian);
    const values = Array.from({ length: count }, (_, idx) => dataView.getUint32(valueOffset + idx * 4, littleEndian));
    return values.join(', ');
  }

  if (type === 5) {
    if (count === 1) return readRational(valueOffset, false);
    const values = Array.from({ length: count }, (_, idx) => readRational(valueOffset + idx * 8, false));
    return values.join(', ');
  }

  if (type === 9) {
    if (count === 1) return dataView.getInt32(valueOffset, littleEndian);
    const values = Array.from({ length: count }, (_, idx) => dataView.getInt32(valueOffset + idx * 4, littleEndian));
    return values.join(', ');
  }

  if (type === 10) {
    if (count === 1) return readRational(valueOffset, true);
    const values = Array.from({ length: count }, (_, idx) => readRational(valueOffset + idx * 8, true));
    return values.join(', ');
  }

  if (type === 1 || type === 7) {
    if (count === 1) return dataView.getUint8(valueOffset);
    const values = Array.from({ length: count }, (_, idx) => dataView.getUint8(valueOffset + idx));
    return values.join(', ');
  }

  return null;
};

const parseIfdEntries = (dataView: DataView, tiffStart: number, ifdOffset: number, littleEndian: boolean, exifMap: Record<string, string | number | boolean | null>): void => {
  if (!ifdOffset) return;
  const absoluteOffset = tiffStart + ifdOffset;
  if (absoluteOffset + 2 > dataView.byteLength) return;

  const entryCount = dataView.getUint16(absoluteOffset, littleEndian);
  for (let i = 0; i < entryCount; i += 1) {
    const entryOffset = absoluteOffset + 2 + i * 12;
    if (entryOffset + 12 > dataView.byteLength) break;

    const tag = dataView.getUint16(entryOffset, littleEndian);
    const type = dataView.getUint16(entryOffset + 2, littleEndian);
    const count = dataView.getUint32(entryOffset + 4, littleEndian);
    const typeSize = EXIF_TYPE_SIZES[type] ?? 0;
    if (!typeSize || !count) continue;

    const totalSize = typeSize * count;
    const valueOrOffset = dataView.getUint32(entryOffset + 8, littleEndian);
    const valueOffset = totalSize <= 4 ? entryOffset + 8 : tiffStart + valueOrOffset;
    if (valueOffset < 0 || valueOffset >= dataView.byteLength) continue;

    const tagName = EXIF_TAG_NAMES[tag] ?? `Tag_${tag.toString(16)}`;
    const tagValue = readExifValue(dataView, littleEndian, valueOffset, type, count);
    exifMap[tagName] = tagValue;

    if (tag === 0x8769 && typeof tagValue === 'number') {
      parseIfdEntries(dataView, tiffStart, tagValue, littleEndian, exifMap);
    }
    if (tag === 0x8825 && typeof tagValue === 'number') {
      parseIfdEntries(dataView, tiffStart, tagValue, littleEndian, exifMap);
    }
  }
};

const parseExifFromJpeg = (buffer: ArrayBuffer): Record<string, string | number | boolean | null> => {
  const dataView = new DataView(buffer);
  const exifMap: Record<string, string | number | boolean | null> = {};
  if (dataView.byteLength < 4 || dataView.getUint16(0) !== 0xffd8) return exifMap;

  let offset = 2;
  while (offset + 4 < dataView.byteLength) {
    if (dataView.getUint8(offset) !== 0xff) break;
    const marker = dataView.getUint8(offset + 1);
    const segmentLength = dataView.getUint16(offset + 2);
    if (!segmentLength) break;

    if (marker === 0xe1) {
      const exifHeaderOffset = offset + 4;
      if (exifHeaderOffset + 6 > dataView.byteLength) break;
      const exifHeader = new TextDecoder().decode(new Uint8Array(buffer, exifHeaderOffset, 6));
      if (exifHeader !== 'Exif\0\0') break;

      const tiffStart = exifHeaderOffset + 6;
      const littleEndian = dataView.getUint16(tiffStart) === 0x4949;
      const firstIfdOffset = dataView.getUint32(tiffStart + 4, littleEndian);
      parseIfdEntries(dataView, tiffStart, firstIfdOffset, littleEndian, exifMap);
      break;
    }

    offset += 2 + segmentLength;
  }

  return exifMap;
};

const readImageDimensions = (file: File): Promise<{ width: number | null; height: number | null }> =>
  new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth || null, height: image.naturalHeight || null });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });

export const readImageMetadata = async (file: File): Promise<ImageMetadata> => {
  const [dimensions, arrayBuffer] = await Promise.all([readImageDimensions(file), file.arrayBuffer()]);
  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
  const exif = isJpeg ? parseExifFromJpeg(arrayBuffer) : {};

  return {
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    width: dimensions.width,
    height: dimensions.height,
    exif,
  };
};
