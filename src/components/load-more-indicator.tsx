import { useEffect, useRef, useCallback } from 'react';
import { Loader2Icon } from 'lucide-react';

interface LoadMoreIndicatorProps {
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage?: boolean;
  onLoadMore: () => void;
}

export function LoadMoreIndicator({ isLoading, isFetching, hasNextPage, onLoadMore }: LoadMoreIndicatorProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !isLoading && !isFetching && hasNextPage) {
        onLoadMore();
      }
    },
    [isLoading, isFetching, hasNextPage, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div ref={loaderRef} className='flex justify-center py-4'>
      {isFetching && (
        <div className='flex items-center gap-2'>
          <Loader2Icon className='h-5 w-5 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Загрузка...</p>
        </div>
      )}
    </div>
  );
}
