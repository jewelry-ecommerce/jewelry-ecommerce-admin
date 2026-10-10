// Publish card/summary/footer ported from trading-admin CMS, split into small render parts.
import { Box, Card, CardContent, Typography } from "@mui/material";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { CustomButton } from "@/trading-ui/components/button/custom-button";
import type { CmsPageWizardBlock } from "./cms-source-block.interface";
import { CmsPageWizardFooter } from "./cms-page-wizard-footer.component";
export interface CmsPageWizardStepPublishProps {
  name: string;
  slug: string;
  locale: string;
  targetDevice: string;
  blocks: CmsPageWizardBlock[];
  isPublishedVersion?: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  loadingPublish: boolean;
  viewMode?: boolean;
}
function PageSummary({ name, slug, locale, targetDevice, blocks }: CmsPageWizardStepPublishProps) {
  const fields = [
    ["Tên trang", name || "—"],
    ["Đường dẫn", "/" + (slug || "—")],
    ["Ngôn ngữ", locale],
    ["Thiết bị", targetDevice],
    ["Số khối", blocks.length],
  ];
  return (
    <>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828", mb: 1 }}>Thông tin trang</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
        {fields.map(([label, value]) => (
          <Typography key={label} sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
            <Box component="span" sx={{ color: "#6B7280" }}>
              {label}:{" "}
            </Box>
            {value}
          </Typography>
        ))}
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: "#101828", mb: 1 }}>Danh sách khối</Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, mb: 2 }}>
        {blocks.map((block) => (
          <Typography key={block.clientId} component="li" sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>
            {block.title || block.blockTypeCode}
          </Typography>
        ))}
      </Box>
    </>
  );
}
function PublishCard(props: CmsPageWizardStepPublishProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "#E5E7EB", boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: "#101828", mb: 0.5 }}>Xác nhận xuất bản</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#6B7280", mb: 2 }}>Kiểm tra lại thông tin trước khi xuất bản</Typography>
        <PageSummary {...props} />
        <Box sx={{ bgcolor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 2, p: 1.5 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#92400E" }}>
            Lưu ý: Sau khi xuất bản, trang sẽ hiển thị trên giao diện tại website theo đường dẫn đã cấu hình. Bạn có thể chỉnh sửa và xuất
            bản lại sau.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
export function CmsPageWizardStepPublish(props: CmsPageWizardStepPublishProps) {
  const { onBack, onSaveDraft, onPublish, loadingPublish, viewMode } = props;
  return (
    <>
      <PublishCard {...props} />
      <CmsPageWizardFooter
        left={
          <CustomButton variant="outline" onClick={onBack} disabled={loadingPublish} sx={{ px: 3 }}>
            Quay lại
          </CustomButton>
        }
        right={
          viewMode ? null : (
            <>
              <CustomButton variant="outline" onClick={onSaveDraft} disabled={loadingPublish} sx={{ px: 3 }}>
                Lưu nháp
              </CustomButton>
              <CustomButton variant="primary" onClick={onPublish} disabled={loadingPublish} sx={{ px: 3, minWidth: 140 }}>
                Xuất bản ngay
              </CustomButton>
            </>
          )
        }
      />
    </>
  );
}
