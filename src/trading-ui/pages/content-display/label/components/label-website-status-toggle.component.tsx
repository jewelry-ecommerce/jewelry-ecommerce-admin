import { HighlightStatusToggle } from '../../../../components/switch/highlight-status-toggle.component';

type LabelWebsiteStatusToggleProps = {
  readonly active: boolean;
  readonly onActiveChange?: (active: boolean) => void;
  readonly disabled?: boolean;
  readonly name?: string;
  readonly readOnly?: boolean;
  readonly statusLabel?: string;
};

export const LabelWebsiteStatusToggle = ({ active, onActiveChange, disabled, name = 'status', readOnly = false, statusLabel }: LabelWebsiteStatusToggleProps) => (
  <HighlightStatusToggle label="Hiển thị lên website" checked={active} onCheckedChange={onActiveChange} disabled={disabled} name={name} readOnly={readOnly} statusLabel={statusLabel} />
);
