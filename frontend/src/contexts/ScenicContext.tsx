import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { ScenicInput } from '@/utils/scenic-scene';

interface ScenicContextValue {
  routeKey: string;
  input: ScenicInput;
  publish: (routeKey: string, input: ScenicInput) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ScenicContext = createContext<ScenicContextValue | null>(null);

export function ScenicProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;
  const [scene, setScene] = useState<{ routeKey: string; input: ScenicInput } | null>(null);
  const publish = useCallback((key: string, input: ScenicInput) => setScene({ routeKey: key, input }), []);
  const value = useMemo<ScenicContextValue>(() => ({
    routeKey,
    input: scene?.routeKey === routeKey ? scene.input : {},
    publish,
  }), [publish, routeKey, scene]);

  return <ScenicContext.Provider value={value}>{children}</ScenicContext.Provider>;
}
