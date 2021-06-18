// It doesn't return a ponyfill if global fetch is not available
export default function getFetch() {
  return typeof fetch === 'function' ? fetch : undefined;
}
