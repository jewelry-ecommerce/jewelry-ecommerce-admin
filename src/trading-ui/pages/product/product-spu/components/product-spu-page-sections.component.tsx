import { Box, Stack, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { formatDate } from '../../../../common/utils/date-format.util';
import { PrefixedNumericInput } from '@/trading-ui/components/form/prefixed-numeric-input';
import { TextDateInput } from '../../../../components/form/text-date-input';
import { StackRowAlignCenter } from '../../../../components/styled';
import { useSectionNavigation } from '../hooks/use-section-navigation.hook';
import { PRODUCT_SPU_SIDEBAR_SECTIONS } from '../product-spu.constant';
import { ProductSpuSidebar } from './product-spu-sidebar.component';
import { type ProductSpuMatrixFieldCellProps, type ProductSpuPageSectionsFrameProps } from '../product-spu.interface';
import { TextInput } from '../../../../components/form';
import { formatProductMoney, parseProductMoneyInput } from '../utils/product-spu-currency.utils';

export const ProductSpuMatrixFieldCell = ({
  disabled = false,
  readOnly,
  type = 'number',
  value,
  onChange,
  placeholder,
  prefix,
  onBlur,
  numericTooltip,
  error = false,
  errorMessage,
}: ProductSpuMatrixFieldCellProps) => {
  if (readOnly) {
    if (type === 'date') {
      const v = value?.trim();
      if (!v) return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>—</Typography>;
      const formatted = formatDate(v);
      return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>{formatted !== '—' ? formatted : v}</Typography>;
    }
    const display = type === 'currency' ? formatProductMoney(value) : value?.trim();
    return <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#27272A' }}>{display ? display : '—'}</Typography>;
  }

  if (type === 'text') {
    return (
      <TextInput
        size="small"
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        error={error}
        errorMessage={errorMessage}
      />
    );
  }

  if (type === 'date') {
    return <TextDateInput value={value} onChange={onChange} placeholder={placeholder} onBlur={onBlur} disabled={disabled} />;
  }

  if (type === 'currency') {
    return (
      <PrefixedNumericInput
        prefix={prefix ?? 'đ'}
        value={formatProductMoney(value)}
        onChange={(raw) => onChange(parseProductMoneyInput(raw))}
        placeholder={placeholder}
        onBlur={onBlur}
        disabled={disabled}
        tooltipContent={numericTooltip}
        error={error}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <PrefixedNumericInput
      prefix={prefix}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onBlur={onBlur}
      disabled={disabled}
      tooltipContent={numericTooltip}
      error={error}
      errorMessage={errorMessage}
    />
  );
};

// ------------------------------------------------------------
export const ProductSpuPageSectionsFrame = ({ sections, scrollAreaMaxHeight = 'calc(100vh - 200px)', sx }: ProductSpuPageSectionsFrameProps) => {
  const visibleSections = useMemo(() => PRODUCT_SPU_SIDEBAR_SECTIONS.filter((d) => sections.some((s) => s.key === d.key)), [sections]);

  const { activeKey, sectionRefs, scrollContainerRef, handleNavigate } = useSectionNavigation({
    visibleSections,
    initialActiveKey: visibleSections[0]!.key,
  });

  return (
    <Stack sx={sx}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(200px, 240px) minmax(0, 1fr)' },
          gap: '16px',
          minWidth: 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            position: { md: 'sticky' },
            top: { md: 16 },
            minWidth: 0,
          }}
        >
          <ProductSpuSidebar items={visibleSections} activeKey={activeKey} onNavigate={handleNavigate} />
        </Box>

        <Box
          ref={scrollContainerRef}
          sx={{
            minWidth: 0,
            maxHeight: scrollAreaMaxHeight,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            pr: { xs: 0, md: 0.5 },
          }}
        >
          {sections.map((section) => (
            <Box
              key={section.key}
              ref={(el) => {
                sectionRefs.current[section.key] = el as HTMLElement;
              }}
              sx={{ minWidth: 0, maxWidth: '100%' }}
            >
              {section.content}
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

// ------------------------------------------------------------
export const ProductSpuSectionPanel = ({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) => (
  <Stack
    sx={{
      border: '1px solid #E5E7EB',
      borderRadius: '10px',
      bgcolor: '#FFFFFF',
      p: 2,
      boxSizing: 'border-box',
      gap: 3,
    }}
  >
    <StackRowAlignCenter gap={1}>
      {icon && icon}
      <Typography sx={{ ...TYPOGRAPHY_STYLES.md.semibold, color: '#101828' }}>{title}</Typography>
    </StackRowAlignCenter>
    {children}
  </Stack>
);
