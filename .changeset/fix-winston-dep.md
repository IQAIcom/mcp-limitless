---
"@iqai/mcp-limitless": patch
---

fix: move winston from devDependencies to dependencies

Winston was incorrectly listed as a devDependency but is required at runtime
for logging. This caused the package to fail when installed via npm/pnpx.
