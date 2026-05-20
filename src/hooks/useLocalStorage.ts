"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  // Ref: always current — avoids stale prev in functional updates
  const storedRef = useRef<T>(initialValue);
  storedRef.current = storedValue;

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item) as T;
        storedRef.current = parsed;
        setStoredValue(parsed);
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, [key]);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Compute next value synchronously from ref (not from React state)
      const next = value instanceof Function ? value(storedRef.current) : value;
      storedRef.current = next;
      // Write to localStorage immediately — before setState, so unmount can't lose it
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      setStoredValue(next);
    },
    [key]
  );

  return [storedValue, setValue, loaded];
}
