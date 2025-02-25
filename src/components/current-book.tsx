import { useEffect } from 'react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { getWorks } from '@/core/api';

import { AudioPlayer } from './audio-player';

interface CurrentBookProps {
  id: string;
}

export function CurrentBook({ id }: CurrentBookProps) {
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

  if (!currentBook) {
    return null;
  }

  return (
    <div className='fixed right-0 bottom-0 left-0 border-t bg-background/80 backdrop-blur-lg dark:border-primary/20 dark:bg-secondary/90'>
      <div className='container p-4'>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
