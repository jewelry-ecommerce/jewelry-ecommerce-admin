/** Giới hạn upload ảnh (MB) — khu vực Nội dung & hiển thị (CMS, label, site layout). */
export const CONTENT_DISPLAY_UPLOAD_MAX_FILE_MB = 5;
export const CONTENT_DISPLAY_UPLOAD_MAX_FILE_BYTES = CONTENT_DISPLAY_UPLOAD_MAX_FILE_MB * 1024 * 1024;

/** Giới hạn khi slot nhận video / file media lẫn (banner video, media-upload…). */
export const CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB = 50;
export const CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_BYTES = CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB * 1024 * 1024;

/** Nhận mọi định dạng ảnh; chỉ giới hạn dung lượng. */
export const CONTENT_DISPLAY_IMAGE_ACCEPT = 'image/*';

export const CONTENT_DISPLAY_IMAGE_UPLOAD_HINT = `Hỗ trợ mọi định dạng ảnh (tối đa ${CONTENT_DISPLAY_UPLOAD_MAX_FILE_MB}MB)`;

export const CONTENT_DISPLAY_MEDIA_UPLOAD_HINT = `Hỗ trợ ảnh, video, PDF và các định dạng file khác (tối đa ${CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB}MB)`;

export const CONTENT_DISPLAY_VIDEO_UPLOAD_HINT = `Hỗ trợ video (tối đa ${CONTENT_DISPLAY_VIDEO_UPLOAD_MAX_FILE_MB}MB)`;
