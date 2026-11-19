# Contributing to VesselWatch

- Work on a branch and open a pull request. Merge small and often.
- Keep `main` deployable. Every push to `main` redeploys the live app on Vercel.
- Clinical changes go in `agent/playbook.json` and need a passing test run:

  ```bash
  node agent/test.mjs
  python3 agent/test_agent.py
  ```

- Add a case to `agent/scenarios.json` for every rule change. Both engines must pass the same scenarios, and GitHub Actions checks this on every pull request.
- `engine/hemomind-core.js` is generated. Do not edit it by hand; see `engine/README.md`.
