import { Autocomplete, Box, Radio, TextField, Typography } from '@mui/material';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { useCallback, useMemo, useState } from 'react';
import { formInputSx, formLabelSx } from './form-field.styles';
import { StackRowAlignCenter, StackRowJustCenter } from '../styled';
import { IconArrowDown } from '../../assets/icon';
import { CheckboxComponent } from '../check-box/check-box.element';

export type AttributeTreeSelectOption = {
  group: string;
  value: string;
  label: string;
};

type Props = {
  label?: string;
  requiredMark?: boolean;
  placeholder?: string;
  options: readonly AttributeTreeSelectOption[];
  value: readonly string[];
  onChange: (next: readonly string[]) => void;
  selectionMode?: 'multiple' | 'single';
  optionIndicator?: 'checkbox' | 'radio' | 'none';
  onOpen?: () => void;
  onClose?: () => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  /** Tick cha/con độc lập: bỏ tick con không gỡ cha đã chọn. */
  independentParentSelection?: boolean;
};

const isGroupRootOption = (option: AttributeTreeSelectOption, all: readonly AttributeTreeSelectOption[]): boolean =>
  all.some((o) => o.group === option.group && o.value !== option.value && o.value.startsWith(`${option.value}:`));

const getDescendantOptions = (root: AttributeTreeSelectOption, all: readonly AttributeTreeSelectOption[]): AttributeTreeSelectOption[] =>
  all.filter((o) => o.group === root.group && o.value !== root.value && o.value.startsWith(`${root.value}:`));

const orderValuesByOptions = (set: Set<string>, all: readonly AttributeTreeSelectOption[]): string[] => all.filter((o) => set.has(o.value)).map((o) => o.value);

const pruneGroupRoots = (set: Set<string>, all: readonly AttributeTreeSelectOption[]): void => {
  for (const o of all) {
    if (!isGroupRootOption(o, all)) continue;
    const desc = getDescendantOptions(o, all);
    if (!desc.length) continue;
    const allDesc = desc.every((d) => set.has(d.value));
    if (allDesc) set.add(o.value);
    else set.delete(o.value);
  }
};

const stripDescendantsWhenRootRemoved = (set: Set<string>, removedRoot: AttributeTreeSelectOption, all: readonly AttributeTreeSelectOption[]): void => {
  set.delete(removedRoot.value);
  for (const d of getDescendantOptions(removedRoot, all)) set.delete(d.value);
};

const addRootAndDescendants = (set: Set<string>, root: AttributeTreeSelectOption, all: readonly AttributeTreeSelectOption[]): void => {
  set.add(root.value);
  for (const d of getDescendantOptions(root, all)) set.add(d.value);
};

const groupKeysInOrder = (all: readonly AttributeTreeSelectOption[]): string[] => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const o of all) {
    if (seen.has(o.group)) continue;
    seen.add(o.group);
    out.push(o.group);
  }
  return out;
};

const buildVisibleOptions = (all: readonly AttributeTreeSelectOption[], collapsedGroupKeys: ReadonlySet<string>): AttributeTreeSelectOption[] => {
  const out: AttributeTreeSelectOption[] = [];
  for (const g of groupKeysInOrder(all)) {
    const inGroup = all.filter((o) => o.group === g);
    const root = inGroup.find((o) => isGroupRootOption(o, all));
    const leaves = root ? inGroup.filter((o) => o.value !== root.value) : inGroup;
    if (root) {
      out.push(root);
      if (!collapsedGroupKeys.has(g)) out.push(...leaves);
    } else {
      out.push(...inGroup);
    }
  }
  return out;
};

const TREE_EXPANDER_WIDTH = 28;
const TREE_DEPTH_INDENT = 4;

const getOptionDepth = (option: AttributeTreeSelectOption): number => Math.max(0, option.value.split(':').filter(Boolean).length - 1);

const attributeTreeFilter = createFilterOptions<AttributeTreeSelectOption>();

const disabledReadableTextSx = {
  '& .MuiInputBase-input.Mui-disabled': {
    color: '#0F172A',
    WebkitTextFillColor: '#0F172A',
    opacity: 1,
  },
  '& .MuiChip-root.Mui-disabled': {
    opacity: 1,
  },
  '& .MuiChip-label.Mui-disabled': {
    color: '#0F172A',
    WebkitTextFillColor: '#0F172A',
    opacity: 1,
  },
};

