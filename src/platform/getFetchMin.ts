// It doesn't return a ponyfill if global fetch is not available
export default function getFetch() {
  // eslint-disable-next-line compat/compat
  return typeof window !== 'undefined' ? window.fetch : undefined;
}
