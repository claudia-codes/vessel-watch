# VesselWatch

An astronaut health companion for long missions, built for the NASA Space Apps Challenge. Lumi, a robot-cat companion, runs a short daily check-in or a voice-guided body scan. A transparent medical agent then decides what to do and who needs to know. It focuses on circulation and neck-vein clot risk in microgravity.

**Decision support, not diagnosis.** All crew data in the demo is simulated inside published ISS in-flight ranges by the HemoMind engine. The clot decision is NASA OCHMO-MTB-007 (2026) as a pure function, including its apixaban regimen. Other thresholds are demo values pending clinician review.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The app: crew console with Lumi, mission timeline, daily missions, body scan, voice control, and the medical agent panel |
| `engine/hemomind-core.js` | Generated HemoMind engine: telemetry stream and OCHMO-MTB-007 decision, the single source of truth (see `engine/README.md`) |
| `agent/playbook.json` | All clinical knowledge: rules, daily missions, NASA schedule, evidence sources, speech lexicon |
| `agent/agent.js` | The agent engine for browsers and Node |
| `agent/agent.py` | The same engine in Python, for a FastAPI backend |
| `agent/scenarios.json` | Test cases with expected results |
| `agent/README.md` | How the agent works and how to reuse it |

## Run it locally

The app loads the playbook with `fetch`, so open it through a local server, not by double-clicking the file:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Test the agent

```bash
node agent/test.mjs
python3 agent/test_agent.py
```

Both engines must pass the same scenarios. Add a case to `agent/scenarios.json` for every rule change.

## Deploy

Connect this repo to Vercel as a static site, with no build step. Every push to `main` redeploys, and every pull request gets a preview link.

## Voice

Tap 👂, then say **"Lumi, activate check-in"** or **"Lumi, body scan"**. Anything else after "Lumi" goes to the medical agent. The same commands also work typed into the text box. A full spoken back-and-forth works in Chrome; inside claude.ai, Lumi answers on screen while it listens.

## Working together

- Work on a branch and open a pull request. Merge small and often.
- Keep `main` deployable; freeze it before the demo.
- Clinical changes go in `agent/playbook.json` and need a passing test run.
