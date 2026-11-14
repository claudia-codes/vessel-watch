# VesselWatch medical agent

A transparent rule engine for astronaut circulation, heart and wellbeing self-checks. It reads a day's signals (sleep, mood, symptoms, neck-scan result, schedule, wearable trends) and returns a severity level, the rules that matched, the evidence behind each one, what to do, who is told, and a plain-language message for the crew member.

**Decision support, not diagnosis.** It never diagnoses and never outputs drug doses. Playbook v0.4.0 is a draft pending clinician review.

## What's in the folder

| File | What it is |
|---|---|
| `playbook.json` | All the clinical knowledge: 18 rules plus a fallback, the datasets it draws on, evidence sources, roles and a speech lexicon. This is the file a clinician edits. |
| `agent.js` | The engine as an ES module, for browsers and Node. |
| `agent.py` | The same engine in Python, for a FastAPI or other backend. |
| `scenarios.json` | 11 test cases with expected results. |
| `test.mjs`, `test_agent.py` | Run the test cases against each engine. Both engines must give identical results. |

## Use it in JavaScript

```js
import { createAgent, loadPlaybook } from "./agent.js";

const agent = createAgent(await loadPlaybook("./playbook.json"));

const result = agent.assess({
  day: 47,
  sleepH: 5.2, baselineSleepH: 7.2, shortNights: 3,
  mood: "meh",
  symptoms: ["headache", "puffy"],
  scan: { day: 30, result: "reduced" },
  evaIn: 11
});

result.level;    // "Amber"
result.message;  // what to show or say to the crew member
result.rules;    // [{ id: "VT-2", title, why, evidenceLevel, evidence: [...] }, ...]
result.actions;  // [{ text, who, whoLabel, level, rule }, ...]
```

Turn speech or typed text into signals:

```js
const { signals, heard } = agent.parse("bad night and a headache", currentSignals);
// heard: ["Headache", "Short sleep"]
const result = agent.assess(signals);
```

In Node, read the file instead of fetching it: `createAgent(JSON.parse(fs.readFileSync("playbook.json")))`.

