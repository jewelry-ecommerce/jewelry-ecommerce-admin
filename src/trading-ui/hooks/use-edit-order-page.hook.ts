import { useOrderDraftFormPage } from './use-order-draft-form-page.hook';

export interface UseEditOrderPageArgs {
  orderId: string;
}

/**
 * Hook riêng cho màn chỉnh sửa đơn.
 * Tách khỏi màn create để dễ maintain theo nghiệp vụ edit.
 */
export const useEditOrderPage = ({ orderId }: UseEditOrderPageArgs) => useOrderDraftFormPage({ mode: 'edit', orderId });
