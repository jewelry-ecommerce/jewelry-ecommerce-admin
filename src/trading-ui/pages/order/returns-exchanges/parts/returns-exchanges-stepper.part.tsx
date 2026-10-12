import { CheckRounded } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { sxRoot, sxStepCircle, sxConnector, STEP_LABEL_BY_ID } from '../../../../common/constant/order/order.constants';

type ReturnExchangeFlowStep = 1 | 2 | 3;

export interface ReturnExchangeStepperPartProps {
  step: ReturnExchangeFlowStep;
}

export const ReturnExchangeStepperPart = ({ step }: ReturnExchangeStepperPartProps) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" gap={2.5} sx={sxRoot}>
      {[1, 2, 3].map((n) => {
        const current = n as ReturnExchangeFlowStep;
        const isDone = current < step;
        const isActive = current === step;
        return (
          <Stack key={current} direction="row" alignItems="center" gap={1.25}>
            <Box sx={sxStepCircle(isDone, isActive)}>{isDone ? <CheckRounded sx={{ fontSize: 16 }} /> : current}</Box>
            <Typography
              sx={{
                ...TYPOGRAPHY_STYLES.base.medium,
                color: isActive ? '#101828' : '#98A2B3',
              }}
            >
              {STEP_LABEL_BY_ID[current]}
            </Typography>
            {current < 3 ? <Box sx={sxConnector(step > current)} /> : null}
          </Stack>
        );
      })}
    </Stack>
  );
};
