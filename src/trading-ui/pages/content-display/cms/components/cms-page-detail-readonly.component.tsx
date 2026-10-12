import { Box, Stack, Typography } from '@mui/material';
import type { Layout, Page, VersionBlock } from '../../../../apis';
import { type TargetDevice, VersionStatus } from '../../../../apis/cms/cms.enum';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDateTime } from '../../../../common/utils';
import { StackRowAlignCenterJustBetween } from '../../../../components/styled/stack.style';
import { TagCommonComponent } from '../../../../components/tag';
import { AttributeInfoField } from '../../../product/product-attribute/product-attribute-detail/product-attribute-detail.page';
import { CMS_PAGE_LOCALE_OPTIONS, CMS_PAGE_TARGET_DEVICE_OPTIONS } from '../cms-page.constants';

const getTargetDeviceLabel = (value?: TargetDevice): string => CMS_PAGE_TARGET_DEVICE_OPTIONS.find((option) => option.value === value)?.label ?? value ?? '—';

const getVersionStatusLabel = (status?: VersionStatus): string => {
  if (status === VersionStatus.PUBLISHED) return 'Đã xuất bản';
  if (status === VersionStatus.DRAFT) return 'Nháp';
  if (status === VersionStatus.ARCHIVED) return 'Lưu trữ';
  return status ?? '—';
};

const getLocaleLabel = (locale?: string): string => CMS_PAGE_LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? locale ?? '—';

const formatBlockSummary = (block: VersionBlock): string => {
  const statusLabel = block.isActive ? 'Kích hoạt' : 'Vô hiệu hóa';
  return `${block.blockTypeCode} · ${statusLabel}`;
};

const CmsPageLayoutReadonlySection = ({ layout }: { layout: Layout }) => {
  const version = layout.activeVersion ?? layout.versions?.[0];
  const blocks = version?.blocks ?? [];

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Bố cục & khối nội dung</Typography>
      <StackRowAlignCenterJustBetween gap={2}>
        <AttributeInfoField label="Tên bố cục">{layout.name || '—'}</AttributeInfoField>
        <AttributeInfoField label="Thiết bị">{getTargetDeviceLabel(layout.targetDevice)}</AttributeInfoField>
      </StackRowAlignCenterJustBetween>
      <StackRowAlignCenterJustBetween gap={2}>
        <AttributeInfoField label="Lịch bắt đầu">{layout.scheduleStart ? formatDateTime(String(layout.scheduleStart)) : '—'}</AttributeInfoField>
        <AttributeInfoField label="Lịch kết thúc">{layout.scheduleEnd ? formatDateTime(String(layout.scheduleEnd)) : '—'}</AttributeInfoField>
      </StackRowAlignCenterJustBetween>
      {version ? (
        <StackRowAlignCenterJustBetween gap={2}>
          <AttributeInfoField label="Phiên bản">{version.versionName || `v${version.versionNumber}`}</AttributeInfoField>
          <AttributeInfoField label="Trạng thái phiên bản">{getVersionStatusLabel(version.status)}</AttributeInfoField>
        </StackRowAlignCenterJustBetween>
      ) : null}
      <Stack sx={{ gap: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#27272A' }}>Danh sách khối</Typography>
        {blocks.length ? (
          <Stack gap={0.75}>
            {blocks.map((block) => (
              <Typography key={block.id} sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>
                {formatBlockSummary(block)}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#667085' }}>Chưa có khối nội dung.</Typography>
        )}
      </Stack>
    </Stack>
  );
};

export const CmsPageDetailReadonly = ({ page }: { page: Page }) => {
  const primaryLayout = page.layouts?.[0];

  return (
    <Stack sx={{ p: 3, gap: 3 }}>
      <Stack sx={{ gap: 2, border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFFFFF', p: 2 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Thông tin trang</Typography>
        <StackRowAlignCenterJustBetween gap={2}>
          <AttributeInfoField label="Tên trang">{page.name || '—'}</AttributeInfoField>
          <AttributeInfoField label="Đường dẫn">/{page.slug || '—'}</AttributeInfoField>
        </StackRowAlignCenterJustBetween>
        <StackRowAlignCenterJustBetween gap={2}>
          <AttributeInfoField label="Ngôn ngữ">{getLocaleLabel(page.locale)}</AttributeInfoField>
          <AttributeInfoField label="Hiển thị">
            <TagCommonComponent content={page.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} border />
          </AttributeInfoField>
        </StackRowAlignCenterJustBetween>
      </Stack>

      <Stack sx={{ gap: 2, border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFFFFF', p: 2 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>SEO</Typography>
        <AttributeInfoField label="Tiêu đề SEO">{page.seoTitle?.trim() || '—'}</AttributeInfoField>
        <AttributeInfoField label="Mô tả SEO">{page.seoDescription?.trim() || '—'}</AttributeInfoField>
        <AttributeInfoField label="Từ khóa SEO">{page.seoKeywords?.trim() || '—'}</AttributeInfoField>
        <StackRowAlignCenterJustBetween gap={2}>
          <AttributeInfoField label="URL chuẩn">{page.canonicalUrl?.trim() || '—'}</AttributeInfoField>
          <AttributeInfoField label="Ảnh SEO">
            {page.seoImageUrl?.trim() ? <Box component="img" src={page.seoImageUrl} alt="" sx={{ maxWidth: 120, maxHeight: 64, borderRadius: 1, border: '1px solid #E5E7EB' }} /> : '—'}
          </AttributeInfoField>
        </StackRowAlignCenterJustBetween>
      </Stack>

      {primaryLayout ? (
        <Stack sx={{ gap: 2, border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFFFFF', p: 2 }}>
          <CmsPageLayoutReadonlySection layout={primaryLayout} />
        </Stack>
      ) : null}
    </Stack>
  );
};
