import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AddRounded } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import { isJavaBackend } from '@/common/config/app.config';
import { Eye, Trash03 } from '@untitledui/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STYLE } from '@/trading-ui/adapters/library';
import useSWR from 'swr';
import { cmsHeaderFooterApi, type FooterMenuColumnInput, type FooterSocialLinkInput, type SaveFooterDto } from '../../../../apis';
import { getErrorMessage } from '../../../../common/utils';
import { CustomButton } from '../../../../components/button/custom-button';
import { PermissionIconButton } from '../../../../components/button/permission-icon-button';
import { SelectInput, TextInput } from '../../../../components/form';
import { RichTextEditor } from '../../../../components/editor';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { MediaVisibility } from '../../../../apis/file/file.enum';
import { DEFAULT_FOOTER_FORM, FOOTER_SOCIAL_PLATFORMS, mapFooterSettingToForm, mapFormToFooterPreview } from './site-footer.constants';
import { FooterPreviewDialog } from './components/footer-preview-dialog.component';
import { FooterCollapsibleSection } from './components/footer-collapsible-section.component';
import { FooterMenuColumnCard } from './components/footer-menu-column-card.component';
import { getSocialFieldError, validateFooterForm, type FooterFormErrors } from './site-footer.utils';
import { contentFooterButtonPermission } from '../../content-permission.constants';
import { ContentSettingsEditToolbar } from '../../components/content-settings-edit-toolbar.component';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';
import { TextFieldUploadContent as TextFieldUpload } from '../../components/text-field-upload-content.component';
import { uploadSingleImage } from '../../../../common/utils/image-upload.utils';

type SectionKey = 'copyright' | 'certification' | 'menu' | 'social';

