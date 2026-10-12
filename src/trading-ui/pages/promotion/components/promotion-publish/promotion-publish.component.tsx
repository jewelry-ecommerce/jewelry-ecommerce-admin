import { useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography } from '@mui/material';
import { CustomButton } from '../../../../components/button';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import type { PromotionDraft } from '../../../../apis';
import { StackRow, StackRowAlignCenter } from '../../../../components/styled';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { PROMOTION_DETAIL_SECTION_ICONS } from '../../promotion.constant';
import { promotionListButtonPermission } from '../../promotion-permission.constants';
import type { PromotionPublishReadiness, PromotionPublishReadinessItem } from './promotion-publish-readiness.utils';

const PublishSectionIcon = PROMOTION_DETAIL_SECTION_ICONS.publish;
interface PromotionPublishActionProps {
  promotion: PromotionDraft;
  readiness: PromotionPublishReadiness;
  publishing: boolean;
  onPublish: () => Promise<boolean>;
}

interface PromotionPublishPanelProps {
  readiness: PromotionPublishReadiness;
}

const ACTION_BUTTON_SX = {
  textTransform: 'none',
  bgcolor: '#101828',
  boxShadow: 'none',
  minWidth: 132,
  '&:hover': { bgcolor: '#1D2939', boxShadow: 'none' },
};

const SECONDARY_BUTTON_SX = {
  textTransform: 'none',
  color: '#344054',
  borderColor: '#D0D5DD',
};

const ReadinessItemRow = ({ item }: { item: PromotionPublishReadinessItem }) => {
  const icon = item.complete ? <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#039855' }} /> : <ErrorOutlineOutlinedIcon sx={{ fontSize: 18, color: '#D92D20' }} />;
  return (
    <StackRow gap={1} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ display: 'inline-flex', pt: 0.125 }}>{icon}</Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: item.complete ? '#344054' : '#101828' }}>{item.label}</Typography>
    </StackRow>
  );
};

export const PromotionPublishAction = ({ promotion, readiness, publishing, onPublish }: PromotionPublishActionProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = async () => {
    const succeeded = await onPublish();
    if (succeeded) setConfirmOpen(false);
  };

  return (
    <Stack alignItems={{ xs: 'stretch', sm: 'flex-end' }} gap={0.5} sx={{ minWidth: { xs: '100%', sm: 220 } }}>
      <CustomButton
        startIcon={<PublishOutlinedIcon sx={{ fontSize: 18 }} />}
        disabled={!readiness.canPublish || publishing}
        onClick={() => setConfirmOpen(true)}
        sx={ACTION_BUTTON_SX}
        {...promotionListButtonPermission('publish', 'Phát hành', 'api_promotion_draft_publish')}
      >
        {publishing ? 'Đang phát hành...' : 'Phát hành'}
      </CustomButton>

      <Dialog open={confirmOpen} onClose={() => (publishing ? undefined : setConfirmOpen(false))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Xác nhận phát hành</DialogTitle>
        <DialogContent>
          <Stack gap={1.5}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>Bạn sắp phát hành chương trình "{promotion.name}".</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: '#101828' }}>Lưu ý quan trọng:</Typography>
            <Stack gap={0.5}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>- Sau khi phát hành, toàn bộ thông tin và mức ưu đãi sẽ không thể chỉnh sửa.</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>- Nếu muốn thay đổi, bạn bắt buộc phải gửi yêu cầu duyệt ngừng chương trình khuyến mãi trên.</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#475467' }}>Bạn có chắc chắn muốn phát hành?</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CustomButton variant="outline" fullWidth={false} disabled={publishing} onClick={() => setConfirmOpen(false)} sx={SECONDARY_BUTTON_SX}>
            Hủy
          </CustomButton>
          <CustomButton
            fullWidth={false}
            disabled={publishing}
            onClick={() => void handleConfirm()}
            sx={ACTION_BUTTON_SX}
            {...promotionListButtonPermission('publish', 'Phát hành', 'api_promotion_draft_publish')}
          >
            {publishing ? 'Đang phát hành...' : 'Phát hành'}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const PromotionPublishPanel = ({ readiness }: PromotionPublishPanelProps) => (
  <Paper id="promotion-section-publish" elevation={0} sx={{ p: 3, borderRadius: '8px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
    <Stack gap={2}>
      <Stack gap={0.5}>
        <StackRowAlignCenter gap={1}>
          <PublishSectionIcon size={20} color="#737373" />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.semibold, color: '#101828' }}>Phát hành chương trình</Typography>
        </StackRowAlignCenter>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#667085' }}>Kiểm tra nhanh các điều kiện trước khi phát hành chương trình khuyến mãi.</Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
        {readiness.items.map((item) => (
          <ReadinessItemRow key={item.key} item={item} />
        ))}
      </Box>
    </Stack>
  </Paper>
);
