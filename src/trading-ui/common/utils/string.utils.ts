export const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

export const extractNumberAtStartString = (string: string) => {
  if (!string) return 0;
  const match = string.match(/^\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export const getErrorMessage = (e: unknown) => (e as Error)?.message ?? 'Đã xảy ra lỗi không xác định!';
