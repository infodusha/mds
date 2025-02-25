import { useTheme } from 'next-themes';
import { useEffect } from 'react';

const elements = document.querySelectorAll<HTMLMetaElement>(`meta[name='theme-color']`);
const lightElement = elements[0]!;
const darkElement = elements[1]!;

const lightValue = lightElement.content;
const darkValue = darkElement.content;

export function ThemeMetaProvider({ children }: React.PropsWithChildren) {
  const { theme } = useTheme();

  useEffect(() => {
    const value = theme === 'dark' ? darkValue : lightValue;
    lightElement.content = value;
    darkElement.content = value;
  }, [theme]);

  return children;
}
