export function downloadQRBarcode(filename: string, dataUrl: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBarcodeSVG(filename: string, svgString: string) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadQRCodeWithText(filename: string, dataUrl: string, codeText: string) {
  const img = new Image();
  img.onload = () => {
    const horizontalPadding = 24;
    const topPadding = 16;
    const gap = 12;
    const bottomPadding = 16;
    const textHeight = 32;
    const fontWeight = 600;
    const fontSize = 24;
    const fontFamily = 'Arial';
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) return;
    measureCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const measuredTextWidth = Math.ceil(measureCtx.measureText(codeText).width);
    const minImageWidth = img.width + horizontalPadding * 2;
    const minTextWidth = measuredTextWidth + horizontalPadding * 2;
    const width = Math.max(minImageWidth, minTextWidth);
    const height = topPadding + img.height + gap + textHeight + bottomPadding;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    const imageX = (width - img.width) / 2;
    ctx.drawImage(img, imageX, topPadding);
    ctx.fillStyle = '#07554b';
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(codeText, width / 2, topPadding + img.height + gap + textHeight / 2);
    const output = canvas.toDataURL('image/png');
    downloadQRBarcode(filename, output);
  };
  img.src = dataUrl;
}

export async function downloadBarcodeWithText(filename: string, svgString: string, codeText: string) {
  const barcodeDataUrl = await svgToDataURL(svgString);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load barcode image'));
    img.src = barcodeDataUrl;
  });
  const horizontalPadding = 24;
  const topPadding = 16;
  const gap = 12;
  const bottomPadding = 16;
  const textHeight = 32;
  const width = img.width + horizontalPadding * 2;
  const height = topPadding + img.height + gap + textHeight + bottomPadding;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const imageX = (width - img.width) / 2;
  ctx.drawImage(img, imageX, topPadding);
  ctx.fillStyle = '#07554b';
  ctx.font = '600 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(codeText, width / 2, topPadding + img.height + gap + textHeight / 2);
  const output = canvas.toDataURL('image/png');
  downloadQRBarcode(filename, output);
}

export function svgToDataURL(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    img.src = url;
  });
}

export function printQRCode(title: string, dataUrl: string, codeText: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) return;
  iframeDoc.open();
  iframeDoc.write(
    `<!DOCTYPE html><html><head><title>${title}</title></head><body style="margin:0;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;"><img src="${dataUrl}" alt="QR Code" style="width:200px;height:200px;object-fit:contain;" /><div style="font-size:18px;font-weight:600;color:#07554b;text-align:center;letter-spacing:.5px;margin-top:16px;">${codeText}</div></body></html>`,
  );
  iframeDoc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 500);
  }, 120);
}

export function printBarcode(title: string, svgString: string, codeText: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) return;
  const escapedSvgString = svgString.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  iframeDoc.open();
  iframeDoc.write(
    `<!DOCTYPE html><html><head><title>${title}</title></head><body style="margin:0;padding:40px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;"><div style="width:100%;max-width:600px;display:flex;align-items:center;justify-content:center;background:#fff;padding:20px;border-radius:8px;">${escapedSvgString}</div><div style="font-size:18px;font-weight:600;color:#07554b;text-align:center;letter-spacing:.5px;margin-top:16px;">${codeText}</div></body></html>`,
  );
  iframeDoc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 500);
  }, 200);
}

/**
 * Backward-compatible wrapper for old callsites.
 */
export function printQRBarcode(title: string, element: HTMLElement) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=600');
  if (!printWindow) return;
  printWindow.document.title = title;
  printWindow.document.body.style.margin = '0';
  printWindow.document.body.style.padding = '20px';
  printWindow.document.body.style.display = 'flex';
  printWindow.document.body.style.alignItems = 'center';
  printWindow.document.body.style.justifyContent = 'center';
  const clonedElement = element.cloneNode(true) as HTMLElement;
  printWindow.document.body.appendChild(clonedElement);
  printWindow.focus();
  printWindow.print();
  setTimeout(() => printWindow.close(), 100);
}
