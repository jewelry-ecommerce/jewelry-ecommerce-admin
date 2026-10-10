import { InsertDriveFileOutlined } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { useId, type ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { formLabelSx } from '../form/form-field.styles';
import { StackAlignCenter, StackAlignJustCenter, StackRowAlignCenter } from '../styled';
import { Trash01, Upload01 } from '@untitledui/icons';
import { TextFieldUploadProcess } from './text-field-upload-process.element';

import { useTextFieldUpload } from './use-text-field-upload.hook';
import { type UploadAcceptKeyword, isLikelyVideoPreviewValue } from './text-field-upload.utils';
import { TEXT_FIELD_UPLOAD_ACCEPT_EXCEL, TEXT_FIELD_UPLOAD_ACCEPT_WORD, TEXT_FIELD_UPLOAD_ACCEPT_PDF, TEXT_FIELD_UPLOAD_ACCEPT_OFFICE_DOCS } from './text-field-upload.utils';

export { TEXT_FIELD_UPLOAD_ACCEPT_EXCEL, TEXT_FIELD_UPLOAD_ACCEPT_WORD, TEXT_FIELD_UPLOAD_ACCEPT_PDF, TEXT_FIELD_UPLOAD_ACCEPT_OFFICE_DOCS };

export interface TextFieldUploadProps {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  /** Khi truyền: tự upload và tự set `value` ngoài component. */
  onPickFile?: (file: File) => Promise<void> | void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  requiredMark?: boolean;
  accept?: UploadAcceptKeyword | string;
  maxFileSizeBytes?: number;
  onFileReject?: (reason: string) => void;
  hintText?: string;
  /** Tên file hiển thị khi `value` không phải ảnh (data URL / URL khác) */
  fileLabel?: string;
  previewMode?: 'auto' | 'image' | 'file';
  emptyPrimary?: ReactNode;
  processing?: boolean;
  processingProgress?: number;
  processingTitle?: string;
  processingSubtitle?: string;
  onClear?: () => void;
  clearLabel?: string;
}

const defaultEmptyPrimary = (openPicker: () => void, disabled: boolean) => (
  <Typography sx={{ ...TYPOGRAPHY_STYLES.md.medium, color: '#101828', textAlign: 'center' }}>
    Kéo thả file vào đây hoặc{' '}
    <Link
      component="button"
      type="button"
      variant="body2"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) openPicker();
      }}
      underline="always"
      sx={{
        ...TYPOGRAPHY_STYLES.md.medium,
        color: '#1D4ED8',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      chọn file
    </Link>
  </Typography>
);

export const TextFieldUpload = (props: TextFieldUploadProps) => {
  const {
    label,
    value,
    onPickFile,
    disabled = false,
    error = false,
    errorMessage,
    requiredMark = false,
    hintText = 'PNG, JPG, GIF, WebP, SVG — MP4, WebM, MOV (tối đa 50MB)',
    fileLabel,
    emptyPrimary,
    processing: processingControlled = false,
    processingTitle,
    processingSubtitle,
    onClear,
    clearLabel = 'Xóa file',
  } = props;

  const inputId = useId();
  const { inputRef, showProcess, processProgress, pickedFileName, hasValue, blockInteraction, shouldShowImagePreview, openPicker, onInputChange, onDrop, resolvedAccept } = useTextFieldUpload({
    ...props,
    onPickFile,
  });

  return (
    <Box sx={{ width: '100%' }}>
      {label ? (
        <Typography id={`${inputId}-label`} sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}

      <Box sx={{ position: 'relative' }}>
        <StackAlignCenter
          role="button"
          tabIndex={blockInteraction ? -1 : 0}
          aria-disabled={blockInteraction}
          aria-busy={showProcess}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          onClick={() => {
            if (blockInteraction) return;
            openPicker();
          }}
          onKeyDown={(e) => {
            if (blockInteraction) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={onDrop}
          sx={{
            border: error ? '1px dashed #EF4444' : '1px dashed #D1D5DB',
            borderRadius: '14px',
            p: 3,
            gap: 1.5,
            cursor: blockInteraction ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            opacity: disabled ? 0.6 : 1,
            minHeight: 160,
            justifyContent: 'center',
          }}
        >
          {showProcess ? (
            <TextFieldUploadProcess
              progress={processProgress}
              title={processingTitle ?? (!processingControlled && showProcess ? 'Đang xử lý file' : undefined)}
              subtitle={processingSubtitle ?? (!processingControlled && showProcess ? 'Hệ thống đang đọc file, vui lòng đợi...' : undefined)}
              sx={{ py: 1 }}
            />
          ) : hasValue ? (
            shouldShowImagePreview ? (
              isLikelyVideoPreviewValue(value) ? (
                <Box
                  component="video"
                  src={value}
                  controls
                  muted
                  playsInline
                  sx={{
                    width: '100%',
                    maxHeight: 180,
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={value}
                  alt=""
                  sx={{
                    width: '100%',
                    maxHeight: 180,
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              )
            ) : (
              <StackRowAlignCenter
                gap={1.5}
                sx={{
                  py: 1.5,
                  px: 2,
                  maxWidth: '100%',
                  borderRadius: '8px',
                  bgcolor: '#F3F4F6',
                  alignSelf: 'stretch',
                }}
              >
                <InsertDriveFileOutlined sx={{ color: '#6B7280', fontSize: 28, flexShrink: 0 }} />
                <Typography noWrap title={fileLabel ?? pickedFileName ?? undefined} sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#111827', minWidth: 0 }}>
                  {fileLabel ?? pickedFileName ?? 'Đã chọn file'}
                </Typography>
              </StackRowAlignCenter>
            )
          ) : (
            <StackAlignCenter sx={{ gap: 2 }}>
              <StackAlignJustCenter
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '999px',
                  bgcolor: '#F3F4F6',
                  color: '#4A5565',
                }}
              >
                <Upload01 size={32} />
              </StackAlignJustCenter>

              <StackAlignCenter sx={{ gap: 0 }}>
                {emptyPrimary ?? defaultEmptyPrimary(openPicker, disabled)}
                <Typography
                  sx={{
                    ...TYPOGRAPHY_STYLES.base.regular,
                    color: '#6A7282',
                    textAlign: 'center',
                  }}
                >
                  {hintText}
                </Typography>
              </StackAlignCenter>
            </StackAlignCenter>
          )}
        </StackAlignCenter>
        {hasValue && onClear ? (
          <Trash01
            aria-label={clearLabel}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }}
            size={16}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              cursor: 'pointer',
              color: '#344054',
              backgroundColor: '#FFF',
              borderRadius: '50%',
              padding: 4,
              boxSizing: 'content-box',
            }}
          />
        ) : null}
      </Box>

      <Box
        component="input"
        id={inputId}
        ref={inputRef}
        type="file"
        accept={!resolvedAccept || resolvedAccept === '*/*' ? undefined : resolvedAccept}
        disabled={disabled || showProcess}
        onChange={onInputChange}
        sx={{ display: 'none' }}
      />

      {error && errorMessage ? (
        <Typography
          sx={{
            fontSize: 12,
            color: '#EF4444',
            mt: 0.5,
          }}
        >
          {errorMessage}
        </Typography>
      ) : null}
    </Box>
  );
};
