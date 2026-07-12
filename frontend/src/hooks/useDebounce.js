/**
 * Custom hooks placeholder — reusable logic will live here in future phases.
 */

export function useDebounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