Plan the day (daily missions plus where the crew member is on NASA's schedule):

```js
const plan = agent.planDay(signals);
plan.assessment;   // same as assess()
plan.tasks;        // [{ id: "T-H2O", title: "Hydration", goal: { type: "count", target: 6, unit: "drink bags" }, why, evidence }, ...]
plan.timeline;     // { today: 47, length: 232, next: { label: "Neck scan", day: 60 }, daysToNext: 13, checkpoints: [...] }
```

Missions come from `maintenance.tasks` in the playbook and can depend on which rules matched (for example, aerobic-only exercise after a suspected clot, extra hydration with stagnant flow). The timeline comes from `schedule`: NASA's neck scans on flight days 30 and 60, the day-180 blood draw, landing week and landing, plus any as-needed scan.

## Use it in Python

```python
from agent import Agent

agent = Agent.from_file("playbook.json")
result = agent.assess({"day": 54, "symptoms": ["neck"], "scan": {"day": 54, "result": "thrombus"}})
print(result["level"], result["message"])

plan = agent.plan_day({"day": 47, "landingIn": 185})   # missions and timeline
```

As a FastAPI endpoint:

```python
from fastapi import FastAPI
from agent import Agent

app = FastAPI()
agent = Agent.from_file("playbook.json")

@app.post("/assess")
def assess(signals: dict):
    return agent.assess(signals)
```

From the command line: `python agent.py '{"symptoms": ["chest"]}'`.

## Signals

Every field is optional; missing ones fall back to safe defaults. The full list with descriptions is in `playbook.json` under `signals`.

| Field | Values |
|---|---|
| `day` | Flight day |
| `sleepH`, `baselineSleepH`, `shortNights` | Hours, usual hours, consecutive short nights |
| `mood`, `lowDays` | `good`, `meh` or `low`; consecutive low days |
| `symptoms` | Any of `headache`, `puffy`, `neck`, `palp`, `vision`, `chest`, `breath`, `severeHead`, `neuro`, `exertionFatigue` |
| `scan.day`, `scan.result` | Last neck ultrasound: `antegrade`, `reduced`, `retrograde`, `stagnant` or `thrombus` |
| `risk.family`, `risk.thrombophilia`, `risk.hormone` | Personal clot risk factors (true/false) |
| `evaIn`, `landingIn` | Days to the next spacewalk and to landing |
| `exerciseMin7d` | Average exercise minutes a day this week |
| `restingHR`, `baselineHR`, `hrHighDays` | Heart rate today, usual, consecutive high days |
| `anticoag`, `anticoagCoverageDays`, `anticoagCourseDays` | `none`, `treatment` or `prophylaxis`; stock on board vs days still needed |
| `labsOutOfRange` | Lab markers outside this person's own pre-flight range at a scheduled draw, e.g. `["CRP"]` |

## Severity levels

| Level | Name | Who is told |
|---|---|---|
| 0 | Green | Nobody. Routine day. |
| 1 | Green | Nobody. Self-care, private to the crew member. |
| 2 | Amber | The crew medical officer, only what they need to act. |
| 3 | Red | The medical officer now, and Earth. |

## How a clinician teaches the agent

Each rule in `playbook.json` is one piece of clinical judgment:

```json
{
  "id": "VT-2", "severity": 2, "evidenceLevel": "nasa-protocol", "sources": ["MTB007", "STD100"],
  "title": "Head, face or neck symptoms, no scan today",
  "when": {"all": [
    {"any": [{"has": ["symptoms", "headache"]}, {"has": ["symptoms", "puffy"]}, {"has": ["symptoms", "neck"]}]},
    {"neq": ["scan.day", {"path": "day"}]}
  ]},
  "why": "Why a doctor cares, in plain language.",
  "actions": [{"text": "Neck ultrasound within 24 hours", "who": "cmo", "level": 2}],
  "say": "What Lumi says to the crew member."
}
```

Conditions use a small set of operators: `all`, `any`, `not`, `has` (list contains), `eq`, `neq`, `lt`, `lte`, `gt`, `gte`. A value can point to another signal with `{"path": "baselineSleepH", "add": -1}`. An unknown operator raises an error instead of silently passing.

To change the agent's behavior, edit the JSON, add a matching case to `scenarios.json`, and run both tests:

```bash
node test.mjs
python test_agent.py
```

## Evidence levels

Every rule declares one, and apps should show it:

- **nasa-protocol**: published NASA standard or technical brief (the clot rules follow OCHMO-MTB-007, Jan 2026).
- **clinical-red-flag**: standard emergency warning sign.
- **peer-reviewed**: a study, not a NASA operational rule.
- **standard-practice**: long-standing spaceflight practice, like fluid loading before landing.
- **demo-threshold**: a placeholder value chosen for the demo. `CV-2` (heart rate), `EX-1` (exercise) and `LAB-1` (lab markers) use these and need a clinician's numbers.

## Datasets

`meta.datasets` in the playbook records each dataset the rules draw on, with what it contains and its limits.

- **[OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575)**, SpaceX Inspiration4 blood serum data: metabolic panel, cardiovascular biomarkers and cytokine panels from 4 civilian crew, with several pre-flight and post-flight draws. Rule `LAB-1` follows its design, comparing each result with the person's own pre-flight baseline. The data does not set any threshold: it has no in-flight samples, the mission lasted 3 days, and the crew were 4 civilians. The timepoints listed come from a third-party summary; confirm them on the OSDR page.

## Limits

- Draft rules, written from NASA documents and published studies by a non-clinician. A licensed clinician must review them before any real use.
- NASA has not published validated thresholds for sleep, mood or fatigue escalation, so those rules are conservative demo rules.
- The speech parser matches English keywords. It is simple on purpose: predictable, and easy to read. It will miss unusual phrasing.
- It does not read ultrasound images. The scan result is an input someone else provides.
