import { Star01 } from '@untitledui/icons';
import { StackRow } from '../../../../components/styled';

export interface ProductReviewRatingProps {
  value: number;
  max?: number;
  size?: number;
}

export const ProductReviewRating = ({ value, max = 5, size = 18 }: ProductReviewRatingProps) => {
  return (
    <StackRow gap={0.5}>
      {Array.from({ length: max }).map((_, index) => (
        <Star01 key={index} size={size} fill={index < value ? '#FDE047' : '#EAECF0'} color={index < value ? '#FDE047' : '#EAECF0'} />
      ))}
    </StackRow>
  );
};
