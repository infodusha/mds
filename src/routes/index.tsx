import { SearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { SettingsDrawer } from '@/components/settings-drawer';

import allGenres from '@/data/genres.json';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Book, getWorks } from '@/core/api';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { CurrentBook } from '@/components/current-book';
import { FilterDrawer } from '@/components/filter-drawer';
import { querySchema } from '@/core/query-schema';

export function IndexRoute() {
  const [search, setSearch] = useQueryState('q', querySchema.q);
  const [maxDuration] = useQueryState('d', querySchema.d);
  const [genres, setGenres] = useQueryState('g', querySchema.g);
  const [minRating] = useQueryState('r', querySchema.r);

  const [currentBookId, setCurrentBookId] = useStorageState<string | null>('current-book-id', null);
  const [hideListened, setHideListened] = useStorageState('hideListened', false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const booksQuery = useQuery({
    queryKey: ['books', [hideListened, search, maxDuration, genres, minRating]],
    queryFn: () => {
      return getWorks({
        hideListened: hideListened ? '1' : '0',
        query: {
          author: {
            $exists: true,
          },
          ...(search
            ? {
                $or: [
                  {
                    author: {
                      $regex: `.*${search.trim()}.*`,
                      $options: 'i',
                    },
                  },
                  {
                    name: {
                      $regex: `.*${search.trim()}.*`,
                      $options: 'i',
                    },
                  },
                ],
              }
            : {}),
          duration: {
            $lte: maxDuration * 60,
          },
          ...(minRating > 0
            ? {
                'rating.average': {
                  $gte: minRating,
                },
              }
            : {}),
          ...(genres.length > 0
            ? {
                $and: genres.map((genre) => ({
                  'params.Жанры/поджанры': genre,
                })),
              }
            : {}),
        },
        skip: 16,
      });
    },
    select: (data) => data.foundWorks,
    placeholderData: keepPreviousData,
  });

  const books = booksQuery.data || [];
  const isLoading = booksQuery.isLoading;
  const isFetching = booksQuery.isFetching && !booksQuery.isLoading;

  const queryClient = useQueryClient();

  function setCurrentBook(book: Book) {
    setCurrentBookId(book._id);
    setShouldAutoPlay(true);
    queryClient.setQueryData(['currentBook', book._id], {
      foundWorks: [book],
    });
  }

  function handleGenreToggle(genre: string) {
    const groupWithGenre = Object.entries(allGenres).find(([_, groupGenres]) => groupGenres.includes(genre))?.[0];

    setGenres((current) => (current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]));
    setIsFilterDrawerOpen(true);
    setActiveAccordion(groupWithGenre);
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10'>
      <div className='container mx-auto p-4 pb-38 md:pb-24'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-2xl font-bold tracking-tight'>Модель для сборки</h1>
            <div className='flex gap-2'>
              <SettingsDrawer hideListened={hideListened} setHideListened={setHideListened} />
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute top-2.5 left-2.5 z-10 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Автор или название'
                className='bg-background/50 pr-8 pl-8 backdrop-blur-sm dark:bg-secondary/90 dark:placeholder:text-muted-foreground'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute top-1 right-1 h-7 w-7 cursor-pointer hover:bg-transparent'
                  onClick={() => setSearch('')}
                >
                  <XIcon className='h-4 w-4' />
                  <span className='sr-only'>Очистить поиск</span>
                </Button>
              )}
            </div>
            <FilterDrawer
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
            />
          </div>
          {isFetching && (
            <div className='fixed top-0 right-0 left-0 z-50 flex justify-center'>
              <div className='rounded-b-md bg-primary px-4 py-1.5 text-primary-foreground shadow-md'>
                <div className='flex items-center gap-2'>
                  <Loader2Icon className='h-4 w-4 animate-spin' />
                  <p className='text-sm'>Загрузка...</p>
                </div>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {isLoading ? (
              <div className='col-span-full flex justify-center py-12'>
                <div className='flex flex-col items-center gap-2'>
                  <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
                  <p className='text-sm text-muted-foreground'>Загрузка...</p>
                </div>
              </div>
            ) : books.length === 0 ? (
              <div className='col-span-full flex justify-center py-12'>
                <p className='text-muted-foreground'>Ничего не найдено</p>
              </div>
            ) : (
              books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  isPlaying={currentBookId === book._id}
                  onPlay={() => setCurrentBook(book)}
                  selectedGenres={genres}
                  onGenreToggle={handleGenreToggle}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {currentBookId && <CurrentBook id={currentBookId} autoPlay={shouldAutoPlay} />}
    </div>
  );
}
