import { useState } from 'react';
import { Stack } from '@mui/material';
import { STYLE } from '@/trading-ui/adapters/library';
import { WrapperComponent } from '../../../../components/wrapper';
import { StackRowAlignCenter } from '../../../../components/styled/stack.style';
import { CategoryPageViews } from './category.enum';
import { CategoryCreatePart } from './parts/category-create/category-create.part';
import { CategoryListPart } from './parts/category-list/category-list.part';
import { CategoryUpdatePart } from './parts/category-update/category-update.part';
import { type CategoryGlobalState } from './category.interface';
import useSWR from 'swr';
import { attributeApi } from '../../../../apis';
import { AttributeStatus } from '../../../../apis/attribute/attribute.enum';

const CategoryPage = () => {
  // state
  const [screenState, setScreenState] = useState<CategoryGlobalState>({
    view: CategoryPageViews.LIST,
    selectedCategoryId: undefined,
    createParent: null,
  });
  const panelOpen = screenState.view !== CategoryPageViews.LIST;

  // function
  const { data: attributeList } = useSWR(
    panelOpen ? (['product/admin/attributes'] as const) : null,
    () => attributeApi.getAttributeList({ status: AttributeStatus.ACTIVE, isPagination: false, page: 0, take: 0 }),
    {
      revalidateOnFocus: false,
    },
  );

  return (
    <Stack
      sx={{
        height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`,
        boxSizing: 'border-box',
        minHeight: 0,
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <WrapperComponent label="Danh mục sản phẩm">
          <StackRowAlignCenter sx={{ flex: 1, minHeight: 0, alignItems: 'stretch', gap: 2 }}>
            <Stack sx={{ flex: panelOpen ? '4 1 0%' : '1 1 auto', minWidth: 0, minHeight: 0 }}>
              <CategoryListPart screenState={screenState} setScreenState={setScreenState} />
            </Stack>

            {panelOpen ? (
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
                {screenState.view === CategoryPageViews.CREATE ? (
                  <CategoryCreatePart attributeList={attributeList?.list || []} screenState={screenState} setScreenState={setScreenState} />
                ) : screenState.view === CategoryPageViews.UPDATE && screenState.selectedCategoryId ? (
                  <CategoryUpdatePart attributeList={attributeList?.list || []} screenState={screenState} setScreenState={setScreenState} />
                ) : null}
              </Stack>
            ) : null}
          </StackRowAlignCenter>
        </WrapperComponent>
      </Stack>
    </Stack>
  );
};

export default CategoryPage;
