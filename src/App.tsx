import { useState, useEffect } from 'react';
import { useMaamulat } from './hooks/useMaamulat';
import { AppRouter } from './routes';

export function App() {
  const maamulat = useMaamulat();

  // Dark mode state with persistent localStorage sync
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maamulat_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('maamulat_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('maamulat_theme', 'light');
    }
  }, [isDark]);

  // Detect PWA standalone mode and tag root for consistent styling across platforms
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) {
        document.documentElement.classList.add('standalone');
      }
    }
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <AppRouter
      maamulat={maamulat}
      isDark={isDark}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
