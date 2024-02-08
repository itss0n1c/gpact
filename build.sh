#!/usr/bin/env bash

rm -rf dist &&
bun build --target=browser lib/index.ts --outdir dist &&
tsc -p .
