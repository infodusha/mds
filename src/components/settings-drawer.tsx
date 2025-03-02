import { SettingsIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { login, LoginRequest, logout } from '@/core/api';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/core/hooks/use-profile';

export function SettingsDrawer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { profile, isLoggedIn, refetchProfile } = useProfile();

  const loginMutation = useMutation({
    mutationFn: async (input: LoginRequest) => {
      const response = await login(input);
      if ('status' in response) {
        throw new Error(response.message);
      }
      return response;
    },
    onSuccess: () => {
      setEmail('');
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refetchProfile();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
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
              {isLoggedIn ? (
                <>
                  <div className='flex items-center justify-between'>
                    <div className='font-medium'>Авторизован как:</div>
                    <div>{profile?.email}</div>
                  </div>
                  <Separator className='my-2' />
                  <div className='flex items-center justify-between'>
                    <Label className='font-medium'>Выйти из аккаунта</Label>
                    <Button variant='destructive' onClick={handleLogout} disabled={logoutMutation.isPending}>
                      {logoutMutation.isPending ? 'Выход...' : 'Выйти'}
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleLogin} className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      autoComplete='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='password'>Пароль</Label>
                    <Input
                      id='password'
                      type='password'
                      autoComplete='current-password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type='submit' disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Вход...' : 'Войти'}
                  </Button>
                  {loginMutation.isError && (
                    <div className='text-sm text-destructive'>Ошибка входа: {loginMutation.error.message}</div>
                  )}
                </form>
              )}
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
