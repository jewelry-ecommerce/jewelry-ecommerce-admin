import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import useSWR from 'swr';
import { addOrderNote, getOrderNotes } from '../../../../apis/order';
import { TYPOGRAPHY_STYLES } from '../../../../common/constant/typography.constant';
import { getErrorMessage } from '../../../../common/utils/string.utils';
import { CustomButton } from '../../../../components/button';
import { TextInput } from '../../../../components/form';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';

/** Khớp giới hạn của OMS (ORDER_NOTE_MAX_LENGTH) và ô ghi chú trên máy POS. */
const ORDER_NOTE_MAX_LENGTH = 1000;

export interface OrderDetailInternalNotesCardProps {
  orderId: string;
}

/** Ghi chú nội bộ của đơn (chỉ nhân viên xem) — thêm được từ Admin lẫn máy POS; chỉ thêm, không sửa/xóa. */
export function OrderDetailInternalNotesCard({ orderId }: OrderDetailInternalNotesCardProps) {
  const { showSnackbar } = useSnackbar();
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    data: notes,
    isLoading,
    mutate,
  } = useSWR(['order-internal-notes', orderId] as const, () => getOrderNotes(orderId, 'internal'), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const items = (notes ?? []).filter((note) => note.content?.trim());

  const handleAddNote = async () => {
    const content = draft.trim();
    if (!content || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addOrderNote(orderId, { content, type: 'internal' });
      setDraft('');
      await mutate();
      showSnackbar({ type: SnackbarType.SUCCESS, message: 'Đã thêm ghi chú nội bộ.' });
    } catch (error) {
      showSnackbar({ type: SnackbarType.ERROR, message: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.lg.bold, color: '#111827', mb: 2 }}>Ghi chú nội bộ</Typography>
        {items.length ? (
          <Stack divider={<Divider flexItem />} gap={1.5} sx={{ mb: 2 }}>
            {items.map((note) => (
              <Stack key={note.id} gap={0.25}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#111827', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{note.content.trim()}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: '#9CA3AF' }}>
                  {[note.authorName?.trim(), dayjs(note.createdAt).format('DD/MM/YYYY HH:mm')].filter(Boolean).join(' · ')}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : isLoading ? (
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: '#9CA3AF', mb: 2 }}>Đang tải...</Typography>
        ) : null}
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextInput
              size="small"
              placeholder="Thêm nội dung ghi chú nội bộ..."
              value={draft}
              disabled={isSubmitting}
              inputProps={{ maxLength: ORDER_NOTE_MAX_LENGTH }}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
                event.preventDefault();
                void handleAddNote();
              }}
            />
          </Box>
          <CustomButton
            variant="primary"
            fullWidth={false}
            disabled={!draft.trim() || isSubmitting}
            onClick={() => void handleAddNote()}
            sx={{ flexShrink: 0, minWidth: 72, height: 40, px: 2.5, py: 0 }}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </CustomButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
