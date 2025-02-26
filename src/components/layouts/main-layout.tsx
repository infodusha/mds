import { Outlet } from '@tanstack/react-router';
import { useState, createContext, use } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { CurrentBook } from '@/components/current-book';
import { Book } from '@/core/api';

interface BookContextType {
  currentBookId: string | null;
  setCurrentBook: (book: Book) => void;
}

export const BookContext = createContext<BookContextType>({
  currentBookId: null,
  setCurrentBook: () => {},
});

export function useBookContext() {
  return use(BookContext);
}

export function MainLayout() {
  const queryClient = useQueryClient();
  const [currentBookId, setCurrentBookId] = useStorageState<string | null>('current-book-id', null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  function setCurrentBook(book: Book) {
    setCurrentBookId(book._id);
    setShouldAutoPlay(true);
    queryClient.setQueryData(['currentBook', book._id], {
      foundWorks: [book],
    });
  }

  return (
    <BookContext value={{ currentBookId, setCurrentBook }}>
      <div className='min-h-screen bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10'>
        <div className='container mx-auto p-4 pb-38 md:pb-24'>
          <Outlet />
        </div>

        {currentBookId && <CurrentBook id={currentBookId} autoPlay={shouldAutoPlay} />}
      </div>
    </BookContext>
  );
}
