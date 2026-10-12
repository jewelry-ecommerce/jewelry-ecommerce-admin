import { Box, Stack, Typography } from '@mui/material';
import { LocalShippingOutlined, LocationOnOutlined } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { SelectInput, TextInput } from '../../../../components/form';
import TextFieldSelectSearchComponent from '../../../../components/form/text-field-select-search.component';
import { getProvinceList, getWardsByProvinceCode } from '../../../../apis/address/address.api';
import { type ShippingMethod } from '../../../../apis/order/order.enum';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { IconGhn } from '../../../../assets/icon';
import { ShippingCarrierServiceSelector } from '../../../../components/order/shipping-carrier-service-selector.component';
import type { ReturnExchangeShippingServiceOption, ReturnExchangeWarehouseOption } from '../../order.types';

interface PickupAddressValue {
  warehouseId: string;
  warehouseCode?: string;
  warehouseName: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  phone: string;
  wardCode: number;
  wardName: string;
}

interface ShippingAddressValue {
  lastName: string;
  firstName: string;
  receiverPhone: string;
  wardCode: number;
  wardName: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
}

export interface ReturnExchangeShippingInfoPartProps {
  pickupAddress: PickupAddressValue;
  shippingAddress: ShippingAddressValue;
  shippingMethod: ShippingMethod;
  shippingCarrier: string;
  carrierServiceId: number;
  warehouseOptions: ReturnExchangeWarehouseOption[];
  shippingServiceLoading: boolean;
  shippingServiceOptions: ReturnExchangeShippingServiceOption[];
  shipperNote: string;
  onChangePickupWarehouseId: (warehouseId: string) => void;
  onChangePickupAddress: (value: PickupAddressValue) => void;
  onChangeShippingAddress: (value: ShippingAddressValue) => void;
  onChangeShippingMethod: (value: ShippingMethod) => void;
  onChangeCarrierServiceId: (value: number) => void;
  onChangeShipperNote: (value: string) => void;
}

