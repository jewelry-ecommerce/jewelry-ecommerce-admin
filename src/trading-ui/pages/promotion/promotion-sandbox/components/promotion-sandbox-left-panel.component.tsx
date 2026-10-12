import { Box, Stack, Typography } from '@mui/material';
import type { PromotionDraft } from '../../../../apis';
import { SANDBOX_COLUMN_BODY_SX, SANDBOX_COLUMN_HEADER_SX, SANDBOX_COLUMN_SX, SANDBOX_SECTION_TITLE_SX } from '../sandbox-panel.shared';
import { SandboxSimulationConfigSlot } from './sandbox-simulation-config-slot.component';

export interface PromotionSandboxLeftPanelProps {
  promotions: readonly PromotionDraft[];
}

export const PromotionSandboxLeftPanel = ({ promotions }: PromotionSandboxLeftPanelProps) => (
  <Stack sx={SANDBOX_COLUMN_SX}>
    <Box sx={SANDBOX_COLUMN_HEADER_SX}>
      <Typography sx={SANDBOX_SECTION_TITLE_SX}>Thiết lập giả lập</Typography>
    </Box>
    <Stack sx={{ ...SANDBOX_COLUMN_BODY_SX, gap: 1.5 }}>
      <SandboxSimulationConfigSlot promotions={promotions} />
    </Stack>
  </Stack>
);
