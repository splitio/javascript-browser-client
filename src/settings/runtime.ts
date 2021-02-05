import { ISettings } from '@splitsoftware/splitio-commons/src/types';

export default function(): ISettings['runtime'] {
  return {
    ip: false,
    hostname: false
  };
}
