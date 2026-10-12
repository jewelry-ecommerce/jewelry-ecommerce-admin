import React, { useMemo } from 'react';
import type { CmsBlockSchemaDefinition } from '../../../../../apis/cms/cms-schema-definition.interface';
import type { CmsBlockSchemaValidationErrors } from '../../utils/cms-block-schema.utils';
import { getProductListSchemaWithoutInterleavedBanners } from '../../utils/cms-product-list-block.utils';
import { CmsSchemaDefinitionForm } from '../cms-schema-definition-form.component';

interface CmsPageWizardProductListConfigProps {
  schema?: CmsBlockSchemaDefinition | null;
  value: Record<string, unknown>;
  errors?: CmsBlockSchemaValidationErrors;
  onChange: (nextValue: Record<string, unknown>) => void;
  disabled?: boolean;
}

export const CmsPageWizardProductListConfig: React.FC<CmsPageWizardProductListConfigProps> = ({ schema, value, errors = {}, onChange, disabled = false }) => {
  const baseSchema = useMemo(() => getProductListSchemaWithoutInterleavedBanners(schema), [schema]);

  return <CmsSchemaDefinitionForm schema={baseSchema} value={value} errors={errors} onChange={onChange} disabled={disabled} />;
};
