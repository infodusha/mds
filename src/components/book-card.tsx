import { ClockIcon, PlayIcon, HeadphonesIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book } from '@/core/api';
import { displayDuration } from '@/core/display-duration';
import { getColorForString } from '@/core/get-color-for-string';
import { RatingStars } from '@/components/rating-stars';
import { PARAM_FIELDS } from '@/core/tag-mapping';
import { useProfile } from '@/core/hooks/use-profile';

interface BookCardProps {
  book: Book;
  isPlaying: boolean;
  onPlay: () => void;
  selectedGenres: string[];
  selectedTags: string[];
}

export function BookCard({ book, isPlaying, onPlay, selectedGenres, selectedTags }: BookCardProps) {
  const { isLoggedIn, profile } = useProfile();
  const isListened = isLoggedIn && profile?.listened.includes(book._id);

  const genres = book.params?.['Жанры/поджанры'] ?? [];

  const general = book.params?.[PARAM_FIELDS.GENERAL] ?? [];
  const place = book.params?.[PARAM_FIELDS.PLACE] ?? [];
  const epoch = book.params?.[PARAM_FIELDS.EPOCH] ?? [];
  const story = book.params?.[PARAM_FIELDS.STORY] ?? [];
  const lyrics = book.params?.[PARAM_FIELDS.LYRICS] ?? [];
  const tags = [...general, ...place, ...epoch, ...story, ...lyrics];

  const renderBookInfo = () => (
    <div className='min-w-0 flex-1'>
      <div className='flex items-center gap-2'>
        <h3 className='truncate leading-none font-semibold tracking-tight'>{book.name}</h3>
        {isLoggedIn && isListened && <HeadphonesIcon className='h-4 w-4 text-muted-foreground' />}
      </div>
      <p className='text-sm text-muted-foreground'>{book.author}</p>
      <div className='mt-2 flex items-center gap-2'>
        <RatingStars rating={book.rating.average} size='sm' />
        <span className='text-sm text-muted-foreground'>•</span>
        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
          <ClockIcon className='h-4 w-4' />
          {displayDuration(book.duration)}
        </div>
      </div>
    </div>
  );

  const renderPlayButton = () => (
    <Button
      variant={isPlaying ? 'default' : 'outline'}
      size='icon'
      className={`shrink-0 transition-all ${
        isPlaying
          ? 'dark:bg-primary dark:text-primary-foreground'
          : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPlay();
      }}
    >
      <PlayIcon className='h-4 w-4' />
      <span className='sr-only'>Играть {book.name}</span>
    </Button>
  );

  const renderGenre = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);

    return (
      <Badge
        key={genre}
        className={`cursor-pointer transition-colors ${getColorForString(genre)} ${isSelected ? 'font-bold' : 'font-medium'}`}
        variant='secondary'
      >
        {genre}
      </Badge>
    );
  };

  const renderTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    return (
      <Badge
        key={tag}
        variant='outline'
        className={`bg-background/50 text-xs transition-colors dark:border-primary/20 dark:bg-secondary/90 ${isSelected ? 'font-bold dark:border-primary/50' : ''}`}
      >
        {tag}
      </Badge>
    );
  };

  const renderTags = () => <div className='flex flex-wrap gap-1'>{tags.map(renderTag)}</div>;

  const renderGenres = () => <div className='flex flex-wrap gap-1'>{genres.map(renderGenre)}</div>;

  return (
    <Link to='/book/$id' params={{ id: book._id }} className='block h-full'>
      <Card className='group flex h-full cursor-pointer flex-col overflow-hidden transition-colors hover:bg-secondary/50 dark:bg-secondary/90 dark:hover:bg-secondary/60'>
        <CardContent className='flex flex-1 flex-col p-4'>
          <div className='flex items-start justify-between gap-4'>
            {renderBookInfo()}
            {renderPlayButton()}
          </div>
          <div className='mt-4 space-y-2'>
            {renderGenres()}
            {renderTags()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
