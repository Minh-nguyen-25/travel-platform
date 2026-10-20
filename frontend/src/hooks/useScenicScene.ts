import { useContext, useEffect } from 'react';
import { ScenicContext } from '@/contexts/ScenicContext';
import type { ScenicInput } from '@/utils/scenic-scene';

/** Shares already-loaded page data with the decoration; performs no API requests. */
export default function useScenicScene(input: ScenicInput) {
  const context = useContext(ScenicContext);
  const routeKey = context?.routeKey;
  const publish = context?.publish;
  const serialized = JSON.stringify(input);
  useEffect(() => {
    if (routeKey && publish) publish(routeKey, JSON.parse(serialized) as ScenicInput);
  }, [publish, routeKey, serialized]);
}