const SiteFooterPage = () => {
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState<SaveFooterDto>(DEFAULT_FOOTER_FORM);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sectionExpanded, setSectionExpanded] = useState<Record<SectionKey, boolean>>({
    copyright: true,
    certification: true,
    menu: true,
    social: true,
  });
  const [columnExpanded, setColumnExpanded] = useState<Record<number, boolean>>({});
  const [formErrors, setFormErrors] = useState<FooterFormErrors>({});
  const formSnapshotRef = useRef<SaveFooterDto>(DEFAULT_FOOTER_FORM);
  const columnSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const resetFormFromSnapshot = useCallback(() => {
    setForm(formSnapshotRef.current);
    setFormErrors({});
  }, []);

  const { viewMode, enterEditMode, cancelEditMode, exitEditModeAfterSave } = useContentSettingsViewMode(resetFormFromSnapshot);

  const { data: activeLogo } = useSWR(
    'cms/admin/logos-active',
    async () => {
      const res = await cmsHeaderFooterApi.getLogoList({ take: 50, isPagination: false });
      return (res.list ?? []).find((row) => row.status === 'ACTIVE' && row.type === 'FOOTER');
    },
    { revalidateOnFocus: false },
  );

  const { isLoading, mutate } = useSWR(
    'cms/admin/footer',
    async () => {
      try {
        const setting = await cmsHeaderFooterApi.getFooter();
        const mapped = mapFooterSettingToForm(setting);
        formSnapshotRef.current = mapped;
        setForm(mapped);
      } catch (error) {
        const message = getErrorMessage(error);
        if (!message.toLowerCase().includes('not found') && !message.toLowerCase().includes('không')) {
          showSnackbar({ type: SnackbarType.ERROR, message });
        }
      } finally {
        setLoaded(true);
      }
      return null;
    },
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    setColumnExpanded((prev) => {
      const next = { ...prev };
      form.menuColumns.forEach((_, index) => {
        if (next[index] === undefined) next[index] = true;
      });
      return next;
    });
  }, [form.menuColumns.length]);

  const previewProps = useMemo(() => mapFormToFooterPreview(form, activeLogo?.logoUrl), [form, activeLogo?.logoUrl]);

  const collapseAllSections = () => {
    setSectionExpanded({ copyright: false, certification: false, menu: false, social: false });
  };

  const expandAllSections = () => {
    setSectionExpanded({ copyright: true, certification: true, menu: true, social: true });
    setColumnExpanded(Object.fromEntries(form.menuColumns.map((_, index) => [index, true])));
  };

  const collapseAllColumns = () => {
    setColumnExpanded(Object.fromEntries(form.menuColumns.map((_, index) => [index, false])));
  };

  const toggleSection = (key: SectionKey) => {
    setSectionExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleColumn = (colIndex: number) => {
    setColumnExpanded((prev) => ({ ...prev, [colIndex]: !prev[colIndex] }));
  };

  const clearFieldError = (fieldKey: string) => {
    setFormErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    const validationErrors = validateFooterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      showSnackbar({ type: SnackbarType.ERROR, message: 'Vui lòng kiểm tra lại các trường bắt buộc.' });
      return;
    }

    setFormErrors({});
    setSaving(true);
    try {
      const payload: SaveFooterDto = {
        newsletterHeading: form.newsletterHeading,
        newsletterSubHeading: form.newsletterSubHeading,
        copyrightText: form.copyrightText,
        footerLogoUrl: form.footerLogoUrl,
        certificationImageUrl: form.certificationImageUrl,
        certificationUrl: form.certificationUrl,
        menuColumns: form.menuColumns.map((col, colIndex) => ({
          ...col,
          orderIndex: colIndex,
          items: col.items.map((item, itemIndex) => ({ ...item, orderIndex: itemIndex })),
        })),
        socialLinks: form.socialLinks.map((link, index) => ({ ...link, orderIndex: index })),
      };
      await cmsHeaderFooterApi.putFooter(payload);
      formSnapshotRef.current = payload;
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã lưu cấu hình chân trang.' });
      await mutate();
      exitEditModeAfterSave();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }, [exitEditModeAfterSave, form, mutate, showSnackbar]);

  const updateSocial = (index: number, patch: Partial<FooterSocialLinkInput>) => {
    Object.keys(patch).forEach((field) => clearFieldError(`socialLinks.${index}.${field}`));
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addSocial = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: 'Facebook', displayName: '', url: '', image: '', orderIndex: prev.socialLinks.length }],
    }));
  };

  const removeSocial = (index: number) => {
    setForm((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));
  };

  const updateColumn = (colIndex: number, patch: Partial<FooterMenuColumnInput>) => {
    if ('title' in patch) clearFieldError(`menuColumns.${colIndex}.title`);
    setForm((prev) => ({
      ...prev,
      menuColumns: prev.menuColumns.map((col, i) => (i === colIndex ? { ...col, ...patch } : col)),
    }));
  };

  const updateColumnItem = (colIndex: number, itemIndex: number, patch: Partial<{ label: string; url: string }>) => {
    Object.keys(patch).forEach((field) => clearFieldError(`menuColumns.${colIndex}.items.${itemIndex}.${field}`));
    setForm((prev) => ({
      ...prev,
      menuColumns: prev.menuColumns.map((col, ci) =>
        ci !== colIndex
          ? col
          : {
              ...col,
              items: col.items.map((item, ii) => (ii === itemIndex ? { ...item, ...patch } : item)),
            },
      ),
    }));
  };

  const addColumn = () => {
    if (form.menuColumns.length >= 4) {
      showSnackbar({ type: SnackbarType.ERROR, message: 'Tối đa 4 cột liên kết.' });
      return;
    }
    const nextIndex = form.menuColumns.length;
    setForm((prev) => ({
      ...prev,
      menuColumns: [...prev.menuColumns, { title: 'Cột mới', orderIndex: nextIndex, items: [] }],
    }));
    setColumnExpanded((prev) => ({ ...prev, [nextIndex]: true }));
  };

  const addColumnItem = (colIndex: number) => {
    setForm((prev) => ({
      ...prev,
      menuColumns: prev.menuColumns.map((col, i) => (i !== colIndex ? col : { ...col, items: [...col.items, { label: '', url: '', orderIndex: col.items.length }] })),
    }));
  };

  const removeColumn = (colIndex: number) => {
    setForm((prev) => ({ ...prev, menuColumns: prev.menuColumns.filter((_, i) => i !== colIndex) }));
    setColumnExpanded((prev) => {
      const next: Record<number, boolean> = {};
      form.menuColumns.forEach((_, i) => {
        if (i === colIndex) return;
        const target = i > colIndex ? i - 1 : i;
        next[target] = prev[i] ?? true;
      });
      return next;
    });
  };

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    if (Number.isNaN(oldIndex) || Number.isNaN(newIndex)) return;

    setForm((prev) => ({ ...prev, menuColumns: arrayMove(prev.menuColumns, oldIndex, newIndex) }));
    setColumnExpanded((prev) => {
      const expandedValues = form.menuColumns.map((_, i) => prev[i] ?? true);
      const reordered = arrayMove(expandedValues, oldIndex, newIndex);
      return Object.fromEntries(reordered.map((value, index) => [index, value]));
    });
  };

  if (isLoading || !loaded) {
    return (
      <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)` }}>
        <WrapperComponent label="Quản lý chân trang">
          <LoadingComponent />
        </WrapperComponent>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <WrapperComponent
        label="Quản lý chân trang"
        nodeLabel={
          <StackRowAlignCenterJustBetween sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E5E7EB' }}>
            <StackRowAlignCenter gap={1}>
              <CustomButton type="button" variant="outline" fullWidth={false} startIcon={<Eye size={18} />} onClick={() => setPreviewOpen(true)} sx={{ textTransform: 'none' }}>
                Xem trước
              </CustomButton>
              <CustomButton type="button" variant="outline" fullWidth={false} onClick={collapseAllSections} sx={{ px: 1.25, py: 0.5, textTransform: 'none' }}>
                Thu gọn tất cả
              </CustomButton>
              <CustomButton type="button" variant="outline" fullWidth={false} onClick={expandAllSections} sx={{ px: 1.25, py: 0.5, textTransform: 'none' }}>
                Mở rộng tất cả
              </CustomButton>
            </StackRowAlignCenter>
            <ContentSettingsEditToolbar
              viewMode={viewMode}
              onEnterEdit={enterEditMode}
              onCancelEdit={cancelEditMode}
              editPermission={contentFooterButtonPermission('footer_edit', 'Chỉnh sửa footer', 'api_cms_footer_update')}
              cancelPermission={contentFooterButtonPermission('footer_edit', 'Hủy chỉnh sửa footer', 'api_cms_footer_update')}
              editActions={
                <CustomButton
                  type="button"
                  variant="primary"
                  fullWidth={false}
                  onClick={() => void handleSave()}
                  disabled={saving}
                  sx={{ textTransform: 'none' }}
                  {...contentFooterButtonPermission('footer_save', 'Lưu footer', 'api_cms_footer_update')}
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </CustomButton>
              }
            />
          </StackRowAlignCenterJustBetween>
        }
      >
        <Stack sx={{ flex: 1, minHeight: 0, overflow: 'auto', gap: 2, py: 2, width: '100%' }}>
          <FooterCollapsibleSection title="Bản quyền" expanded={sectionExpanded.copyright} onToggle={() => toggleSection('copyright')}>
            {isJavaBackend() && <Stack gap={2}>
              <TextInput label="Tiêu đề đăng ký nhận tin" disabled={viewMode} value={form.newsletterHeading ?? ''}
                onChange={event => setForm(previous => ({ ...previous, newsletterHeading: event.target.value }))} />
              <TextInput label="Mô tả đăng ký nhận tin" disabled={viewMode} value={form.newsletterSubHeading ?? ''}
                onChange={event => setForm(previous => ({ ...previous, newsletterSubHeading: event.target.value }))} />
            </Stack>}
            <RichTextEditor
              label="Nội dung bản quyền"
              disabled={viewMode}
              value={form.copyrightText ?? ''}
              onChange={(value) => setForm((prev) => ({ ...prev, copyrightText: value }))}
              minHeight={120}
              textOnly
            />
          </FooterCollapsibleSection>

          <FooterCollapsibleSection title="Chứng nhận" expanded={sectionExpanded.certification} onToggle={() => toggleSection('certification')}>
            <Stack gap={2}>
              <TextInput
                label="Đường dẫn chứng nhận"
                placeholder="Ví dụ: http://online.gov.vn/..."
                disabled={viewMode}
                value={form.certificationUrl ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, certificationUrl: e.target.value }))}
              />
              <TextFieldUpload
                label="Ảnh chứng nhận (Bộ Công Thương, v.v.)"
                disabled={viewMode}
                value={form.certificationImageUrl ?? ''}
                onChange={(next) => setForm((prev) => ({ ...prev, certificationImageUrl: next }))}
                accept="image/*"
                previewMode="image"
                hintText="Hỗ trợ mọi định dạng ảnh (tối đa 5MB)"
                onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
                onPickFile={async (file) => {
                  try {
                    const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                    setForm((prev) => ({ ...prev, certificationImageUrl: asset.publicUrl ?? '' }));
                  } catch (error) {
                    showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
                  }
                }}
              />
            </Stack>
          </FooterCollapsibleSection>

          <FooterCollapsibleSection
            title="Cột liên kết (tối đa 4)"
            expanded={sectionExpanded.menu}
            onToggle={() => toggleSection('menu')}
            actions={
              viewMode ? null : (
                <StackRowAlignCenter gap={1}>
                  <CustomButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    disabled={form.menuColumns.length === 0}
                    onClick={collapseAllColumns}
                    sx={{ px: 1, py: 0.25, fontSize: 13, textTransform: 'none' }}
                  >
                    Thu gọn cột
                  </CustomButton>
                  <CustomButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    startIcon={<AddRounded sx={{ fontSize: 16 }} />}
                    onClick={addColumn}
                    disabled={form.menuColumns.length >= 4}
                    sx={{ textTransform: 'none' }}
                  >
                    Thêm cột
                  </CustomButton>
                </StackRowAlignCenter>
              )
            }
          >
            <DndContext sensors={viewMode ? [] : columnSensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={viewMode ? () => undefined : handleColumnDragEnd}>
              <SortableContext items={form.menuColumns.map((_, index) => String(index))} strategy={verticalListSortingStrategy}>
                <Stack gap={1.5}>
                  {form.menuColumns.map((column, colIndex) => (
                    <FooterMenuColumnCard
                      key={column.id ?? colIndex}
                      column={column}
                      colIndex={colIndex}
                      viewMode={viewMode}
                      expanded={columnExpanded[colIndex] ?? true}
                      formErrors={formErrors}
                      onToggle={() => toggleColumn(colIndex)}
                      onRemove={() => removeColumn(colIndex)}
                      onTitleChange={(title) => updateColumn(colIndex, { title })}
                      onItemChange={(itemIndex, patch) => updateColumnItem(colIndex, itemIndex, patch)}
                      onRemoveItem={(itemIndex) => updateColumn(colIndex, { items: column.items.filter((_, ii) => ii !== itemIndex) })}
                      onAddItem={() => addColumnItem(colIndex)}
                    />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          </FooterCollapsibleSection>

          <FooterCollapsibleSection
            title="Mạng xã hội"
            expanded={sectionExpanded.social}
            onToggle={() => toggleSection('social')}
            actions={
              viewMode ? null : (
                <CustomButton
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  startIcon={<AddRounded sx={{ fontSize: 16 }} />}
                  onClick={addSocial}
                  sx={{ textTransform: 'none' }}
                  {...contentFooterButtonPermission('footer_add_social', 'Thêm mạng xã hội', 'api_cms_footer_update')}
                >
                  Thêm mạng
                </CustomButton>
              )
            }
          >
            {form.socialLinks.map((link, index) => (
              <Stack key={link.id ?? index} gap={1.5} sx={{ pb: 1, borderBottom: index < form.socialLinks.length - 1 ? '1px solid #F3F4F6' : undefined }}>
                <StackRowAlignCenter gap={1} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ width: 160, flexShrink: 0 }}>
                    <SelectInput
                      requiredMark
                      label="Nền tảng"
                      disabled={viewMode}
                      value={link.platform}
                      onChange={(e) => updateSocial(index, { platform: e.target.value as FooterSocialLinkInput['platform'] })}
                      options={FOOTER_SOCIAL_PLATFORMS.map((platform) => ({ value: platform, label: platform }))}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <TextInput
                      requiredMark
                      label="Tên hiển thị"
                      disabled={viewMode}
                      value={link.displayName}
                      onChange={(e) => updateSocial(index, { displayName: e.target.value })}
                      error={Boolean(getSocialFieldError(formErrors, index, 'displayName'))}
                      errorMessage={getSocialFieldError(formErrors, index, 'displayName')}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <TextInput
                      requiredMark
                      label="Đường dẫn"
                      disabled={viewMode}
                      value={link.url}
                      onChange={(e) => updateSocial(index, { url: e.target.value })}
                      error={Boolean(getSocialFieldError(formErrors, index, 'url'))}
                      errorMessage={getSocialFieldError(formErrors, index, 'url')}
                    />
                  </Box>
                  {!viewMode ? (
                    <PermissionIconButton
                      aria-label="Xóa mạng xã hội"
                      onClick={() => removeSocial(index)}
                      {...contentFooterButtonPermission('footer_remove_social', 'Xóa mạng xã hội', 'api_cms_footer_update')}
                      sx={{ mt: 2.5, color: '#6B7280' }}
                    >
                      <Trash03 size={20} />
                    </PermissionIconButton>
                  ) : null}
                </StackRowAlignCenter>
                <TextFieldUpload
                  label="Icon nền tảng"
                  requiredMark
                  disabled={viewMode}
                  value={link.image ?? ''}
                  error={Boolean(getSocialFieldError(formErrors, index, 'image'))}
                  errorMessage={getSocialFieldError(formErrors, index, 'image')}
                  onChange={(next) => updateSocial(index, { image: next })}
                  accept="image/*"
                  previewMode="image"
                  hintText="Hỗ trợ mọi định dạng ảnh (tối đa 5MB)"
                  onFileReject={(reason) => showSnackbar({ type: SnackbarType.ERROR, message: reason })}
                  onPickFile={async (file) => {
                    try {
                      const { asset } = await uploadSingleImage({ file, visibility: MediaVisibility.PUBLIC });
                      updateSocial(index, { image: asset.publicUrl ?? '' });
                    } catch (error) {
                      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
                    }
                  }}
                />
              </Stack>
            ))}
          </FooterCollapsibleSection>
        </Stack>
      </WrapperComponent>

      <FooterPreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} preview={previewProps} />
    </Stack>
  );
};

export default SiteFooterPage;
