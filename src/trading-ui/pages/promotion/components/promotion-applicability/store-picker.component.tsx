import { Autocomplete, Box, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { posApi, type PosStore } from '../../../../apis';
import { useDebouncedValue } from '../../../../common/utils/order/create-order.utils';
import { formLabelSx } from '../../../../components/form/form-field.styles';
import { TextInput } from '../../../../components/form/text-input';

/** Stores matching the given codes exactly - the store list API only offers keyword search. */
const lookupStoresByCode = async (codes: string[]): Promise<PosStore[]> => {
  const results = await Promise.all(codes.map((code) => posApi.getPosStoreList({ page: 1, take: 10, keyword: code }).catch(() => null)));
  return results.flatMap((result) => result?.list ?? []).filter((store) => codes.includes(store.code));
};

/** Store name by code, for read-only displays. Codes not found are absent from the map. */
export const useStoreNames = (codes: string[]): Record<string, string> => {
  const { data } = useSWR(codes.length > 0 ? (['pos-store-names', codes.join(',')] as const) : null, () => lookupStoresByCode(codes));
  return useMemo(() => Object.fromEntries((data ?? []).filter((store) => store.name).map((store) => [store.code, store.name])), [data]);
};

/** `names` from useStoreNames; falls back to the code while loading or when the store is gone. */
export const formatStoreNames = (codes: string[], names: Record<string, string>) => codes.map((code) => names[code] || code).join(', ');

/**
 * Multi-select store picker.
 *
 * Deliberately not SelectAllInput: that renders one label in both the dropdown
 * and the chip, and its chips are capped at 140px on a single non-wrapping row.
 * A store needs `CODE — Name — Address` to be identifiable, which truncates to
 * an unreadable stub and clips the remove button. Here the dropdown row carries
 * the full detail while the chip shows just the store name, and chips wrap.
 */
export const StorePicker = ({
  label,
  value,
  onChange,
  requiredMark = false,
  disabled = false,
  errorMessage,
  placeholder = 'Tìm theo mã hoặc tên cửa hàng',
  emptyText = 'Chưa chọn cửa hàng nào',
}: {
  label: string;
  value: string[];
  onChange: (codes: string[]) => void;
  requiredMark?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  placeholder?: string;
  emptyText?: string;
}) => {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, 400);

  const { data, isLoading } = useSWR(['pos-store-picker', debouncedKeyword] as const, () => posApi.getPosStoreList({ page: 1, take: 50, keyword: debouncedKeyword.trim() || undefined }), {
    keepPreviousData: true,
  });

  const options = useMemo(() => data?.list ?? [], [data]);

  /**
   * Every store seen so far, by code. The chip shows the store name, but a
   * selected store may not be in the current (searched) page - remembering
   * past results keeps its name after the keyword changes.
   */
  const [knownStores, setKnownStores] = useState<Record<string, PosStore>>({});
  useEffect(() => {
    if (options.length === 0) return;
    setKnownStores((current) => ({ ...current, ...Object.fromEntries(options.map((store) => [store.code, store])) }));
  }, [options]);

  // Saved codes outside the first page (e.g. on reload): look each one up by code.
  const missingCodes = value.filter((code) => !knownStores[code]);
  const { data: resolvedStores } = useSWR(missingCodes.length > 0 && !isLoading ? (['pos-store-picker-resolve', missingCodes.join(',')] as const) : null, () => lookupStoresByCode(missingCodes));
  useEffect(() => {
    if (!resolvedStores?.length) return;
    setKnownStores((current) => ({ ...current, ...Object.fromEntries(resolvedStores.map((store) => [store.code, store])) }));
  }, [resolvedStores]);

  /** Unknown codes stay as code-only stubs so selection is never silently dropped. */
  const selectedStores: PosStore[] = useMemo(() => value.map((code) => knownStores[code] ?? ({ id: code, code, name: '' } as PosStore)), [value, knownStores]);

  return (
    <Stack gap={0.5}>
      <Typography sx={formLabelSx}>
        {label}
        {requiredMark && <span style={{ color: '#D92D20' }}> *</span>}
      </Typography>

      <Autocomplete
        multiple
        disableCloseOnSelect
        disabled={disabled}
        options={options}
        value={selectedStores}
        loading={isLoading}
        filterOptions={(x) => x}
        isOptionEqualToValue={(option, selected) => option.code === selected.code}
        getOptionLabel={(option) => option.code}
        onInputChange={(_event, next, reason) => {
          if (reason === 'input') setKeyword(next);
        }}
        onChange={(_event, next) => onChange(next.map((store) => store.code))}
        noOptionsText={isLoading ? 'Đang tải...' : 'Không tìm thấy cửa hàng'}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.code}>
            <Stack gap={0.25} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {option.code}
                {option.name ? ` — ${option.name}` : ''}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{[option.brand, option.address, option.wardName, option.provinceName].filter(Boolean).join(' · ') || '—'}</Typography>
            </Stack>
          </Box>
        )}
        renderTags={(tags, getTagProps) =>
          tags.map((store, index) => {
            const { key, ...chipProps } = getTagProps({ index });
            return <Chip key={key} {...chipProps} size="small" label={store.name || store.code} title={store.name ? `${store.code} — ${store.name}` : store.code} sx={{ maxWidth: 220 }} />;
          })
        }
        sx={{
          // Chips wrap instead of being clipped on one row - a promotion can
          // legitimately name a dozen stores.
          '& .MuiOutlinedInput-root': { minHeight: 40, height: 'auto', flexWrap: 'wrap', py: 0.5, borderRadius: '8px' },
        }}
        renderInput={(params) => <TextInput {...params} placeholder={value.length === 0 ? placeholder : ''} errorMessage={errorMessage} error={Boolean(errorMessage)} />}
      />

      {value.length === 0 && !errorMessage && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{emptyText}</Typography>}
    </Stack>
  );
};