export const SelectAttributeTreeInput = ({
  label,
  requiredMark = false,
  placeholder = 'Vui lòng chọn thuộc tính',
  options,
  value,
  onChange,
  selectionMode = 'multiple',
  optionIndicator,
  onOpen,
  onClose,
  disabled = false,
  error = false,
  errorMessage,
  independentParentSelection = false,
}: Props) => {
  const isSingleSelect = selectionMode === 'single';
  const resolvedIndicator: 'checkbox' | 'radio' | 'none' = optionIndicator ?? (isSingleSelect ? 'radio' : 'checkbox');
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(() => new Set());

  const toggleGroupExpand = useCallback((groupKey: string) => {
    setCollapsedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const selected = useMemo(() => options.filter((o) => value.includes(o.value)), [options, value]);
  const selectedSingle = selected[0] ?? null;
  const textFieldSx = useMemo(() => (disabled ? { ...formInputSx, ...disabledReadableTextSx } : formInputSx), [disabled]);

  const valueSet = useMemo(() => new Set(value), [value]);

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: AttributeTreeSelectOption[], reason: string, details?: { option: AttributeTreeSelectOption }) => {
      const opt = details?.option;
      const next = new Set(newValue.map((o) => o.value));

      if (reason === 'removeOption' && opt && isGroupRootOption(opt, options)) {
        stripDescendantsWhenRootRemoved(next, opt, options);
      } else if (reason === 'selectOption' && opt && isGroupRootOption(opt, options)) {
        addRootAndDescendants(next, opt, options);
      } else if (!independentParentSelection) {
        pruneGroupRoots(next, options);
      }

      onChange(orderValuesByOptions(next, options));
    },
    [independentParentSelection, onChange, options],
  );

  const handleSingleChange = useCallback(
    (_: React.SyntheticEvent, newValue: AttributeTreeSelectOption | null) => {
      if (!newValue) {
        onChange([]);
        return;
      }
      onChange([newValue.value]);
    },
    [onChange],
  );

  const renderTreeOption = useCallback(
    (props: React.HTMLAttributes<HTMLLIElement>, option: AttributeTreeSelectOption) => {
      const { key, ...liProps } = props as typeof props & { key?: string };
      void key;
      const isRoot = isGroupRootOption(option, options);
      const descendants = isRoot ? getDescendantOptions(option, options) : [];
      const someChild = descendants.some((d) => valueSet.has(d.value));
      const everyChild = descendants.length > 0 && descendants.every((d) => valueSet.has(d.value));
      const checked = isRoot && !isSingleSelect && !independentParentSelection ? everyChild : valueSet.has(option.value);
      const indeterminate = Boolean(!isSingleSelect && isRoot && (independentParentSelection ? someChild && !valueSet.has(option.value) : someChild && !everyChild));
      const groupExpanded = !collapsedGroupKeys.has(option.group);
      const showTreeArrow = isRoot && descendants.length > 0;
      const depth = getOptionDepth(option);

      return (
        <li key={option.value} {...liProps}>
          <StackRowAlignCenter sx={{ width: '100%', minWidth: 0, pl: depth * TREE_DEPTH_INDENT }}>
            <StackRowJustCenter
              sx={{
                width: TREE_EXPANDER_WIDTH,
                flexShrink: 0,
              }}
            >
              {showTreeArrow ? (
                <Box
                  component="span"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleGroupExpand(option.group);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleGroupExpand(option.group);
                    }
                  }}
                  sx={{
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '& svg': {
                      transition: 'transform 160ms ease',
                      transform: groupExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    },
                    '&:hover': { bgcolor: 'rgba(16,24,40,0.04)' },
                  }}
                >
                  <IconArrowDown />
                </Box>
              ) : null}
            </StackRowJustCenter>
            {resolvedIndicator === 'checkbox' ? <CheckboxComponent sx={{ p: 0 }} checked={checked} indeterminate={indeterminate} /> : null}
            {resolvedIndicator === 'radio' ? (
              <Radio
                size="small"
                checked={checked}
                sx={{
                  p: 0.25,
                  color: '#101828',
                  '&.Mui-checked': { color: '#101828' },
                }}
              />
            ) : null}
            <Typography component="span" variant="body2" sx={{ minWidth: 0 }} noWrap>
              {option.label}
            </Typography>
          </StackRowAlignCenter>
        </li>
      );
    },
    [collapsedGroupKeys, independentParentSelection, isSingleSelect, options, resolvedIndicator, toggleGroupExpand, valueSet],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {label ? (
        <Typography sx={formLabelSx}>
          {label}
          {requiredMark ? (
            <Box component="span" sx={{ color: '#FB2C36', ml: 0.5 }}>
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}

      {isSingleSelect ? (
        <Autocomplete
          disabled={disabled}
          options={[...options]}
          onOpen={onOpen}
          onClose={onClose}
          filterOptions={(opts, state) => buildVisibleOptions(attributeTreeFilter(opts, state), collapsedGroupKeys)}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          value={selectedSingle}
          onChange={handleSingleChange}
          renderOption={renderTreeOption}
          renderInput={(params) => <TextField {...params} placeholder={selectedSingle ? undefined : placeholder} error={error} size="small" sx={textFieldSx} />}
        />
      ) : (
        <Autocomplete
          multiple
          disableCloseOnSelect
          disabled={disabled}
          options={[...options]}
          onOpen={onOpen}
          onClose={onClose}
          filterOptions={(opts, state) => buildVisibleOptions(attributeTreeFilter(opts, state), collapsedGroupKeys)}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          value={selected}
          onChange={handleChange}
          renderOption={renderTreeOption}
          renderInput={(params) => <TextField {...params} placeholder={selected.length ? undefined : placeholder} error={error} size="small" sx={textFieldSx} />}
        />
      )}

      {error && errorMessage ? <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5 }}>{errorMessage}</Typography> : null}
    </Box>
  );
};
