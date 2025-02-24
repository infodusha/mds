import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='grid grid-cols-2 gap-1.5'>
      <Button
        variant='outline'
        size='sm'
        className={`w-24 justify-center ${
          theme === 'light' ? 'bg-accent text-accent-foreground hover:bg-accent/80' : 'hover:bg-secondary/50'
        }`}
        onClick={() => setTheme('light')}
      >
        <Sun className='h-4 w-4' />
        Светлая
      </Button>
      <Button
        variant='outline'
        size='sm'
        className={`w-24 justify-center ${
          theme === 'dark' ? 'bg-accent text-accent-foreground hover:bg-accent/80' : 'hover:bg-secondary/50'
        }`}
        onClick={() => setTheme('dark')}
      >
        <Moon className='h-4 w-4' />
        Темная
      </Button>
    </div>
  );
}
