import { Stack } from '@mui/material';
import { STYLE } from '@/trading-ui/adapters/library';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { WrapperComponent } from '../../../../components/wrapper';
import { SnackbarType } from '@/hooks/use-snackbar.hook';
import { NavigationDialogs } from './components/navigation-dialogs.component';
import { NavigationPageHeader } from './components/navigation-page-header.component';
import { NavigationTreePanel } from './components/navigation-tree-panel.component';
import { NavigationFormPart } from './parts/navigation-form/navigation-form.part';
import { useSiteNavigation } from './use-site-navigation.hook';
import { useContentSettingsViewMode } from '../../hooks/use-content-settings-view-mode.hook';

const SiteNavigationPage = () => {
  const nav = useSiteNavigation();
  const { viewMode, enterEditMode, cancelEditMode } = useContentSettingsViewMode(() => {
    nav.resetToIdle();
  });

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, minHeight: 0, boxSizing: 'border-box' }}>
      <WrapperComponent
        label={
          <NavigationPageHeader
            viewMode={viewMode}
            onEnterEdit={enterEditMode}
            onCancelEdit={cancelEditMode}
            hasPendingPublish={nav.publishStatus?.hasPendingPublish}
            publishing={nav.publishing}
            onPublish={() => void nav.handlePublish()}
          />
        }
      >
        <StackRowAlignCenter sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', gap: 2 }}>
          <NavigationTreePanel
            viewMode={viewMode}
            tree={nav.tree}
            isLoading={nav.isTreeLoading}
            selectedId={nav.screenState.selectedId}
            expandedIds={nav.expandedIds}
            onToggleExpanded={nav.toggleExpanded}
            onAddRoot={() => {
              if (viewMode) return;
              nav.startCreate(null);
            }}
            onAddChild={(node) => {
              if (viewMode) return;
              nav.startCreate(node);
            }}
            onArchive={viewMode ? () => undefined : nav.setArchiveTarget}
            onSelect={nav.startEdit}
            onReorder={viewMode ? () => undefined : (parentId, orderedNodes) => void nav.handleTreeReorder(parentId, orderedNodes)}
            onInvalidDrop={() =>
              nav.showSnackbar({
                type: SnackbarType.ERROR,
                message: 'Kéo thả hiện hỗ trợ sắp xếp trong cùng một cấp. Đổi cấp cha/con đang được phát triển.',
              })
            }
          />

          <Stack
            sx={{
              flex: '6 1 0%',
              minWidth: 0,
              minHeight: 0,
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              p: 2,
            }}
          >
            <NavigationFormPart
              viewMode={viewMode}
              screenState={nav.screenState}
              selectedTreeNode={nav.selectedTreeNode}
              form={nav.form}
              formErrors={nav.formErrors}
              saving={nav.saving}
              menuPopupLocked={nav.menuPopupLocked}
              categoryTree={nav.categoryTree}
              categoryOptions={nav.categoryOptions}
              tree={nav.tree}
              pages={nav.pages}
              pageOptions={nav.pageOptions}
              sourceName={nav.sourceName ?? ''}
              isPageTargetBroken={nav.isPageTargetBroken}
              isCategoryTargetBroken={nav.isCategoryTargetBroken}
              selectedDetail={nav.selectedDetail}
              updateForm={nav.updateForm}
              setForm={nav.setForm}
              setFormErrors={nav.setFormErrors}
              onCancel={nav.resetToIdle}
              onSave={() => void nav.handleSave()}
              onSelectBadge={nav.selectBadge}
            />
          </Stack>
        </StackRowAlignCenter>
      </WrapperComponent>

      <NavigationDialogs
        archiveTarget={nav.archiveTarget}
        conflict={nav.conflict}
        saving={nav.saving}
        onCloseArchive={() => nav.setArchiveTarget(null)}
        onConfirmArchive={() => void nav.handleArchive()}
        onCloseConflict={nav.closeConflict}
        onConfirmConflict={() => void nav.handleConfirmConflictReplace()}
      />
    </Stack>
  );
};

export default SiteNavigationPage;
