import type { CmsDemoBlock, CmsDemoBlockType } from "@/apis/cms-demo/cms-demo.interface";
export interface CmsPageWizardBlock extends CmsDemoBlock {
  clientId: string;
  title: string;
  description: string;
  isActive: boolean;
}
export interface CmsPageBlockCatalogItem {
  code: CmsDemoBlockType;
  name: string;
  description: string;
}
export type CmsPageBlockValidationState = Record<string, Record<string, string>>;
