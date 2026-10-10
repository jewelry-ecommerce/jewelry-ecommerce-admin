
import { Box, type SxProps, type Theme } from '@mui/material';
export function ImageElement({url,sx}:{url:string;sx?:SxProps<Theme>}) {
  return <Box component="img" src={url || undefined} alt="" sx={sx} />;
}
