import { IFetch } from '@splitsoftware/splitio-commons/src/services/types';
import unfetch from 'unfetch';

export function getFetch() {
  return typeof fetch === 'function' ? fetch : unfetch as unknown as IFetch;
}
