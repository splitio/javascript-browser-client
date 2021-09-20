#!/bin/bash

# replace splitio-commons imports to use its ES modules build
replace '@splitsoftware/splitio-commons/src' '@splitsoftware/splitio-commons/esm' ./esm -r

cp ./types/slim/index.d.ts ./esm/slim/index.d.ts

if [ $? -eq 0 ]
then
  exit 0
else
  exit 1
fi
