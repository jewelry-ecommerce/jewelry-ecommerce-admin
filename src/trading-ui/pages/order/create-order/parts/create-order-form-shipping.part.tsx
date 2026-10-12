import { LocalShippingOutlined } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { memo, useMemo, useState } from 'react';
import { Controller, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { SelectInput, TextInput } from '../../../../components/form';
import TextFieldSelectSearchComponent from '../../../../components/form/text-field-select-search.component';
import { ShippingCarrierServiceSelector } from '../../../../components/order/shipping-carrier-service-selector.component';
import type { CreateOrderFormValues, FieldOption, ShippingServiceOption, WarehouseOption } from '../create-order.interface';
import { ORDER_FORM_CARD_SX, ORDER_FORM_SECTION_TITLE_SX } from './create-order-form.shared';
import { IconGhn } from '../../../../assets/icon';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { StackRow, StackRowAlignCenter } from '../../../../components/styled';
import { MarkerPin01 } from '@untitledui/icons';

export interface CreateOrderFormShippingPartProps {
  control: Control<CreateOrderFormValues>;
  errors: FieldErrors<CreateOrderFormValues>;
  provinceOptions?: FieldOption[];
  wardOptions?: FieldOption[];
  shippingCarrierOptions?: FieldOption[];
  shippingServiceOptions?: ShippingServiceOption[];
  shippingServiceLoading?: boolean;
  shippingServiceFetchFailed?: boolean;
  onSyncShippingServices?: () => void;
  warehouseOptions?: WarehouseOption[];
  omsManaged?: boolean;
  onProvinceChange: (rawValue: string | number, onChange: (value: number | '') => void) => void;
  onWardChange: (rawValue: string | number, onChange: (value: number | '') => void) => void;
}

export const CreateOrderFormShippingPart = memo(function CreateOrderFormShippingPart({
  control,
  errors,
  provinceOptions = [],
  wardOptions = [],
  shippingCarrierOptions = [],
  shippingServiceOptions = [],
  shippingServiceLoading = false,
  shippingServiceFetchFailed = false,
  onSyncShippingServices,
  warehouseOptions = [],
  omsManaged = false,
  onProvinceChange,
  onWardChange,
}: CreateOrderFormShippingPartProps) {
  const warehouseId = useWatch({ control, name: 'warehouseId' });
  const provinceCode = useWatch({ control, name: 'provinceCode' });
  const wardCode = useWatch({ control, name: 'wardCode' });
  const addressLine = useWatch({ control, name: 'addressLine' });
  const shippingCarrier = useWatch({ control, name: 'shippingCarrier' });
  const selectedWarehouse = warehouseOptions.find((option) => String(option.value) === String(warehouseId));
  const selectedShippingCarrierOption = shippingCarrierOptions.find((option) => String(option.value) === String(shippingCarrier));
  const [provinceSearchValue, setProvinceSearchValue] = useState('');
  const [wardSearchValue, setWardSearchValue] = useState('');
  const normalizedShippingCarrier = String(shippingCarrier ?? '')
    .trim()
    .toLowerCase();
  const canSelectShippingService = provinceCode !== '' && wardCode !== '' && String(addressLine ?? '').trim() !== '' && String(shippingCarrier ?? '') !== '';
  const shippingServiceLockedMessage = 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Phường/Xã, Địa chỉ chi tiết và Đơn vị vận chuyển để mở dịch vụ giao hàng.';
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

  return (
    <Paper elevation={0} sx={ORDER_FORM_CARD_SX}>
      <Typography sx={{ ...ORDER_FORM_SECTION_TITLE_SX, mb: 1.5 }}>
        <LocalShippingOutlined sx={{ ...TYPOGRAPHY_STYLES.base.semibold }} />
        Thông tin vận chuyển
      </Typography>
      <Stack gap={1.5}>
        {!omsManaged ? (
          <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5, gap: 2 }}>
            <StackRowAlignCenter gap={1} mb={2}>
              <MarkerPin01 size={16} />
              <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Địa chỉ của kho giao/nhận</Typography>
            </StackRowAlignCenter>
            <Stack gap={2}>
              <Controller
                control={control}
                name="warehouseId"
                rules={{ required: 'Vui lòng chọn kho giao/nhận' }}
                render={({ field }) => (
                  <SelectInput
                    requiredMark
                    label="Chọn kho giao/nhận"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Chọn kho"
                    options={warehouseOptions}
                    error={Boolean(errors.warehouseId)}
                    helperText={errors.warehouseId?.message}
                  />
                )}
              />
              <TextInput requiredMark label="Địa chỉ chi tiết" value={selectedWarehouse?.addressLine ?? ''} placeholder="Chưa có địa chỉ" disabled />
            </Stack>
          </Box>
        ) : null}
        <Box sx={{ border: '1px solid #E4E7EC', borderRadius: 1.25, p: 1.5 }}>
          <StackRowAlignCenter gap={1} mb={2}>
            <MarkerPin01 size={16} />
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold }}>Địa chỉ của khách hàng</Typography>
          </StackRowAlignCenter>
          <Stack gap={2}>
            <StackRow>
              <Controller
                control={control}
                name="provinceCode"
                rules={{ required: 'Vui lòng chọn Tỉnh/Thành phố' }}
                render={({ field }) => (
                  <TextFieldSelectSearchComponent
                    label="Tỉnh/Thành phố"
                    requiredMark
                    value={field.value}
                    options={filteredProvinceOptions}
                    searchValue={provinceSearchValue}
                    onSearch={setProvinceSearchValue}
                    onSelect={(value) => {
                      onProvinceChange(value, field.onChange);
                      setWardSearchValue('');
                    }}
                    error={typeof errors.provinceCode?.message === 'string' ? errors.provinceCode.message : undefined}
                  />
                )}
              />
              <Controller
                control={control}
                name="wardCode"
                rules={{ required: 'Vui lòng chọn Phường/Xã' }}
                render={({ field }) => (
                  <TextFieldSelectSearchComponent
                    label="Phường/Xã"
                    requiredMark
                    value={field.value}
                    disabled={provinceCode === ''}
                    options={filteredWardOptions}
                    searchValue={wardSearchValue}
                    onSearch={setWardSearchValue}
                    onSelect={(value) => onWardChange(value, field.onChange)}
                    error={errors.wardCode?.message ?? undefined}
                  />
                )}
              />
            </StackRow>
            <Controller
              control={control}
              name="addressLine"
              rules={{ required: 'Vui lòng nhập địa chỉ chi tiết' }}
              render={({ field }) => (
                <TextInput
                  requiredMark
                  label="Địa chỉ chi tiết"
                  placeholder="Số nhà, tên đường..."
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={Boolean(errors.addressLine)}
                  errorMessage={errors.addressLine?.message}
                />
              )}
            />
          </Stack>
        </Box>
        {!omsManaged ? (
          <Controller
            control={control}
            name="shippingCarrier"
            rules={{ required: 'Vui lòng chọn đơn vị vận chuyển' }}
            render={({ field }) => (
              <SelectInput
                requiredMark
                label="Đơn vị vận chuyển"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="Chọn đơn vị vận chuyển"
                options={shippingCarrierOptions}
                error={Boolean(errors.shippingCarrier)}
                helperText={errors.shippingCarrier?.message}
              />
            )}
          />
        ) : null}
        {!omsManaged ? (
          <Controller
            control={control}
            name="shippingService"
            rules={{ required: 'Vui lòng chọn dịch vụ giao hàng' }}
            render={({ field }) => (
              <ShippingCarrierServiceSelector
                carrierLabel="Đơn vị vận chuyển"
                carrierDisplayName={selectedShippingCarrierOption?.label || String(shippingCarrier || '—')}
                carrierIcon={normalizedShippingCarrier === 'ghn' ? <IconGhn /> : undefined}
                selectedServiceValue={String(field.value ?? '')}
                serviceOptions={shippingServiceOptions.map((service) => ({ ...service }))}
                isLoading={shippingServiceLoading}
                fetchFailed={shippingServiceFetchFailed}
                onRetryFetch={onSyncShippingServices}
                retryApiCode="api_order_services_with_leadtime"
                onChangeService={(value) => {
                  if (!canSelectShippingService) return;
                  field.onChange(value);
                }}
                disabled={!canSelectShippingService}
                disabledMessage={shippingServiceLockedMessage}
                errorMessage={canSelectShippingService ? errors.shippingService?.message : undefined}
              />
            )}
          />
        ) : null}
      </Stack>
    </Paper>
  );
});
