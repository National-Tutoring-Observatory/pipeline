---
name: validate
description: Run typecheck, tests, and format checks to validate the codebase
disable-model-invocation: true
allowed-tools: Bash(yarn:*)
---

Run the validation checks in this order:

1. `yarn typecheck`
2. `yarn format`
3. `yarn test`

Run each command sequentially. If a check fails, stop and report the failure clearly so it can be addressed before continuing.
