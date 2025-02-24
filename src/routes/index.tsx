import { useState } from 'react';
import { Filter, Search, Settings } from 'lucide-react';
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

interface Book {
  id: string;
  name: string;
  author: string;
  duration: string;
  genres: string[];
  tags: string[];
  audioUrl: string;
  listened?: boolean;
  rating: number;
}

export function IndexRoute() {
  const [search, setSearch] = useState('');
  const [duration, setDuration] = useState([0]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [hideListened, setHideListened] = useState(false);

  const books = [
    {
      id: '1',
      name: 'The Midnight Library',
      author: 'Matt Haig',
      duration: '8h 50m',
      genres: ['Fiction', 'Fantasy', 'Contemporary'],
      tags: ['Life Choices', 'Philosophy', 'Self-Discovery'],
      audioUrl: '/sample.mp3',
      listened: true,
      rating: 4,
    },
    {
      id: '2',
      name: 'Atomic Habits',
      author: 'James Clear',
      duration: '5h 35m',
      genres: ['Non-Fiction', 'Self-Help'],
      tags: ['Productivity', 'Psychology', 'Personal Development'],
      audioUrl: '/sample.mp3',
      rating: 5,
    },
    {
      id: '3',
      name: 'Project Hail Mary',
      author: 'Andy Weir',
      duration: '16h 10m',
      genres: ['Science Fiction', 'Adventure'],
      tags: ['Space', 'Problem Solving', 'First Contact'],
      audioUrl: '/sample.mp3',
      listened: true,
      rating: 5,
    },
  ];

  const filteredBooks = books.filter((book) => !hideListened || !book.listened);

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
                    <Settings className='h-4 w-4' />
                    <span className='sr-only'>Настройки</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className='mx-auto w-full max-w-sm'>
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
              <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search audiobooks...'
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
                  <Filter className='h-4 w-4' />
                  <span className='sr-only'>Фильтры</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-sm'>
                  <DrawerHeader>
                    <DrawerTitle>Фильтры</DrawerTitle>
                    <DrawerDescription>Настройте фильтры, чтобы найти идеальный выпуск</DrawerDescription>
                  </DrawerHeader>
                  <div className='p-4 pb-8'>
                    <div className='grid gap-4'>
                      <div className='space-y-2'>
                        <h4 className='leading-none font-medium'>Продолжительность (минуты)</h4>
                        <Slider
                          defaultValue={[300]}
                          max={300}
                          step={5}
                          value={duration}
                          onValueChange={setDuration}
                          className='w-full'
                        />
                        <p className='text-sm text-muted-foreground'>До {duration} минут</p>
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
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isPlaying={currentBook?.id === book.id}
                onPlay={() => setCurrentBook(book)}
              />
            ))}
          </div>
        </div>
      </div>
      {currentBook && (
        <div className='fixed right-0 bottom-0 left-0 border-t bg-background/80 backdrop-blur-lg dark:border-primary/20 dark:bg-secondary/90'>
          <div className='container p-4'>
            <div className='flex items-center gap-4'>
              <div className='min-w-0 flex-1'>
                <h3 className='truncate font-medium'>{currentBook.name}</h3>
                <p className='truncate text-sm text-muted-foreground'>{currentBook.author}</p>
              </div>
              <AudioPlayer src={currentBook.audioUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
