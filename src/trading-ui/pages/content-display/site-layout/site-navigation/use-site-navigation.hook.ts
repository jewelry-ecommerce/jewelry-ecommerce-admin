import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import {
  categoryApi,
  cmsApi,
  navigationApi,
  type CmsNavigation,
  type CmsNavigationBadge,
  type CmsNavigationBadgeScheduleConflictResponse,
  type CreateCmsNavigationDto,
  type UpdateCmsNavigationDto,
  isCmsNavigationBadgeScheduleConflictResponse,
} from '../../../../apis';
import { CategoryStatus } from '../../../../apis/category/category.enum';
import { getErrorMessage } from '../../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { DEFAULT_FORM, NAVIGATION_PUBLISH_STATUS_KEY, NAVIGATION_TREE_KEY } from './site-navigation.constant';
import type { NavigationFormState, PendingSubmit, ScreenState } from './site-navigation.interface';
import {
  buildFormFromNavigation,
  buildCategorySelectOptions,
  buildCategoryUrl,
  buildCmsPageUrl,
  buildPageSelectOptions,
  findCategoryById,
  findNavigationNode,
  findPageById,
  getNodeDepth,
  isCategoryTargetMissing,
  isPageTargetMissing,
  isValidManualUrl,
} from './site-navigation.utils';

