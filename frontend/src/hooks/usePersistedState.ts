import { useState, useEffect } from "react";

export const usePersistedState = <T extends string = string>(key: string) => {
  const [value, setValueState] = useState<T | undefined>(() => {
    return (localStorage.getItem(key) as T) ?? undefined;
  });

  useEffect(() => {
    if (value !== undefined) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [key, value]);

  const setValue = (next: T | undefined) => setValueState(next);

  return { value, setValue };
};
