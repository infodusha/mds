import { HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <div className='flex min-h-[calc(100vh-6rem)] items-center justify-center px-4'>
      <Card className='w-full max-w-md'>
        <CardContent className='flex flex-col items-center gap-6 p-4 text-center sm:p-6'>
          <div className='relative aspect-square w-full max-w-[240px] sm:w-64'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='relative h-full w-full'>
                <div className='absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 transform rounded-sm border-2 border-dashed border-primary/30'></div>

                <div className='absolute top-[20%] right-[20%] h-[20%] w-[20%] transform'>
                  <svg viewBox='0 0 100 100' className='h-full w-full'>
                    <path d='M0,0 L100,0 L100,100 Z' fill='currentColor' className='text-primary/10' />
                  </svg>
                </div>

                <div className='absolute top-[30%] left-1/2 -translate-x-1/2 transform'>
                  <span className='text-6xl font-bold text-primary/30'>?</span>
                </div>

                <div className='absolute top-[60%] left-1/2 -translate-x-1/2 transform'>
                  <h1 className='text-6xl font-bold tracking-tighter text-primary sm:text-7xl'>404</h1>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2 px-2'>
            <h2 className='text-xl font-bold sm:text-2xl'>Страница не найдена</h2>
            <p className='text-sm text-muted-foreground sm:text-base'>Кажется, эта страница затерялась в библиотеке</p>
          </div>

          <Button asChild className='mt-2 w-full sm:w-auto' size='lg'>
            <Link to='/'>
              <HomeIcon className='mr-2 h-4 w-4' />
              Вернуться на главную
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
