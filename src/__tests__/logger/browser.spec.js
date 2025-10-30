// Here we are testing exceptions and the handler should be ours, we need to avoid tape-catch
import { initialLogLevel } from './setLocalStorage';
import tape from 'tape';
import sinon from 'sinon';
import fetchMock from '../testUtils/fetchMock';
import { SplitFactory, ErrorLogger, DebugLogger } from '../../';

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

  assert.test('debug settings: false', async (t) => {
    const factory = SplitFactory({ ...minConfig, debug: false });
    await factory.client().destroy();
    t.false(logSpy.calledWithMatch('splitio => '), 'shouldn\'t log split messages');

    logSpy.resetHistory();
    t.end();
  });

  assert.test('debug settings: Logger object', async (t) => {
    const factory = SplitFactory({ ...minConfig, debug: ErrorLogger() });
    await Promise.resolve();

    await factory.client().destroy();
    t.false(logSpy.calledWithMatch('[WARN]'), 'shouldn\'t log messages with level WARN');
    t.true(logSpy.calledWithMatch('[ERROR]'), 'should log messages with level ERROR');

    logSpy.resetHistory();
    localStorage.clear();
    t.end();
  });

  assert.test('debug settings: log level', async (t) => {
    const factory = SplitFactory({ ...minConfig, debug: 'INFO' });
    await Promise.resolve();
    await factory.client().destroy();
    t.false(logSpy.calledWithMatch('[DEBUG]'), 'shouldn\'t log messages with level DEBUG');
    t.true(logSpy.calledWithMatch('[INFO]'), 'should log messages with level INFO');

    logSpy.resetHistory();
    t.end();
  });

  assert.test('debug settings: custom logger', async (t) => {
    const customLogger = {
      debug: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
      error: sinon.spy()
    };

    const factory = SplitFactory({ ...minConfig, debug: 'INFO', logger: customLogger });

    t.equal(factory.settings.log.options.logLevel, 'INFO');

    await factory.client().destroy();
    t.false(customLogger.debug.called, 'should not log messages with level DEBUG');
    t.true(customLogger.info.calledWithMatch('splitio => '), 'should log messages with level INFO');

    logSpy.resetHistory();
    t.end();
  });

  assert.test('debug settings: localStorage.splitio_debug = "enable"', async (t) => {
    const factory = SplitFactory(minConfig);
    await Promise.resolve();
    await factory.client().destroy();
    t.true(logSpy.calledWithMatch('[' + initialLogLevel + ']'), 'should log messages with level' + initialLogLevel);

    logSpy.resetHistory();
    t.end();
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

      // attempt to set invalid logger
      factory.Logger.setLogger('invalid logger');
      t.equal(factory.settings.log.logger, undefined);

      // set logger
      factory.Logger.setLogger(console);
      t.equal(factory.settings.log.logger, console);

      // unset logger
      factory.Logger.setLogger(undefined);
      t.equal(factory.settings.log.logger, undefined);

      factory.client().destroy();
    }

    assertLoggerApi(SplitFactory({ ...minConfig, debug: DebugLogger() }));
    assertLoggerApi(SplitFactory({ ...minConfig, debug: 'ERROR' }));

    t.end();
  });

  assert.end();
});
