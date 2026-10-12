 
import { CheckCircleRounded, WarningAmberRounded } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { PermissionIconButton } from '../../../components/button';

import { useMemo } from 'react';
import { type Order, type OrderShippingAddress } from '../order.types';

interface OrderDataStatusCellProps {
  order: Order;
  onSave?: (orderId: string, shippingAddress: OrderShippingAddress) => void;
}

// const normalizeShippingAddress = (shippingAddress: OrderShippingAddress): OrderShippingAddress => ({
//   ...shippingAddress,
//   firstName: shippingAddress.firstName.trim(),
//   lastName: shippingAddress.lastName.trim(),
//   receiverPhone: shippingAddress.receiverPhone.trim(),
//   provinceName: shippingAddress.provinceName.trim(),
//   wardName: shippingAddress.wardName.trim(),
//   addressLine: shippingAddress.addressLine.trim(),
// });

export const OrderDataStatusCell = ({ order, onSave: _onSave }: OrderDataStatusCellProps) => {
  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // const [draftShippingAddress, setDraftShippingAddress] = useState<OrderShippingAddress>(order.shippingAddress);
  // const [provinceOptions, setProvinceOptions] = useState<FieldOption[]>([]);
  // const [wardOptions, setWardOptions] = useState<FieldOption[]>([]);
  // const [provinceLoading, setProvinceLoading] = useState(false);
  // const [wardLoading, setWardLoading] = useState(false);
  // const [provinceSearchValue, setProvinceSearchValue] = useState('');
  // const [wardSearchValue, setWardSearchValue] = useState('');
  // const [provinceLoaded, setProvinceLoaded] = useState(false);
  // const [wardLoadedProvinceCode, setWardLoadedProvinceCode] = useState<number | null>(null);

  const hasErrorLogData = useMemo(() => {
    const errorLog = order.errorLog;
    if (!errorLog) return false;
    if (typeof errorLog === 'string') return errorLog.trim().length > 0;
    return Object.values(errorLog).some((value) => (value ?? '').toString().trim().length > 0);
  }, [order.errorLog]);

  const dataIssues = useMemo(() => {
    if (order.isDataValid === false && hasErrorLogData) {
      return ['Lỗi địa chỉ'];
    }
    return [];
  }, [hasErrorLogData, order.isDataValid]);
  const hasIssues = dataIssues.length > 0;
  // const selectedProvinceCode = draftShippingAddress.provinceCode ?? '';
  // const selectedWardCode = draftShippingAddress.wardCode ?? '';

  // const provinceOptionsWithSelected = useMemo(() => {
  //   const selectedProvinceCode = Number(draftShippingAddress.provinceCode ?? 0);
  //   const selectedProvinceName = draftShippingAddress.provinceName?.trim() ?? '';
  //   if (!Number.isFinite(selectedProvinceCode) || selectedProvinceCode <= 0 || !selectedProvinceName) {
  //     return provinceOptions;
  //   }

  //   const existed = provinceOptions.some((option) => String(option.value) === String(selectedProvinceCode));
  //   if (existed) return provinceOptions;

  //   return [{ value: selectedProvinceCode, label: selectedProvinceName }, ...provinceOptions];
  // }, [draftShippingAddress.provinceCode, draftShippingAddress.provinceName, provinceOptions]);

  // const wardOptionsWithSelected = useMemo(() => {
  //   const selectedCode = Number(draftShippingAddress.wardCode ?? 0);
  //   const selectedName = draftShippingAddress.wardName?.trim() ?? '';
  //   if (!Number.isFinite(selectedCode) || selectedCode <= 0 || !selectedName) {
  //     return wardOptions;
  //   }

  //   const existed = wardOptions.some((option) => String(option.value) === String(selectedCode));
  //   if (existed) return wardOptions;

  //   return [{ value: selectedCode, label: selectedName }, ...wardOptions];
  // }, [draftShippingAddress.wardCode, draftShippingAddress.wardName, wardOptions]);

  // const filteredProvinceOptions = useMemo(() => {
  //   const keyword = provinceSearchValue.trim().toLowerCase();
  //   if (!keyword) return provinceOptionsWithSelected;
  //   return provinceOptionsWithSelected.filter((option) => option.label.toLowerCase().includes(keyword));
  // }, [provinceOptionsWithSelected, provinceSearchValue]);

  // const filteredWardOptions = useMemo(() => {
  //   const keyword = wardSearchValue.trim().toLowerCase();
  //   if (!keyword) return wardOptionsWithSelected;
  //   return wardOptionsWithSelected.filter((option) => option.label.toLowerCase().includes(keyword));
  // }, [wardOptionsWithSelected, wardSearchValue]);

  // const loadProvinceOptions = async () => {
  //   if (provinceLoaded || provinceLoading) return;

  //   setProvinceLoading(true);
  //   try {
  //     const response = await getProvinceList();
  //     const options: FieldOption[] = (response.list ?? []).map((province) => ({
  //       value: province.code,
  //       label: province.name,
  //     }));
  //     setProvinceOptions(options);
  //     setProvinceLoaded(true);
  //   } catch {
  //     setProvinceOptions([]);
  //     setProvinceLoaded(true);
  //   } finally {
  //     setProvinceLoading(false);
  //   }
  // };

  // const loadWardOptions = async (provinceCodeRaw: number | null | undefined) => {
  //   const provinceCode = Number(provinceCodeRaw ?? 0);
  //   if (!Number.isFinite(provinceCode) || provinceCode <= 0) {
  //     setWardOptions([]);
  //     setWardLoadedProvinceCode(null);
  //     setWardLoading(false);
  //     return;
  //   }
  //   if (wardLoadedProvinceCode === provinceCode || wardLoading) return;

  //   setWardLoading(true);
  //   try {
  //     const response = await getWardsByProvinceCode(provinceCode);
  //     const options: FieldOption[] = (response.list ?? []).map((ward) => ({
  //       value: ward.code,
  //       label: ward.name,
  //     }));
  //     setWardOptions(options);
  //     setWardLoadedProvinceCode(provinceCode);
  //   } catch {
  //     setWardOptions([]);
  //     setWardLoadedProvinceCode(provinceCode);
  //   } finally {
  //     setWardLoading(false);
  //   }
  // };

  // const handleOpen = (event: MouseEvent<HTMLElement>) => {
  //   if (!hasIssues) return;

  //   setDraftShippingAddress(order.shippingAddress);
  //   setProvinceSearchValue('');
  //   setWardSearchValue('');
  //   setWardLoadedProvinceCode(null);
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  //   setDraftShippingAddress(order.shippingAddress);
  //   setProvinceSearchValue('');
  //   setWardSearchValue('');
  //   setWardLoadedProvinceCode(null);
  // };

  // const handleChange = <TKey extends keyof OrderShippingAddress>(field: TKey, value: OrderShippingAddress[TKey]) => {
  //   setDraftShippingAddress((currentAddress) => ({
  //     ...currentAddress,
  //     [field]: value,
  //   }));
  // };

  // const handleSave = () => {
  //   onSave(order.id, normalizeShippingAddress(draftShippingAddress));
  //   setAnchorEl(null);
  // };

  // const handleSelectProvince = (rawValue: string | number) => {
  //   const nextProvinceCode = Number(rawValue);
  //   const selectedOption = provinceOptionsWithSelected.find((option) => String(option.value) === String(rawValue));
  //   setDraftShippingAddress((currentAddress) => ({
  //     ...currentAddress,
  //     provinceCode: Number.isFinite(nextProvinceCode) && nextProvinceCode > 0 ? nextProvinceCode : null,
  //     provinceName: selectedOption?.label ?? '',
  //     wardCode: null,
  //     wardName: '',
  //   }));
  //   setWardOptions([]);
  //   setWardLoadedProvinceCode(null);
  //   setWardSearchValue('');
  // };

  // const handleSelectWard = (rawValue: string | number) => {
  //   const nextWardCode = Number(rawValue);
  //   const selectedOption = wardOptionsWithSelected.find((option) => String(option.value) === String(rawValue));
  //   setDraftShippingAddress((currentAddress) => ({
  //     ...currentAddress,
  //     wardCode: Number.isFinite(nextWardCode) && nextWardCode > 0 ? nextWardCode : null,
  //     wardName: selectedOption?.label ?? '',
  //   }));
  // };

  // const handleProvinceSearch = (keyword: string) => {
  //   setProvinceSearchValue(keyword);
  //   void loadProvinceOptions();
  // };

  // const handleWardSearch = (keyword: string) => {
  //   setWardSearchValue(keyword);
  //   void loadWardOptions(draftShippingAddress.provinceCode);
  // };

  if (!hasIssues) {
    return (
      <Tooltip title="Dữ liệu đầy đủ">
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#12B76A' }}>
          <CheckCircleRounded sx={{ fontSize: 20 }} />
        </Box>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title="Dữ liệu cần bổ sung">
        <PermissionIconButton
          size="small"
          // onClick={handleOpen}
          sx={{
            width: 28,
            height: 28,
            color: '#F79009',
            '&:hover': {
              backgroundColor: '#FFFAEB',
            },
          }}
        >
          <WarningAmberRounded sx={{ fontSize: 20 }} />
        </PermissionIconButton>
      </Tooltip>

      {/* <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 360,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0 18px 32px rgba(15, 23, 42, 0.14)',
          },
        }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditRounded sx={{ fontSize: 18, color: '#344054' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Bổ sung dữ liệu đơn hàng</Typography>
          </Stack>

          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              backgroundColor: '#FFFAEB',
              border: '1px solid #FDE68A',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#B54708', mb: 0.5 }}>
              Cần kiểm tra các mục sau
            </Typography>
            <Stack spacing={0.5}>
              {dataIssues.map((issue) => (
                <Typography key={issue} sx={{ fontSize: 12, color: '#92400E' }}>
                  - {issue}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Họ và tên"
                value={draftShippingAddress.firstName}
                onChange={(event) => handleChange('firstName', event.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="Tên"
                value={draftShippingAddress.lastName}
                onChange={(event) => handleChange('lastName', event.target.value)}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Số điện thoại"
              value={draftShippingAddress.receiverPhone}
              onChange={(event) => handleChange('receiverPhone', event.target.value)}
            />

            <Stack direction="row" spacing={1}>
              <TextFieldSelectSearchComponent
                label="Tỉnh/Thành phố"
                value={selectedProvinceCode}
                options={filteredProvinceOptions}
                searchValue={provinceSearchValue}
                onSearch={handleProvinceSearch}
                onSelect={handleSelectProvince}
                isLoading={provinceLoading}
              />
              <TextFieldSelectSearchComponent
                label="Phường/Xã"
                value={selectedWardCode}
                options={filteredWardOptions}
                searchValue={wardSearchValue}
                onSearch={handleWardSearch}
                onSelect={handleSelectWard}
                isLoading={wardLoading}
                disabled={!selectedProvinceCode}
              />
            </Stack>

            <TextField
              fullWidth
              size="small"
              label="Địa chỉ chi tiết"
              value={draftShippingAddress.addressLine}
              onChange={(event) => handleChange('addressLine', event.target.value)}
            />
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                minWidth: 88,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#D0D5DD',
                color: '#111827',
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                minWidth: 96,
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: '#111827',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#0B1220',
                  boxShadow: 'none',
                },
              }}
            >
              Lưu
            </Button>
          </Stack>
        </Stack>
      </Popover> */}
    </>
  );
};
