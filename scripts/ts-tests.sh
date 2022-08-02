#!/bin/bash

cd ts-tests ## Go to typescript tests folder
echo "Installing dependencies for TypeScript declarations testing..."
npm install ## Install dependencies
echo "Dependencies installed, linking the package."
npm link @splitsoftware/splitio-browserjs ## Link to the cloned code
echo "Running tsc compiler."
../node_modules/.bin/tsc ## Run typescript compiler. No need for flags as we have a tsconfig.json file

if [ $? -eq 0 ]
then
  echo "✅  Successfully compiled TS tests."

  npm run test-cjs-and-umd
  if [ $? -ne 0 ]
  then
    echo "☠️  Error testing modules in CJS and UMD builds."
    npm unlink @splitsoftware/splitio-browserjs
    exit 1
  fi

  npm run test-esm
  if [ $? -ne 0 ]
  then
    echo "☠️  Error testing modules in ESM build."
    npm unlink @splitsoftware/splitio-browserjs
    exit 1
  fi

  SIZE_FULL_BUNDLE=$(wc -c ./bundleESM.js | awk '{print $1}')
  SIZE_SLIM_WITH_LOCALHOST_BUNDLE=$(wc -c ./bundleESM_TreeShaking.js | awk '{print $1}')

  echo "Minified file with all modules shouldn't be larger than 120KB. Current size: $SIZE_FULL_BUNDLE"
  if [[ $SIZE_FULL_BUNDLE > 120000 ]] ;then
    npm unlink @splitsoftware/splitio-browserjs
    exit 1
  fi

  echo "Minified file with tree-shaking shouldn't be larger than 90KB. Current size: $SIZE_SLIM_WITH_LOCALHOST_BUNDLE"
  if [[ $SIZE_SLIM_WITH_LOCALHOST_BUNDLE > 90000 ]] ;then
    npm unlink @splitsoftware/splitio-browserjs
    exit 1
  fi

  echo "✅  Successfully run modules tests."
  npm unlink @splitsoftware/splitio-browserjs
  exit 0
fi

echo "☠️  Error compiling TS tests."
npm unlink @splitsoftware/splitio-browserjs
exit 1