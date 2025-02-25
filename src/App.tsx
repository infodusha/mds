import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';

import { IndexRoute } from './routes';
import { ThemeMetaProvider } from './core/theme-meta-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <ThemeMetaProvider>
          <NuqsAdapter>
            <IndexRoute />
          </NuqsAdapter>
        </ThemeMetaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
