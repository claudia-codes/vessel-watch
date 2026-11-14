# VesselWatch: project context

Read this first. It sums up the decisions, constraints and state of the project so far.

## What it is

A NASA Space Apps 2026 hackathon prototype. VesselWatch is an astronaut health companion for long missions (Moon, Gateway, Mars), where crews have no real-time doctor or psychologist; Earth can be 15 to 22 minutes away one way. It focuses on circulation and internal jugular vein (IJV) clot risk in microgravity, with sleep, mood and heart as connected signals.

- **Lumi**: an original robot-cat hologram companion. It runs a 3-question daily check-in or a voice-guided body scan, reacts with expressions, and keeps reporting effort low.
- **Medical agent**: a transparent, rule-based playbook (not ML). It decides severity, what to do, and who is told. Every recommendation shows the rule that fired and its evidence.
- **Pitch hook**: in the 2019 ISS study, 6 of 11 crew had stagnant or retrograde left IJV flow around flight day 50, and 1 had a clot with no symptoms (Marshall-Goebel et al., JAMA Netw Open 2019). The first in-flight clot was treated on orbit with radiologists guiding from Earth (Auñón-Chancellor et al., NEJM 2020). On a Mars mission, that support isn't available in real time.

## Hard constraints (do not break)

- Never invent astronaut measurements. All crew data is **simulated** and labeled as such in the UI.
- Never mix real and simulated data without a label. Provenance tags: cyan solid = real/NASA, amber hatched = simulated, dotted = not loaded.
- Do not claim to diagnose or predict thrombosis. It is decision support.
- **No drug doses anywhere** in the UI or playbook (the NASA brief has apixaban doses; keep them out).
- Earth DVT datasets (for example ThrombUS+) cannot validate astronaut predictions.
- Thresholds marked `demo-threshold` are placeholders pending clinician review. NASA has not published validated behavioral-health thresholds (the team's research says a semi-autonomous monitoring system is a NASA HRP deliverable for 2031–2034), so the approach is "the system guides and explains", not "the system decides".
- Mood helps **arteries** (brief stress reduced artery dilation for up to ~4 h, Ghiadoni et al., Circulation 2000; laughter increased dilation in small Univ. of Maryland studies). It does **not** prevent neck-vein clots. Never imply it does.
- Lumi never guilt-trips: no sadness at the user, no streaks to lose, glow rewards honest check-ins whatever the answers. (CIMON's "Don't you like it here with me?" is the cautionary example.)
- Privacy by design: the crew medical officer sees only what they need to act (for example "neck scan requested"), never mood. Mood notes go privately to the Earth psychology team only if the crew member chooses.

## Conventions

- Always write in **English**, including UI copy, docs and commits, even when source material is in Spanish.
- Commits are authored as `claudia-codes <claudia-codes@users.noreply.github.com>` (repo-level git config). **No `Co-Authored-By: Claude` line or any other Claude attribution** in commit messages.
- Plain, sentence-case copy. Name things by what users understand.
- Every playbook change gets a test case in `agent/scenarios.json`, and both engines must pass.

## Repository

| Path | What it is |
|---|---|
| `index.html` | The whole app (HTML, CSS, JS module) |
| `agent/playbook.json` | All clinical knowledge: rules, daily missions, NASA schedule, evidence sources, datasets, speech lexicon. v0.4.0 |
| `agent/agent.js` | Engine (ES module): `createAgent`, `loadPlaybook`, `assess`, `parse`, `planDay` |
| `agent/agent.py` | Same engine in Python (`Agent.from_file`, `assess`, `parse`, `plan_day`) for a FastAPI backend |
| `agent/scenarios.json` | 11 test scenarios, with expected severity, rules and missions |
| `agent/test.mjs`, `agent/test_agent.py` | Test runners; both must print "All passed" |
| `agent/README.md` | Agent docs: signals, rule format, evidence levels, reuse |

Run locally: `python3 -m http.server 8000` (the app fetches the playbook, so `file://` won't work). Test: `node agent/test.mjs && python3 agent/test_agent.py`.

## The app (index.html)

Layout: a dashed amber **Demo controls** bar (clearly outside the app) with scenarios Normal day / Needs a closer look / Red alert / Live check-in. Below it, two columns: **The app** (crew console) and **Behind the app** (medical agent panel: what the agent sees, assessment, rules matched with evidence, actions and who is told, whole playbook).

Crew console:
- **Mission timeline** at the top: launch, neck scans on flight days 30 and 60, blood draw on day 180, landing week, landing; "you are here" marker; next checkpoint pulses.
- **Check-in tab**: Lumi (sticky, shrinks on scroll) with glow ring; 3 one-tap questions (sleep, mood, body symptoms; keys 1–4); agent verdict; cards for what others are told; **Today's missions** board (tap +1 / Done or by voice), glow rewards, all-done bonus.
- **Body scan tab**: holographic body map with zones (mind and sleep, head and eyes, neck veins, heart and lungs) colored ok / watch / alert.
- **Voice bar**: 👂 listening mode, 🎙 push-to-talk, text input (same commands typed), 🔊 spoken-replies toggle in the console header.
- Removed on purpose: the Breathe tab, and the old mission-control view.

Lumi moods (CSS classes on the SVG): `happy` (cyan, smiling eyes, blush, fast tail wag), `concerned` (amber, worried brows, sweat drop, ears droop, tail down), `alert` (red, wide eyes, flat ears), `thinking`, `listening`, `pet` (tap to pet: purr sound, heart, mood-appropriate line). Eyes follow the pointer. `setRest(face)` sets the face it returns to after reactions.

### Voice

- Wake word "Lumi". Commands: "Lumi, activate check-in" and "Lumi, body scan". "Lumi, repeat" and "Lumi, stop" during a session. "Lumi" alone waits ~8 s for a command.
- Turn-taking: Lumi asks, listens, echoes what it understood ("Got it, a short night"), then asks the next question. Answers don't need the wake word. One reprompt after ~25 s of silence, then it pauses.
- Body scan goes zone by zone; a red flag (chest pain, breathlessness, sudden severe headache, neuro signs) stops the scan and runs the agent immediately.
- **Anything else said to Lumi goes to the medical agent** (it reassesses and answers). Mission commands like "drank water" or "done exercise" tick missions.
- Engines: browser SpeechRecognition + speech synthesis (Chrome) gives a full spoken loop, pausing recognition while Lumi speaks. Inside claude.ai the app can use the `dictation` and `tts` artifact capabilities, but the platform can't speak while dictating, so replies there are on screen with a chime. Present the live demo from the Vercel deploy in Chrome.
- `window.__vw.handleListen(text)` is a test hook that feeds text as if heard.

## The medical agent (playbook v0.4.0)

Severity: 0–1 Green (nobody told), 2 Amber (crew medical officer told what to do), 3 Red (medical officer now plus Earth). Roles: crew, cmo, cmd (commander), earth.

Rules: RF-1 chest pain or sudden breathlessness (red), RF-2 sudden severe headache / vision loss / weakness / slurred speech (red), VT-1 suspected clot on scan (red, NASA protocol: treatment protocol, no EVA or resistive exercise 30+ days), MED-1 anticoagulant stock short of course, LD-2 anticoagulant with landing ≤2 days (NASA pause 48 h treatment / 24 h prevention), VT-2 head/face/neck symptoms and no scan today → scan within 24 h, VT-3 stagnant flow + risk factor → flight surgeon reviews preventive protocol, VT-4 stagnant flow without risk factors → more scans + hydration, CV-1 palpitations, CV-2 resting HR high 3 days (demo threshold), NO-1 gradual vision change (SANS), OP-1 spacewalk ≤3 days while not at baseline → go/no-go, LAB-1 lab marker outside own pre-flight range (demo threshold, design from OSD-575), LD-1 landing ≤7 days → landing checklist, EX-1 exercise <60 min/day (demo threshold), AN-1 tired on exertion after day 90 → blood count, BH-1 3+ rough nights or low days → private Earth note offer, WB-1 one short night or low mood, WB-0 baseline fallback.

Daily missions (`maintenance.tasks`): symptom check (auto), hydration (6 drink bags, 8 with stagnant flow), exercise 90 min / high-intensity 30 min after EX-1 / aerobic-only 45 min after a clot, neck scan, treatment check-in, weekly vision test, blood draw, landing checklist, bank a good moment. Goals are demo values.

Demo scenarios (simulated, crew member "Rin Takeda", CMO "Ines", 232-day mission): Normal day (FD32) → Green; Needs a closer look (FD47, 3rd short night, headache, puffy face) → Amber, neck-scan mission; Red alert (FD54, suspected clot on today's scan, spacewalk in 4 days) → Red.

## Evidence sources used

- NASA OCHMO-MTB-007, Venous Thrombosis in Spaceflight (Jan 2026): three in-flight IJV flow patterns (slow antegrade, stagnant, retrograde); stasis is the most concerning pre-clot sign; decision tree; risk factors (family history, thrombophilia, higher-risk hormones); landing washout.
- OCHMO-STD-100.1A requirement 6041: IJV screening L-12/3 months, L+30, L+60, R-42 days, R+0/45, and as clinically indicated.
- NASA HRP cardiovascular risk pages; OCHMO-MTB-001 (SANS); OCHMO-TB-031 (exercise); NASA OSDR (osdr.nasa.gov); NTRS.
- OSD-575: SpaceX Inspiration4 blood serum data (metabolic panel, cardiovascular biomarkers, cytokines; 4 civilians; pre/post-flight only). Used for design, not thresholds. Timepoints came from a third-party summary; confirm on OSDR.
- Trudel et al., Nature Medicine 2022: ~54% more red blood cells destroyed in space.
- Team research dossier (Spanish) on historical cases: Apollo 15 bigeminy seen only by ground, Mir 1997 fatigue and collision, Soyuz T-14, Skylab 4 overload ("strike" is a myth), Crew-11 first ISS medical evacuation (Jan 2026), Mars-500, Antarctic analogs, and the ~22-minute Earth–Mars delay (NASA ASCEND 2022). Use only peer-reviewed or official items as on-screen "verified" facts.

## Known weak spots (anti-review)

1. The "22 astronauts" longitudinal flow-grade dataset is not in hand. Check whether Bostick et al. 2025 (NASA/SP-20250001074/REV1) publishes per-astronaut grades. Until then the UI shows a "not loaded" slot.
2. The tool is downstream of an ultrasound scan it doesn't acquire. Guided scan acquisition is future work (and the top suggested next feature).
3. The playbook was written by a non-clinician from published sources. A doctor mentor must review it before claiming it was "trained by a medic".
4. Gamification must never reward "being green", which would encourage under-reporting (Apollo 9, Skylab 4, Vasyutin). Psychologists own Lumi's rules and alert wording.
5. "StarCraft-like" means genre inspiration only. No Blizzard fonts, art or names. Lumi is an original character.
6. Continuous cortisol sweat patches are research-grade; show only as a concept slide.
7. On a real spacecraft the wake word should run on-device for privacy.

## Team

- Claudia (claudia-codes): frontend/product lead: UX, implementation, visual identity, storytelling.
- Backend engineer: real data extraction, API (FastAPI can reuse `agent/agent.py`).
- Psychologist 1: cognitive workload and human factors.
- Psychologist 2: alert fatigue, behavioral design, decision-making.
- Psychologist 3: NASA research outreach, scientific validation, scenarios.

Suggested ownership: UI, Lumi and voice → Claudia; backend and NASA data → backend engineer; `playbook.json` rules, missions and wording → psychologists plus a doctor reviewer.

## Deployment status

- GitHub: `claudia-codes/vessel-watch`, branch `main`.
- Vercel: account `claudiadonea24-2904`, team "Inner Ground Control" (`team_5wiOa0YMDgxvupQBtPvsSdaL`). Project not created yet: the MCP connector got 403 creating it. Import manually at vercel.com/new (Framework: Other, no build command, root `./`), installing Vercel's GitHub App for the repo. After that, pushes to `main` auto-deploy. Check that deployment protection doesn't block public viewers.
- A private claude.ai artifact of the app also exists; it can be shared from its Share menu, but voice features there only work for the owner's organization.

## Next steps

1. Finish the Vercel import and verify the live URL (playbook loads, scenarios run, voice works in Chrome).
2. Split `index.html` into modules before teammates start, to avoid merge conflicts: `styles.css`, `js/lumi.js`, `js/voice.js`, `js/missions.js`, `js/app.js`.
3. Branch + pull request workflow; Vercel previews per PR; freeze `main` before the demo.
4. Get a doctor to review the playbook; replace demo thresholds.
5. Optional features discussed: guided ultrasound scan mode, landing-readiness countdown, heart-rate trends; future-countermeasures slide (LBNP, thigh cuffs, compression garments, fluid loading, SPRINT exercise, circadian lighting, VR, self-guided therapy). Don't recommend iron supplements for space anemia.
