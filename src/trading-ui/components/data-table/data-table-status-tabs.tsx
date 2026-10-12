import { Box, ButtonBase } from '@mui/material';
import useEmblaCarousel from 'embla-carousel-react';
import { TYPOGRAPHY_STYLES } from '../../common/constant/typography.constant';
import { type DataTableStatusTab } from './data-table.types';

interface DataTableStatusTabsProps<TValue extends string | number> {
  tabs: Array<DataTableStatusTab<TValue>>;
  activeValue: TValue;
  onChange: (value: TValue) => void;
  variant?: 'default' | 'pill';
}

const STATUS_TAB_TONE_STYLES = {
  active: {
    labelColor: '#111827',
    countBgColor: '#111827',
    countTextColor: '#FFFFFF',
  },
  highlighted: {
    labelColor: '#EA580C',
    countBgColor: '#FFF7ED',
    countTextColor: '#C2410C',
  },
  default: {
    labelColor: '#6B7280',
    countBgColor: '#EEF2F7',
    countTextColor: '#475569',
  },
} as const;

export const DataTableStatusTabs = <TValue extends string | number>({ tabs, activeValue, onChange, variant = 'default' }: DataTableStatusTabsProps<TValue>) => {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        ...(variant === 'default' ? { borderBottom: '1px solid #E5E7EB' } : { pb: 1 }),
      }}
    >
      <Box ref={emblaRef} sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: variant === 'pill' ? 1.5 : 2.5,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.value === activeValue;

            if (variant === 'pill') {
              return (
                <Box key={tab.value} sx={{ flex: '0 0 auto' }}>
                  <ButtonBase
                    onClick={() => onChange(tab.value)}
                    disableRipple
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1.5,
                      py: '3px',
                      borderRadius: '100px',
                      bgcolor: isActive ? '#111827' : '#FFFFFF',
                      border: isActive ? '1px solid #111827' : '1px solid #374151',
                      color: isActive ? '#FFFFFF' : '#111827',
                      transition: 'all 0.2s ease',
                      ...TYPOGRAPHY_STYLES.sm.regular,
                      '&:hover': {
                        bgcolor: isActive ? '#111827' : '#F9FAFB',
                      },
                    }}
                  >
                    {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                  </ButtonBase>
                </Box>
              );
            }

            const isHighlighted = Boolean(tab.highlighted);
            const tabTone = isActive ? (isHighlighted ? 'highlighted' : 'active') : isHighlighted ? 'highlighted' : 'default';
            const tabToneStyles = STATUS_TAB_TONE_STYLES[tabTone];
            const bottomBorderColor = isActive ? (isHighlighted ? '#FDBA74' : '#111827') : 'transparent';

            return (
              <Box key={tab.value} sx={{ flex: '0 0 auto' }}>
                <ButtonBase
                  onClick={() => onChange(tab.value)}
                  disableRipple
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    minWidth: 0,
                    px: 0.5,
                    py: 1.6,
                    borderBottom: `2px solid ${bottomBorderColor}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        ...TYPOGRAPHY_STYLES.base.medium,
                        fontWeight: isActive || isHighlighted ? 700 : 500,
                        color: tabToneStyles.labelColor,
                        lineHeight: 1.2,
                      }}
                    >
                      {tab.label}
                    </Box>
                    {tab.count !== undefined && (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          px: '5px',
                          height: 18,
                          borderRadius: 999,
                          bgcolor: tabToneStyles.countBgColor,
                          color: tabToneStyles.countTextColor,
                          border: isHighlighted ? '1px solid #FDBA74' : '1px solid transparent',
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {tab.count}
                      </Box>
                    )}
                  </Box>
                </ButtonBase>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
