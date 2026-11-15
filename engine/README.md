# engine/

`hemomind-core.js` is a **generated file**. Do not edit it by hand.

It is the HemoMind engine compiled from the HemoMind-AI TypeScript sources. VesselWatch uses it as the single source of truth for everything physiological. The global it exposes is `window.HemoMindCore`.

| Source (HemoMind-AI) | What VesselWatch gets |
|---|---|
| `src/nasaMockStream.ts` | Reactive telemetry stream: heart rate, blood pressure (Norsk 2015), HRV rMSSD (Otsuka 2019), sleep (Barger 2014), left IJV ultrasound (Marshall-Goebel 2019), Earth–Mars delay (3–22 min) |
| `src/nasa/vteAlgorithm.ts`, `src/nasa/ochmoMtb007.ts` | `evaluateVteAlgorithm()`: the NASA OCHMO-MTB-007 p.14 decision tree as a pure function (status, EVA/ARED, apixaban regimen, landing washout, hormone advice) |
| `src/reference/scenarios.ts` | The 3 states: `NOMINAL`, `PRETHROMBOTIC`, `EMERGENCY_THROMBOSIS` |
| `src/vessel/vesselWatchAdapter.ts` | `buildVesselView(packet)`: the English view model this page renders, plus the signals passed to `agent/playbook.json` |

## Regenerate

From the HemoMind-AI folder:

```bash
npm test
npm run build:vessel
```

The build writes `../vessel-watch/engine/hemomind-core.js`.

## Not in the stream (on purpose)

- **Mood score.** No validated 1–5 scale exists in NASA data, so mood comes only from Lumi's check-in.
- **Glucose and temperature.** There are no open in-flight values, so the crew logs them by hand.
- **Vitals that differ by state.** No source links IJV stasis or a clot to changes in vital signs, so vitals keep the same published ranges in every state.
- **Mission plan values.** Mission length, the planned EVA day and weekly exercise minutes live in `MISSION_PLAN` in `index.html`. They are labeled as simulated.
