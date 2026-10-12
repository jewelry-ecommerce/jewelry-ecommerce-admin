import { useCallback } from 'react';
import { StackRowJustEnd } from '../../../../components/styled';
import { ComponentKind, type PromotionDraftSchemaComponentsResponseDto } from '../../../../apis';
import { CustomButton } from '../../../../components/button';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { promotionListButtonPermission, promotionSchemaEditPermission } from '../../promotion-permission.constants';
import { SchemaComponentAuthoringPanel } from './schema-component-authoring-panel.component';
import type { SchemaComponentDrawerKind } from './promotion-schema-component-config-drawer.types';
import { useSchemaComponentAuthoring } from './use-schema-component-authoring.hook';

interface SchemaComponentConfigDrawerProps {
  open: boolean;
  componentKind: SchemaComponentDrawerKind;
  schemaName: string;
  draftId: string;
  schemaId: string;
  initialComponents?: PromotionDraftSchemaComponentsResponseDto | null;
  saving: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SchemaComponentConfigDrawer = ({ open, componentKind, schemaName, draftId, schemaId, initialComponents, saving: parentSaving, onClose, onSaved }: SchemaComponentConfigDrawerProps) => {
  const { showSnackbar } = useSnackbar();

  const notifyError = useCallback(
    (message: string) => {
      showSnackbar({ message, type: SnackbarType.ERROR });
    },
    [showSnackbar],
  );

  const authoring = useSchemaComponentAuthoring({
    open,
    componentKind,
    draftId,
    schemaId,
    initialComponents,
    onError: notifyError,
  });

  const saving = parentSaving || authoring.saving;
  const saveButtonLabel = saving ? 'Đang lưu...' : 'Lưu cấu hình';
  const handleSave = async () => {
    const savedComponent = await authoring.save();
    if (!savedComponent) return;
    onSaved();
  };

  return (
    <DrawerComponent
      open={open}
      onClose={onClose}
      title={componentKind === ComponentKind.CONDITION ? 'Cấu hình điều kiện' : 'Cấu hình ưu đãi'}
      subtitle={schemaName}
      width={680}
      footer={
        <StackRowJustEnd spacing={1.5}>
          <CustomButton variant="outline" fullWidth={false} onClick={onClose} sx={{ textTransform: 'none', color: '#344054', borderColor: '#D0D5DD', minWidth: 112 }}>
            Đóng
          </CustomButton>
          <CustomButton
            fullWidth={false}
            disabled={saving || !authoring.selectedOption}
            onClick={() => void handleSave()}
            sx={{ textTransform: 'none', bgcolor: '#101828', boxShadow: 'none', minWidth: 156, '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' } }}
            {...promotionListButtonPermission('edit', 'Lưu cấu hình', 'api_promotion_draft_update')}
          >
            {saveButtonLabel}
          </CustomButton>
        </StackRowJustEnd>
      }
    >
      <SchemaComponentAuthoringPanel
        componentKind={componentKind}
        options={authoring.options}
        optionsLoading={authoring.optionsLoading}
        optionsError={authoring.optionsError}
        selectedOptionIndex={authoring.selectedOptionIndex}
        selectedOption={authoring.selectedOption}
        formValues={authoring.formValues}
        validationErrors={authoring.validationErrors}
        saveError={authoring.saveError}
        onSelectOption={authoring.selectOption}
        onFormValuesChange={authoring.updateFormValues}
        onRetryOptions={authoring.retryOptions}
        arrayItemButtonPermission={promotionSchemaEditPermission('Thêm phần tử')}
      />
    </DrawerComponent>
  );
};
