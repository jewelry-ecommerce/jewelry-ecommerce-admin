import { Box, Checkbox, Stack, Typography } from '@mui/material';
import React, { useLayoutEffect, type ChangeEvent } from 'react';
import { Plus, Trash01 } from '@untitledui/icons';
import { VoucherDiscountKind, type PromotionAuthoringSchemaDefinition, type PromotionAuthoringUiSchema } from '../../../../apis';
import { CustomButton } from '../../../../components/button/custom-button';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import { SelectAllInput, SelectInput, TextDateInput, TextInput } from '../../../../components/form';
import { TextFieldUpload } from '../../../../components/text-field-upload/text-field-upload.component';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { isoToStoredDateTime, storedDateTimeToIso } from '../../../../common/utils/date-format.util';
import { StackRow, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { applySchemaDefaultsToFormValues } from './schema-component-config-form.utils';

export interface SchemaDefinitionImageUploadHandlers {
  uploading: boolean;
  error?: string | null;
  onPick: (file: File) => Promise<void>;
  onReject: (reason: string) => void;
  onClear: () => void;
}

interface PromotionSchemaDefinitionFormProps {
  schema: PromotionAuthoringSchemaDefinition | null;
  value: Record<string, unknown>;
  errors?: Record<string, string>;
  onChange: (nextValue: Record<string, unknown>) => void;
  arrayItemButtonPermission?: PageButtonPermissionProps;
  uiSchema?: PromotionAuthoringUiSchema | null;
  disabled?: boolean;
  imageUpload?: SchemaDefinitionImageUploadHandlers;
}

interface FieldProps {
  schema: PromotionAuthoringSchemaDefinition;
  value: unknown;
  path: readonly string[];
  propertyKey?: string;
  required?: boolean;
  isRoot?: boolean;
  rootValue: Record<string, unknown>;
  errors: Record<string, string>;
  onPathChange: (path: readonly string[], value: unknown) => void;
  onRootChange: (nextValue: Record<string, unknown>) => void;
  arrayItemButtonPermission?: PageButtonPermissionProps;
  uiSchemaNode?: unknown;
  disabled?: boolean;
  imageUpload?: SchemaDefinitionImageUploadHandlers;
}

const shouldSkipVoucherField = (propertyKey: string | undefined, rootValue: Record<string, unknown>): boolean => {
  if (!propertyKey) return false;
  if (propertyKey === 'maxDiscountAmount' && rootValue.discountKind !== VoucherDiscountKind.PERCENT) return true;
  return false;
};

const isRecordValue = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const joinPath = (path: readonly string[]): string => path.join('.');

const getUiWidget = (uiSchemaNode: unknown): string | undefined => {
  if (!isRecordValue(uiSchemaNode)) return undefined;
  return typeof uiSchemaNode.widget === 'string' ? uiSchemaNode.widget : undefined;
};

const getChildUiSchemaNode = (uiSchemaNode: unknown, key: string): unknown => {
  if (!isRecordValue(uiSchemaNode)) return undefined;
  return uiSchemaNode[key];
};

const isHiddenByUiSchema = (uiSchemaNode: unknown, schema: PromotionAuthoringSchemaDefinition): boolean => {
  if (schema.readOnly) return true;
  return getUiWidget(uiSchemaNode) === 'hidden';
};

const parseNumberInputValue = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/** Read form state only — do not fall back to schema.default (that desyncs UI label vs validation). */
const getPrimitiveValue = (value: unknown): string | number | boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return undefined;
};

const getDefaultForSchema = (schema: PromotionAuthoringSchemaDefinition | undefined): unknown => {
  if (!schema) return undefined;
  if (schema.default !== undefined) return schema.default;
  if (schema.type === 'object') {
    const props: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [key, child] of Object.entries(schema.properties)) {
        props[key] = getDefaultForSchema(child);
      }
    }
    return props;
  }
  if (schema.type === 'array') return [];
  if (schema.type === 'string') return '';
  if (schema.type === 'number') return undefined;
  if (schema.type === 'boolean') return false;
  return undefined;
};

const buildArrayItemValue = (itemSchema: PromotionAuthoringSchemaDefinition | undefined): unknown => {
  const next = getDefaultForSchema(itemSchema);
  if (next !== undefined) return next;
  if (itemSchema?.type === 'object') return {};
  if (itemSchema?.type === 'string') return '';
  return undefined;
};

const renderDescription = (description?: string) => {
  if (!description?.trim()) return null;
  return <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#6B7280', mt: 0.5 }}>{description}</Typography>;
};

