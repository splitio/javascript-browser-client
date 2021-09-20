// Here we are testing exceptions and the handler should be ours, we need to avoid tape-catch
import { initialLogLevel } from './setLocalStorage';
import tape from 'tape';
import sinon from 'sinon';
import fetchMock from '../testUtils/fetchMock';
import { SplitFactory, ErrorLogger, DebugLogger } from '../../index';

// Don't care about SDK readiness
fetchMock.get('*', { throws: new TypeError('Network error') });
fetchMock.post('*', 200);

const minConfig = {
  core: {
    authorizationKey: '<fake-token-1>',
    key: 'nico@split.io'
  }
};


tape('## E2E Logger Tests ##', assert => {

  const logSpy = sinon.spy(console, 'log');

  assert.test('debug settings: false', (t) => {
    const factory = SplitFactory({ ...minConfig, debug: false });
    factory.client().destroy().then(() => {
      t.false(logSpy.calledWithMatch('splitio => '), 'shouldn\'t log split messages');

      logSpy.resetHistory();
      t.end();
    });
  });

  assert.test('debug settings: Logger object', (t) => {
    const factory = SplitFactory({ ...minConfig, debug: ErrorLogger() });
    factory.client().destroy().then(() => {
      t.false(logSpy.calledWithMatch('[WARN]'), 'shouldn\'t log messages with level WARN');
      t.true(logSpy.calledWithMatch('[ERROR]'), 'should log messages with level ERROR');

      logSpy.resetHistory();
      localStorage.clear();
      t.end();
    });
  });

  assert.test('debug settings: log level', (t) => {
    const factory = SplitFactory({ ...minConfig, debug: 'INFO' });
    factory.client().destroy().then(() => {
      t.false(logSpy.calledWithMatch('[DEBUG]'), 'shouldn\'t log messages with level DEBUG');
      t.true(logSpy.calledWithMatch('[INFO]'), 'should log messages with level INFO');

      logSpy.resetHistory();
      t.end();
    });
  });

  assert.test('debug settings: localStorage.splitio_debug = "enable"', (t) => {
    const factory = SplitFactory(minConfig);
    factory.client().destroy().then(() => {
      t.true(logSpy.calledWithMatch('[' + initialLogLevel + ']'), 'should log messages with level' + initialLogLevel);

      logSpy.resetHistory();
      t.end();
    });
  });

  assert.test('Logger API', (t) => {

    function assertLoggerApi(factory) {
      factory.Logger.disable();
      t.equal(factory.settings.log.options.logLevel, 'NONE');

      factory.Logger.enable();
      t.equal(factory.settings.log.options.logLevel, 'DEBUG');

      factory.Logger.setLogLevel('WARN');
      t.equal(factory.settings.log.options.logLevel, 'WARN');

      factory.Logger.setLogLevel('invalid');
      t.equal(factory.settings.log.options.logLevel, 'WARN');

      factory.client().destroy();
    }

    assertLoggerApi(SplitFactory({ ...minConfig, debug: DebugLogger() }));
    assertLoggerApi(SplitFactory({ ...minConfig, debug: 'ERROR' }));

    t.end();
  });

  assert.end();
});
