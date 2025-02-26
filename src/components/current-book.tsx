import { useEffect } from 'react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { getWorks } from '@/core/api';

import { AudioPlayer } from './audio-player';

interface CurrentBookProps {
  id: string;
  autoPlay: boolean;
}

export function CurrentBook({ id, autoPlay }: CurrentBookProps) {
  const currentBookQuery = useQuery({
    queryKey: ['currentBook', id],
    queryFn: id
      ? () =>
          getWorks({
            query: {
              _id: id,
            },
            hideListened: '0',
          })
      : skipToken,
    select: (data) => data.foundWorks?.[0],
  });

  const currentBook = currentBookQuery.data || null;
  const isLoading = currentBookQuery.isLoading;

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.metadata = currentBook
      ? new MediaMetadata({
          title: currentBook.name,
          artist: currentBook.author,
          album: 'Модель для сборки',
        })
      : null;
  }, [currentBook]);

  if (!currentBook && !isLoading) {
    return null;
  }

  return (
    <div className='fixed right-0 bottom-0 left-0 border-t bg-background/80 backdrop-blur-lg dark:border-primary/20 dark:bg-secondary/90'>
      <div className='container p-4'>
        {isLoading ? (
          <div className='flex items-center justify-center py-2'>
            <Loader2Icon className='mr-2 h-5 w-5 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>Загрузка...</p>
          </div>
        ) : (
          currentBook && (
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <div className='min-w-0 flex-shrink-0 sm:w-[300px]'>
                <h3 className='truncate font-medium'>{currentBook.name}</h3>
                <p className='truncate text-sm text-muted-foreground'>{currentBook.author}</p>
              </div>
              <div className='flex-1'>
                <AudioPlayer
                  key={currentBook._id}
                  id={currentBook._id}
                  path={currentBook.path}
                  duration={currentBook.duration}
                  autoPlay={autoPlay}
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
