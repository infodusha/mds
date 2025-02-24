import { SetStateAction, useEffect, useState } from 'react';

export function useStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : initialValue;
  });

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
        setState(newValue);
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  function saveAndSetState(value: SetStateAction<T>) {
    setState((prev) => {
      const newValue = typeof value === 'function' ? (value as (prevState: T) => T)(prev) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  }

  return [state, saveAndSetState] as const;
}
