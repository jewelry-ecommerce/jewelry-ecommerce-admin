import { CmsBannerContent } from './cms-banner-content.component';
import { CmsDemoBlockType, type CmsDemoBlock, type CmsDemoConfig } from '@/apis/cms-demo/cms-demo.interface';
import { CmsSchemaDefinitionForm } from '@/trading-ui/pages/content-display/cms/components/cms-schema-definition-form.component';
import { CmsPageWizardImageGalleryConfig } from '@/trading-ui/pages/content-display/cms/components/image-gallery-config/cms-page-wizard-image-gallery-config.component';
import { getCmsSourceBlockSchema } from '@/trading-ui/schemas/cms-source-schemas';
interface Props {
  block: CmsDemoBlock;
  disabled: boolean;
  errors?: Record<string, string>;
  onChange: (config: CmsDemoConfig) => void;
}
export function CmsBlockFields(props: Props) {
  const { block, disabled, onChange } = props;
  const schema = getCmsSourceBlockSchema(block.blockTypeCode);
  if (block.blockTypeCode === CmsDemoBlockType.BANNER) return <CmsBannerContent placementCode={block.config.placementCode} disabled={disabled} error={props.errors?.placementCode} onChange={placementCode => onChange({ ...block.config, placementCode })} />;
  const shared = { schema, value: block.config, onChange, disabled, errors: props.errors };
  if (block.blockTypeCode === CmsDemoBlockType.IMAGE_GALLERY) return <CmsPageWizardImageGalleryConfig {...shared} />;
  return <CmsSchemaDefinitionForm {...shared} blockTypeCode={block.blockTypeCode} />;
}
