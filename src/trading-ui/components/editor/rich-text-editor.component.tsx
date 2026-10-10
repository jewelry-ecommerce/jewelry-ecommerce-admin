import { Box, FormControl, Stack, Typography } from '@mui/material';
import { ClassicEditorBridge } from './classic-editor.bridge';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formLabelSx } from '../form/form-field.styles';
import '../../styles/ckeditor.css';
import { hasPendingEditorUploads } from './ckeditor-pending-uploads.util';
import { registerEditorHtmlSanitize, type CkEditorSanitizeInstance } from './ckeditor-sanitize.plugin';
import { sanitizeEditorHtml } from './editor-html-sanitize.util';
import { getRichTextEditorConfig } from './ckeditor.config';

type RichTextEditorProps = {
  label: string;
  requiredMark?: boolean;
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  minHeight?: number;
  /** Ẩn toolbar — chỉ gõ text + Enter xuống dòng. */
  textOnly?: boolean;
};

type CkEditorInstance = CkEditorSanitizeInstance & {
  plugins: CkEditorSanitizeInstance['plugins'];
};

export const RichTextEditor = ({ label, requiredMark = false, value = '', onChange, error = false, errorMessage, disabled = false, minHeight = 200, textOnly = false }: RichTextEditorProps) => {
  const onChangeRef = useRef(onChange);
  const editorRef = useRef<CkEditorInstance | null>(null);
  /** data prop chỉ dùng lần mount — không bind theo value mỗi render. */
  const [initialData] = useState(() => sanitizeEditorHtml(value));
  /** HTML đã emit ra form — tránh echo value → data.set() trong lúc gõ/upload. */
  const lastEmittedHtmlRef = useRef(initialData);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editorConfig = useMemo(() => (textOnly ? { toolbar: [] } : getRichTextEditorConfig()), [textOnly]);

  const handleEditorReady = useCallback((editor: CkEditorSanitizeInstance) => {
    editorRef.current = editor as CkEditorInstance;
    registerEditorHtmlSanitize(editor);
  }, []);

  const handleEditorChange = useCallback((_: unknown, editor: CkEditorSanitizeInstance) => {
    // Chỉ đẩy HTML sang form. Không setData lại vào editor (kể cả sau sanitize).
    const clean = sanitizeEditorHtml(editor.getData());
    lastEmittedHtmlRef.current = clean;
    onChangeRef.current(clean);
  }, []);

  // Đồng bộ value từ ngoài (reset form / load bản ghi) — bỏ qua khi đang upload.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const next = sanitizeEditorHtml(value);
    if (next === lastEmittedHtmlRef.current) {
      return;
    }
    if (hasPendingEditorUploads(editor)) {
      return;
    }
    if (editor.getData() === next) {
      lastEmittedHtmlRef.current = next;
      return;
    }

    editor.setData(next);
    lastEmittedHtmlRef.current = next;
  }, [value]);

  return (
    <FormControl fullWidth error={error} disabled={disabled}>
      <Typography sx={formLabelSx}>
        {label}
        {requiredMark ? (
          <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
            *
          </Box>
        ) : null}
      </Typography>
      <Stack
        sx={{
          border: `1px solid ${error ? '#DC2626' : disabled ? '#D1D5DB' : '#E5E7EB'}`,
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: disabled ? '#E5E7EB' : '#FFFFFF',
          pointerEvents: disabled ? 'none' : 'auto',
          '& .ck-toolbar': {
            display: disabled || textOnly ? 'none' : undefined,
          },
          '& .ck-editor__editable': {
            minHeight,
            bgcolor: disabled ? '#E5E7EB' : '#FFFFFF',
            color: disabled ? '#6B7280' : undefined,
          },
        }}
      >
        <Box sx={{ px: 0.5, pt: 0.5 }}>
          <ClassicEditorBridge data={initialData} disabled={disabled} onReady={handleEditorReady} onChange={handleEditorChange} config={editorConfig} />
        </Box>
      </Stack>
      {error && errorMessage ? <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5 }}>{errorMessage}</Typography> : null}
    </FormControl>
  );
};
