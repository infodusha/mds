import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';

import { ThemeMetaProvider } from '@/core/theme-meta-provider';
import { NotFound } from '@/components/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ThemeMetaProvider>
          <NuqsAdapter>
            <Outlet />
          </NuqsAdapter>
        </ThemeMetaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  ),
  notFoundComponent: () => <NotFound />,
});
