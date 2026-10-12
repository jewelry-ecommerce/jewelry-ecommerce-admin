import { Box, Tooltip, type TooltipProps } from '@mui/material';
import React, { type ReactElement } from 'react';
import { XClose } from '@untitledui/icons';

export interface TooltipOnHoverComponentProps extends Partial<Omit<TooltipProps, 'content'>> {
  openTest?: boolean;
  content: ReactElement | string;
  showCloseIcon?: boolean;
  onCloseClick?: () => void;
  disabled?: boolean;
  leaveDelay?: number;
}

export const TooltipOnHoverComponent: React.FC<TooltipOnHoverComponentProps> = ({
  openTest = false,
  placement = 'top',
  content,
  showCloseIcon = false,
  onCloseClick,
  children,
  onOpen,
  onClose,
  disabled = false,
  leaveDelay = 400,
  ...rest
}) => {
  if (disabled) {
    return <Box component="span">{children}</Box>;
  }
  return (
    <Tooltip
      leaveDelay={leaveDelay}
      PopperProps={{ disablePortal: false }}
      placement={placement}
      onClose={onClose}
      onOpen={onOpen}
      title={
        <Box sx={{ position: 'relative' }}>
          {showCloseIcon && (
            <Box sx={{ position: 'absolute', top: 2, right: 0, cursor: 'pointer' }} onClick={onCloseClick}>
              <XClose color="#737373" size={20} />
            </Box>
          )}
          <Box sx={{ pr: showCloseIcon ? 2 : 0 }}>{content}</Box>
        </Box>
      }
      disableFocusListener
      // disableTouchListener
      {...(openTest && {
        disableHoverListener: openTest,
        open: openTest,
      })}
      sx={{
        zIndex: 100,
        maxWidth: 200,
      }}
      {...rest}
    >
      <Box component="span">{children}</Box>
    </Tooltip>
  );
};
