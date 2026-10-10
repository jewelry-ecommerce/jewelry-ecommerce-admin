import type { ChangeEvent } from 'react';

const SCRIPT_BLOCK_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const SCRIPT_OPEN_PATTERN = /<script\b[^>]*>/gi;
const DANGEROUS_TAG_PATTERN = /<\/?(?:script|iframe|object|embed|svg|math|form|template|noscript|style|link|meta|base|frame|frameset)\b[^>]*>/gi;
const EVENT_HANDLER_PATTERN = /\bon[a-z]+\s*=/gi;
const DANGEROUS_URI_PATTERN = /(?:javascript|vbscript)\s*:|data\s*:\s*text\/html/gi;

/** Loại bỏ payload XSS/JS phổ biến khỏi plain text input. */
export function sanitizePlainTextInput(value: string): string {
  if (!value) {
    return value;
  }

  return value
    .replace(SCRIPT_BLOCK_PATTERN, '')
    .replace(SCRIPT_OPEN_PATTERN, '')
    .replace(DANGEROUS_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(DANGEROUS_URI_PATTERN, '')
    .replace(/<[^>]*>/g, '');
}

export function shouldSanitizeTextInputType(type?: string, nativeNumberInput?: boolean): boolean {
  if (nativeNumberInput) {
    return false;
  }

  const normalizedType = type?.toLowerCase() ?? 'text';
  return normalizedType !== 'number' && normalizedType !== 'password' && normalizedType !== 'hidden' && normalizedType !== 'file';
}

export function sanitizeTextInputChangeEvent<E extends HTMLInputElement | HTMLTextAreaElement>(event: ChangeEvent<E>): ChangeEvent<E> {
  const sanitized = sanitizePlainTextInput(event.target.value);
  if (sanitized === event.target.value) {
    return event;
  }

  event.target.value = sanitized;
  return event;
}

export function sanitizeControlledTextInputValue(value: unknown, type?: string, nativeNumberInput?: boolean): unknown {
  if (!shouldSanitizeTextInputType(type, nativeNumberInput)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  return sanitizePlainTextInput(value);
}
