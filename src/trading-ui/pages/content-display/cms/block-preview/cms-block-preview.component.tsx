import { Box, Typography } from '@mui/material';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import {
  BLOCK_PREVIEW_BANNER_IMAGE,
  BLOCK_PREVIEW_CATEGORY_ITEMS,
  BLOCK_PREVIEW_COLLECTION_ITEMS,
  BLOCK_PREVIEW_INFO_CARDS,
  BLOCK_PREVIEW_LOOKBOOK_IMAGES,
  BLOCK_PREVIEW_PRODUCT_IMAGE,
  BLOCK_PREVIEW_PRODUCTS,
} from './block-preview.constants';

export type CmsBlockPreviewProps = {
  blockCode: string;
};

const sectionTitleSx = {
  ...TYPOGRAPHY_STYLES['3xl'].bold,
  color: '#27251F',
  textTransform: 'uppercase' as const,
  px: 2,
  pt: 3,
  pb: 1,
};

const sectionSubtitleSx = {
  ...TYPOGRAPHY_STYLES.xl.regular,
  color: '#666',
  textTransform: 'uppercase' as const,
  px: 2,
  pb: 2,
};

const BlockSectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box>
    <Typography sx={sectionTitleSx}>{title}</Typography>
    {subtitle ? <Typography sx={sectionSubtitleSx}>{subtitle}</Typography> : null}
  </Box>
);

const MockProductCard = ({ name, price }: { name: string; price: string }) => (
  <Box
    sx={{
      flex: '0 0 25%',
      minWidth: 0,
      p: 2,
      borderRight: '1px solid #E0E0E0',
      borderBottom: '1px solid #E0E0E0',
      boxSizing: 'border-box',
    }}
  >
    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '350 / 440', bgcolor: '#FFF', overflow: 'hidden' }}>
      <Box component="img" src={BLOCK_PREVIEW_PRODUCT_IMAGE} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: '#027A48',
          color: '#fff',
          px: 1,
          py: 0.25,
          ...TYPOGRAPHY_STYLES.xs.regular,
        }}
      >
        Mới
      </Box>
    </Box>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#27251F', mt: 1, textTransform: 'uppercase' }}>{name}</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#C0392B', mt: 0.5 }}>{price}</Typography>
  </Box>
);

const BannerPreview = () => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      minHeight: 420,
      overflow: 'hidden',
      bgcolor: '#111',
    }}
  >
    <Box component="img" src={BLOCK_PREVIEW_BANNER_IMAGE} alt="" sx={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pb: 5,
        px: 3,
      }}
    >
      <Typography sx={{ ...TYPOGRAPHY_STYLES['3xl'].bold, color: '#fff', textAlign: 'center', textTransform: 'uppercase', mb: 1 }}>Heart Lock Collection</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.regular, color: '#fff', textAlign: 'center', mb: 2 }}>Khám phá bộ sưu tập mới nhất</Typography>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Box
          sx={{
            px: 2.5,
            py: 1,
            bgcolor: '#fff',
            color: '#000',
            ...TYPOGRAPHY_STYLES.sm.semibold,
            textTransform: 'uppercase',
          }}
        >
          Xem bộ sưu tập
        </Box>
        <Box
          sx={{
            px: 2.5,
            py: 1,
            border: '1px solid #fff',
            color: '#fff',
            ...TYPOGRAPHY_STYLES.sm.semibold,
            textTransform: 'uppercase',
          }}
        >
          Khám phá câu chuyện
        </Box>
      </Box>
    </Box>
  </Box>
);

const ProductCarouselPreview = () => (
  <Box sx={{ bgcolor: '#fff', pb: 3 }}>
    <BlockSectionTitle title="Bộ sưu tập mới" subtitle="Định danh phong cách riêng" />
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      {BLOCK_PREVIEW_PRODUCTS.slice(0, 4).map((product) => (
        <MockProductCard key={product.name} {...product} />
      ))}
    </Box>
  </Box>
);

