// Actions/footer ported from trading-admin CMS, using the local button adapter.
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import { CmsPageWizardFooter } from "./cms-page-wizard-footer.component";
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
function ForwardActions(props: CmsPageWizardStepActionsProps) {
  const busy = props.loadingSave || props.loadingContinue;
  return (
    <>
      {!props.viewMode && (
        <CustomButton
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={props.onSave}
          disabled={busy}
          sx={{ px: 3, minWidth: 100 }}
        >
          {props.saveLabel || "Lưu"}
        </CustomButton>
      )}
      <CustomButton
        type="button"
        variant="primary"
        fullWidth={false}
        onClick={props.onContinue}
        disabled={busy}
        sx={{ px: 3, minWidth: 120 }}
      >
        {props.continueLabel || "Tiếp tục"}
      </CustomButton>
    </>
  );
}
export function CmsPageWizardStepActions(props: CmsPageWizardStepActionsProps) {
  return (
    <CmsPageWizardFooter
      left={
        <CustomButton
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={props.onLeft}
          disabled={props.loadingSave || props.loadingContinue}
          sx={{ px: 3 }}
        >
          {props.leftLabel}
        </CustomButton>
      }
      right={<ForwardActions {...props} />}
    />
  );
}
