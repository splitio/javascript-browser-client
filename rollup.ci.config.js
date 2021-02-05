import { plugins, VERSION } from './rollup.common.js';
import { terser } from 'rollup-plugin-terser';

export default env => {
  return [
    {
      input: 'src/umdMinOnline.ts', // minimal online version
      output: [
        // development build
        {
          format: 'umd', // works as `cjs`, `iife` and `amd` all in one
          name: 'splitio',
          file: `umd/split-browser${env.branch !== 'main' ? `-dev-${env.commit_hash}` : `-${VERSION}`}.js`
        },
        // production build
        {
          format: 'umd',
          name: 'splitio',
          file: `umd/split-browser${env.branch !== 'main' ? `-dev-${env.commit_hash}` : `-${VERSION}`}.min.js`,
          plugins: [
            terser()
          ]
        }],
      plugins
    }
  ];
};