const CategoryNavPreview = () => (
  <Box sx={{ bgcolor: '#fff', pb: 4 }}>
    <BlockSectionTitle title="Danh mục sản phẩm" />
    <Box sx={{ display: 'flex', gap: 2, px: 2, overflow: 'hidden' }}>
      {BLOCK_PREVIEW_CATEGORY_ITEMS.map((item) => (
        <Box key={item.label} sx={{ flex: '0 0 160px' }}>
          <Box
            sx={{
              width: 160,
              height: 160,
              border: '2px solid #E0E0E0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box component="img" src={item.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.bold,
              color: '#27251F',
              mt: 1,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const ProductListPreview = () => (
  <Box sx={{ bgcolor: '#fff', p: 2 }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, px: 1 }}>
      <Box sx={{ px: 1.5, py: 0.75, border: '1px solid #D1D5DB', ...TYPOGRAPHY_STYLES.sm.regular }}>Bộ lọc sản phẩm</Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#666' }}>Sắp xếp: Mới nhất</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#666', ml: 'auto' }}>128 sản phẩm</Typography>
    </Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {BLOCK_PREVIEW_PRODUCTS.map((product) => (
        <Box key={product.name} sx={{ flex: '0 0 25%', minWidth: 0 }}>
          <MockProductCard {...product} />
        </Box>
      ))}
    </Box>
  </Box>
);

const CollectionShowcasePreview = () => (
  <Box sx={{ bgcolor: '#fff', px: 2, pb: 3 }}>
    <Typography sx={{ ...sectionTitleSx, px: 0 }}>Chọn theo phong cách riêng</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 257px)', gap: '14px' }}>
      {BLOCK_PREVIEW_COLLECTION_ITEMS.map((item) => (
        <Box key={item.title}>
          <Box
            sx={{
              width: 257,
              height: 306,
              border: '1px solid #000',
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#666', textTransform: 'uppercase', pt: 1 }}>{item.title}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const ExpandableDescriptionPreview = () => (
  <Box sx={{ bgcolor: '#fff', px: 2, py: 3 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES['3xl'].bold, color: '#27251F', textTransform: 'uppercase', mb: 1 }}>Giới thiệu trang</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#000', lineHeight: 1.6, maxWidth: 900 }}>
      Khám phá thế giới trang sức tinh xảo với thiết kế hiện đại, kết hợp nghệ thuật chế tác truyền thống và phong cách đương đại. Mỗi món trang sức là một câu chuyện riêng, mang đến trải nghiệm cá
      nhân hóa cho người đeo.
    </Typography>
    <Typography
      component="button"
      type="button"
      sx={{
        ...TYPOGRAPHY_STYLES.base.regular,
        color: '#000',
        textDecoration: 'underline',
        textTransform: 'uppercase',
        border: 'none',
        bgcolor: 'transparent',
        p: 0,
        mt: 1,
        cursor: 'default',
      }}
    >
      Xem thêm
    </Typography>
  </Box>
);

const TextBlockPreview = () => (
  <Box sx={{ bgcolor: '#fff', px: 2, py: 3 }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES['3xl'].bold, color: '#27251F', textTransform: 'uppercase', mb: 2, textAlign: 'center' }}>Chính sách giao hàng</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.bold, color: '#000', mb: 1 }}>A. Chi phí và phạm vi giao hàng</Typography>
    <Box component="ul" sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#000', pl: 3, m: 0, mb: 2 }}>
      <li>Giao hàng toàn quốc qua đối tác vận chuyển.</li>
      <li>Phí ship được tính theo khu vực nhận hàng.</li>
    </Box>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#000' }}>Nội dung khối văn bản hỗ trợ định dạng rich text (tiêu đề, danh sách, bảng, hình ảnh) từ CKEditor.</Typography>
  </Box>
);

const InfoCardsPreview = () => (
  <Box sx={{ bgcolor: '#fff', pb: 3 }}>
    <BlockSectionTitle title="Khám phá thêm" subtitle="Tin tức & xu hướng" />
    <Box sx={{ display: 'flex', gap: 0, px: 2 }}>
      {BLOCK_PREVIEW_INFO_CARDS.map((item) => (
        <Box key={item.title} sx={{ flex: '0 0 50%', p: 1, boxSizing: 'border-box' }}>
          <Box sx={{ width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', mb: 2 }}>
            <Box component="img" src={item.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, color: '#27251F', textTransform: 'uppercase' }}>{item.title}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: '#666', textTransform: 'uppercase', mt: 0.5 }}>{item.subtitle}</Typography>
          <Typography
            sx={{
              ...TYPOGRAPHY_STYLES.sm.regular,
              color: '#27251F',
              textDecoration: 'underline',
              mt: 1,
              textTransform: 'uppercase',
            }}
          >
            Xem thêm
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const ImageGalleryPreview = () => (
  <Box sx={{ bgcolor: '#fff', pb: 3 }}>
    <BlockSectionTitle title="Lookbook / Social Feed" subtitle="Chọn theo phong cách riêng" />
    <Box sx={{ display: 'flex', px: 2, gap: 1 }}>
      {BLOCK_PREVIEW_LOOKBOOK_IMAGES.map((src, index) => (
        <Box key={src} sx={{ flex: '0 0 25%', position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              bgcolor: '#fff',
              px: 1.5,
              py: 0.5,
              clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
              ...TYPOGRAPHY_STYLES.xs.bold,
              textTransform: 'uppercase',
            }}
          >
            {index % 2 === 0 ? 'Lookbook' : 'Social'}
          </Box>
          <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      ))}
    </Box>
  </Box>
);

const NewsletterPreview = () => (
  <Box
    sx={{
      width: '100%',
      bgcolor: '#F4F4F4',
      py: 5,
      px: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Typography sx={{ ...TYPOGRAPHY_STYLES.md.bold, textAlign: 'center', textTransform: 'uppercase', mb: 3, maxWidth: 720 }}>Đăng ký nhận tin để nhận ưu đãi hấp dẫn</Typography>
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Box
        sx={{
          border: '1px solid #DEDEDE',
          borderRadius: 1,
          bgcolor: '#fff',
          px: 2,
          py: 1.25,
          ...TYPOGRAPHY_STYLES.base.regular,
          color: '#9CA3AF',
        }}
      >
        Email của bạn
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#000', mt: 2 }}>Bằng cách nhấp chọn, bạn đồng ý với Chính sách Bảo mật thông tin ở trang này.</Typography>
    </Box>
  </Box>
);

const FallbackPreview = ({ blockCode }: { blockCode: string }) => (
  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F9FAFB' }}>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Chưa có giao diện xem trước</Typography>
    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#6B7280', mt: 1 }}>Loại khối: {blockCode}</Typography>
  </Box>
);

export const CmsBlockPreview = ({ blockCode }: CmsBlockPreviewProps) => {
  const code = blockCode.trim().toUpperCase();

  switch (code) {
    case 'BANNER':
      return <BannerPreview />;
    case 'PRODUCT_CAROUSEL':
      return <ProductCarouselPreview />;
    case 'PRODUCT_CATEGORY_NAV':
      return <CategoryNavPreview />;
    case 'PRODUCT_LIST':
      return <ProductListPreview />;
    case 'PRODUCT_COLLECTION_SHOWCASE':
      return <CollectionShowcasePreview />;
    case 'PRODUCT_EXPANDABLE_DESCRIPTION':
      return <ExpandableDescriptionPreview />;
    case 'TEXT_BLOCK':
      return <TextBlockPreview />;
    case 'INFO_CARDS':
      return <InfoCardsPreview />;
    case 'IMAGE_GALLERY':
      return <ImageGalleryPreview />;
    case 'NEWSLETTER_SIGNUP':
      return <NewsletterPreview />;
    default:
      return <FallbackPreview blockCode={code} />;
  }
};
