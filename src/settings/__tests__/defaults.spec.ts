import { defaults } from '../defaults';
import { version } from '../../../package.json';

test('sdk version should contain the package.json version', () => {
  expect(defaults.version).toBe(`browserjs-${version}`);
  expect(version.length <= 16).toBeTruthy(); // SDK version must not exceed 16 chars length');
});
