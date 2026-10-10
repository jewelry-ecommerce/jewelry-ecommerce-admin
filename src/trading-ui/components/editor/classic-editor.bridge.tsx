import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import type { ComponentType } from 'react';
import type { CkEditorSanitizeInstance } from './ckeditor-sanitize.plugin';
import type { getRichTextEditorConfig } from './ckeditor.config';
interface ClassicEditorBridgeProps {
  data: string;
  disabled: boolean;
  onReady: (editor: CkEditorSanitizeInstance) => void;
  onChange: (event: unknown, editor: CkEditorSanitizeInstance) => void;
  config: ReturnType<typeof getRichTextEditorConfig> | { toolbar: string[] };
}
interface LegacyEditorComponentProps extends ClassicEditorBridgeProps {
  editor: typeof ClassicEditor;
}
// The source uses the v41 prebuilt editor with the v11 React wrapper. Both expose
// these lifecycle/data methods; the wrapper's current Editor generic is for a
// newer core. Keep that version boundary here, rather than suppressing every
// prop with "never" inside the CMS form. No editor configuration is altered.
const LegacyEditorComponent = CKEditor as unknown as ComponentType<LegacyEditorComponentProps>;
export function ClassicEditorBridge(props: ClassicEditorBridgeProps) {
  return <LegacyEditorComponent {...props} editor={ClassicEditor} />;
}
