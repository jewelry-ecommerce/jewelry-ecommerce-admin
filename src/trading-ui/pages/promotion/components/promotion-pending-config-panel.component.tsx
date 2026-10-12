import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { InfoCircle } from '@untitledui/icons';
import { TYPOGRAPHY_STYLES } from '../../../common/constant/typography.constant';
import { ProductSpuSectionPanel } from '../../product/product-spu/components/product-spu-page-sections.component';
import { PROMOTION_DETAIL_SECTION_ICONS } from '../promotion.constant';

interface PromotionPendingConfigPanelProps {
  sectionId?: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

export const PromotionPendingConfigPanel = ({ sectionId, title, description, icon }: PromotionPendingConfigPanelProps) => {
  const SectionIcon = (sectionId ? PROMOTION_DETAIL_SECTION_ICONS[sectionId] : undefined) ?? InfoCircle;

  return (
    <Box id={sectionId ? `promotion-section-${sectionId}` : undefined}>
      <ProductSpuSectionPanel title={title} icon={icon ?? <SectionIcon size={20} color="#737373" />}>
        <Box sx={{ p: 1.5, borderRadius: '8px', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#475467' }}>{description}</Typography>
        </Box>
      </ProductSpuSectionPanel>
    </Box>
  );
};
