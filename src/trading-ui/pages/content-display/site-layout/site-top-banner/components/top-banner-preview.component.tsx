import { Box, Typography } from '@mui/material';
import type { HeaderBannerDisplayStyle } from '../../../../../apis';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';

type TopBannerPreviewProps = {
  bannerDisplayStyle: HeaderBannerDisplayStyle;
  bannerContent: string;
  bannerBgColor: string;
  bannerTextColor: string;
};

export const TopBannerPreview = ({ bannerDisplayStyle, bannerContent, bannerBgColor, bannerTextColor }: TopBannerPreviewProps) => {
  const text = bannerContent.trim();

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bannerBgColor || '#D4E157',
        color: bannerTextColor || '#101828',
        borderRadius: 1,
        px: 2,
        py: 1,
      }}
    >
      {bannerDisplayStyle === 'MEDIA' && text ? (
        <Box component="img" src={text} alt="Top banner" sx={{ maxHeight: 28, maxWidth: '100%', objectFit: 'contain' }} />
      ) : (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: 'inherit', textAlign: 'center' }}>{text || 'Nội dung top banner hiển thị tại đây'}</Typography>
      )}
    </Box>
  );
};
