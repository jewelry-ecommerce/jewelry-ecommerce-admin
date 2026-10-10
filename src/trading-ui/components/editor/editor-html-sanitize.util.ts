import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';
import {
  SERVER_SAFE_HTML_ALLOWED_ATTR,
  SERVER_SAFE_HTML_ALLOWED_TAGS,
  SERVER_SAFE_HTML_ALLOWED_URI_REGEXP,
  SERVER_SAFE_HTML_FORBID_TAGS,
  SERVER_SAFE_HTML_PURIFY_CONFIG,
} from '../server-safe-content/server-safe-content.config';

const DANGEROUS_URI_PATTERN = /^\s*(?:javascript|data(?:\s*%3a|:)|vbscript)\s*:/i;

/** Tag CKEditor sinh ra hợp lệ — không mở thêm vector XSS. */
const CKEDITOR_EXTRA_TAGS = ['figure', 'figcaption', 'mark', 'video'] as const;

const CKEDITOR_EXTRA_ATTR = ['controls', 'playsinline'] as const;

const EDITOR_FORBID_TAGS = SERVER_SAFE_HTML_FORBID_TAGS.filter((tag) => tag !== 'video' && tag !== 'audio' && tag !== 'source');

export const EDITOR_HTML_PURIFY_CONFIG: Config = {
  ...SERVER_SAFE_HTML_PURIFY_CONFIG,
  ALLOWED_TAGS: [...SERVER_SAFE_HTML_ALLOWED_TAGS, ...CKEDITOR_EXTRA_TAGS, '#text'],
  ALLOWED_ATTR: [...SERVER_SAFE_HTML_ALLOWED_ATTR, ...CKEDITOR_EXTRA_ATTR],
  FORBID_TAGS: [...EDITOR_FORBID_TAGS],
};

function isSafeMediaSrc(src: string): boolean {
  const normalized = src.trim();
  if (!normalized) {
    return false;
  }
  return SERVER_SAFE_HTML_ALLOWED_URI_REGEXP.test(normalized) && !DANGEROUS_URI_PATTERN.test(normalized);
}

/** DOMPurify hook không luôn gỡ được thẻ media rỗng — xử lý thêm sau sanitize. */
function stripUnsafeMediaTags(html: string): string {
  const withoutUnsafeVideo = html.replace(/<video\b[^>]*>[\s\S]*?<\/video>/gi, (block) => {
    const srcMatch = block.match(/\ssrc=["']([^"']*)["']/i);
    return srcMatch && isSafeMediaSrc(srcMatch[1]) ? block : '';
  });

  return withoutUnsafeVideo.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\ssrc=["']([^"']*)["']/i);
    if (!srcMatch || !isSafeMediaSrc(srcMatch[1])) {
      return '';
    }
    if (/\bon[a-z]+\s*=/i.test(tag)) {
      return '';
    }
    return tag;
  });
}

/** Fallback string-level strip nếu payload còn sót sau DOMPurify. */
function stripResidualXssPatterns(html: string): string {
  return html
    .replace(/\bon[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
}

/**
 * Sanitize HTML từ CKEditor trước khi lưu form / gửi API.
 * Dùng whitelist rộng hơn render (figure, video...) nhưng vẫn chặn script/event/style.
 */
export function sanitizeEditorHtml(rawHtml: string): string {
  const input = rawHtml?.trim() ?? '';
  if (!input) {
    return '';
  }

  return stripResidualXssPatterns(stripUnsafeMediaTags(DOMPurify.sanitize(input, EDITOR_HTML_PURIFY_CONFIG)));
}

/**
 * Sanitize HTML hiện tại của editor (cho form/save).
 * Không gọi setData — đẩy HTML ngược vào editor đang upload sẽ abort FileLoader (crash isFulfilled).
 */
export function applySanitizedEditorContent(editor: { getData: () => string; setData: (data: string) => void }): string {
  return sanitizeEditorHtml(editor.getData());
}
