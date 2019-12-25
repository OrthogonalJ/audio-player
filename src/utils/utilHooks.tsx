import { useEffect, useRef, MutableRefObject } from 'react';

export function useInterval(callback: () => any, delay: number) {
  // Source: https://blog.logrocket.com/how-to-build-a-progress-bar-with-react-native/
  const savedCallback: MutableRefObject<any> = useRef<any>();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}