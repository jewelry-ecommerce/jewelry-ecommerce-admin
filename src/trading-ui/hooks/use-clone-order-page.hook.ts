import { useOrderDraftFormPage } from './use-order-draft-form-page.hook';

export interface UseCloneOrderPageArgs {
  sourceOrderId: string;
}

/**
 * Hook riêng cho màn sao chép đơn.
 * Nghiệp vụ clone dùng luồng create (POST) nhưng giao diện giống màn edit.
 */
export const useCloneOrderPage = ({ sourceOrderId }: UseCloneOrderPageArgs) =>
  useOrderDraftFormPage({
    mode: 'create',
    cloneFromId: sourceOrderId,
  });
