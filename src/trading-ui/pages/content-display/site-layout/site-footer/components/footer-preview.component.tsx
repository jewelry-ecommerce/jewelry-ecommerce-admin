import { Box, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { ServerSafeContent } from '../../../../../components/server-safe-content/server-safe-content.component';
import { StackRowAlignCenterJustBetween } from '../../../../../components/styled/stack.style';

export type FooterPreviewColumn = {
  title: string;
  items: { label: string; url: string }[];
};

export type FooterPreviewSocial = {
  src: string;
  alt: string;
  href: string;
};

export type FooterPreviewProps = {
  logoSrc: string;
  brandName: string;
  columns: FooterPreviewColumn[];
  socialIcons: FooterPreviewSocial[];
  copyright: string;
};

const footerPreviewSx = {
  root: {
    width: '100%',
    backgroundColor: '#171717',
    padding: '40px 16px',
    boxSizing: 'border-box' as const,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '24px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  columnTitle: {
    ...TYPOGRAPHY_STYLES.md.semibold,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  linkItem: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: '#FFFFFF',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 0.8,
    },
  },
  linkText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: '#FFFFFF',
  },
  divider: {
    height: '1px',
    backgroundColor: '#929292',
    marginTop: '40px',
    marginBottom: '16px',
    width: '100%',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  copyrightText: {
    ...TYPOGRAPHY_STYLES.base.regular,
    color: '#FFFFFF',
    flex: 1,
    minWidth: 0,
    '& p': {
      margin: 0,
    },
    '& p + p': {
      marginTop: '4px',
    },
    '& a': {
      color: 'inherit',
    },
  },
  socialIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  socialIcon: {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    display: 'inline-flex',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  logoPC: {
    display: 'flex',
  },
};

/** Clone UI từ trading-fe Footer — chỉ desktop, dùng cho popup xem trước admin. */
export const FooterPreviewComponent = ({ logoSrc, brandName, columns, socialIcons, copyright }: FooterPreviewProps) => (
  <Box component="footer" sx={footerPreviewSx.root}>
    <Box sx={footerPreviewSx.gridContainer}>
      <Box sx={{ ...footerPreviewSx.column, ...footerPreviewSx.logoPC }}>
        <Box component="a" href="/" sx={{ display: 'inline-flex' }}>
          <Box component="img" src={logoSrc} alt={brandName} sx={{ width: 120, height: 40, objectFit: 'contain' }} />
        </Box>
      </Box>

      {columns.map((section, index) => (
        <Box key={index} sx={footerPreviewSx.column}>
          <Typography sx={footerPreviewSx.columnTitle}>{section.title}</Typography>
          <Box sx={footerPreviewSx.linkList}>
            {section.items.map((item, idx) => (
              <Box key={idx}>
                {item.url ? (
                  <Box component="a" href={item.url} sx={footerPreviewSx.linkItem}>
                    {item.label}
                  </Box>
                ) : (
                  <Typography sx={footerPreviewSx.linkText}>{item.label}</Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>

    <Box sx={footerPreviewSx.divider} />

    <StackRowAlignCenterJustBetween sx={footerPreviewSx.bottomBar}>
      <ServerSafeContent component="div" sx={footerPreviewSx.copyrightText} rawHtml={copyright} />
      <Box sx={footerPreviewSx.socialIcons}>
        {socialIcons.map((icon, index) => (
          <Box key={index} component="a" href={icon.href} target="_blank" rel="noopener noreferrer" sx={footerPreviewSx.socialIcon}>
            <Box component="img" src={icon.src} alt={icon.alt} sx={{ width: 25, height: 25 }} />
          </Box>
        ))}
      </Box>
    </StackRowAlignCenterJustBetween>
  </Box>
);
