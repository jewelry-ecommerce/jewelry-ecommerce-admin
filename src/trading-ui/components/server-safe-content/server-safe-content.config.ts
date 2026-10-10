import type { Config } from 'dompurify';

/** Whitelist tag phù hợp rich text CMS/CKEditor — không cho phép SVG, style, form, media nhúng. */
export const SERVER_SAFE_HTML_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'ins',
  'sub',
  'sup',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'div',
  'span',
  'hr',
] as const;

/** Chỉ attribute cần thiết cho rich text — không có style, id, hay event handler. */
export const SERVER_SAFE_HTML_ALLOWED_ATTR = ['class', 'href', 'src', 'alt', 'title', 'target', 'rel', 'width', 'height', 'loading', 'colspan', 'rowspan', 'start', 'type', 'value'] as const;

/** Chặn scheme nguy hiểm; cho phép https/mailto/tel và URL tương đối nội bộ. */
export const SERVER_SAFE_HTML_ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|\/|\.\/|\.\.\/|#)(?:[^\s"'<>()]|$)/i;

export const SERVER_SAFE_HTML_FORBID_TAGS = [
  'style',
  'svg',
  'math',
  'iframe',
  'form',
  'template',
  'noscript',
  'script',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'video',
  'audio',
  'source',
  'track',
  'frame',
  'frameset',
  'applet',
] as const;

export const SERVER_SAFE_HTML_FORBID_ATTR = [
  'style',
  'onerror',
  'onload',
  'onclick',
  'onmouseover',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
  'oninput',
  'onkeydown',
  'onkeyup',
  'onkeypress',
  'onanimationend',
  'onanimationstart',
  'formaction',
  'xlink:href',
  'xmlns',
] as const;

export const SERVER_SAFE_HTML_PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [...SERVER_SAFE_HTML_ALLOWED_TAGS, '#text'],
  ALLOWED_ATTR: [...SERVER_SAFE_HTML_ALLOWED_ATTR],
  /** Không truyền ALLOWED_URI_REGEXP vào DOMPurify — v3.4 áp dụng lên cả `target` và strip `_blank`. Validate href/src trong hook. */
  FORBID_TAGS: [...SERVER_SAFE_HTML_FORBID_TAGS],
  FORBID_ATTR: [...SERVER_SAFE_HTML_FORBID_ATTR],
  ADD_ATTR: ['target'],
  /** false: không promote nội dung từ tag bị cấm; kết hợp '#text' để giữ text hợp lệ. */
  KEEP_CONTENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

/** Tag bị cấm — xóa cả subtree, không promote con ra ngoài (vd. img trong noscript). */
export const SERVER_SAFE_HTML_FORBID_SUBTREE_TAGS = new Set(['noscript', 'template', 'iframe', 'form', 'svg', 'math', 'script', 'style']);
