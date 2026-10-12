import { Alert, Box, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';
import { BadgeCampaignStatus, type BadgeTemplateBadgeType, type BadgeTemplate } from '../../../../../apis/badge';
import { TYPOGRAPHY_STYLES } from '../../../../../common/constant/typography.constant';
import { SelectAllInput, SelectInput, TextInput } from '../../../../../components/form';
import { formLabelSx } from '../../../../../components/form/form-field.styles';
import { StackRow } from '../../../../../components/styled/stack.style';
import { LabelWebsiteStatusToggle } from '../../components';
import { LabelDesignPreviewCell } from '../../components/label-design-preview-cell.component';
import { badgePositionLabelVi, badgeTemplateBadgeTypeLabelVi } from '../../label-content/label-content.utils';
import type { LabelDisplayPromotionPickItem, LabelDisplaySelectedCategory, LabelDisplaySelectedCollection, LabelDisplaySelectedProduct } from '../label-display.interface';
import { LABEL_DISPLAY_BADGE_TYPE_OPTIONS } from '../label-display.utils';
import { LabelDisplayScopePanel } from './label-display-scope-panel.component';

type LabelSelectOption = { value: string; label: string };

export type LabelDisplayFormViewProps = {
  viewMode?: boolean;
  campaignName: string;
  onCampaignNameChange?: (value: string) => void;
  activeFrom: Dayjs | null;
  onActiveFromChange?: (value: Dayjs | null) => void;
  activeTo: Dayjs | null;
  onActiveToChange?: (value: Dayjs | null) => void;
  campaignStatus: BadgeCampaignStatus;
  onCampaignStatusChange?: (status: BadgeCampaignStatus) => void;
  selectedBadgeType: BadgeTemplateBadgeType;
  onBadgeTypeChange?: (value: BadgeTemplateBadgeType) => void;
  selectedLabelIds: string[];
  onLabelsChange?: (ids: string[]) => void;
  labelSelectOptions: LabelSelectOption[];
  selectedTemplates: BadgeTemplate[];
  maxLabelTemplates: number;
  isOutOfStock: boolean;
  inputsDisabled?: boolean;
  scopeAll: boolean;
  scopePromotion: boolean;
  scopeCategory: boolean;
  scopeCollection: boolean;
  scopeProduct: boolean;
  onToggleAll?: (checked: boolean) => void;
  onTogglePromotion?: (checked: boolean) => void;
  onToggleCategory?: (checked: boolean) => void;
  onToggleCollection?: (checked: boolean) => void;
  onToggleProduct?: (checked: boolean) => void;
  selectedPromotions: LabelDisplayPromotionPickItem[];
  onPromotionsChange?: (value: LabelDisplayPromotionPickItem[]) => void;
  selectedCategories: LabelDisplaySelectedCategory[];
  onCategoriesChange?: (rows: LabelDisplaySelectedCategory[]) => void;
  selectedCollections: LabelDisplaySelectedCollection[];
  onCollectionsChange?: (rows: LabelDisplaySelectedCollection[]) => void;
  selectedProducts: LabelDisplaySelectedProduct[];
  onProductsChange?: (rows: LabelDisplaySelectedProduct[]) => void;
  onImportExcel?: () => void;
  showTaskManagerButton?: boolean;
  onOpenTaskManager?: () => void;
  isSkuImportProcessing?: boolean;
};

export const LabelDisplayFormView = ({
  viewMode = false,
  campaignName,
  onCampaignNameChange,
  activeFrom,
  onActiveFromChange,
  activeTo,
  onActiveToChange,
  campaignStatus,
  onCampaignStatusChange,
  selectedBadgeType,
  onBadgeTypeChange,
  selectedLabelIds,
  onLabelsChange,
  labelSelectOptions,
  selectedTemplates,
  maxLabelTemplates,
  isOutOfStock,
  inputsDisabled = false,
  scopeAll,
  scopePromotion,
  scopeCategory,
  scopeCollection,
  scopeProduct,
  onToggleAll,
  onTogglePromotion,
  onToggleCategory,
  onToggleCollection,
  onToggleProduct,
  selectedPromotions,
  onPromotionsChange,
  selectedCategories,
  onCategoriesChange,
  selectedCollections,
  onCollectionsChange,
  selectedProducts,
  onProductsChange,
  onImportExcel,
  showTaskManagerButton,
  onOpenTaskManager,
  isSkuImportProcessing = false,
}: LabelDisplayFormViewProps) => {
  const fieldsDisabled = viewMode || inputsDisabled;

  return (
    <StackRow sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', p: 3, gap: 3 }}>
      <Stack sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: 0, minHeight: 0, gap: 2 }}>
        <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2, gap: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Thông tin campaign</Typography>
          <TextInput
            label="Tên campaign"
            name="campaignName"
            value={campaignName}
            requiredMark
            placeholder="Nhập tên cấu hình"
            onChange={(e) => onCampaignNameChange?.(e.target.value)}
            disabled={fieldsDisabled}
            fullWidth
            size="small"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={formLabelSx}>
                Thời gian bắt đầu
                <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
                  *
                </Box>
              </Typography>
              <DateTimePicker
                value={activeFrom}
                onChange={onActiveFromChange}
                disabled={fieldsDisabled}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { fullWidth: true, size: 'small', placeholder: 'dd/mm/yyyy hh:mm' },
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={formLabelSx}>Thời gian kết thúc</Typography>
              <DateTimePicker
                value={activeTo}
                onChange={onActiveToChange}
                disabled={viewMode}
                format="DD/MM/YYYY HH:mm"
                minDateTime={activeFrom ?? undefined}
                slotProps={{
                  textField: { fullWidth: true, size: 'small', placeholder: 'dd/mm/yyyy hh:mm' },
                }}
              />
            </Box>
          </Stack>
          <LabelWebsiteStatusToggle
            active={campaignStatus === BadgeCampaignStatus.ACTIVE}
            name="campaignStatus"
            disabled={viewMode}
            onActiveChange={(nextActive) => onCampaignStatusChange?.(nextActive ? BadgeCampaignStatus.ACTIVE : BadgeCampaignStatus.INACTIVE)}
          />
        </Stack>

        <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: '10px', bgcolor: '#FFF', p: 2, gap: 2 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>Label được áp dụng</Typography>
          <SelectInput
            label="Loại Label"
            name="badgeType"
            value={selectedBadgeType}
            requiredMark
            placeholder="Chọn loại label"
            disabled={fieldsDisabled}
            options={LABEL_DISPLAY_BADGE_TYPE_OPTIONS}
            onChange={(e) => onBadgeTypeChange?.(e.target.value as BadgeTemplateBadgeType)}
            fullWidth
            size="small"
          />
          <SelectAllInput
            label={`Chọn Label (tối đa ${maxLabelTemplates})`}
            name="labelIds"
            value={selectedLabelIds}
            requiredMark
            placeholder="Vui lòng chọn label"
            disabled={fieldsDisabled}
            options={labelSelectOptions}
            onChange={(e) => {
              const raw = (e.target as EventTarget & { value: unknown }).value;
              const next = Array.isArray(raw) ? raw.map(String) : [];
              onLabelsChange?.(next);
            }}
          />

          {selectedTemplates.length > 0 ? (
            <Stack sx={{ border: '1px solid #E5E7EB', borderRadius: 1, p: 1.5, gap: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)',
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Nhãn dán</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Loại nhãn</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#6B7280' }}>Vị trí</Typography>
              </Box>
              {selectedTemplates.map((template) => (
                <Box
                  key={template.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr) minmax(0,0.9fr)',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <LabelDesignPreviewCell badgeTemplate={template} />
                  </Box>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{badgeTemplateBadgeTypeLabelVi(template.badgeType)}</Typography>
                  <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#374151' }}>{template.defaultPosition ? badgePositionLabelVi(template.defaultPosition) : '—'}</Typography>
                </Box>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Stack>

      {!isOutOfStock ? (
        <Stack sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: 0, minHeight: 0, gap: 1.5 }}>
          {!viewMode && isSkuImportProcessing ? (
            <Alert severity="info">File import biến thể đang được xử lý. Danh sách sản phẩm sẽ cập nhật tự động khi hoàn tất — theo dõi thêm trong Trình quản lý tác vụ.</Alert>
          ) : null}
          <LabelDisplayScopePanel
            viewMode={viewMode}
            scopeAll={scopeAll}
            scopePromotion={scopePromotion}
            scopeCategory={scopeCategory}
            scopeCollection={scopeCollection}
            scopeProduct={scopeProduct}
            formDisabled={inputsDisabled}
            onToggleAll={onToggleAll ?? (() => undefined)}
            onTogglePromotion={onTogglePromotion ?? (() => undefined)}
            onToggleCategory={onToggleCategory ?? (() => undefined)}
            onToggleCollection={onToggleCollection ?? (() => undefined)}
            onToggleProduct={onToggleProduct ?? (() => undefined)}
            selectedPromotions={selectedPromotions}
            onPromotionsChange={onPromotionsChange ?? (() => undefined)}
            selectedCategories={selectedCategories}
            onCategoriesChange={onCategoriesChange ?? (() => undefined)}
            selectedCollections={selectedCollections}
            onCollectionsChange={onCollectionsChange ?? (() => undefined)}
            selectedProducts={selectedProducts}
            onProductsChange={onProductsChange ?? (() => undefined)}
            onImportExcel={viewMode ? undefined : onImportExcel}
            showTaskManagerButton={viewMode ? false : showTaskManagerButton}
            onOpenTaskManager={viewMode ? undefined : onOpenTaskManager}
          />
        </Stack>
      ) : null}
    </StackRow>
  );
};
