// Kho giao/nhận của phiếu đổi trả lấy cùng nguồn với form đơn hàng: OMS `orders/warehouses` (kho WMS, mã tỉnh/phường đã đổi sang mã GHN).
import { type Dispatch, type SetStateAction, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { isJavaBackend } from '@/common/config/app.config';
import { getOrderWarehouses } from '../../../apis/order';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import type { ReturnExchangeStepConfirmPartProps, ReturnExchangeWarehouseOption } from '../order.types';

type PickupAddress = ReturnExchangeStepConfirmPartProps['pickupAddress'];

const ORDER_WAREHOUSES_SWR_KEY = ['order-warehouses'] as const;
const DEFAULT_PICKUP_PHONE = '0900000000';

export const mapWarehouseOptionToPickupAddress = (warehouse: ReturnExchangeWarehouseOption): PickupAddress => ({
  warehouseId: warehouse.value,
  ...(warehouse.code ? { warehouseCode: warehouse.code } : {}),
  warehouseName: warehouse.label,
  addressLine: warehouse.addressLine,
  provinceCode: warehouse.provinceCode,
  provinceName: warehouse.provinceName,
  wardCode: warehouse.wardCode,
  wardName: warehouse.wardName,
  phone: warehouse.phone,
});

/**
 * Tải kho từ OMS và tự chọn kho khi phiếu chưa có kho.
 * `preferredWarehouseId` (kho của đơn gốc) được ưu tiên nếu OMS có trả kho đó; không thì lấy kho đầu tiên.
 */
export const useReturnExchangeWarehouseOptions = (setPickupAddress: Dispatch<SetStateAction<PickupAddress>>, preferredWarehouseId?: string | null) => {
  const { showSnackbar } = useSnackbar();
  const { data } = useSWR(isJavaBackend() ? null : ORDER_WAREHOUSES_SWR_KEY, () => getOrderWarehouses(), {
    revalidateOnFocus: false,
    onError: (error) => {
      console.error('Failed to fetch order warehouses:', error);
      showSnackbar({ type: SnackbarType.ERROR, message: 'Không tải được danh sách kho giao/nhận.' });
    },
  });

  const warehouseOptions = useMemo<ReturnExchangeWarehouseOption[]>(
    () =>
      (data ?? [])
        .filter((w) => Boolean(w.warehouseId))
        .map((w) => ({
          value: String(w.warehouseId),
          label: w.warehouseName || w.warehouseCode || String(w.warehouseId),
          code: w.warehouseCode,
          addressLine: w.addressLine ?? '',
          provinceCode: w.provinceCode ?? 0,
          provinceName: w.provinceName ?? '',
          wardCode: w.wardCode ?? 0,
          wardName: w.wardName ?? '',
          phone: w.phone || DEFAULT_PICKUP_PHONE,
        })),
    [data],
  );

  useEffect(() => {
    if (!warehouseOptions.length) return;
    const preferred = preferredWarehouseId ? warehouseOptions.find((w) => w.value === preferredWarehouseId) : undefined;
    setPickupAddress((prev) => {
      if (preferred) return prev.warehouseId === preferred.value ? prev : mapWarehouseOptionToPickupAddress(preferred);
      return prev.warehouseId ? prev : mapWarehouseOptionToPickupAddress(warehouseOptions[0]);
    });
  }, [preferredWarehouseId, setPickupAddress, warehouseOptions]);

  return warehouseOptions;
};
