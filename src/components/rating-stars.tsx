import { StarIcon } from 'lucide-react';
import { cn } from '@/core/utils';

interface RatingStarsProps {
  rating: number;
  className?: string;
  size: 'sm' | 'md' | 'lg';
}

export function RatingStars({ rating, className, size }: RatingStarsProps) {
  const value = Math.round(rating);
  const starSize = starSizes[size];

  return (
    <div className={cn('flex', className)}>
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={cn(starSize, i < value ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground')}
        />
      ))}
    </div>
  );
}

const starSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};
