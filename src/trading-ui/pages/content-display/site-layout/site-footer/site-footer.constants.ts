import type { FooterSetting, SaveFooterDto } from '../../../../apis';
import type { FooterPreviewProps } from './components/footer-preview.component';

const DEFAULT_BRAND_NAME = 'HEARTLOCK';

export const resolveFooterSocialIconSrc = (imageUrl?: string): string => imageUrl?.trim() ?? '';

export const DEFAULT_FOOTER_FORM: SaveFooterDto = {
  copyrightText: '© 2026 SevaRetail. All rights reserved.',
  footerLogoUrl: '',
  certificationImageUrl: '',
  certificationUrl: '',
  socialLinks: [
    { platform: 'TikTok', displayName: 'TikTok', url: '#', orderIndex: 0 },
    { platform: 'Facebook', displayName: 'Facebook', url: '#', orderIndex: 1 },
    { platform: 'YouTube', displayName: 'YouTube', url: '#', orderIndex: 2 },
    { platform: 'Instagram', displayName: 'Instagram', url: '#', orderIndex: 3 },
  ],
  menuColumns: [
    {
      title: 'Chăm sóc khách hàng',
      orderIndex: 0,
      items: [
        { label: 'FAQs & Liên hệ', url: '#', orderIndex: 0 },
        { label: 'Tra cứu đơn hàng', url: '/tra-cuu-don-hang', orderIndex: 1 },
      ],
    },
    {
      title: 'Chính sách hỗ trợ',
      orderIndex: 1,
      items: [{ label: 'Thanh toán', url: '#', orderIndex: 0 }],
    },
    {
      title: 'Đặc quyền thành viên',
      orderIndex: 2,
      items: [{ label: 'Đăng ký', url: '#', orderIndex: 0 }],
    },
    {
      title: 'Về chúng tôi',
      orderIndex: 3,
      items: [{ label: 'Về thương hiệu', url: '#', orderIndex: 0 }],
    },
  ],
};

export const mapFormToFooterPreview = (form: SaveFooterDto, logoUrl = ''): FooterPreviewProps => ({
  logoSrc: logoUrl || '/image/logo/logo.svg',
  brandName: DEFAULT_BRAND_NAME,
  columns: form.menuColumns.map((col) => ({
    title: col.title,
    items: col.items.map((item) => ({ label: item.label, url: item.url })),
  })),
  socialIcons: form.socialLinks
    .map((link) => ({
      src: resolveFooterSocialIconSrc(link.image),
      alt: link.displayName || link.platform,
      href: link.url || '#',
    }))
    .filter((icon) => Boolean(icon.src)),
  copyright: form.copyrightText?.trim() || '© 2026 SevaRetail. All rights reserved.',
});

export const FOOTER_SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Zalo', 'Other'] as const;

export const FOOTER_SOCIAL_IMAGE_ACCEPT = 'image/*';

export const mapFooterSettingToForm = (setting: FooterSetting): SaveFooterDto => ({
  newsletterHeading: setting.newsletterHeading ?? '',
  newsletterSubHeading: setting.newsletterSubHeading ?? '',
  copyrightText: setting.copyrightText ?? '',
  footerLogoUrl: setting.footerLogoUrl ?? '',
  certificationImageUrl: setting.certificationImageUrl ?? '',
  certificationUrl: setting.certificationUrl ?? '',
  socialLinks: (setting.socialLinks ?? []).map((link, index) => ({
    id: link.id,
    platform: link.platform,
    displayName: link.displayName,
    url: link.url,
    image: link.image,
    orderIndex: link.orderIndex ?? index,
  })),
  menuColumns: (setting.menuColumns ?? []).map((column, colIndex) => ({
    id: column.id,
    title: column.title,
    orderIndex: column.orderIndex ?? colIndex,
    items: (column.items ?? []).map((item, itemIndex) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      orderIndex: item.orderIndex ?? itemIndex,
    })),
  })),
});
