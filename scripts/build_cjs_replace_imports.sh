#!/bin/bash

# replace splitio-commons imports to use its commonjs build
replace '@splitsoftware/splitio-commons/src' '@splitsoftware/splitio-commons/cjs' ./cjs -r

cp ./types/slim/index.d.ts ./cjs/slim/index.d.ts

if [ $? -eq 0 ]
then
  exit 0
else
  exit 1
fi
