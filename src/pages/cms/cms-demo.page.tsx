import { Alert, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CustomButton } from "@/components/button/custom-button.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { getCmsPageEditPath, ROUTE_PATH } from "@/router/route.path";
import type { CmsDemoPage, CmsDemoStatus } from "@/apis/cms-demo/cms-demo.interface";
import { CmsPageEditor } from "./cms-page-editor.component";
import { CmsPageList } from "./cms-page-list.component";
import { CmsPageWizardHeader } from "./source/cms-page-wizard-header.component";
import { newCmsPage } from "./cms-demo.constants";
import { useCmsDemo } from "./use-cms-demo.hook";
type State = ReturnType<typeof useCmsDemo>;
interface ContentProps {
  state: State;
  creating: boolean;
  id?: string;
  save: (page: CmsDemoPage, status: CmsDemoStatus) => Promise<CmsDemoPage | undefined>;
}
function CmsContent({ state, creating, id, save }: ContentProps) {
  if (state.error)
    return (
      <Alert severity="error">
        {state.error}
        <CustomButton variant="outline" onClick={() => state.mutate()}>
          Thử lại
        </CustomButton>
      </Alert>
    );
  if (state.isLoading) return <Alert severity="info">Đang đọc kho CMS...</Alert>;
  const selected = state.pages.find((page) => page.id === id);
  if (creating || selected)
    return (
      <CmsPageEditor
        key={selected?.id || "create"}
        initial={selected || newCmsPage()}
        saving={state.saving}
        message={state.message}
        onSave={save}
      />
    );
  if (id) return <Alert severity="warning">Không tìm thấy page.</Alert>;
  return <CmsPageList pages={state.pages} />;
}
export default function CmsDemoPageView() {
  const state = useCmsDemo();
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const creating = pathname === ROUTE_PATH.CMS_PAGE_CREATE;
  async function savePage(page: CmsDemoPage, status: CmsDemoStatus) {
    const saved = await state.save(page, status);
    if (saved && creating && saved.status === "PUBLISHED") navigate(getCmsPageEditPath(saved.id));
    return saved;
  }
  const content = <CmsContent state={state} creating={creating} id={id} save={savePage} />;
  if (creating || id)
    return (
      <Stack sx={{ height: "100%", overflow: "auto", bgcolor: "#F3F4F6" }}>
        <CmsPageWizardHeader
          title={creating ? "Tạo trang mới" : "Chỉnh sửa trang"}
          subtitle={state.pages.find((page) => page.id === id)?.name || ""}
          onBack={() => navigate(ROUTE_PATH.CMS_PAGE_LIST)}
        />
        {content}
      </Stack>
    );
  return (
    <WrapperComponent label="Danh sách trang CMS">
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Chưa tạo trang/block thì client chưa có nội dung. Dữ liệu được lưu chung với client.
        </Alert>
        {content}
      </Stack>
    </WrapperComponent>
  );
}
