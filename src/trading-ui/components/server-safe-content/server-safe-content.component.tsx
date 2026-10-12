import { Box, type BoxProps } from '@mui/material';
import { forwardRef, useMemo } from 'react';
import { sanitizeHtml } from './server-safe-content.util';

interface ServerSafeContentProps extends Omit<BoxProps, 'children' | 'dangerouslySetInnerHTML'> {
  rawHtml: string;
}

/**
 * Render HTML từ API sau khi sanitize.
 *
 * Sanitize chạy lại mỗi lần render (server + client) để giảm rủi ro mutation XSS
 * khi jsdom (SSR) và DOM thật (hydration) parse khác nhau.
 */
export const ServerSafeContent = forwardRef<HTMLElement, ServerSafeContentProps>(function ServerSafeContent({ rawHtml, ...boxProps }, ref) {
  const cleanHtml = useMemo(() => sanitizeHtml(rawHtml), [rawHtml]);

  if (!cleanHtml) {
    return <Box ref={ref} {...boxProps} />;
  }

  return <Box ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cleanHtml }} {...boxProps} />;
});
