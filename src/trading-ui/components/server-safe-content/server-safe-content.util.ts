import DOMPurify from 'isomorphic-dompurify';
import { SERVER_SAFE_HTML_ALLOWED_URI_REGEXP, SERVER_SAFE_HTML_FORBID_SUBTREE_TAGS, SERVER_SAFE_HTML_PURIFY_CONFIG } from './server-safe-content.config';

const EVENT_HANDLER_ATTR_PATTERN = /^on/i;
const DANGEROUS_URI_PATTERN = /^\s*(?:javascript|data(?:\s*%3a|:)|vbscript)\s*:/i;

let hooksRegistered = false;

function isSafeUri(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }
  return SERVER_SAFE_HTML_ALLOWED_URI_REGEXP.test(normalized) && !DANGEROUS_URI_PATTERN.test(normalized);
}

function registerSanitizeHooks(): void {
  if (hooksRegistered) {
    return;
  }

  hooksRegistered = true;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (!SERVER_SAFE_HTML_FORBID_SUBTREE_TAGS.has(data.tagName)) {
      return;
    }

    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  });

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    const attrName = data.attrName.toLowerCase();

    if (EVENT_HANDLER_ATTR_PATTERN.test(attrName)) {
      data.attrValue = '';
      data.keepAttr = false;
      return;
    }

    if (attrName === 'href' || attrName === 'src') {
      if (!isSafeUri(data.attrValue)) {
        data.attrValue = '';
        data.keepAttr = false;
      }
    }
  });

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const tagName = node.tagName?.toUpperCase() ?? '';

    if (tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }

    if (tagName === 'IMG' && !node.getAttribute('src')?.trim()) {
      node.parentNode?.removeChild(node);
    }

    if (tagName === 'VIDEO') {
      const src = node.getAttribute('src') ?? '';
      if (!src.trim() || DANGEROUS_URI_PATTERN.test(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });
}

registerSanitizeHooks();

/**
 * Sanitize HTML từ API/CMS trước khi render qua dangerouslySetInnerHTML.
 * Luôn truyền config thứ hai — không dùng default của DOMPurify.
 */
export function sanitizeHtml(rawHtml: string): string {
  const input = rawHtml?.trim() ?? '';
  if (!input) {
    return '';
  }

  return DOMPurify.sanitize(input, SERVER_SAFE_HTML_PURIFY_CONFIG);
}
