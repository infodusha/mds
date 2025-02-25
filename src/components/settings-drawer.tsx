import { SettingsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';

type SettingsDrawerProps = {
  hideListened: boolean;
  setHideListened: (value: boolean) => void;
};

export function SettingsDrawer({ hideListened, setHideListened }: SettingsDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='shrink-0 dark:border-secondary dark:bg-secondary/90 dark:hover:bg-secondary/60'
        >
          <SettingsIcon className='h-4 w-4' />
          <span className='sr-only'>Настройки</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className='mx-auto w-full max-w-xl'>
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
  );
}
