/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export const usePrevious = <T>(value: T): T => {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current as T;
};
