import { Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';
import { SwitchContentElement } from '../../../../../components/switch/switch-content.element';
import type { NavigationFormState } from '../site-navigation.interface';

export type NavigationFormDisplaySectionProps = {
  fieldsDisabled?: boolean;
  form: NavigationFormState;
  menuPopupLocked: boolean;
  updateForm: <K extends keyof NavigationFormState>(key: K, value: NavigationFormState[K]) => void;
};

export const NavigationFormDisplaySection = ({ fieldsDisabled = false, form, menuPopupLocked, updateForm }: NavigationFormDisplaySectionProps) => (
  <Stack gap={1.5} sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', p: 2, bgcolor: '#FFFFFF' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>Cấu hình hiển thị</Typography>
    <StackRowAlignCenterJustBetween
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        px: 2,
        py: 1.5,
        bgcolor: menuPopupLocked ? '#F9FAFB' : '#FFFFFF',
      }}
    >
      <Stack>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>Hiển thị trên menu xổ xuống</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Từ cấp 4 trở đi hệ thống tự tắt và khóa cờ này.</Typography>
      </Stack>
      <SwitchContentElement
        content={menuPopupLocked ? 'Tắt' : form.showOnMenuPopup ? 'Bật' : 'Tắt'}
        value={!menuPopupLocked && form.showOnMenuPopup}
        disabled={menuPopupLocked || fieldsDisabled}
        onChange={(event) => updateForm('showOnMenuPopup', Boolean(event?.target?.value))}
      />
    </StackRowAlignCenterJustBetween>
    <StackRowAlignCenterJustBetween sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', px: 2, py: 1.5 }}>
      <Stack>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#111827' }}>Hiển thị trên thanh trượt danh mục</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#667085' }}>Áp dụng cho mọi cấp trong cây menu điều hướng.</Typography>
      </Stack>
      <SwitchContentElement content={form.showOnPlp ? 'Bật' : 'Tắt'} value={form.showOnPlp} disabled={fieldsDisabled} onChange={(event) => updateForm('showOnPlp', Boolean(event?.target?.value))} />
    </StackRowAlignCenterJustBetween>
    <SwitchContentElement
      content={form.openInNewTab ? 'Mở đường dẫn ở tab mới' : 'Mở đường dẫn cùng tab'}
      value={form.openInNewTab}
      disabled={fieldsDisabled}
      onChange={(event) => updateForm('openInNewTab', Boolean(event?.target?.value))}
    />
  </Stack>
);
