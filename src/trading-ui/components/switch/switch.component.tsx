import { useTheme } from '@mui/material';
import React from 'react';
import { motion, MotionConfig } from 'framer-motion';

export interface SwitchComponentProps {
  name?: string;
  value: boolean;
  onChange?: (event: { target: { name?: string; value: boolean } }) => void;
  disabled?: boolean;
}

export const SwitchComponent: React.FC<SwitchComponentProps> = ({ name, value = false, onChange, disabled = false }) => {
  const { palette } = useTheme();

  const change = () => {
    onChange?.({ target: { name, value: !value } });
  };

  return (
    <MotionConfig transition={{ duration: 0.2, ease: 'easeOut' }}>
      <motion.div
        className="switch"
        initial={false}
        animate={{
          backgroundColor: value ? '#111827' : palette.text.disabled,
        }}
        onClick={disabled ? undefined : change}
        style={{
          display: 'flex',
          justifyContent: value ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          width: '30px',
          height: '14px',
          padding: '3px',
          borderRadius: '10px',
          boxSizing: 'content-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <motion.div layout className="handle" style={{ background: '#FFF', aspectRatio: 1, height: '100%', borderRadius: '50%' }} />
      </motion.div>
    </MotionConfig>
  );
};
