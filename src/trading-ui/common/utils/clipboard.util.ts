export const copyTextToClipboard = async (value: string): Promise<boolean> => {
  if (!value) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fallback below for non-secure contexts / blocked permissions.
    }
  }

  if (typeof document === 'undefined') return false;

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

export const getCopyFailureMessage = (value?: string): string => (value ? `Không thể sao chép ${value} trong trình duyệt hiện tại` : 'Không thể sao chép trong trình duyệt hiện tại.');

export const getCopySuccessMessage = (value: string, prefix = 'Đã sao chép'): string => `${prefix} ${value}`;
