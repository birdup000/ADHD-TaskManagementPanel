import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to track component mounted state safely.
 * Ensures consistent behavior during React strict mode double-rendering.
 */
export function useMountedRef() {
  // Use a single ref to store both the mounted state and the getter
  const mountedRef = useRef({
    current: false,
    get: () => mountedRef.current.current
  });
  
  useEffect(() => {
    mountedRef.current.current = true;
    return () => {
      mountedRef.current.current = false;
    };
  }, []);

  // Return a stable callback using the ref's getter
  const isMounted = useCallback(mountedRef.current.get, []);

  return { ref: mountedRef, isMounted };
}