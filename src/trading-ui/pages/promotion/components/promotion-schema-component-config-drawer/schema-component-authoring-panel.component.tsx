import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ComponentKind, type SingleObjectDefinitionV2 } from '../../../../apis';
import { CustomButton } from '../../../../components/button';
import { SelectInput } from '../../../../components/form';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { PageButtonPermissionProps } from '../../../../permissions/page-button-permission.utils';
import type { SchemaComponentDrawerKind, SchemaComponentValidationErrors } from './promotion-schema-component-config-drawer.types';
import { getOptionTitle, hasNoUserFields } from './schema-component-config-form.utils';
import { SingleObjectAuthoringRenderer } from './single-object-authoring-renderer.component';
import React from 'react';

interface SchemaComponentAuthoringPanelProps {
  componentKind: SchemaComponentDrawerKind;
  options: SingleObjectDefinitionV2[];
  optionsLoading: boolean;
  optionsError: string | null;
  selectedOptionIndex: number;
  selectedOption: SingleObjectDefinitionV2 | null;
  formValues: Record<string, unknown>;
  validationErrors: SchemaComponentValidationErrors;
  saveError: string | null;
  onSelectOption: (index: number) => void;
  onFormValuesChange: (nextValues: Record<string, unknown>) => void;
  onRetryOptions: () => void;
  arrayItemButtonPermission?: PageButtonPermissionProps;
}

export const SchemaComponentAuthoringPanel = ({
  componentKind,
  options,
  optionsLoading,
  optionsError,
  selectedOptionIndex,
  selectedOption,
  formValues,
  validationErrors,
  onSelectOption,
  onFormValuesChange,
  onRetryOptions,
  arrayItemButtonPermission,
}: SchemaComponentAuthoringPanelProps) => {
  const isConditionMode = componentKind === ComponentKind.CONDITION;
  const optionLabel = isConditionMode ? 'Loại điều kiện' : 'Loại ưu đãi';

  return <Stack sx={{ p: 2 }}>{renderOptionContent()}</Stack>;

  function renderOptionContent(): ReactNode {
    if (optionsLoading) return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Đang tải cấu hình...</Typography>;
    if (optionsError) return renderOptionsError();
    if (options.length === 0) return <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>Không có tùy chọn cấu hình nào khả dụng cho loại hình thức khuyến mãi này.</Typography>;

    return (
      <React.Fragment>
        {options.length > 1 ? renderOptionSelector() : null}
        {selectedOption ? renderSelectedOption() : null}
      </React.Fragment>
    );
  }

  function renderOptionsError(): ReactNode {
    return (
      <Box sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: 2, p: 1.5 }}>
        <Stack spacing={1.25}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#B91C1C' }}>Không thể tải cấu hình: {optionsError}</Typography>
          <Box>
            <CustomButton
              variant="outline"
              fullWidth={false}
              onClick={onRetryOptions}
              sx={{ textTransform: 'none', color: '#B42318', borderColor: '#FDA29B', minWidth: 112, '&:hover': { bgcolor: '#FEF2F2' } }}
            >
              Thử lại
            </CustomButton>
          </Box>
        </Stack>
      </Box>
    );
  }

  function renderOptionSelector(): ReactNode {
    return (
      <SelectInput
        label={optionLabel}
        value={selectedOptionIndex >= 0 ? String(selectedOptionIndex) : ''}
        options={options.map((option, index) => ({ value: String(index), label: getOptionTitle(option) }))}
        onChange={(event) => onSelectOption(Number(event.target.value))}
        placeholder="Chọn loại"
      />
    );
  }

  function renderSelectedOption(): ReactNode {
    if (!selectedOption) return null;
    return (
      <React.Fragment>
        {selectedOption.description ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{selectedOption.description}</Typography> : null}
        {hasNoUserFields(selectedOption.configSchema) ? renderNoFieldNotice() : renderDefinitionForm()}
      </React.Fragment>
    );
  }

  function renderNoFieldNotice(): ReactNode {
    return (
      <Box sx={{ bgcolor: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 2, p: 1.5 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>
          {isConditionMode ? 'Điều kiện này luôn được áp dụng, không cần cấu hình thêm.' : 'Không có trường cấu hình nào.'}
        </Typography>
      </Box>
    );
  }

  function renderDefinitionForm(): ReactNode {
    if (!selectedOption) return null;
    return (
      <SingleObjectAuthoringRenderer
        definition={selectedOption}
        values={formValues}
        validationErrors={validationErrors}
        arrayItemButtonPermission={arrayItemButtonPermission}
        onValuesChange={onFormValuesChange}
      />
    );
  }
};
