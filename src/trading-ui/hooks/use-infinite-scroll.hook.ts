import { useCallback } from 'react';

export interface UseInfiniteScrollProps {
  hasMore: boolean;
  isValidating: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export const useInfiniteScroll = ({ hasMore, isValidating, onLoadMore, threshold = 50 }: UseInfiniteScrollProps) => {
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const target = e.currentTarget;
      if (target.scrollHeight - target.scrollTop <= target.clientHeight + threshold) {
        if (!isValidating && hasMore) {
          onLoadMore();
        }
      }
    },
    [hasMore, isValidating, onLoadMore, threshold],
  );

  return { onScroll: handleScroll };
};
