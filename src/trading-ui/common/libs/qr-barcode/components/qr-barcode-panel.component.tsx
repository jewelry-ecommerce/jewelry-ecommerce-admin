import { ContentCopy } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { ButtonIconElement, COLOR, StackRow, StackRowAlignCenterJustBetween, STYLE, TypographyOneLine } from '@/trading-ui/adapters/library';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { WMS_COMMON } from '../../../constant/ware-house/wms-palette.constant';
import { copyTextToClipboard, getCopyFailureMessage, getCopySuccessMessage } from '../../../utils';
import { downloadBarcodeWithText, downloadQRCodeWithText, printBarcode, printQRCode } from '../qr-barcode.utils';
import { BarcodeComponent } from './barcode.component';
import { QRCodeComponent } from './qr-code.component';

interface CardProps {
  title: string;
  onDownload?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
  children: React.ReactNode;
}

const CodeCard: React.FC<CardProps> = ({ title, onDownload, onPrint, onCopy, children }) => (
  <Box
    sx={{
      width: '100%',
      borderRadius: STYLE.BORDER_RADIUS_ELEMENT_MIDDLE,
      border: `1px solid ${COLOR.NEUTRAL[300]}`,
      background: `linear-gradient(180deg, ${COLOR.STATUS.successBg} 0%, ${COLOR.NEUTRAL[50]} 50%)`,
      overflow: 'hidden',
    }}
  >
    <Box sx={{ p: 1.5 }}>
      <StackRowAlignCenterJustBetween gap={1.5}>
        <TypographyOneLine content={title} sx={{ fontSize: 14, fontWeight: 500, color: WMS_COMMON.deep_blue, letterSpacing: '0.15px' }} />
        <StackRow gap={0.75}>
          {onCopy && (
            <IconButton
              className="nodrag"
              size="small"
              onClick={onCopy}
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1,
                backgroundColor: COLOR.NEUTRAL[50],
                border: `1px solid ${COLOR.NEUTRAL[400]}`,
                color: COLOR.NEUTRAL[600],
              }}
            >
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          )}
          <ButtonIconElement
            icon="download"
            className="nodrag"
            size="small"
            onClick={onDownload}
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              backgroundColor: COLOR.NEUTRAL[50],
              border: `1px solid ${COLOR.NEUTRAL[400]}`,
            }}
          />
          <ButtonIconElement
            icon="print"
            className="nodrag"
            size="small"
            onClick={onPrint}
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              backgroundColor: COLOR.NEUTRAL[50],
              border: `1px solid ${COLOR.NEUTRAL[400]}`,
            }}
          />
        </StackRow>
      </StackRowAlignCenterJustBetween>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  </Box>
);

export interface QRBarcodePanelProps {
  code?: string;
  value?: string;
}

export const QRBarcodePanel: React.FC<QRBarcodePanelProps> = ({ code, value }) => {
  const { showSnackbar } = useSnackbar();
  const displayCode = (code ?? value ?? '').trim();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [barcodeSvgString, setBarcodeSvgString] = useState<string | null>(null);

  if (!displayCode) return null;

  const handleCopy = async () => {
    if (!displayCode) return;
    const success = await copyTextToClipboard(displayCode);
    if (success) showSnackbar({ type: SnackbarType.SUCCESS, message: getCopySuccessMessage(displayCode) });
    else showSnackbar({ type: SnackbarType.WARNING, message: getCopyFailureMessage(displayCode) });
  };

  return (
    <StackRow gap={1} sx={{ mt: 2 }}>
      <Box sx={{ width: 198, flexShrink: 0 }}>
        <CodeCard
          title="QR code"
          onDownload={() => {
            if (qrDataUrl) downloadQRCodeWithText(`qr-${displayCode}.png`, qrDataUrl, displayCode);
          }}
          onPrint={() => {
            if (qrDataUrl) printQRCode(`QR Code - ${displayCode}`, qrDataUrl, displayCode);
          }}
          onCopy={handleCopy}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1.5,
              minHeight: 140,
            }}
          >
            <QRCodeComponent value={displayCode} size={100} onRendered={setQrDataUrl} sx={{ flexShrink: 0, width: 100, height: 100 }} />
            <TypographyOneLine content={displayCode} sx={{ fontSize: 16, fontWeight: 500, color: WMS_COMMON.deep_blue }} />
          </Box>
        </CodeCard>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <CodeCard
          title="Barcode"
          onDownload={async () => {
            if (barcodeSvgString) await downloadBarcodeWithText(`barcode-${displayCode}.png`, barcodeSvgString, displayCode);
          }}
          onPrint={() => {
            if (barcodeSvgString) printBarcode(`Barcode - ${displayCode}`, barcodeSvgString, displayCode);
          }}
          onCopy={handleCopy}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1.5,
              minHeight: 140,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLOR.COMMON.white,
                borderRadius: 1,
                p: 1,
                height: 100,
              }}
            >
              <BarcodeComponent
                value={displayCode}
                format="CODE128"
                width={2}
                height={80}
                displayValue={false}
                fontSize={16}
                onRendered={setBarcodeSvgString}
                sx={{ width: '100%', flexShrink: 0, maxWidth: '100%' }}
              />
            </Box>
            <TypographyOneLine content={displayCode} sx={{ fontSize: 16, fontWeight: 500, color: WMS_COMMON.deep_blue }} />
          </Box>
        </CodeCard>
      </Box>
    </StackRow>
  );
};
