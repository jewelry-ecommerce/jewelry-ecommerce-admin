import React from 'react';
import { CustomButton } from '../../../../components/button/custom-button';
import { CmsPageWizardFooter } from './cms-page-wizard-footer.component';
import { contentCmsPagesButtonPermission } from '../../content-permission.constants';

export interface CmsPageWizardStepActionsProps {
  leftLabel: string;
  onLeft: () => void;
  onSave: () => void;
  onContinue: () => void;
  loadingSave: boolean;
  loadingContinue: boolean;
  saveLabel?: string;
  continueLabel?: string;
  viewMode?: boolean;
}

export const CmsPageWizardStepActions: React.FC<CmsPageWizardStepActionsProps> = ({
  leftLabel,
  onLeft,
  onSave,
  onContinue,
  loadingSave,
  loadingContinue,
  saveLabel = 'Lưu',
  continueLabel = 'Tiếp tục',
  viewMode = false,
}) => {
  const busy = loadingSave || loadingContinue;

  return (
    <CmsPageWizardFooter
      left={
        <CustomButton
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={onLeft}
          disabled={busy}
          sx={{ px: 3 }}
          {...contentCmsPagesButtonPermission('wizard_back', leftLabel, 'api_cms_page_detail')}
        >
          {leftLabel}
        </CustomButton>
      }
      right={
        viewMode ? (
          <CustomButton
            type="button"
            variant="primary"
            fullWidth={false}
            onClick={onContinue}
            disabled={busy}
            sx={{ px: 3, minWidth: 120 }}
            {...contentCmsPagesButtonPermission('continue', continueLabel, 'api_cms_page_detail')}
          >
            {continueLabel}
          </CustomButton>
        ) : (
          <React.Fragment>
            <CustomButton
              type="button"
              variant="outline"
              fullWidth={false}
              onClick={onSave}
              disabled={busy}
              sx={{ px: 3, minWidth: 100 }}
              {...contentCmsPagesButtonPermission('save', saveLabel, 'api_cms_page_update')}
            >
              {saveLabel}
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              fullWidth={false}
              onClick={onContinue}
              disabled={busy}
              sx={{ px: 3, minWidth: 120 }}
              {...contentCmsPagesButtonPermission('continue', continueLabel, 'api_cms_page_update')}
            >
              {continueLabel}
            </CustomButton>
          </React.Fragment>
        )
      }
    />
  );
};
