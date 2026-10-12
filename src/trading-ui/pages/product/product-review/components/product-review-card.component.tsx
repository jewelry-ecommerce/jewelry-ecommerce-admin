import { Box, Stack, Typography } from '@mui/material';
import { ImageElement } from '@/trading-ui/adapters/library';
import { CustomButton } from '../../../../components/button';

import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { CheckboxComponent } from '../../../../components/check-box/check-box.element';
import { StackRow, StackRowAlignCenter, StackRowAlignCenterJustBetween } from '../../../../components/styled';
import { CheckCircleBroken, Send01, XCircle } from '@untitledui/icons';
import { PRODUCT_SPU_DEFAULT_IMAGE_SRC } from '../../product-spu/product-spu.constant';
import { ProductReviewRating } from './product-review-rating.component';
import dayjs from 'dayjs';
import React from 'react';

export interface ProductReviewCardProps {
  authorName: string;
  orderCode: string;
  productName: string;
  productSku: string;
  productImage: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  reviewImages: string[];
  createdAt: string;
  checked?: boolean;
  onToggleChecked?: (checked: boolean) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onReply?: () => void;
  onViewReason?: () => void;
}

const ACTION_BUTTON_STYLES = {
  approve: {
    bgcolor: '#2E90FA',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '6px 12px',
    '&:hover': { bgcolor: '#1570EF' },
  },
  reject: {
    bgcolor: '#F04438',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '6px 12px',
    '&:hover': { bgcolor: '#D92D20' },
  },
  reply: {
    color: '#344054',
    borderColor: '#D0D5DD',
    borderRadius: '10px',
    padding: '6px 12px',
    '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D0D5DD' },
  },
  viewReason: {
    bgcolor: '#F2F4F7',
    color: '#344054',
    borderRadius: '10px',
    padding: '6px 12px',
    boxShadow: 'none',
    '&:hover': { bgcolor: '#E4E7EC', boxShadow: 'none' },
  },
};

const ReviewCardHeader = ({ authorName, orderCode, checked, onToggleChecked, onApprove, onReject, onReply, onViewReason }: Partial<ProductReviewCardProps>) => (
  <StackRowAlignCenterJustBetween
    sx={{
      p: '16px 12px',
      borderBottom: '1px solid #F2F4F7',
    }}
  >
    <StackRowAlignCenter gap={1.5} sx={{ flex: 0.8 }}>
      {!onViewReason && <CheckboxComponent size="medium" checked={checked} isSameButton={true} onChange={(_, next) => onToggleChecked?.(next)} sx={{ p: 0 }} />}
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semibold, color: '#101828' }}>{authorName}</Typography>
      <Box sx={{ width: '1px', height: 32, bgcolor: '#E5E7EB' }} />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6A7282' }}>Mã đơn hàng: </Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#2563EB', cursor: 'pointer' }}>{orderCode}</Typography>
    </StackRowAlignCenter>

    <StackRowAlignCenter gap={2}>
      {onViewReason ? (
        <CustomButton variant="primary" fullWidth={false} startIcon={<XCircle size={18} />} onClick={onViewReason} sx={ACTION_BUTTON_STYLES.viewReason}>
          Xem lý do từ chối
        </CustomButton>
      ) : onReply ? (
        <CustomButton variant="outline" fullWidth={false} startIcon={<Send01 size={18} />} onClick={onReply} sx={ACTION_BUTTON_STYLES.reply}>
          Trả lời
        </CustomButton>
      ) : (
        <React.Fragment>
          <CustomButton variant="primary" fullWidth={false} startIcon={<XCircle size={18} />} onClick={onReject} sx={ACTION_BUTTON_STYLES.reject}>
            Từ chối duyệt
          </CustomButton>
          <CustomButton variant="primary" fullWidth={false} startIcon={<CheckCircleBroken size={18} />} onClick={onApprove} sx={ACTION_BUTTON_STYLES.approve}>
            Duyệt
          </CustomButton>
        </React.Fragment>
      )}
    </StackRowAlignCenter>
  </StackRowAlignCenterJustBetween>
);

const ReviewCardProductInfo = ({ productImage, productName, productSku }: Partial<ProductReviewCardProps>) => (
  <StackRowAlignCenter sx={{ width: '30%', gap: 2, p: 2, borderRight: '1px solid #E5E7EB' }}>
    <ImageElement
      url={productImage || PRODUCT_SPU_DEFAULT_IMAGE_SRC}
      sx={{
        width: 64,
        height: 64,
        borderRadius: '4px',
        objectFit: 'contain',
      }}
    />
    <Stack sx={{ minWidth: 0, gap: 0 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }} noWrap>
        {productName}
      </Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085', textTransform: 'uppercase' }} noWrap>
        Mã biến thể: {productSku}
      </Typography>
    </Stack>
  </StackRowAlignCenter>
);

const ReviewCardContent = ({ rating = 0, createdAt, reviewTitle, reviewContent, reviewImages = [] }: Partial<ProductReviewCardProps>) => (
  <Stack sx={{ flex: 1, gap: 1.5, p: 2 }}>
    <StackRowAlignCenterJustBetween>
      <ProductReviewRating value={rating} />
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#667085' }}>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</Typography>
    </StackRowAlignCenterJustBetween>
    <Stack sx={{ gap: 0.5 }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#101828' }}>{reviewTitle}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: '#6A7282' }}>{reviewContent}</Typography>
    </Stack>
    {reviewImages.length > 0 && (
      <StackRow>
        {reviewImages.map((img, idx) => (
          <ImageElement
            key={idx}
            url={img}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '4px',
              objectFit: 'cover',
            }}
          />
        ))}
      </StackRow>
    )}
  </Stack>
);

export const ProductReviewCard = (props: ProductReviewCardProps) => {
  return (
    <Box
      sx={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <ReviewCardHeader {...props} />
      <StackRow sx={{ gap: 0 }}>
        <ReviewCardProductInfo {...props} />
        <ReviewCardContent {...props} />
      </StackRow>
    </Box>
  );
};
