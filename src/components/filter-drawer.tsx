import { FilterIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/core/utils';
import { displayDuration } from '@/core/display-duration';
import { DEFAULT_MAX_DURATION, DEFAULT_MIN_RATING, querySchema } from '@/core/query-schema';

import allGenres from '@/data/genres.json';

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeAccordion?: string;
  setActiveAccordion: (value: string | undefined) => void;
  onMaxDurationChange: (value: number) => void;
  onMinRatingChange: (value: number) => void;
  onGenreToggle: (value: string) => void;
  onReset: () => void;
}

export function FilterDrawer({
  open,
  onOpenChange,
  activeAccordion,
  setActiveAccordion,
  onMaxDurationChange,
  onMinRatingChange,
  onGenreToggle,
  onReset: reset,
}: FilterDrawerProps) {
  const [maxDuration] = useQueryState('d', querySchema.d);
  const [minRating] = useQueryState('r', querySchema.r);
  const [genres] = useQueryState('g', querySchema.g);

  const areFiltersActive = maxDuration < DEFAULT_MAX_DURATION || genres.length > 0 || minRating > DEFAULT_MIN_RATING;

  function renderGenre(genre: string) {
    const isSelected = genres.includes(genre);

    return (
      <Button
        key={genre}
        variant={isSelected ? 'default' : 'outline'}
        size='sm'
        className={`h-7 cursor-pointer rounded-full text-xs whitespace-nowrap ${
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

  function handleDrawerOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
    if (!isOpen) {
      setActiveAccordion(undefined);
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
      <DrawerContent>
        <div className='mx-auto w-full max-w-xl'>
          <DrawerHeader>
            <DrawerTitle>Фильтры</DrawerTitle>
            <DrawerDescription>Настройте фильтры, чтобы найти идеальный выпуск</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pb-8'>
            <div className='grid gap-4'>
              <div className='flex items-center justify-between'>
                <h4 className='leading-none font-medium'>Фильтры</h4>
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
              <div className='space-y-2'>
                <h4 className='leading-none font-medium'>Продолжительность</h4>
                <Slider
                  max={DEFAULT_MAX_DURATION}
                  step={5}
                  value={[maxDuration]}
                  onValueChange={([newMaxDuration]) => onMaxDurationChange(newMaxDuration ?? DEFAULT_MAX_DURATION)}
                  className='w-full'
                />
                <p className='text-sm text-muted-foreground'>До {displayDuration(maxDuration * 60)}</p>
              </div>
              <div className='space-y-2'>
                <h4 className='leading-none font-medium'>Рейтинг</h4>
                <Slider
                  max={5}
                  step={0.2}
                  inverted
                  value={[5 - minRating]}
                  onValueChange={([newMinRating]) =>
                    onMinRatingChange(Math.round((5 - (newMinRating ?? DEFAULT_MIN_RATING)) * 10) / 10)
                  }
                  className='w-full'
                />
                <p className='text-sm text-muted-foreground'>От {minRating}</p>
              </div>
              <div className='space-y-2'>
                <h4 className='leading-none font-medium'>Жанры</h4>
                <Accordion
                  type='single'
                  collapsible
                  className='w-full space-y-2'
                  value={activeAccordion}
                  onValueChange={setActiveAccordion}
                >
                  {Object.entries(allGenres).map(([group, groupGenres]) => (
                    <AccordionItem key={group} value={group} className='rounded-lg border'>
                      <AccordionTrigger className='px-3'>
                        <span className='flex items-center gap-2'>
                          {group}
                          <span className='text-xs text-muted-foreground'>
                            {groupGenres.filter((g) => genres.includes(g)).length || ''}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className='px-3 pb-3'>
                        <div className='flex flex-wrap gap-1.5'>{groupGenres.map(renderGenre)}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
