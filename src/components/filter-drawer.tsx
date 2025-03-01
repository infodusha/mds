import { FilterIcon, Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/core/utils';
import { displayDuration } from '@/core/display-duration';
import { DEFAULT_MAX_DURATION, DEFAULT_MIN_RATING, querySchema } from '@/core/query-schema';
import { getAmount } from '@/core/api';
import { useStorageState } from '@/core/hooks/use-storage-state';
import { useQuery } from '@tanstack/react-query';

import allGenres from '@/data/genres.json';
import { allTags, tagToParamMap } from '@/core/tag-mapping';

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMaxDurationChange: (value: number) => void;
  onMinRatingChange: (value: number) => void;
  onGenreToggle: (value: string) => void;
  onTagToggle: (value: string) => void;
  onReset: () => void;
}

export function FilterDrawer({
  open,
  onOpenChange,
  onMaxDurationChange,
  onMinRatingChange,
  onGenreToggle,
  onTagToggle,
  onReset: reset,
}: FilterDrawerProps) {
  const [maxDuration] = useQueryState('d', querySchema.d);
  const [minRating] = useQueryState('r', querySchema.r);
  const [genres] = useQueryState('g', querySchema.g);
  const [tags] = useQueryState('t', querySchema.t);
  const [search] = useQueryState('q', querySchema.q);
  const [hideListened] = useStorageState('hideListened', false);
  const [activeTab, setActiveTab] = useState('common');
  const [genreSearch, setGenreSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const countQuery = useQuery({
    queryKey: ['worksCount', hideListened, search, maxDuration, minRating, genres, tags],
    queryFn: async () => {
      const searchRegex = {
        $regex: `.*${search.trim()}.*`,
        $options: 'i',
      };

      const searchQuery = search ? { $or: [{ author: searchRegex }, { name: searchRegex }] } : {};
      const durationQuery = { duration: { $lte: maxDuration * 60 } };
      const ratingQuery = minRating > 0 ? { 'rating.average': { $gte: minRating } } : {};
      const genreQueryArr = genres.length > 0 ? genres.map((genre) => ({ ['params.Жанры/поджанры']: genre })) : [];

      const tagQueryArr = tags.length > 0 ? tags.map((tag) => ({ [tagToParamMap.get(tag) || '']: tag })) : [];

      const hasAndQuery = genreQueryArr.length > 0 || tagQueryArr.length > 0;
      const andQuery = hasAndQuery ? { $and: [...genreQueryArr, ...tagQueryArr] } : {};

      return getAmount({
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
      });
    },
    enabled: open,
  });

  const areFiltersActive =
    maxDuration < DEFAULT_MAX_DURATION || genres.length > 0 || tags.length > 0 || minRating > DEFAULT_MIN_RATING;

  const selectedGenres = useMemo(() => {
    return allGenres.filter((g) => genres.includes(g));
  }, [genres]);

  const selectedTags = useMemo(() => {
    return allTags.filter((t) => tags.includes(t));
  }, [tags]);

  const filteredUnselectedGenres = useMemo(() => {
    const unselectedGenres = allGenres.filter((g) => !genres.includes(g));

    if (!genreSearch.trim()) {
      return unselectedGenres;
    }

    const searchLower = genreSearch.toLowerCase();
    return unselectedGenres.filter((genre) => genre.toLowerCase().includes(searchLower));
  }, [genreSearch, genres]);

  const filteredUnselectedTags = useMemo(() => {
    const unselectedTags = allTags.filter((t) => !tags.includes(t));

    if (!tagSearch.trim()) {
      return unselectedTags;
    }

    const searchLower = tagSearch.toLowerCase();
    return unselectedTags.filter((tag) => tag.toLowerCase().includes(searchLower));
  }, [tagSearch, tags]);

  function renderGenre(genre: string) {
    const isSelected = genres.includes(genre);

    return (
      <Button
        key={genre}
        variant={isSelected ? 'default' : 'outline'}
        size='sm'
        className={`h-8 cursor-pointer rounded-full px-2 text-xs whitespace-nowrap ${
          isSelected
            ? 'dark:bg-primary dark:text-primary-foreground'
            : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        }`}
        onClick={() => onGenreToggle(genre)}
      >
        {genre}
      </Button>
    );
  }

  function renderTag(tag: string) {
    const isSelected = tags.includes(tag);

    return (
      <Button
        key={tag}
        variant={isSelected ? 'default' : 'outline'}
        size='sm'
        className={`h-8 cursor-pointer rounded-full px-2 text-xs whitespace-nowrap ${
          isSelected
            ? 'dark:bg-primary dark:text-primary-foreground'
            : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        }`}
        onClick={() => onTagToggle(tag)}
      >
        {tag}
      </Button>
    );
  }

  function handleDrawerOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setGenreSearch('');
      setTagSearch('');
    }
  }

  function resetFilters() {
    reset();
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={handleDrawerOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant={areFiltersActive ? 'default' : 'outline'}
          size='icon'
          className={cn(
            'shrink-0',
            areFiltersActive
              ? 'dark:bg-primary dark:text-primary-foreground'
              : 'dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
          )}
        >
          <FilterIcon className='h-4 w-4' />
          <span className='sr-only'>Фильтры</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className='h-[85vh]'>
        <div className='mx-auto flex h-full w-full max-w-lg flex-col pb-8'>
          <DrawerHeader className='py-4'>
            <div className='flex items-center justify-between'>
              <DrawerTitle className='text-xl'>Фильтры</DrawerTitle>
              <Button
                variant='outline'
                size='sm'
                disabled={!areFiltersActive}
                onClick={resetFilters}
                className='dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
              >
                Сбросить
              </Button>
            </div>
            <DrawerDescription>
              {countQuery.isLoading ? (
                <span className='mt-1 text-sm text-muted-foreground'>Загрузка...</span>
              ) : countQuery.data !== undefined ? (
                <span className='mt-1 text-sm text-muted-foreground'>
                  Найдено: {countQuery.data}{' '}
                  {countQuery.data === 1 ? 'выпуск' : countQuery.data < 5 ? 'выпуска' : 'выпусков'}
                  {search ? ' (включая поиск)' : ''}
                </span>
              ) : null}
            </DrawerDescription>
          </DrawerHeader>

          <div className='flex flex-1 flex-col overflow-hidden px-4'>
            <Tabs
              defaultValue='common'
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex h-full w-full flex-col'
            >
              <TabsList className='mb-5 h-11 w-full flex-shrink-0 bg-muted/50 p-1'>
                <TabsTrigger value='common' className='h-full flex-1'>
                  Основное
                  {(maxDuration < DEFAULT_MAX_DURATION || minRating > DEFAULT_MIN_RATING) && (
                    <span className='ml-1 h-2 w-2 rounded-full bg-primary'></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value='genres' className='h-full flex-1'>
                  Жанры{' '}
                  {genres.length > 0 && (
                    <span className='ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
                      {genres.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value='tags' className='h-full flex-1'>
                  Теги{' '}
                  {tags.length > 0 && (
                    <span className='ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
                      {tags.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className='flex-1 overflow-y-auto'>
                <TabsContent value='common' className='mt-0 h-full focus-visible:outline-none'>
                  <div className='space-y-8'>
                    <div className='space-y-4'>
                      <h4 className='text-lg font-medium'>Продолжительность</h4>
                      <Slider
                        max={DEFAULT_MAX_DURATION}
                        step={5}
                        value={[maxDuration]}
                        onValueChange={([newMaxDuration]) =>
                          onMaxDurationChange(newMaxDuration ?? DEFAULT_MAX_DURATION)
                        }
                        className='w-full py-4'
                      />
                      <p className='text-base text-muted-foreground'>До {displayDuration(maxDuration * 60)}</p>
                    </div>

                    <div className='space-y-4'>
                      <h4 className='text-lg font-medium'>Минимальный рейтинг</h4>
                      <Slider
                        max={5}
                        step={0.2}
                        inverted
                        value={[5 - minRating]}
                        onValueChange={([newMinRating]) =>
                          onMinRatingChange(Math.round((5 - (newMinRating ?? DEFAULT_MIN_RATING)) * 10) / 10)
                        }
                        className='w-full py-4'
                      />
                      <p className='text-base text-muted-foreground'>От {minRating}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='genres' className='mt-0 h-full focus-visible:outline-none'>
                  <div className='space-y-4 pb-4'>
                    <h4 className='text-lg font-medium'>Жанры {genres.length > 0 && `(${genres.length})`}</h4>

                    <div className='relative'>
                      <Input
                        placeholder='Поиск жанров...'
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        className='pl-9'
                      />
                      <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    </div>

                    {selectedGenres.length > 0 && (
                      <div className='mt-2'>
                        <p className='mb-1.5 text-sm text-muted-foreground'>Выбранные жанры:</p>
                        <div className='mb-3 flex flex-wrap gap-1.5'>{selectedGenres.map(renderGenre)}</div>
                      </div>
                    )}

                    {selectedGenres.length === 0 && genreSearch === '' && (
                      <p className='mb-2 text-sm text-muted-foreground'>
                        Начните печатать для поиска жанров или выберите из списка ниже:
                      </p>
                    )}

                    <div className='mt-2 flex flex-wrap gap-1.5'>{filteredUnselectedGenres.map(renderGenre)}</div>
                  </div>
                </TabsContent>

                <TabsContent value='tags' className='mt-0 h-full focus-visible:outline-none'>
                  <div className='space-y-4 pb-4'>
                    <h4 className='text-lg font-medium'>Теги {tags.length > 0 && `(${tags.length})`}</h4>

                    <div className='relative'>
                      <Input
                        placeholder='Поиск тегов...'
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className='pl-9'
                      />
                      <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                    </div>

                    {selectedTags.length > 0 && (
                      <div className='mt-2'>
                        <p className='mb-1.5 text-sm text-muted-foreground'>Выбранные теги:</p>
                        <div className='mb-3 flex flex-wrap gap-1.5'>{selectedTags.map(renderTag)}</div>
                      </div>
                    )}

                    {selectedTags.length === 0 && tagSearch === '' && (
                      <p className='mb-2 text-sm text-muted-foreground'>
                        Начните печатать для поиска тегов или выберите из списка ниже:
                      </p>
                    )}

                    <div className='mt-2 flex flex-wrap gap-1.5'>{filteredUnselectedTags.map(renderTag)}</div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
