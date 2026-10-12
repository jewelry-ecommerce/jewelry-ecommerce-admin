import { Box, CircularProgress, Step, StepButton, StepLabel, Stepper, type StepIconProps, type StepperProps } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { Check } from '@untitledui/icons';

export type StepperComponentItem = {
  label: ReactNode;
  optional?: ReactNode;
  id?: string;
  completed?: boolean;
  /** When true on the active step, show a spinner instead of the step number. */
  loading?: boolean;
};

const STEP_ICON_SIZE = 32;

type StepperIconExtraProps = StepIconProps & { loading?: boolean };

const StepperComponentIcon = (props: StepperIconExtraProps) => {
  const { active, completed, className, icon, loading } = props;
  const isCompletedStyle = completed && !loading;

  return (
    <Box
      className={className}
      sx={{
        width: STEP_ICON_SIZE,
        height: STEP_ICON_SIZE,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...TYPOGRAPHY_STYLES.sm.regular,
        fontWeight: active ? 600 : 500,
        bgcolor: isCompletedStyle ? '#0F9D58' : active || loading ? '#0F172A' : '#EAECF0',
        color: isCompletedStyle || active || loading ? '#FFFFFF' : '#6A7282',
        border: 'none',
        boxSizing: 'border-box',
      }}
    >
      {loading ? (
        <CircularProgress size={16} thickness={5} sx={{ color: '#fff' }} />
      ) : completed && active ? (
        <EditOutlinedIcon sx={{ fontSize: 16, color: '#000' }} />
      ) : completed ? (
        <Check size={16} color="#fff" />
      ) : (
        icon
      )}
    </Box>
  );
};

const buildLabelSx = (alternativeLabel: boolean) => ({
  // Nhãn cùng hàng với số: căn giữa theo trục dọc; nếu `alternativeLabel` thì dải số+ nhãn dọc, cho margin nhỏ
  '& .MuiStepLabel-root': {
    alignItems: 'center',
    padding: 0,
  },
  '& .MuiStepLabel-label': {
    ...TYPOGRAPHY_STYLES.sm.regular,
    color: '#6A7282',
    fontWeight: 500,
    mt: alternativeLabel ? 0.5 : 0,
  },
  '& .MuiStepLabel-label.Mui-active': {
    color: '#101828',
    fontWeight: 600,
  },
  '& .MuiStepLabel-label.Mui-completed': {
    color: '#0F9D58',
    fontWeight: 500,
  },
  '& .MuiStepLabel-optional': {
    ...TYPOGRAPHY_STYLES.xs.regular,
    color: '#98A2B3',
  },
});

export type StepperComponentProps = {
  activeStep: number;
  steps: readonly StepperComponentItem[];
  orientation?: StepperProps['orientation'];
  alternativeLabel?: boolean;
  nonLinear?: boolean;
  markOtherStepsCompleted?: boolean;
  onStepClick?: (stepIndex: number) => void;
  connector?: StepperProps['connector'];
  sx?: StepperProps['sx'];
  className?: string;
  'aria-label'?: string;
  id?: string;
};

export const StepperComponent = ({
  activeStep,
  steps,
  orientation = 'horizontal',
  alternativeLabel = false,
  nonLinear = false,
  markOtherStepsCompleted = false,
  onStepClick,
  connector,
  sx,
  className,
  'aria-label': ariaLabel = 'Quy trình từng bước',
  id,
}: StepperComponentProps) => {
  const labelSx = buildLabelSx(alternativeLabel);
  const canClickStep = nonLinear && Boolean(onStepClick);

  return (
    <Stepper
      id={id}
      className={className}
      activeStep={activeStep}
      nonLinear={canClickStep}
      alternativeLabel={alternativeLabel}
      orientation={orientation}
      connector={connector}
      aria-label={ariaLabel}
      sx={[
        {
          width: '100%',
          ...labelSx,
          '& .MuiStepConnector-line': {
            borderColor: '#EAECF0',
            borderTopWidth: 2,
          },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
            borderColor: '#0F9D58',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {steps.map((s, index) => {
        const key = s.id ?? (typeof s.label === 'string' ? s.label : `step-${index}`);
        const isLoading = Boolean(s.loading);
        const isCompleted = s.completed ?? (markOtherStepsCompleted ? index !== activeStep : index < activeStep);
        const stepLabel = (
          <StepLabel optional={s.optional} StepIconComponent={(iconProps) => <StepperComponentIcon {...iconProps} loading={isLoading} />}>
            {s.label}
          </StepLabel>
        );

        if (!canClickStep) {
          return (
            <Step key={key} completed={isCompleted && !isLoading}>
              {stepLabel}
            </Step>
          );
        }

        return (
          <Step key={key} completed={isCompleted && !isLoading}>
            <StepButton color="inherit" onClick={() => onStepClick?.(index)} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
              {stepLabel}
            </StepButton>
          </Step>
        );
      })}
    </Stepper>
  );
};
