import { StarIcon } from 'lucide-react';
import { cn } from '@/core/utils';

const STEPS = 5;

interface RatingStarsProps {
  rating: number;
  className?: string;
  size: 'sm' | 'md' | 'lg';
}

export function RatingStars({ rating, className, size }: RatingStarsProps) {
  const starSize = starSizes[size];

  return (
    <div className={cn('flex', className)}>
      {[...Array(5)].map((_, i) => {
        const fillLevel = Math.max(0, Math.min(1, rating - i));
        const fillPercentage = (Math.round(fillLevel * STEPS) / STEPS) * 100;

        return (
          <div key={i} className='relative'>
            <StarIcon className={cn(starSize, 'fill-muted text-muted-foreground')} />

            {fillPercentage > 0 && (
              <div className='absolute inset-0 overflow-hidden' style={{ width: `${fillPercentage}%` }}>
                <StarIcon className={cn(starSize, 'fill-primary text-primary')} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const starSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};
