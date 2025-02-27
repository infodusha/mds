import { createFileRoute, Link, useCanGoBack, useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeftIcon, ClockIcon, Loader2Icon, PlayIcon, ShareIcon, CheckIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getWorks } from '@/core/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { displayDuration } from '@/core/display-duration';
import { useBookContext } from '@/components/layouts/main-layout';
import { getColorForString } from '@/core/get-color-for-string';
import { NotFound } from '@/components/not-found';
import { cn } from '@/core/utils';
import { throwIfNotDefined } from '@/core/defined';
import { RatingStars } from '@/components/rating-stars';

export const Route = createFileRoute('/_layout/book/$id')({
  component: BookDetails,
});

function BookDetails() {
  const { id } = useParams({ from: '/_layout/book/$id' });
  const { currentBookId, setCurrentBook } = useBookContext();
  const [shareSuccess, setShareSuccess] = useState(false);

  const router = useRouter();
  const canGoBack = useCanGoBack();

  const bookQuery = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const result = await getWorks({
        hideListened: '0',
        query: { _id: id },
      });
      return result.foundWorks[0];
    },
  });

  const book = bookQuery.data;
  const isLoading = bookQuery.isLoading;
  const isPlaying = currentBookId === id;

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        <Loader2Icon className='h-10 w-10 animate-spin text-primary' />
        <p className='mt-4 text-muted-foreground'>Загрузка...</p>
      </div>
    );
  }

  if (!book) {
    return <NotFound />;
  }

  const genres = book.params?.['Жанры/поджанры'] ?? [];
  const general = book.params?.['Общие характеристики'] ?? [];
  const place = book.params?.['Место действия'] ?? [];
  const epoch = book.params?.['Время действия'] ?? [];
  const story = book.params?.['Сюжетные ходы'] ?? [];
  const lyrics = book.params?.['Линейность сюжета'] ?? [];
  const tags = [...general, ...place, ...epoch, ...story, ...lyrics];

  async function handleShare() {
    throwIfNotDefined(book);
    const title = `${book.name} - ${book.author}`;
    const url = `${location.origin}/book/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setShareSuccess(true);
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
      }

      setTimeout(() => {
        setShareSuccess(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  function handleGoBack(event: React.MouseEvent<HTMLAnchorElement>) {
    if (canGoBack) {
      event.preventDefault();
      router.history.back();
    }
  }

  const renderHeader = () => (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon' asChild className='mr-2'>
          <Link to='/' onClick={handleGoBack}>
            <ArrowLeftIcon className='h-4 w-4' />
            <span className='sr-only'>Назад</span>
          </Link>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Детали выпуска</h1>
      </div>

      <Button
        variant='outline'
        size='sm'
        onClick={handleShare}
        className='flex items-center gap-1.5 border-primary/50 transition-all duration-300 hover:bg-primary/10'
      >
        {shareSuccess ? <CheckIcon className='h-4 w-4 text-green-500' /> : <ShareIcon className='h-4 w-4' />}
      </Button>
    </div>
  );

  const renderBookTitle = () => (
    <div>
      <h2 className='text-2xl font-bold tracking-tight'>{book.name}</h2>
      <p className='text-lg text-muted-foreground'>{book.author}</p>
    </div>
  );

  const renderRatingAndDuration = (iconSize = 'h-4 w-4') => (
    <div className='flex items-center gap-3'>
      <RatingStars rating={book.rating.average} size='md' />
      <span className='text-lg text-muted-foreground'>•</span>
      <div className='flex items-center gap-1.5 text-muted-foreground'>
        <ClockIcon className={iconSize} />
        <span>{displayDuration(book.duration)}</span>
      </div>
    </div>
  );

  const renderAnnotation = (titleSize = 'font-medium') => (
    <div>
      <h3 className={`mb-2 ${titleSize}`}>Аннотация</h3>
      <div className='text-muted-foreground'>
        {book.annotation ? <p>{book.annotation}</p> : <p>Аннотация отсутствует</p>}
      </div>
    </div>
  );

  const renderGenres = (titleSize = 'font-medium') => (
    <div>
      <h3 className={`mb-2 ${titleSize}`}>Жанры</h3>
      <div className='flex flex-wrap gap-2'>
        {genres.length > 0 ? (
          genres.map((genre) => (
            <Badge key={genre} className={`${getColorForString(genre)} font-medium`} variant='secondary'>
              {genre}
            </Badge>
          ))
        ) : (
          <span className='text-sm text-muted-foreground'>Жанры не указаны</span>
        )}
      </div>
    </div>
  );

  const renderTags = (titleSize = 'font-medium', textSize = 'text-sm') => (
    <div>
      <h3 className={`mb-2 ${titleSize}`}>Характеристики</h3>
      <div className='flex flex-wrap gap-2'>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge
              key={tag}
              variant='outline'
              className={`bg-background/50 ${textSize} transition-colors hover:bg-secondary dark:border-primary/20 dark:bg-secondary/90 dark:hover:border-primary/50`}
            >
              {tag}
            </Badge>
          ))
        ) : (
          <span className='text-sm text-muted-foreground'>Характеристики не указаны</span>
        )}
      </div>
    </div>
  );

  const renderTracks = (titleSize = 'font-medium', textSize = 'text-sm', maxHeight = 'max-h-60') => (
    <div>
      <h3 className={`mb-2 ${titleSize}`}>Треки</h3>
      <div className='flex flex-col gap-1'>
        {book.tracks && book.tracks.length > 0 ? (
          <div className={`${maxHeight} overflow-y-auto`}>
            {book.tracks.map((track, index) => (
              <div key={index} className={`rounded p-1.5 ${textSize} text-muted-foreground hover:bg-secondary`}>
                {index + 1}. {track}
              </div>
            ))}
          </div>
        ) : (
          <span className='text-sm text-muted-foreground'>Список треков отсутствует</span>
        )}
      </div>
    </div>
  );

  const renderPlayButton = (isMobile = true) => {
    if (isMobile) {
      return (
        <Button
          variant={isPlaying ? 'default' : 'outline'}
          size='lg'
          className='mt-1 mb-1'
          onClick={() => setCurrentBook(book)}
        >
          <PlayIcon className='mr-2 h-5 w-5' />
          {isPlaying ? 'Сейчас играет' : 'Играть'}
        </Button>
      );
    }

    return (
      <div className='flex w-30 flex-col items-center gap-2'>
        <div className='flex h-16 w-16 items-center justify-center'>
          <Button
            variant={isPlaying ? 'default' : 'outline'}
            size='icon'
            className={cn(
              'h-16 w-16 rounded-full transition-colors duration-300',
              isPlaying
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'border-primary/30 bg-background hover:border-primary hover:bg-primary/5'
            )}
            onClick={() => setCurrentBook(book)}
          >
            <PlayIcon className='h-8 w-8' />
            <span className='sr-only'>Играть {book.name}</span>
          </Button>
        </div>
        <p className='text-center text-xs font-medium text-muted-foreground'>
          {isPlaying ? 'Сейчас играет' : 'Слушать'}
        </p>
      </div>
    );
  };

  const renderMobileLayout = () => (
    <div className='md:hidden'>
      <Card className='overflow-hidden dark:bg-secondary/90'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-6'>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-col gap-2'>
                {renderBookTitle()}
                {renderPlayButton(true)}
                {renderRatingAndDuration('h-5 w-5')}
                {renderAnnotation()}
              </div>
            </div>

            <div className='space-y-4'>
              {renderGenres()}
              {renderTags()}
              {renderTracks()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className='hidden md:block'>
      <Card className='overflow-hidden dark:bg-secondary/90'>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                {renderBookTitle()}
                <div className='mt-2'>{renderRatingAndDuration()}</div>
              </div>
              {renderPlayButton(false)}
            </div>

            <div className='grid gap-6 md:grid-cols-3'>
              <div className='md:col-span-2'>{renderAnnotation('text-lg font-medium')}</div>

              <div className='flex flex-col gap-4'>
                {renderGenres('text-lg font-medium')}
                {renderTags('text-lg font-medium', 'text-xs')}
                {renderTracks('text-lg font-medium', 'text-xs', 'max-h-72')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className='flex flex-col gap-6'>
      {renderHeader()}
      {renderMobileLayout()}
      {renderDesktopLayout()}
    </div>
  );
}