export const ReturnExchangeShippingInfoPart = ({
  pickupAddress,
  shippingAddress,
  shippingCarrier,
  carrierServiceId,
  warehouseOptions,
  shippingServiceLoading,
  shippingServiceOptions,
  shipperNote,
  onChangePickupWarehouseId,
  onChangePickupAddress,
  onChangeShippingAddress,
  onChangeShippingMethod,
  onChangeCarrierServiceId,
  onChangeShipperNote,
}: ReturnExchangeShippingInfoPartProps) => {
  const normalizedShippingCarrier = String(shippingCarrier ?? '')
    .trim()
    .toLowerCase();
  const [provinceSearchValue, setProvinceSearchValue] = useState('');
  const [wardSearchValue, setWardSearchValue] = useState('');
  const { data: provincesData } = useSWR('return-exchange-provinces', getProvinceList);
  const { data: wardsData } = useSWR(shippingAddress.provinceCode ? ['return-exchange-wards', shippingAddress.provinceCode] : null, () => getWardsByProvinceCode(shippingAddress.provinceCode));

  const provinceOptions = useMemo(() => {
    const options = (provincesData?.list ?? []).map((province) => ({ value: province.code, label: province.name }));
    if (options.some((option) => option.value === shippingAddress.provinceCode)) return options;
    if (!shippingAddress.provinceCode) return options;
    return [{ value: shippingAddress.provinceCode, label: shippingAddress.provinceName }, ...options];
  }, [provincesData?.list, shippingAddress.provinceCode, shippingAddress.provinceName]);

  const wardOptions = useMemo(() => {
    const options = (wardsData?.list ?? []).map((ward) => ({ value: ward.code, label: ward.name }));
    if (options.some((option) => option.value === shippingAddress.wardCode)) return options;
    if (!shippingAddress.wardCode) return options;
    return [{ value: shippingAddress.wardCode, label: shippingAddress.wardName }, ...options];
  }, [shippingAddress.wardCode, shippingAddress.wardName, wardsData?.list]);

  const filteredProvinceOptions = useMemo(() => {
    const keyword = provinceSearchValue.trim().toLowerCase();
    if (!keyword) return provinceOptions;
    return provinceOptions.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [provinceOptions, provinceSearchValue]);

  const filteredWardOptions = useMemo(() => {
    const keyword = wardSearchValue.trim().toLowerCase();
    if (!keyword) return wardOptions;
    return wardOptions.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [wardOptions, wardSearchValue]);

  const pickupWarehouseOptions = useMemo(() => {
    const options = warehouseOptions.map((warehouse) => ({ value: warehouse.value, label: warehouse.label }));
    if (options.some((option) => option.value === pickupAddress.warehouseId)) return options;
    if (!pickupAddress.warehouseId) return options;
    return [{ value: pickupAddress.warehouseId, label: pickupAddress.warehouseName || pickupAddress.warehouseId }, ...options];
  }, [pickupAddress.warehouseId, pickupAddress.warehouseName, warehouseOptions]);

  return (
    <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.5, p: 1.5, bgcolor: '#FFFFFF' }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 1.5 }}>
        <LocalShippingOutlined sx={{ ...TYPOGRAPHY_STYLES.base.semibold }} />
        Thông tin vận chuyển
      </Typography>

      <Stack gap={1.5}>
        <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5, bgcolor: '#FFFFFF' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 1.25 }}>
            <LocationOnOutlined sx={{ fontSize: 14, mr: 0.75, verticalAlign: 'middle' }} />
            Địa chỉ của kho giao/nhận
          </Typography>
          <Stack gap={1.25}>
            <SelectInput
              fullWidth
              label="Chọn kho giao/nhận"
              requiredMark
              value={pickupAddress.warehouseId}
              options={pickupWarehouseOptions}
              onChange={(e) => onChangePickupWarehouseId(String(e.target.value))}
            />
            <TextInput fullWidth label="Địa chỉ chi tiết" requiredMark value={pickupAddress.addressLine} onChange={(e) => onChangePickupAddress({ ...pickupAddress, addressLine: e.target.value })} />
          </Stack>
        </Box>

        <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5, bgcolor: '#FFFFFF' }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, mb: 1.25 }}>
            <LocationOnOutlined sx={{ fontSize: 14, mr: 0.75, verticalAlign: 'middle' }} />
            Địa chỉ của khách hàng
          </Typography>
          <Stack gap={1.25}>
            <Stack direction="row" gap={1.25}>
              <TextFieldSelectSearchComponent
                label="Tỉnh/Thành phố"
                requiredMark
                value={shippingAddress.provinceCode}
                options={filteredProvinceOptions}
                searchValue={provinceSearchValue}
                onSearch={setProvinceSearchValue}
                onSelect={(value) => {
                  const provinceCode = Number(value);
                  const provinceName = provinceOptions.find((option) => option.value === provinceCode)?.label || shippingAddress.provinceName;
                  onChangeShippingAddress({
                    ...shippingAddress,
                    provinceCode,
                    provinceName,
                    wardCode: 0,
                    wardName: '',
                  });
                  setWardSearchValue('');
                }}
              />
              <TextFieldSelectSearchComponent
                label="Phường/Xã"
                requiredMark
                disabled={!shippingAddress.provinceCode}
                value={shippingAddress.wardCode}
                options={filteredWardOptions}
                searchValue={wardSearchValue}
                onSearch={setWardSearchValue}
                onSelect={(value) =>
                  // Keep selected ward name in payload sent to API.
                  onChangeShippingAddress({
                    ...shippingAddress,
                    wardCode: Number(value),
                    wardName: wardOptions.find((option) => option.value === Number(value))?.label || shippingAddress.wardName,
                  })
                }
              />
            </Stack>
            <TextInput
              fullWidth
              label="Địa chỉ chi tiết"
              requiredMark
              value={shippingAddress.addressLine}
              onChange={(e) => onChangeShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
            />
          </Stack>
        </Box>

        <ShippingCarrierServiceSelector
          carrierLabel="Đơn vị vận chuyển"
          carrierDisplayName={normalizedShippingCarrier === 'ghn' ? 'Giao hàng nhanh' : String(shippingCarrier || '—')}
          carrierIcon={normalizedShippingCarrier === 'ghn' ? <IconGhn /> : undefined}
          selectedServiceValue={String(carrierServiceId > 0 ? carrierServiceId : '')}
          isLoading={shippingServiceLoading}
          serviceOptions={shippingServiceOptions.map((service) => ({ ...service }))}
          onChangeService={(value) => {
            const service = shippingServiceOptions.find((item) => item.value === value);
            const serviceId = Number(value);
            if (Number.isFinite(serviceId) && serviceId > 0) onChangeCarrierServiceId(serviceId);
            if (service) onChangeShippingMethod(service.method);
          }}
          noteValue={shipperNote}
          onChangeNote={onChangeShipperNote}
        />
      </Stack>
    </Box>
  );
};
