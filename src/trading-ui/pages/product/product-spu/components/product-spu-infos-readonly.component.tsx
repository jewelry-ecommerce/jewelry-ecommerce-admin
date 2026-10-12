import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { useState } from 'react';
import { ServerSafeContent } from '../../../../components/server-safe-content';
import { StackRowAlignCenter } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import type { ProductInfoItem } from '../../../../apis/product/product.entities';

type ProductSpuInfosReadonlyProps = {
  productInfos?: ProductInfoItem[];
};

const sortProductInfos = (items: ProductInfoItem[]): ProductInfoItem[] => [...items].sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));

export const ProductSpuInfosReadonly = ({ productInfos = [] }: ProductSpuInfosReadonlyProps) => {
  const sortedInfos = sortProductInfos(productInfos);

  if (sortedInfos.length === 0) {
    return null;
  }

  return (
    <Stack gap={1.5}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#6B7280' }}>Thông tin bổ sung (tab trên trang chi tiết)</Typography>
      <Stack gap={1.5}>
        {sortedInfos.map((info, index) => (
          <ProductSpuInfoReadonlyRow key={`${info.sortOrder}-${info.title}-${index}`} index={index} info={info} />
        ))}
      </Stack>
    </Stack>
  );
};

type ProductSpuInfoReadonlyRowProps = {
  index: number;
  info: ProductInfoItem;
};

const ProductSpuInfoReadonlyRow = ({ index, info }: ProductSpuInfoReadonlyRowProps) => {
  const [expanded, setExpanded] = useState(true);
  const descriptionHtml = info.description?.trim() ?? '';

  return (
    <Stack
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        px: 1.5,
        py: 1.25,
        bgcolor: '#FFF',
        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.04)',
      }}
    >
      <StackRowAlignCenter>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, color: '#101828' }}>Mục {index + 1}</Typography>
          {info.title?.trim() ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#344054', mt: 0.25 }}>{info.title}</Typography> : null}
        </Box>
        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)} sx={{ color: '#667085', ml: 0.5 }}>
          <KeyboardArrowDownRounded
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>
      </StackRowAlignCenter>

      <Collapse in={expanded}>
        {descriptionHtml ? (
          <ServerSafeContent rawHtml={descriptionHtml} className="ck-content" sx={{ pt: 1.5, pl: 0.5, color: '#344054', typography: 'body2', '& p': { margin: 0 } }} />
        ) : (
          <Typography sx={{ pt: 1.5, pl: 0.5, color: '#344054', ...TYPOGRAPHY_STYLES.sm.regular }}>—</Typography>
        )}
      </Collapse>
    </Stack>
  );
};
