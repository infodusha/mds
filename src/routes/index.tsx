import { SearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/book-card';
import { SettingsDrawer } from '@/components/settings-drawer';
import { LoadMoreIndicator } from '@/components/load-more-indicator';

import allGenres from '@/data/genres.json';
import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Book, getWorks } from '@/core/api';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { CurrentBook } from '@/components/current-book';
import { FilterDrawer } from '@/components/filter-drawer';
import { DEFAULT_MAX_DURATION, DEFAULT_MIN_RATING, querySchema } from '@/core/query-schema';

const MIN_BOOK_CARD_HEIGHT = 170; // px

function calculateItemsPerPage() {
  let columns = 1;

  if (window.innerWidth >= 1024) {
    columns = 3;
  } else if (window.innerWidth >= 768) {
    columns = 2;
  }

  const rows = Math.max(2, Math.floor(window.innerHeight / MIN_BOOK_CARD_HEIGHT));

  return Math.max(3, columns * rows);
}

export function IndexRoute() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState('q', querySchema.q);
  const [maxDuration, setMaxDuration] = useQueryState('d', querySchema.d);
  const [genres, setGenres] = useQueryState('g', querySchema.g);
  const [minRating, setMinRating] = useQueryState('r', querySchema.r);

  const [currentBookId, setCurrentBookId] = useStorageState<string | null>('current-book-id', null);
  const [hideListened, setHideListened] = useStorageState('hideListened', false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | undefined>();
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const itemsPerPage = calculateItemsPerPage();

  const handleSearchChange = useCallback(
    (value: string) => {
      if (value !== search) {
        queryClient.resetQueries({ queryKey: ['books'] });
        setSearch(value);
      }
    },
    [search, setSearch, queryClient]
  );

  const handleMaxDurationChange = useCallback(
    (value: number) => {
      queryClient.resetQueries({ queryKey: ['books'] });
      setMaxDuration(value);
    },
    [maxDuration, setMaxDuration, queryClient]
  );

  const handleMinRatingChange = useCallback(
    (value: number) => {
      queryClient.resetQueries({ queryKey: ['books'] });
      setMinRating(value);
    },
    [minRating, setMinRating, queryClient]
  );

  const handleHideListenedChange = useCallback(
    (value: boolean) => {
      queryClient.resetQueries({ queryKey: ['books'] });
      setHideListened(value);
    },
    [hideListened, setHideListened, queryClient]
  );

  const handleGenreToggle = useCallback(
    (genre: string) => {
      const groupWithGenre = Object.entries(allGenres).find(([_, groupGenres]) => groupGenres.includes(genre))?.[0];

      setGenres((current) => {
        const newGenres = current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre];
        queryClient.resetQueries({ queryKey: ['books'] });
        return newGenres;
      });

      setIsFilterDrawerOpen(true);
      setActiveAccordion(groupWithGenre);
    },
    [genres, setGenres, queryClient, setIsFilterDrawerOpen, setActiveAccordion]
  );

  const booksQuery = useInfiniteQuery({
    queryKey: ['books', hideListened, search, maxDuration, genres, minRating, itemsPerPage],
    queryFn: async ({ pageParam = [] }) => {
      const searchRegex = {
        $regex: `.*${search.trim()}.*`,
        $options: 'i',
      };

      const searchQuery = search ? { $or: [{ author: searchRegex }, { name: searchRegex }] } : {};

      const durationQuery = { duration: { $lte: maxDuration * 60 } };

      const ratingQuery =
        minRating > 0
          ? {
              'rating.average': {
                $gte: minRating,
              },
            }
          : {};

      const genreQueryArr = genres.length > 0 ? genres.map((genre) => ({ 'params.Жанры/поджанры': genre })) : [];
      const pageQueryArr = pageParam.length > 0 ? pageParam.map((param) => ({ _id: { $ne: param } })) : [];
      const hasAndQuery = genreQueryArr.length > 0 || pageQueryArr.length > 0;

      const andQuery = hasAndQuery ? { $and: [...genreQueryArr, ...pageQueryArr] } : {};

      const result = await getWorks({
        hideListened: hideListened ? '1' : '0',
        query: {
          author: {
            $exists: true,
          },
          ...searchQuery,
          ...durationQuery,
          ...ratingQuery,
          ...andQuery,
        },
        skip: itemsPerPage,
      });

      const allIds = [...pageParam, ...result.foundWorks.map((book) => book._id)];

      return {
        books: result.foundWorks,
        nextCursor: result.foundCount < itemsPerPage ? undefined : allIds,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.books.length === 0 ? undefined : lastPage.nextCursor),
    initialPageParam: [] as string[],
    placeholderData: keepPreviousData,
  });

  const books = booksQuery.data?.pages.flatMap((page) => page.books) || [];
  const isLoading = booksQuery.isLoading;
  const isFetching = booksQuery.isFetching && !booksQuery.isLoading;
  const hasNextPage = booksQuery.hasNextPage;

  const handleLoadMore = useCallback(() => {
    booksQuery.fetchNextPage();
  }, [booksQuery.fetchNextPage]);

  function setCurrentBook(book: Book) {
    setCurrentBookId(book._id);
    setShouldAutoPlay(true);
    queryClient.setQueryData(['currentBook', book._id], {
      foundWorks: [book],
    });
  }

  function handleFilterReset() {
    queryClient.resetQueries({ queryKey: ['books'] });
    setMaxDuration(DEFAULT_MAX_DURATION);
    setMinRating(DEFAULT_MIN_RATING);
    setGenres([]);
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10'>
      <div className='container mx-auto p-4 pb-38 md:pb-24'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-2xl font-bold tracking-tight'>Модель для сборки</h1>
            <div className='flex gap-2'>
              <SettingsDrawer hideListened={hideListened} setHideListened={handleHideListenedChange} />
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute top-2.5 left-2.5 z-10 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Автор или название'
                className='bg-background/50 pr-8 pl-8 backdrop-blur-sm dark:bg-secondary/90 dark:placeholder:text-muted-foreground'
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {search && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute top-1 right-1 h-7 w-7 cursor-pointer hover:bg-transparent'
                  onClick={() => handleSearchChange('')}
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
              onMaxDurationChange={handleMaxDurationChange}
              onMinRatingChange={handleMinRatingChange}
              onGenreToggle={handleGenreToggle}
              onReset={handleFilterReset}
            />
          </div>
          {isFetching && !isLoading && (
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
            {isLoading && books.length === 0 ? (
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

          {!isLoading && books.length > 0 && (
            <LoadMoreIndicator
              isLoading={isLoading}
              isFetching={isFetching}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </div>

      {currentBookId && <CurrentBook id={currentBookId} autoPlay={shouldAutoPlay} />}
    </div>
  );
}