export const useSiteNavigation = () => {
  const { showSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();

  const [screenState, setScreenState] = useState<ScreenState>({ mode: 'idle', createParent: null });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [form, setForm] = useState<NavigationFormState>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<CmsNavigation | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null);
  const [conflict, setConflict] = useState<CmsNavigationBadgeScheduleConflictResponse | null>(null);

  const { data: treeResponse, isLoading: isTreeLoading } = useSWR(NAVIGATION_TREE_KEY, navigationApi.getNavigationTree);
  const { data: publishStatus } = useSWR(NAVIGATION_PUBLISH_STATUS_KEY, navigationApi.getNavigationPublishStatus);
  const { data: categoryTree = [] } = useSWR(['product/admin/categories/tree', 'navigation-picker'], () => categoryApi.getCategoryTree({ compact: true, status: CategoryStatus.ACTIVE }), {
    revalidateOnFocus: false,
  });
  const { data: pageRes } = useSWR(['cms/admin/pages', 'navigation-picker'], () => cmsApi.getPageList({ page: 1, take: 100, isPagination: false }), { revalidateOnFocus: false });
  const { data: selectedDetail } = useSWR(screenState.mode === 'edit' && screenState.selectedId ? ['cms/admin/navigations/detail', screenState.selectedId] : null, ([, id]) =>
    navigationApi.getNavigationDetail(id),
  );

  const tree = treeResponse?.items ?? [];
  const selectedTreeNode = useMemo(() => findNavigationNode(tree, screenState.selectedId), [tree, screenState.selectedId]);
  const currentDepth = useMemo(() => {
    if (screenState.mode === 'create') {
      return screenState.createParent ? (getNodeDepth(tree, screenState.createParent.id) ?? 0) + 1 : 1;
    }
    return getNodeDepth(tree, screenState.selectedId) ?? 1;
  }, [screenState, tree]);
  const menuPopupLocked = currentDepth >= 4;
  const categoryOptions = useMemo(() => buildCategorySelectOptions(categoryTree, form.targetId), [categoryTree, form.targetId]);
  const pages = pageRes?.list ?? [];
  const pageOptions = useMemo(() => buildPageSelectOptions(pages, form.targetId), [form.targetId, pages]);
  const selectedCategory = useMemo(() => findCategoryById(categoryTree, form.targetId), [categoryTree, form.targetId]);
  const selectedPage = useMemo(() => findPageById(pages, form.targetId), [pages, form.targetId]);
  const isPageTargetBroken = form.type === 'PAGE' && isPageTargetMissing(pages, form.targetId);
  const isCategoryTargetBroken = form.type === 'CATEGORY' && isCategoryTargetMissing(categoryTree, form.targetId);
  const sourceName = form.type === 'CATEGORY' ? selectedCategory?.name : form.type === 'PAGE' ? selectedPage?.name : '';

  const updateForm = <K extends keyof NavigationFormState>(key: K, value: NavigationFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  useEffect(() => {
    if (selectedDetail && screenState.mode === 'edit') {
      setForm(buildFormFromNavigation(selectedDetail));
      setFormErrors({});
    }
  }, [screenState.mode, selectedDetail]);

  useEffect(() => {
    if (!publishStatus?.hasPendingPublish) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'Thay đổi của bạn chưa được xuất bản lên website E-commerce. Chắc chắn rời đi?';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [publishStatus?.hasPendingPublish]);

  useEffect(() => {
    if (menuPopupLocked && form.showOnMenuPopup) {
      updateForm('showOnMenuPopup', false);
    }
  }, [menuPopupLocked, form.showOnMenuPopup]);

  const refreshNavigation = async () => {
    await Promise.all([mutate(NAVIGATION_TREE_KEY), mutate(NAVIGATION_PUBLISH_STATUS_KEY), mutate((key) => Array.isArray(key) && key[0] === 'cms/admin/navigations/detail')]);
  };

  const resetToIdle = () => {
    setScreenState({ mode: 'idle', createParent: null, selectedId: undefined });
    setForm(DEFAULT_FORM);
    setFormErrors({});
  };

  const startCreate = (parent: CmsNavigation | null = null) => {
    setScreenState({ mode: 'create', createParent: parent, selectedId: undefined });
    setForm({
      ...DEFAULT_FORM,
      showOnMenuPopup: parent && (getNodeDepth(tree, parent.id) ?? 1) + 1 >= 4 ? false : true,
    });
    setFormErrors({});
    if (parent) setExpandedIds((prev) => new Set([...prev, parent.id]));
  };

  const startEdit = (id: string) => {
    setScreenState({ mode: 'edit', selectedId: id, createParent: null });
    setFormErrors({});
  };

  const buildPayload = (confirmReplaceSchedule = false): CreateCmsNavigationDto | UpdateCmsNavigationDto | null => {
    const errors: Record<string, string> = {};
    const label = form.label.trim() || sourceName?.trim() || '';

    if (!label) errors.label = 'Vui lòng nhập tên hiển thị';
    if (form.type === 'CATEGORY' && !form.targetId) errors.targetId = 'Vui lòng chọn danh mục sản phẩm';
    if (form.type === 'PAGE' && !form.targetId) errors.targetId = 'Vui lòng chọn trang nội dung';
    if (form.type === 'LINK') {
      if (!form.url.trim()) errors.url = 'Vui lòng nhập đường dẫn';
      else if (!isValidManualUrl(form.url)) errors.url = 'Đường dẫn thủ công phải bắt đầu bằng http:// hoặc https://';
    }

    const parentNavigationId = screenState.mode === 'create' ? screenState.createParent?.id : selectedTreeNode?.parentId;
    const categoryUrl = form.type === 'CATEGORY' ? buildCategoryUrl(categoryTree, tree, form.targetId, parentNavigationId ?? undefined) : undefined;
    const pageUrl = form.type === 'PAGE' ? buildCmsPageUrl(selectedPage) : undefined;
    if (form.type === 'CATEGORY' && form.targetId && isCategoryTargetMissing(categoryTree, form.targetId)) {
      errors.targetId = 'Danh mục đã bị xóa hoặc không còn hoạt động — vui lòng chọn lại';
    } else if (form.type === 'CATEGORY' && form.targetId && !categoryUrl) {
      errors.targetId = 'Danh mục chưa có đường dẫn hợp lệ';
    }
    if (form.type === 'PAGE' && form.targetId && isPageTargetMissing(pages, form.targetId)) {
      errors.targetId = 'Trang nội dung đã bị xóa — vui lòng chọn trang khác';
    } else if (form.type === 'PAGE' && form.targetId && !pageUrl) {
      errors.targetId = 'Trang nội dung chưa có đường dẫn hợp lệ';
    }

    if (form.badgeEnabled) {
      if (form.badgeDesignType === 'TEXT') {
        if (!form.badgeDisplayText.trim()) errors.badgeDisplayText = 'Vui lòng nhập văn bản nhãn';
        if (form.badgeDisplayText.trim().length > 5) errors.badgeDisplayText = 'Văn bản nhãn tối đa 5 ký tự';
      }
      if (form.badgeDesignType === 'IMAGE' && !form.badgeImageUrl.trim()) {
        errors.badgeImageUrl = 'Vui lòng tải ảnh nhãn';
      }
      if (!form.badgeStartTime) {
        errors.badgeStartTime = 'Vui lòng chọn thời gian bắt đầu';
      }
      if (form.badgeStartTime && form.badgeEndTime && !form.badgeEndTime.isAfter(form.badgeStartTime)) {
        errors.badgeEndTime = 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu';
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length) return null;

    const base: CreateCmsNavigationDto = {
      label,
      type: form.type,
      image: form.image.trim() || undefined,
      openInNewTab: form.openInNewTab,
      showOnMenuPopup: menuPopupLocked ? false : form.showOnMenuPopup,
      showOnPlp: form.showOnPlp,
    };

    if (screenState.mode === 'create') {
      base.parentId = screenState.createParent?.id ?? null;
    }

    if (form.type === 'CATEGORY' || form.type === 'PAGE') {
      base.targetId = form.targetId;
      if (form.type === 'CATEGORY' && categoryUrl) base.url = categoryUrl;
      if (form.type === 'PAGE' && form.url) base.url = form.url;
    }

    if (form.type === 'LINK') {
      base.url = form.url.trim();
    }

    if (screenState.mode === 'edit' && !form.badgeEnabled && (form.badgeId || (selectedDetail?.badges?.length ?? 0) > 0)) {
      (base as UpdateCmsNavigationDto).clearBadge = true;
    } else if (form.badgeEnabled && form.badgeStartTime) {
      base.badge = {
        ...(form.badgeId ? { id: form.badgeId } : {}),
        designType: form.badgeDesignType,
        startTime: form.badgeStartTime.toISOString(),
        ...(form.badgeEndTime ? { endTime: form.badgeEndTime.toISOString() } : {}),
        ...(confirmReplaceSchedule ? { confirmReplaceSchedule: true } : {}),
        ...(form.badgeDesignType === 'TEXT'
          ? {
              displayText: form.badgeDisplayText.trim(),
              styleConfig: {
                backgroundColor: form.badgeBackgroundColor,
                color: form.badgeTextColor,
                fontSize: '11px',
                fontWeight: '600',
              },
            }
          : { imageUrl: form.badgeImageUrl.trim(), styleConfig: {} }),
      };
    }

    return base;
  };

  const handleSubmitPayload = async (payload: CreateCmsNavigationDto | UpdateCmsNavigationDto, id?: string) => {
    setSaving(true);
    try {
      const response = id ? await navigationApi.patchNavigation(id, payload) : await navigationApi.postNavigation(payload as CreateCmsNavigationDto);
      if (isCmsNavigationBadgeScheduleConflictResponse(response)) {
        setPendingSubmit({ id, payload });
        setConflict(response);
        return;
      }
      showSnackbar({
        type: SnackbarType.SUCCESS,
        message: id ? 'Cập nhật menu điều hướng thành công' : 'Tạo menu điều hướng thành công',
      });
      resetToIdle();
      await refreshNavigation();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const payload = buildPayload(false);
    if (!payload) return;
    await handleSubmitPayload(payload, screenState.mode === 'edit' ? screenState.selectedId : undefined);
  };

  const handleConfirmConflictReplace = async () => {
    if (!pendingSubmit) return;
    const payload = buildPayload(true);
    if (!payload) return;
    setConflict(null);
    setPendingSubmit(null);
    await handleSubmitPayload(payload, pendingSubmit.id);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await navigationApi.postNavigationPublish();
      await refreshNavigation();
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Xuất bản giao diện thành công' });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setSaving(true);
    try {
      await navigationApi.patchNavigationArchive(archiveTarget.id);
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Lưu trữ mục menu thành công' });
      setArchiveTarget(null);
      resetToIdle();
      await refreshNavigation();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTreeReorder = async (_parentId: string | null, orderedNodes: CmsNavigation[]) => {
    try {
      await navigationApi.patchNavigationReorder({
        items: orderedNodes.map((item, sortOrder) => ({ id: item.id, sortOrder })),
      });
      await refreshNavigation();
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    }
  };

  const selectBadge = (badge: CmsNavigationBadge) => {
    setForm((prev) => ({
      ...prev,
      badgeEnabled: true,
      badgeId: badge.id,
      badgeDesignType: badge.designType,
      badgeDisplayText: badge.displayText ?? '',
      badgeImageUrl: badge.imageUrl ?? '',
      badgeBackgroundColor: badge.styleConfig?.backgroundColor ?? '#E53935',
      badgeTextColor: badge.styleConfig?.color ?? '#FFFFFF',
      badgeStartTime: badge.startTime ? dayjs(badge.startTime) : null,
      badgeEndTime: badge.endTime ? dayjs(badge.endTime) : null,
    }));
  };

  const closeConflict = () => {
    setConflict(null);
    setPendingSubmit(null);
  };

  return {
    tree,
    isTreeLoading,
    screenState,
    expandedIds,
    publishStatus,
    publishing,
    archiveTarget,
    conflict,
    saving,
    form,
    formErrors,
    selectedTreeNode,
    menuPopupLocked,
    categoryTree,
    categoryOptions,
    pages,
    pageOptions,
    sourceName,
    isPageTargetBroken,
    isCategoryTargetBroken,
    selectedDetail,
    updateForm,
    setForm,
    setFormErrors,
    resetToIdle,
    startCreate,
    startEdit,
    handleSave,
    handlePublish,
    handleArchive,
    toggleExpanded,
    handleTreeReorder,
    selectBadge,
    setArchiveTarget,
    closeConflict,
    handleConfirmConflictReplace,
    showSnackbar,
  };
};
