import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Box, type SxProps, type Theme } from '@mui/material';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';

export interface QRCodeComponentProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
  sx?: SxProps<Theme>;
  onRendered?: (dataUrl: string) => void;
}

export const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ value, size = 100, backgroundColor = '#FFFFFF', foregroundColor = '#000000', errorCorrectionLevel = 'M', sx, onRendered }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    QRCode.toCanvas(
      canvas,
      value,
      {
        width: size,
        margin: 1,
        color: { dark: foregroundColor, light: backgroundColor },
        errorCorrectionLevel,
      },
      (error: Error | null | undefined) => {
        if (error) {
          console.error('QR Code generation error:', error);
          return;
        }
        if (onRendered) onRendered(canvas.toDataURL('image/png'));
      },
    );
  }, [value, size, backgroundColor, foregroundColor, errorCorrectionLevel, onRendered]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
    </Box>
  );
};
