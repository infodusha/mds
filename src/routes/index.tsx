import { FilterIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';

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
import { AudioPlayer } from '@/components/audio-player';
import { BookCard } from '@/components/book-card';
import { ThemeToggle } from '@/components/theme-toggle';

import genres from '@/data/genres.json';
import { keepPreviousData, skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { Book, getWorks } from '@/core/api';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { displayDuration } from '@/core/display-duration';

export function IndexRoute() {
  const [search, setSearch] = useQueryState('q', {
    defaultValue: '',
    throttleMs: 500,
  });
  const [maxDuration, setMaxDuration] = useQueryState('d', parseAsInteger.withDefault(240));

  const [currentBookId, setCurrentBookId] = useStorageState<string | null>('current-book-id', null);
  const [hideListened, setHideListened] = useStorageState('hideListened', false);

  const booksQuery = useQuery({
    queryKey: ['books', [hideListened, search, maxDuration]],
    queryFn: () => {
      return getWorks({
        hideListened: hideListened ? '1' : '0',
        query: {
          author: {
            $exists: true,
          },
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
          duration: {
            $lte: maxDuration * 60,
          },
          // $and: [
          //   {
          //     params: {
          //       'Жанры/поджанры': 'Магический реализм',
          //     },
          //   },
          // ],
        },
        skip: 16,
      });
    },
    select: (data) => data.foundWorks,
    placeholderData: keepPreviousData,
  });

  const books = booksQuery.data || [];

  const currentBookQuery = useQuery({
    queryKey: ['currentBook', currentBookId],
    queryFn: currentBookId
      ? () =>
          getWorks({
            query: {
              _id: currentBookId,
            },
            hideListened: '0',
          })
      : skipToken,
    select: (data) => data.foundWorks?.[0],
  });

  const currentBook = currentBookQuery.data || null;

  function renderCurrentBook() {
    if (!currentBook) {
      return null;
    }

    return (
      <div className='fixed right-0 bottom-0 left-0 border-t bg-background/80 backdrop-blur-lg dark:border-primary/20 dark:bg-secondary/90'>
        <div className='container p-4'>
          <div className='flex items-center gap-4'>
            <div className='min-w-0 flex-1'>
              <h3 className='truncate font-medium'>{currentBook.name}</h3>
              <p className='truncate text-sm text-muted-foreground'>{currentBook.author}</p>
            </div>
            <AudioPlayer key={currentBook._id} id={currentBook._id} path={currentBook.path} />
          </div>
        </div>
      </div>
    );
  }

  const queryClient = useQueryClient();

  function setCurrentBook(book: Book) {
    setCurrentBookId(book._id);
    queryClient.setQueryData(['currentBook', book._id], {
      foundWorks: [book],
    });
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
                placeholder='Искать по автору или названию...'
                className='bg-background/50 pl-8 backdrop-blur-sm dark:bg-secondary/90 dark:placeholder:text-muted-foreground'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Drawer>
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
                          onValueChange={([newDuration]) => setMaxDuration(newDuration ?? 240)}
                          className='w-full'
                        />
                        <p className='text-sm text-muted-foreground'>До {displayDuration(maxDuration * 60)}</p>
                      </div>
                      <div className='space-y-2'>
                        <h4 className='leading-none font-medium'>Жанры</h4>
                        <div className='grid grid-cols-2 gap-2'>
                          {genres.map((genre) => (
                            <Button
                              key={genre}
                              variant='outline'
                              className='justify-start dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
                            >
                              {genre}
                            </Button>
                          ))}
                        </div>
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
              />
            ))}
          </div>
        </div>
      </div>

      {renderCurrentBook()}
    </div>
  );
}
