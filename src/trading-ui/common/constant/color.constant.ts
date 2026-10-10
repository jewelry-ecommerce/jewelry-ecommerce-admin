
const ATTRIBUTE_STATUS_TAG_COLORS: Readonly<Record<string,string>> = {
  ACTIVE: '#16A34A', INACTIVE: '#FF4444', 'Kích hoạt': '#16A34A', 'Vô hiệu hóa': '#FF4444',
};
const DEFAULT_TAG_COLOR = '#737373';
export const resolveTagHexFromContent = (content:string):string => ATTRIBUTE_STATUS_TAG_COLORS[content] ?? DEFAULT_TAG_COLOR;