const SchemaField: React.FC<FieldProps> = ({
  schema,
  value,
  path,
  propertyKey,
  required = false,
  isRoot = false,
  rootValue,
  errors,
  onPathChange,
  onRootChange,
  arrayItemButtonPermission,
  uiSchemaNode,
  disabled = false,
  imageUpload,
}) => {
  const pathKey = joinPath(path);
  const fieldTitle = schema.title ?? propertyKey ?? '';
  const fieldError = errors[pathKey];
  const widget = getUiWidget(uiSchemaNode);

  if (isHiddenByUiSchema(uiSchemaNode, schema)) {
    return null;
  }

  if (schema.type === 'object') {
    const objectValue = isRecordValue(value) ? value : {};
    const requiredKeys = new Set(schema.required ?? []);
    const entries = Object.entries(schema.properties ?? {});

    const content = (
      <Stack>
        {entries.length === 0 ? (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Không có trường cấu hình.</Typography>
        ) : (
          entries
            .filter(([key]) => !isRoot || !shouldSkipVoucherField(key, rootValue))
            .map(([key, childSchema]) => (
              <SchemaField
                key={`${pathKey}:${key}`}
                schema={childSchema}
                value={objectValue[key]}
                path={[...path, key]}
                propertyKey={key}
                required={requiredKeys.has(key)}
                rootValue={rootValue}
                errors={errors}
                onPathChange={onPathChange}
                onRootChange={onRootChange}
                arrayItemButtonPermission={arrayItemButtonPermission}
                uiSchemaNode={getChildUiSchemaNode(uiSchemaNode, key)}
                disabled={disabled}
                imageUpload={imageUpload}
              />
            ))
        )}
      </Stack>
    );

    if (isRoot || entries.length === 0) return content;

    return <Box>{content}</Box>;
  }

  if (schema.type === 'array') {
    const items = Array.isArray(value) ? value : [];
    const itemEnum = schema.items && 'enum' in schema.items ? schema.items.enum : undefined;
    const itemEnumNames = schema.items && 'enumNames' in schema.items ? schema.items.enumNames : undefined;
    const useMultiSelect = Boolean(itemEnum?.length) || widget === 'multi-select';

    if (useMultiSelect && itemEnum?.length) {
      const optionList = itemEnum.map((option, index) => ({
        value: String(option),
        label: itemEnumNames?.[index] ?? String(option),
      }));

      return (
        <Box>
          <SelectAllInput
            label={fieldTitle}
            requiredMark={required}
            value={items.map(String)}
            options={optionList}
            placeholder={fieldTitle ? `Chọn ${fieldTitle.toLowerCase()}` : undefined}
            disabled={disabled}
            error={Boolean(fieldError)}
            errorMessage={fieldError}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const nextValue = event.target.value;
              onPathChange(path, Array.isArray(nextValue) ? nextValue : []);
            }}
            fullWidth
          />
          {renderDescription(schema.description)}
        </Box>
      );
    }

    const handleRemoveItem = (index: number) => {
      onPathChange(
        path,
        items.filter((_, currentIndex) => currentIndex !== index),
      );
    };

    return (
      <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 1.5, bgcolor: '#FFF' }}>
        <Box sx={{ mb: 1.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>
            {fieldTitle}
            {required ? (
              <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                *
              </Box>
            ) : null}
          </Typography>
          {renderDescription(schema.description)}
          {fieldError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#EF4444', mt: 0.5 }}>{fieldError}</Typography> : null}
        </Box>

        <Stack spacing={1.25}>
          {items.map((item, index) => {
            const itemPath = [...path, String(index)];

            return (
              <Box key={joinPath(itemPath)} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 1.25, bgcolor: '#FCFCFD' }}>
                <StackRowAlignCenterJustBetween sx={{ gap: 1, mb: 1.25 }}>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.semibold, color: '#344054' }}>{schema.items?.title?.trim() || `${fieldTitle} #${index + 1}`}</Typography>
                  <CustomButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    onClick={() => handleRemoveItem(index)}
                    disabled={disabled}
                    sx={{ minWidth: 36, px: 0.75, py: 0.5 }}
                    aria-label={`Xóa ${fieldTitle} #${index + 1}`}
                    {...arrayItemButtonPermission}
                  >
                    <Trash01 size={16} />
                  </CustomButton>
                </StackRowAlignCenterJustBetween>

                {schema.items ? (
                  <SchemaField
                    schema={schema.items}
                    value={item}
                    path={itemPath}
                    propertyKey={propertyKey}
                    rootValue={rootValue}
                    errors={errors}
                    onPathChange={onPathChange}
                    onRootChange={onRootChange}
                    isRoot={schema.items.type === 'object'}
                    arrayItemButtonPermission={arrayItemButtonPermission}
                    disabled={disabled}
                    imageUpload={imageUpload}
                  />
                ) : (
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#98A2B3' }}>Chưa có định nghĩa phần tử cho mảng này.</Typography>
                )}
              </Box>
            );
          })}

          <CustomButton
            type="button"
            variant="outline"
            fullWidth={false}
            onClick={() => onPathChange(path, [...items, buildArrayItemValue(schema.items)])}
            disabled={disabled || !schema.items}
            sx={{ alignSelf: 'flex-start', px: 1.5, py: 0.75 }}
            {...arrayItemButtonPermission}
          >
            <Plus size={16} style={{ marginRight: 6 }} />
            Thêm phần tử
          </CustomButton>
        </Stack>
      </Box>
    );
  }

  if (schema.type === 'boolean') {
    const checked = Boolean(getPrimitiveValue(value));

    return (
      <Box>
        <StackRow sx={{ alignItems: 'flex-start', gap: 1 }}>
          <Checkbox checked={checked} disabled={disabled} onChange={(event) => onPathChange(path, event.target.checked)} sx={{ pt: 0.25 }} size="small" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>
              {fieldTitle}
              {required ? (
                <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                  *
                </Box>
              ) : null}
            </Typography>
            {renderDescription(schema.description)}
            {fieldError ? <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#EF4444', mt: 0.5 }}>{fieldError}</Typography> : null}
          </Box>
        </StackRow>
      </Box>
    );
  }

  if (widget === 'image-upload' && schema.type === 'string' && imageUpload) {
    const imageUrl = typeof value === 'string' ? value : '';
    return (
      <Stack spacing={1}>
        <TextFieldUpload
          label={fieldTitle}
          value={imageUrl}
          onChange={(nextUrl) => onPathChange(path, nextUrl)}
          onPickFile={imageUpload.onPick}
          onFileReject={imageUpload.onReject}
          disabled={disabled || imageUpload.uploading}
          error={Boolean(fieldError || imageUpload.error)}
          errorMessage={fieldError ?? imageUpload.error ?? undefined}
          accept="image"
          previewMode="image"
        />
        {imageUrl ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CustomButton
              fullWidth={false}
              disabled={disabled || imageUpload.uploading}
              onClick={imageUpload.onClear}
              variant="outline"
              sx={{ textTransform: 'none', color: '#344054', borderColor: '#D0D5DD', minWidth: 88, fontSize: 13 }}
            >
              Xóa ảnh
            </CustomButton>
          </Box>
        ) : null}
      </Stack>
    );
  }

  if (schema.enum && schema.enum.length > 0) {
    const optionList = schema.enum.map((option, index) => ({
      value: option,
      label: schema.enumNames?.[index] ?? String(option),
    }));

    return (
      <SelectInput
        label={fieldTitle}
        requiredMark={required}
        value={getPrimitiveValue(value) ?? ''}
        placeholder={`Chọn ${fieldTitle.toLowerCase()}`}
        options={optionList}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === '') {
            onPathChange(path, undefined);
            return;
          }
          onPathChange(path, schema.type === 'number' ? Number(raw) : raw);
        }}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
      />
    );
  }

  if (schema.type === 'string' && schema.format === 'date-time') {
    const isoValue = typeof value === 'string' ? value : '';
    return (
      <Box>
        <TextDateInput
          label={fieldTitle}
          requiredMark={required}
          mode="dateTime"
          placeholder={`Chọn ${fieldTitle.toLowerCase()}`}
          value={isoToStoredDateTime(isoValue)}
          disabled={disabled}
          onChange={(next) => onPathChange(path, next.trim() ? storedDateTimeToIso(next) : undefined)}
          error={Boolean(fieldError)}
          errorMessage={fieldError}
        />
        {renderDescription(schema.description)}
      </Box>
    );
  }

  const isPercentDiscountValue = propertyKey === 'discountValue' && rootValue.discountKind === 'PERCENT';
  const numberInputProps = schema.type === 'number' ? { min: isPercentDiscountValue ? 1 : schema.minimum, max: isPercentDiscountValue ? 100 : schema.maximum } : undefined;
  const isGroupedNumber = schema.type === 'number' && !isPercentDiscountValue && (schema.format === 'currency' || schema.format === 'integer');

  return (
    <Box>
      <TextInput
        label={fieldTitle}
        requiredMark={required}
        value={getPrimitiveValue(value) ?? ''}
        type={schema.type === 'number' ? 'number' : 'text'}
        nativeNumberInput={isPercentDiscountValue}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value;
          if (schema.type === 'number') {
            if (isPercentDiscountValue) {
              if (next === '') {
                onPathChange(path, undefined);
                return;
              }
              const parsed = Number(next);
              if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) return;
              onPathChange(path, parsed);
              return;
            }
            onPathChange(path, parseNumberInputValue(next));
            return;
          }
          onPathChange(path, next);
        }}
        error={Boolean(fieldError)}
        errorMessage={fieldError}
        inputProps={numberInputProps}
        numericThousandSeparator={isGroupedNumber ? '.' : ''}
        numericDecimalSeparator={isGroupedNumber ? ',' : '.'}
        numericAllowedDecimalSeparators={isGroupedNumber ? [',', '.'] : undefined}
        numericDecimalScale={schema.type === 'number' && schema.format === 'integer' ? 0 : undefined}
      />
      {renderDescription(schema.description)}
    </Box>
  );
};

