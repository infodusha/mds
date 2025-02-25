import { ClockIcon, PlayIcon, StarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/core/api';
import { displayDuration } from '@/core/display-duration';

interface BookCardProps {
  book: Book;
  isPlaying: boolean;
  onPlay: () => void;
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
}

// Function to get a consistent color based on string
function getColorForString(str: string) {
  const colors = [
    'bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-200',
    'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-200',
    'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-200',
    'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-200',
    'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-200',
    'bg-pink-500/20 text-pink-600 dark:bg-pink-500/30 dark:text-pink-200',
  ];
  const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function BookCard({ book, isPlaying, onPlay, selectedGenres, onGenreToggle }: BookCardProps) {
  const genres = book.params?.['Жанры/поджанры'] ?? [];

  const general = book.params?.['Общие характеристики'] ?? [];
  const place = book.params?.['Место действия'] ?? [];
  const epoch = book.params?.['Время действия'] ?? [];
  const story = book.params?.['Сюжетные ходы'] ?? [];
  const lyrics = book.params?.['Линейность сюжета'] ?? [];
  const tags = [...general, ...place, ...epoch, ...story, ...lyrics];
  const rating = Math.round(book.rating.average);

  function renderGenre(genre: string) {
    const isSelected = selectedGenres.includes(genre);

    return (
      <Badge
        key={genre}
        className={`cursor-pointer transition-colors ${getColorForString(genre)} ${isSelected ? 'font-bold' : 'font-medium'}`}
        variant='secondary'
        onClick={() => onGenreToggle(genre)}
      >
        {genre}
      </Badge>
    );
  }

  return (
    <Card className='group overflow-hidden transition-colors hover:bg-secondary/50 dark:bg-secondary/90 dark:hover:bg-secondary/60'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex-1'>
            <h3 className='truncate leading-none font-semibold tracking-tight'>{book.name}</h3>
            <p className='text-sm text-muted-foreground'>{book.author}</p>
            <div className='mt-2 flex items-center gap-2'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className='text-sm text-muted-foreground'>•</span>
              <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                <ClockIcon className='h-4 w-4' />
                {displayDuration(book.duration)}
              </div>
            </div>
          </div>
          <Button
            variant={isPlaying ? 'default' : 'outline'}
            size='icon'
            className={`shrink-0 transition-all ${
              isPlaying
                ? 'dark:bg-primary dark:text-primary-foreground'
                : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
            }`}
            onClick={onPlay}
          >
            <PlayIcon className='h-4 w-4' />
            <span className='sr-only'>Играть {book.name}</span>
          </Button>
        </div>
        <div className='mt-4 space-y-2'>
          <div className='flex flex-wrap gap-1'>{genres.map(renderGenre)}</div>
          <div className='flex flex-wrap gap-1'>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant='outline'
                className='bg-background/50 text-xs transition-colors hover:bg-secondary dark:border-primary/20 dark:bg-secondary/90 dark:hover:border-primary/50'
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
