import { useState, useEffect } from 'react';

export type AppRoute = '/' | '/customize';

export function parseCurrentRoute(): AppRoute {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/customize' || search.includes('customize') || hash.includes('customize')) {
    return '/customize';
  }
  return '/';
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(parseCurrentRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(parseCurrentRoute());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { currentRoute, navigateTo };
}
