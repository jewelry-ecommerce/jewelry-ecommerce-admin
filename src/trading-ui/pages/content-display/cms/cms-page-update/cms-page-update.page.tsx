import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { cmsApi } from '../../../../apis';
import { ROUTE_PATH } from '@/trading-ui/router/route.path';
import type { CmsPageFormValues } from '../cms-page.interface';
import { CMS_PAGE_CREATE_DEFAULT_VALUES, CMS_PAGE_WIZARD_STEPS_EDIT, cmsPageFormSchema } from '../cms-page.constants';
import { CmsPageWizardPageContent } from '../components/cms-page-wizard-page-content.component';

const CmsPageUpdatePage = () => {
  const { pageId = '' } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pageId) {
      void navigate(ROUTE_PATH.CMS_PAGE_LIST, { replace: true });
    }
  }, [pageId, navigate]);

  const form = useForm<CmsPageFormValues>({
    resolver: yupResolver(cmsPageFormSchema),
    defaultValues: CMS_PAGE_CREATE_DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { data: pageDetail, isLoading } = useSWR(pageId ? (['cms/admin/pages', pageId] as const) : null, () => cmsApi.getPageDetail(pageId), {
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });

  return (
    <CmsPageWizardPageContent
      mode="edit"
      headerTitle="Chỉnh sửa trang"
      wizardSteps={CMS_PAGE_WIZARD_STEPS_EDIT}
      form={form}
      pageId={pageId}
      pageDetail={pageDetail}
      pageLoading={isLoading && !pageDetail}
    />
  );
};

export default CmsPageUpdatePage;
