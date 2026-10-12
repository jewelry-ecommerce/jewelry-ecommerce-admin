import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CreateBlockTypeDto } from '../../../../apis';
import type { CmsBlockSchemaDefinition } from '../../../../apis/cms/cms-schema-definition.interface';
import { DialogComponent } from '../../../../components/dialog/dialog.component';
import { TextInput } from '../../../../components/form';
import { SwitchContentElement } from '../../../../components/switch/switch-content.element';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { isCmsBlockSchemaDefinition } from '../utils/cms-block-schema.utils';

interface BlockTypeFormValues {
  code: string;
  name: string;
  schemaDefinitionJson: string;
  isActive: boolean;
}

const parseSchemaDefinitionJson = (raw: string): CmsBlockSchemaDefinition | null | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('JSON cấu hình không hợp lệ');
  }

  if (!isCmsBlockSchemaDefinition(parsed)) {
    throw new Error('JSON cấu hình phải là schema hợp lệ (object có trường type)');
  }

  return parsed;
};

const blockTypeFormSchema: yup.ObjectSchema<BlockTypeFormValues> = yup
  .object({
    code: yup
      .string()
      .trim()
      .required('Vui lòng nhập mã loại khối')
      .matches(/^[A-Z0-9_]+$/, 'Chỉ dùng A-Z, số và dấu gạch dưới (_)'),
    name: yup.string().trim().required('Vui lòng nhập tên loại khối'),
    schemaDefinitionJson: yup.string().trim().default(''),
    isActive: yup.boolean().required(),
  })
  .required();

const DEFAULT_FORM_VALUES: BlockTypeFormValues = {
  code: '',
  name: '',
  schemaDefinitionJson: '',
  isActive: true,
};

export interface CmsPageWizardDialogBlockTypeProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateBlockTypeDto) => Promise<void>;
}

export const CmsPageWizardDialogBlockType: React.FC<CmsPageWizardDialogBlockTypeProps> = ({ open, loading, onClose, onSubmit }) => {
  const { showSnackbar } = useSnackbar();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockTypeFormValues>({
    resolver: yupResolver(blockTypeFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onSubmit',
  });

  const handleClose = () => {
    reset(DEFAULT_FORM_VALUES);
    onClose();
  };

  const submitForm = handleSubmit(async (values) => {
    try {
      const schemaDefinition = parseSchemaDefinitionJson(values.schemaDefinitionJson);
      await onSubmit({
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        schemaDefinition,
        isActive: values.isActive,
      });
      handleClose();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    }
  });

  return (
    <DialogComponent
      title="Tạo loại khối mới"
      open={open}
      onClose={handleClose}
      maxWidth="md"
      buttonLeft={{
        content: 'Hủy',
        variant: 'outlined',
        onClick: handleClose,
        disabled: loading,
      }}
      buttonRight={{
        content: 'Tạo loại khối',
        variant: 'contained',
        onClick: submitForm,
        disabled: loading,
        loading,
      }}
    >
      <Stack gap={2}>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Box>
              <TextInput label="Mã loại khối" requiredMark value={field.value} placeholder="BANNER" onChange={field.onChange} error={Boolean(errors.code)} errorMessage={errors.code?.message} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>VD: BANNER, TOP_LINE_BANNER, PRODUCT_CAROUSEL (viết HOA, dùng dấu gạch dưới).</Typography>
            </Box>
          )}
        />

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Tên loại khối"
              requiredMark
              value={field.value}
              placeholder="Banner Quảng Cáo Hình Ảnh"
              onChange={field.onChange}
              error={Boolean(errors.name)}
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          name="schemaDefinitionJson"
          control={control}
          render={({ field }) => (
            <Box>
              <TextInput
                label="Cấu hình schema (JSON)"
                value={field.value}
                placeholder='{"type":"object","properties":{...}}'
                onChange={field.onChange}
                multiline
                minRows={8}
                error={Boolean(errors.schemaDefinitionJson)}
                errorMessage={errors.schemaDefinitionJson?.message}
              />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>
                Tùy chọn. Để trống nếu chưa cần schema; nhập JSON tùy chỉnh nếu muốn định nghĩa form cấu hình khối.
              </Typography>
            </Box>
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => <SwitchContentElement content="Kích hoạt ngay" name={field.name} value={Boolean(field.value)} onChange={(event) => field.onChange(Boolean(event?.target?.value))} />}
        />
      </Stack>
    </DialogComponent>
  );
};
