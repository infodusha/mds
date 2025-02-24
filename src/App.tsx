import { ThemeProvider } from 'next-themes';

import { IndexRoute } from './routes';

export function App() {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <IndexRoute />
    </ThemeProvider>
  );
}
