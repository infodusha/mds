import { FilterIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookCard } from '@/components/book-card';
import { ThemeToggle } from '@/components/theme-toggle';

import allGenres from '@/data/genres.json';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Book, getWorks } from '@/core/api';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { displayDuration } from '@/core/display-duration';
import { CurrentBook } from '@/components/current-book';

export function IndexRoute() {
  const [search, setSearch] = useQueryState('q', {
    defaultValue: '',
    throttleMs: 500,
  });
  const [maxDuration, setMaxDuration] = useQueryState('d', parseAsInteger.withDefault(240));
  const [genres, setGenres] = useQueryState<string[]>('g', {
    defaultValue: [],
    parse: (value) => value.split(',').filter(Boolean),
    serialize: (value) => value.join(','),
  });

  const [currentBookId, setCurrentBookId] = useStorageState<string | null>('current-book-id', null);
  const [hideListened, setHideListened] = useStorageState('hideListened', false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const booksQuery = useQuery({
    queryKey: ['books', [hideListened, search, maxDuration, genres]],
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

  const queryClient = useQueryClient();

  function setCurrentBook(book: Book) {
    setCurrentBookId(book._id);
    queryClient.setQueryData(['currentBook', book._id], {
      foundWorks: [book],
    });
  }

  function toggleGenre(genre: string) {
    setGenres((current) => (current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]));
  }

  const sortedGenres = allGenres.toSorted((a, b) => Number(genres.includes(b)) - Number(genres.includes(a)));

  function renderGenre(genre: string) {
    const isSelected = genres.includes(genre);

    return (
      <Button
        key={genre}
        variant={isSelected ? 'default' : 'outline'}
        size='sm'
        className={`h-7 rounded-full text-xs whitespace-nowrap ${
          isSelected
            ? 'dark:bg-primary dark:text-primary-foreground'
            : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        }`}
        onClick={() => toggleGenre(genre)}
      >
        {genre}
      </Button>
    );
  }

  function handleGenreToggle(genre: string) {
    toggleGenre(genre);
    setIsFilterDrawerOpen(true);
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10'>
      <div className='container mx-auto p-4 pb-24'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between gap-4'>
            <h1 className='text-2xl font-bold tracking-tight'>Модель для сборки</h1>
            <div className='flex gap-2'>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='shrink-0 dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
                  >
                    <SettingsIcon className='h-4 w-4' />
                    <span className='sr-only'>Настройки</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className='mx-auto w-full max-w-xl'>
                    <DrawerHeader>
                      <DrawerTitle>Настройки</DrawerTitle>
                      <DrawerDescription>Отредактируйте внешний вид под себя</DrawerDescription>
                    </DrawerHeader>
                    <div className='p-4 pb-8'>
                      <div className='grid gap-4'>
                        <div className='flex items-center justify-between'>
                          <Label htmlFor='hide-listened' className='font-medium'>
                            Скрыть прослушанные
                          </Label>
                          <Switch id='hide-listened' checked={hideListened} onCheckedChange={setHideListened} />
                        </div>
                        <Separator className='my-2' />
                        <div className='flex items-center justify-between'>
                          <Label className='font-medium'>Тема</Label>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute top-2.5 left-2.5 z-10 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Автор или название'
                className='bg-background/50 pl-8 backdrop-blur-sm dark:bg-secondary/90 dark:placeholder:text-muted-foreground'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='shrink-0 dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
                >
                  <FilterIcon className='h-4 w-4' />
                  <span className='sr-only'>Фильтры</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-xl'>
                  <DrawerHeader>
                    <DrawerTitle>Фильтры</DrawerTitle>
                    <DrawerDescription>Настройте фильтры, чтобы найти идеальный выпуск</DrawerDescription>
                  </DrawerHeader>
                  <div className='p-4 pb-8'>
                    <div className='grid gap-4'>
                      <div className='space-y-2'>
                        <h4 className='leading-none font-medium'>Продолжительность</h4>
                        <Slider
                          max={240}
                          step={5}
                          value={[maxDuration]}
                          onValueChange={([newMaxDuration]) => setMaxDuration(newMaxDuration ?? 240)}
                          className='w-full'
                        />
                        <p className='text-sm text-muted-foreground'>До {displayDuration(maxDuration * 60)}</p>
                      </div>
                      <div className='space-y-2'>
                        <h4 className='leading-none font-medium'>Жанры</h4>
                        <div className='flex flex-wrap gap-1.5 pb-2'>{sortedGenres.map(renderGenre)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                isPlaying={currentBookId === book._id}
                onPlay={() => setCurrentBook(book)}
                selectedGenres={genres}
                onGenreToggle={handleGenreToggle}
              />
            ))}
          </div>
        </div>
      </div>

      {currentBookId && <CurrentBook id={currentBookId} />}
    </div>
  );
}
