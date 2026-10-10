import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  DEFAULT_MAX_FILE_SIZE,
  fileMatchesAccept,
  fileToDataUrlWithProgress,
  formatMaxLabel,
  isLikelyImagePreviewValue,
  isLikelyVideoPreviewValue,
  resolveAccept,
  type UploadAcceptKeyword,
} from './text-field-upload.utils';

export interface UseTextFieldUploadProps {
  value: string;
  onChange: (next: string) => void;
  /** Khi truyền: caller tự xử lý upload và set `value` ngoài; hook chỉ quản lý pick/drag + loading. */
  onPickFile?: (file: File) => Promise<void> | void;
  disabled?: boolean;
  accept?: UploadAcceptKeyword | string;
  maxFileSizeBytes?: number;
  onFileReject?: (reason: string) => void;
  previewMode?: 'auto' | 'image' | 'file';
  processing?: boolean;
  processingProgress?: number;
}

export const useTextFieldUpload = ({
  value,
  onChange,
  onPickFile,
  disabled = false,
  accept,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE,
  onFileReject,
  previewMode = 'auto',
  processing: processingControlled = false,
  processingProgress: processingProgressControlled = 0,
}: UseTextFieldUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedAccept = resolveAccept(accept);

  const [internalProcessing, setInternalProcessing] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const showProcess = processingControlled || internalProcessing;
  const processProgress = processingControlled ? processingProgressControlled : internalProgress;
  const resolvedPickedFileName = value ? pickedFileName : null;

  const handlePickFile = async (file: File) => {
    if (maxFileSizeBytes !== undefined && file.size > maxFileSizeBytes) {
      onFileReject?.(`Dung lượng file vượt quá ${formatMaxLabel(maxFileSizeBytes)}`);
      return;
    }
    if (resolvedAccept && !fileMatchesAccept(file, resolvedAccept)) {
      onFileReject?.('Định dạng file không được hỗ trợ');
      return;
    }
    setInternalProcessing(true);
    setInternalProgress(0);
    try {
      setPickedFileName(file.name);
      if (onPickFile) {
        await onPickFile(file);
        return;
      }
      const dataUrl = await fileToDataUrlWithProgress(file, setInternalProgress);
      onChange(dataUrl);
    } catch {
      onFileReject?.('Không đọc được file');
    } finally {
      setInternalProcessing(false);
      setInternalProgress(0);
    }
  };

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handlePickFile(file);
    e.target.value = '';
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    if (disabled || showProcess) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handlePickFile(file);
  };

  const hasValue = Boolean(value);
  const blockInteraction = disabled || showProcess;
  const shouldShowImagePreview = previewMode === 'image' || (previewMode === 'auto' && (isLikelyImagePreviewValue(value) || isLikelyVideoPreviewValue(value)));

  return {
    inputRef,
    showProcess,
    processProgress,
    pickedFileName: resolvedPickedFileName,
    hasValue,
    blockInteraction,
    shouldShowImagePreview,
    openPicker,
    onInputChange,
    onDrop,
    internalProcessing,
    resolvedAccept,
  };
};
