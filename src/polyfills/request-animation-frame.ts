/**
 * Expo's static web export renders in Node, where `requestAnimationFrame`
 * does not exist. Reanimated 4.7 schedules its web mappers with it.
 */
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(Date.now()), 0) as unknown as number;
  };
}

if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = (handle: number | null | undefined): void => {
    if (handle != null) clearTimeout(handle);
  };
}
