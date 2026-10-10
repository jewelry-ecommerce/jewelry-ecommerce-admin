import { sanitizePlainTextInput } from '../form/input-sanitize.util';
import { sanitizeEditorHtml } from './editor-html-sanitize.util';

type ClipboardDataTransfer = {
  getData: (type: string) => string;
  setData: (type: string, data: string) => void;
};

export type CkEditorSanitizeInstance = {
  getData: () => string;
  setData: (data: string) => void;
  editing: {
    view: {
      document: {
        on: (event: string, callback: (event: unknown, data?: unknown) => void, options?: { priority?: "highest" | "high" | "normal" | "low" | "lowest" }) => void;
      };
    };
  };
  plugins: {
    get: (name: string) => {
      on: (event: string, callback: (event: unknown, data?: unknown) => void, options?: { priority?: "highest" | "high" | "normal" | "low" | "lowest" }) => void;
      loaders?: Iterable<{ status?: string }>;
    };
  };
};

const looksLikeHtmlPayload = (value: string): boolean => /<\s*\/?[a-z][\s\S]*>/i.test(value) || /\bon[a-z]+\s*=/i.test(value);

function sanitizeClipboardTransfer(dataTransfer: ClipboardDataTransfer): void {
  const htmlContent = dataTransfer.getData('text/html');
  const plainContent = dataTransfer.getData('text/plain');

  if (htmlContent) {
    dataTransfer.setData('text/html', sanitizeEditorHtml(htmlContent));
  }

  if (plainContent && looksLikeHtmlPayload(plainContent)) {
    const sanitizedPlain = sanitizePlainTextInput(plainContent);
    dataTransfer.setData('text/plain', sanitizedPlain);
    if (!htmlContent || htmlContent !== sanitizeEditorHtml(htmlContent)) {
      dataTransfer.setData('text/html', sanitizeEditorHtml(sanitizedPlain));
    }
  }
}

/**
 * Sanitize clipboard khi paste (XSS).
 * Không gắn change:data → setData — sẽ abort FileLoader đang upload (crash isFulfilled).
 */
export function registerEditorHtmlSanitize(editor: CkEditorSanitizeInstance): void {
  editor.editing.view.document.on(
    'clipboardInput',
    (_evt, data) => {
      const payload = data as { dataTransfer?: ClipboardDataTransfer } | undefined;
      if (payload?.dataTransfer) {
        sanitizeClipboardTransfer(payload.dataTransfer);
      }
    },
    { priority: 'highest' },
  );

  editor.plugins.get('ClipboardPipeline').on(
    'inputTransformation',
    (_evt, data) => {
      const payload = data as { dataTransfer?: ClipboardDataTransfer } | undefined;
      if (payload?.dataTransfer) {
        sanitizeClipboardTransfer(payload.dataTransfer);
      }
    },
    { priority: 'highest' },
  );
}
