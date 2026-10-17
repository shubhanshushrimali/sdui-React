import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const emptySubscribe = () => () => {};

/**
 * Static web renders use light mode. After hydration, follow the device scheme.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : 'light';
}
