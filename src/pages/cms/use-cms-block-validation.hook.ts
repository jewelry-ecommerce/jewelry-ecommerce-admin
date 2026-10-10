import { useState } from 'react';
import type { CmsDemoBlock, CmsDemoPage } from '@/apis/cms-demo/cms-demo.interface';
import { getCmsSourceBlockSchema } from '@/trading-ui/schemas/cms-source-schemas';
import { validateBlockConfigBySchema } from '@/trading-ui/pages/content-display/cms/utils/cms-block-schema.utils';
import { validateProductCarouselBlockConfig } from '@/trading-ui/pages/content-display/cms/utils/cms-product-carousel-block.utils';
import { validateImageGalleryBlockConfig } from '@/trading-ui/pages/content-display/cms/utils/cms-image-gallery-block.utils';
type BlockErrors = Record<string, Record<string, string>>;
function blockErrors(block: CmsDemoBlock): Record<string, string> {
  return {
    ...(block.blockTypeCode === 'BANNER' && !block.config.placementCode?.trim() ? { placementCode: 'Vui lòng tạo hoặc chọn vị trí banner.' } : {}),
    ...validateBlockConfigBySchema(getCmsSourceBlockSchema(block.blockTypeCode), block.config),
    ...(block.blockTypeCode === 'PRODUCT_CAROUSEL' ? validateProductCarouselBlockConfig(block.config) : {}),
    ...(block.blockTypeCode === 'IMAGE_GALLERY' ? validateImageGalleryBlockConfig(block.config) : {}),
  };
}
function pageErrors(page: CmsDemoPage): BlockErrors {
  const errors: BlockErrors = {};
  for (const block of page.blocks) {
    const errorsForBlock = blockErrors(block);
    if (Object.keys(errorsForBlock).length) errors[block.id] = errorsForBlock;
  }
  return errors;
}
export function useCmsBlockValidation(page: CmsDemoPage, setStep: (step: number) => void) {
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? pageErrors(page) : {};
  function validate(): boolean {
    setShowErrors(true);
    if (Object.keys(pageErrors(page)).length === 0) return true;
    setStep(1);
    return false;
  }
  return { errors, validate };
}
