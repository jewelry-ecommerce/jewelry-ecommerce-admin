import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box, type SxProps, type Theme } from '@mui/material';

export interface BarcodeComponentProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  sx?: SxProps<Theme>;
  onRendered?: (svgString: string) => void;
}

export const BarcodeComponent: React.FC<BarcodeComponentProps> = ({ value, format = 'CODE128', width = 2, height = 100, displayValue = true, fontSize = 20, sx, onRendered }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    const svg = svgRef.current;
    try {
      JsBarcode(svg, value, { format, width, height, displayValue, fontSize, margin: 10 });
      if (onRendered) {
        const serializer = new XMLSerializer();
        onRendered(serializer.serializeToString(svg));
      }
    } catch (error) {
      console.error('Barcode generation error:', error);
    }
  }, [value, format, width, height, displayValue, fontSize, onRendered]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', ...sx }}>
      <svg ref={svgRef} />
    </Box>
  );
};
