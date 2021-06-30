import React, { useCallback, useState } from 'react';

type ReturnType<T> = {
  value: T;
  handler: (_e: FieldEvent<T>) => void;
  setValue: React.Dispatch<React.SetStateAction<T>>;
};

type FieldEvent<T> = React.ChangeEvent<
  {
    value: T;
    name?: string;
  } & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
>;

/**
 * Custom Input Hook
 * @param initialState 초기값
 * @returns object to use Input Hook
 */
export default function useInput<T>(initialState: T): ReturnType<T> {
  const [value, setValue] = useState<T>(initialState);

  const handler = useCallback((e: FieldEvent<T>) => {
    setValue(e.target.value);
  }, []);

  return { value, handler, setValue };
}
