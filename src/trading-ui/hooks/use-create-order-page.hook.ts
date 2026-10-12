import { useOrderDraftFormPage } from './use-order-draft-form-page.hook';

/**
 * Hook riêng cho màn tạo đơn.
 * Tách khỏi màn edit để tránh mode-switch ở tầng page.
 */
export const useCreateOrderPage = () =>
  useOrderDraftFormPage({
    mode: 'create',
    cloneFromId: null,
  });
