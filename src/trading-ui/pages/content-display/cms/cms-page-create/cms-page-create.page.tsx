import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { CmsPageFormValues } from '../cms-page.interface';
import { CMS_PAGE_CREATE_DEFAULT_VALUES, CMS_PAGE_WIZARD_STEPS_CREATE, cmsPageFormSchema } from '../cms-page.constants';
import { CmsPageWizardPageContent } from '../components/cms-page-wizard-page-content.component';

const CmsPageCreatePage = () => {
  const form = useForm<CmsPageFormValues>({
    resolver: yupResolver(cmsPageFormSchema),
    defaultValues: CMS_PAGE_CREATE_DEFAULT_VALUES,
    mode: 'onChange',
  });

  return <CmsPageWizardPageContent mode="create" headerTitle="Tạo trang mới" wizardSteps={CMS_PAGE_WIZARD_STEPS_CREATE} form={form} />;
};

export default CmsPageCreatePage;
