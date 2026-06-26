const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { rollup } = require('rollup');
const puppeteer = require('puppeteer');
const createRollupConfig = require('./rollup.spec.config');

const TIMEOUT_MS = 5 * 60 * 1000;

function uniqueSuffix() {
  return crypto.randomBytes(8).toString('hex');
}

function describePageError(err) {
  if (err && err.stack) return err.stack;
  if (err && err.message) return err.message;
  return String(err);
}

async function bundleSpec(input) {
  const outFile = path.join(os.tmpdir(), `split-spec-${process.pid}-${Date.now()}-${uniqueSuffix()}.js`);
  const config = createRollupConfig(input, outFile);
  const bundle = await rollup({ input: config.input, plugins: config.plugins });
  await bundle.write(config.output);
  await bundle.close();
  return outFile;
}

async function runSpec(browser, specEntry) {
  const bundlePath = await bundleSpec(specEntry);
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const htmlPath = path.join(os.tmpdir(), `split-spec-${process.pid}-${Date.now()}-${uniqueSuffix()}.html`);
  // Wrap console.log AFTER the bundle loads (so module-init sinon spies have
  // already attached) but before tape's first test runs (tape schedules tests
  // via setImmediate, so a synchronous wrap right after the bundle script is
  // still in time). karma-tap relied on this same ordering to mask a latent
  // spec bug where some sub-suites call sinon.spy(console, 'log') without
  // restoring; the karma-tap wrap sits on top and absorbs the sinon marker,
  // so subsequent sinon.spy calls do not see "already wrapped".
  const postamble = `(function(){var o=console.log;console.log=function(){return o.apply(this,arguments);};})();`;
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>${bundle}</script><script>${postamble}</script></body></html>`;
  fs.writeFileSync(htmlPath, html);

  const page = await browser.newPage();
  let passing = true;
  let resolveDone;
  const donePromise = new Promise(r => { resolveDone = r; });

  page.on('console', (msg) => {
    const text = msg.text();
    process.stdout.write(text + '\n');
    if (/^not ok\s+\d+/.test(text)) passing = false;
    const failMatch = /^# fail\s+(\d+)$/.exec(text);
    if (failMatch) {
      if (Number.parseInt(failMatch[1], 10) > 0) passing = false;
      resolveDone();
    } else if (/^# ok$/.test(text)) {
      resolveDone();
    }
  });

  page.on('pageerror', (err) => {
    // Tag each line with a clear prefix so uncaught page errors (including
    // intentional ones from errorCatching specs) cannot be confused with
    // TAP output. Exit code is still decided by the TAP counters at the
    // end of the run — page errors do not abort.
    const stack = describePageError(err);
    stack.split('\n').forEach(line => {
      process.stderr.write('[pageerror] ' + line + '\n');
    });
  });

  await page.goto('file://' + htmlPath);

  const timer = setTimeout(() => {
    process.stderr.write(`run-tape: timeout after ${TIMEOUT_MS / 1000}s on ${specEntry}\n`);
    passing = false;
    resolveDone();
  }, TIMEOUT_MS);

  await donePromise;
  clearTimeout(timer);

  await page.close();
  fs.rmSync(bundlePath, { force: true });
  fs.rmSync(htmlPath, { force: true });

  return passing;
}

async function main(specs) {
  const launchOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  };
  if (process.env.CHROME_BIN) {
    launchOptions.executablePath = process.env.CHROME_BIN;
  }
  const browser = await puppeteer.launch(launchOptions);
  let allPassing = true;
  try {
    for (const spec of specs) {
      process.stdout.write(`\n# running ${spec}\n`);
      const passing = await runSpec(browser, spec);
      if (!passing) allPassing = false;
    }
  } finally {
    await browser.close();
  }
  process.exit(allPassing ? 0 : 1);
}

const specs = process.argv.slice(2);
if (!specs.length) {
  console.error('usage: node scripts/run-tape.js <spec entry file> [more...]');
  process.exit(2);
}
(async () => {
  try {
    await main(specs);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