const setAtPath = (obj: Record<string, unknown>, p: readonly string[], val: unknown): Record<string, unknown> => {
  if (p.length === 0) return isRecordValue(val) ? val : {};
  const [head, ...rest] = p;
  const index = Number(head);
  if (!Number.isNaN(index) && Array.isArray(obj)) {
    const copy = [...obj];
    copy[index] = rest.length > 0 && isRecordValue(copy[index]) ? setAtPath(copy[index] as Record<string, unknown>, rest, val) : val;
    return copy as unknown as Record<string, unknown>;
  }
  const current = obj[head];
  const nextValue = rest.length === 0 ? val : setAtPath(isRecordValue(current) ? current : {}, rest, val);

  return {
    ...obj,
    [head]: nextValue,
  };
};

const authoringValuesEqual = (left: Record<string, unknown>, right: Record<string, unknown>): boolean => JSON.stringify(left) === JSON.stringify(right);

export const PromotionSchemaDefinitionForm: React.FC<PromotionSchemaDefinitionFormProps> = ({
  schema,
  value,
  errors = {},
  onChange,
  arrayItemButtonPermission,
  uiSchema = null,
  disabled = false,
  imageUpload,
}) => {
  useLayoutEffect(() => {
    if (!schema || schema.type !== 'object') return;
    const hydrated = applySchemaDefaultsToFormValues(schema, value);
    if (authoringValuesEqual(hydrated, value)) return;
    onChange(hydrated);
  }, [schema, value, onChange]);

  if (!schema) {
    return (
      <Box sx={{ border: '1px dashed #D0D5DD', borderRadius: 2, p: 1.5, bgcolor: '#FCFCFD' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Chưa có định nghĩa cấu hình; không có trường để nhập.</Typography>
      </Box>
    );
  }

  if (schema.type !== 'object') {
    return (
      <Box sx={{ border: '1px dashed #D0D5DD', borderRadius: 2, p: 1.5, bgcolor: '#FCFCFD' }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Cấu hình gốc không hợp lệ. Vui lòng liên hệ quản trị hệ thống.</Typography>
      </Box>
    );
  }

  const handleRootChange = (nextValue: Record<string, unknown>) => {
    onChange(nextValue);
  };

  const handlePathChange = (path: readonly string[], nextValue: unknown) => {
    let nextConfig = setAtPath(value, path, nextValue);
    if (!isRecordValue(nextConfig)) {
      onChange({});
      return;
    }

    if (path.length === 1 && path[0] === 'discountKind') {
      nextConfig = { ...nextConfig, discountValue: undefined };
      if (nextValue !== VoucherDiscountKind.PERCENT) {
        nextConfig = { ...nextConfig, maxDiscountAmount: undefined };
      }
    }

    onChange(nextConfig);
  };

  return (
    <Stack>
      <SchemaField
        schema={schema}
        value={value}
        path={[]}
        rootValue={value}
        errors={errors}
        onPathChange={handlePathChange}
        onRootChange={handleRootChange}
        isRoot
        arrayItemButtonPermission={arrayItemButtonPermission}
        uiSchemaNode={uiSchema}
        disabled={disabled}
        imageUpload={imageUpload}
      />
    </Stack>
  );
};
