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
  npm unlink @splitsoftware/splitio-browserjs
  exit 0
else
  echo "☠️  Error compiling TS tests."
  npm unlink @splitsoftware/splitio-browserjs
  exit 1
fi
