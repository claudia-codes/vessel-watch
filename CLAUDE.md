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
- Drug doses appear **only** in the OCHMO-MTB-007 decision panel, and only as the HemoMind engine outputs them (`evaluateVteAlgorithm()`, OCHMO p.12/p.14), with the citation and a decision-support label. Never type doses into the UI or `playbook.json` by hand. (Changed Nov 2026: earlier rule was no doses anywhere.)
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
| `calm.html` | Calm version: same engine, playbook and Lumi in the Inner Ground Control visual system (one status word, mind/heart rings, data folded, one step per sheet). Also listed under Other prototypes |
| `engine/hemomind-core.js` | **Generated** HemoMind engine bundle (`window.HemoMindCore`): telemetry stream + OCHMO-MTB-007 decision. Single source of truth for physiological data. See `engine/README.md` |
| `agent/playbook.json` | All clinical knowledge: rules, daily missions, NASA schedule, evidence sources, datasets, speech lexicon. v0.4.0 |
| `agent/agent.js` | Engine (ES module): `createAgent`, `loadPlaybook`, `assess`, `parse`, `planDay` |
| `agent/agent.py` | Same engine in Python (`Agent.from_file`, `assess`, `parse`, `plan_day`) for a FastAPI backend |
| `agent/scenarios.json` | 11 test scenarios, with expected severity, rules and missions |
| `agent/redflags.json` | Safety set: 54 red-flag phrasings (must be caught), 48 negations (must not alarm), mixed sentences, clearing checks |
| `.github/workflows/agent-tests.yml` | Runs both engines' tests on every push/PR touching `agent/` |
| `agent/test.mjs`, `agent/test_agent.py` | Test runners; both must print "All passed" |
| `agent/README.md` | Agent docs: signals, rule format, evidence levels, reuse |
| `prototypes/watch-lumi.html` | **Lumi watch**: VesselWatch on a round smartwatch. Same engine stream (`../engine/hemomind-core.js`), playbook (`../agent/`) and Lumi. Five swipeable screens: face (Lumi + status word + live HR), 3-tap check-in → playbook verdict and who is told, vitals with citations, neck vein (OCHMO flow + EVA/ARED), Earth delay and Houston queue. No doses on the watch. Its own Nominal / Stasis / Clot demo strip. First entry in "Other prototypes"; the prototype view has a "← Back to the app" button |
| `prototypes/` | Other team prototypes shown from Demo controls → "Other prototypes" (e.g. `watch.html`, the smartwatch companion). To add one: put the file here and add a line to `PROTOTYPES` in `index.html` |

Run locally: `python3 -m http.server 8000` (the app fetches the playbook, so `file://` won't work). Test: `node agent/test.mjs && python3 agent/test_agent.py`.

## The app (index.html)

Layout (decluttered Nov 2026): one centered crew console with Lumi; nothing else competes on first view. The **Demo** dock is a collapsed amber pill (bottom right; in the page flow on phones). Opened, it holds the 3 engine states (Nominal / Pre-thrombotic / Emergency thrombosis), Live check-in, the stream counter and Other prototypes. **Behind the app** is a right-side drawer opened from the header button "How Lumi decides" (its dot takes the severity colour; Esc or the scrim closes it). The drawer shows, in order: assessment, actions and who is told, the live OCHMO-MTB-007 decision; then folded: rules matched with evidence, what the agent saw, live telemetry tiles with citations, Houston link and queue, whole playbook. Desktop (≥900 px wide) is **one screen, no scrolling**: the console fills the window under the header as a grid. Left column: Check-in / Body scan tabs, Lumi (smaller on screens under 800 px tall), the current conversation step (one Lumi bubble per step; a scenario opener is merged into the verdict via `runAgent({opener})`), and the voice bar. Right column `#today` (`setToday(R, plan, checkedIn)`): the **"What happens next" card** (`nextCard()`: state pill Emergency / Alert / Follow-up / Stable from `clinicalState()`, the agent's `R.meaning` as headline, numbered steps with who is told; tinted with the `--s-*` tokens; replaces the red alert strip, which stays only for screen readers) and Today's missions (progress bars hidden, "Why" next to the button). Missions look like a plain health-app list: a status ring per task (`ringSVG()`: empty → partial arc → filled with a check), no emoji, no diamonds, no strike-through; the action button hides when done. The 3rd check-in question uses a 2 × 2 chip grid. **Vital signs** (`#vitals`, block 3): from 1200 px wide a third column on the left with one card per measurement (heart rate, blood pressure, HRV, sleep, neck-vein area, neck-vein flow). Each card: name, status in words (In range / Out of range; flow: Normal / Watch / Act now), big tabular value + unit, a trend line over the published ISS band, and that band with its citation. Data come from `HM.buildIgcView(packet, history)` in the same engine bundle (`renderVitals()`, built once and patched every packet). Any vital outside its published range raises `clinicalState()` to at least "alert". 900–1199 px: the cards run as a row under the timeline (page may scroll); phones: one column at the end. **Next steps are actionable:** in the "What happens next" card each step is a `<details>` (one open at a time): it shows why (the rule that fired), its evidence level and sources, and role-specific extras (medical officer steps: "Open the NASA protocol" opens the drawer at the OCHMO panel, and "Medical officer not reachable"; Earth steps: one-way delay and round trip; commander steps: EVA/ARED flight rules). On Amber/Red the first step is marked "Do first" and highlighted, and two situation buttons appear: "Tell Lumi what's happening" (starts push-to-talk or listening mode, or focuses the text box) and "Medical officer not reachable" (Lumi routes to the commander and Earth with the live delay, says not to start medicine alone; labelled "Demo routing, pending clinician review"). `nextAction()` handles them; no new clinical content and no doses outside the OCHMO panel. In an emergency the daily follow-up folds into one dimmed line ("Daily follow-up paused during the emergency · Show"); while a step is open the follow-up list hides to keep one screen.

**Less noise (block 4):** no emoji in the crew UI (check-in chips are text + number key; voice, mic and speaker buttons use one-stroke line SVGs `.ic`; tabs have no glyphs; the OCHMO panel has no ✓/⛔/💊). No flying "+glow" counters (`.float-xp` hidden; the glow ring around Lumi stays). The missions list is titled "Clinical follow-up today" and shows clinical tasks only (`CLINICAL()` hides `T-GOOD`, which stays reachable by voice and in Lumi's message); counts use the clinical tasks. **Lumi column (block 5):** one turn on screen at a time. A free-form message (typed or spoken) starts a new turn (`render`, not `append`); the "You", "Medical agent" and "Lumi logged" lines are compact secondary rows (`.tx.you`, `.tx.sys`) and only Lumi's reply is full size; `append()` never keeps more than 4 blocks. Lumi is smaller on desktop (128 px area, 104 px under 800 px tall). **Accessibility (block 6):** every visible text passes WCAG AA (measured in all states; lowest ~6.2:1) and almost all AAA (`--muted` raised to #9bb2c1, 8.6:1). State changes are announced politely in `#srState`; emergencies also through the `role="alert"` strip (visually hidden). Lumi's letter-by-letter typing is `aria-hidden`; screen readers get the full sentence once. While the "How Lumi decides" drawer is open, the page behind it is `inert`; Esc returns focus to the button. Focus ring is the global cyan `:focus-visible`; `prefers-reduced-motion` turns off all animation and the typing effect. Clinical state tokens: `--s-emer`, `--s-alert`, `--s-prev`, `--s-ok` (+ `-bg`), `body[data-state]`. The Demo pill sits in the header row. Phones stack the same pieces in one column and scroll the page. The vitals strip and glow stats row are hidden in the console (their data lives in the drawer). Pre-declutter copy: `../originals/vessel-watch-index-2026-11-14-before-redesign.html`.

Crew console:
- **Mission timeline** at the top, words first: "Day 50 of 232 in space" and "Next: Neck scan · day 60 (in 10 days)", then a thin progress bar with circular checkpoints (launch, neck scans on days 30 and 60, blood draw on day 180, landing week, landing) labelled Launch and Landing at the ends. No diamonds, no pulsing.
- **Check-in tab**: Lumi (sticky, shrinks on scroll) with glow ring; 3 one-tap questions (sleep, mood, body symptoms; keys 1–4); agent verdict; cards for what others are told; **Today's missions** board (tap +1 / Done or by voice), glow rewards, all-done bonus.
- **Body scan tab**: holographic body map with zones (mind and sleep, head and eyes, neck veins, heart and lungs) colored ok / watch / alert.
- **Voice bar**: 👂 listening mode, 🎙 push-to-talk, text input (same commands typed), 🔊 spoken-replies toggle in the console header.
- Removed on purpose: the Breathe tab, and the old mission-control view.

Lumi moods (CSS classes on the SVG): `happy` (cyan, smiling eyes, blush, fast tail wag), `concerned` (amber, worried brows, sweat drop, ears droop, tail down), `alert` (red, wide eyes, flat ears), `thinking`, `listening`, `pet` (tap to pet: purr sound, heart, mood-appropriate line). Eyes follow the pointer. `setRest(face)` sets the face it returns to after reactions.

### Voice

- **Three modes**, shown in the console header chip: **Agent** (default: free talk goes to the medical agent), **Check-in** and **Body scan** (everything said is an answer to the current question until the flow ends or "stop"). Commands work in every mode. Intent detection normalizes the transcript (case, punctuation) and accepts common mishearings ("checking", "check up", "body scam"); a phrase counts as a command if it's short (≤4 words) or has an action verb (activate, start…). Near-commands that don't match get "Did you mean…?" instead of going to the agent. The line under Lumi shows what was heard and how it was routed.
- Wake word "Lumi". Commands: "Lumi, activate check-in" and "Lumi, body scan". "Lumi, repeat" and "Lumi, stop" during a session. "Lumi" alone waits ~8 s for a command.
- Turn-taking: Lumi asks, listens, echoes what it understood ("Got it, a short night"), then asks the next question. Answers don't need the wake word. One reprompt after ~25 s of silence, then it pauses.
- Body scan goes zone by zone; a red flag (chest pain, breathlessness, sudden severe headache, neuro signs) stops the scan and runs the agent immediately.
- **Anything else said to Lumi goes to the medical agent** (it reassesses and answers). Mission commands like "drank water" or "done exercise" tick missions.
- Engines: browser SpeechRecognition + speech synthesis (Chrome) gives a full spoken loop, pausing recognition while Lumi speaks. Inside claude.ai the app can use the `dictation` and `tts` artifact capabilities, but the platform can't speak while dictating, so replies there are on screen with a chime. Present the live demo from the Vercel deploy in Chrome.
- `window.__vw.handleListen(text)` is a test hook that feeds text as if heard.

## Understanding speech

- `agent.parse` is negation-aware (config in `lexicon.negation`): "no chest pain", "my headache is gone", "heart isn't racing" don't count and clear earlier entries. Returns `{signals, heard, negated}`.
- In the app, `understand()` combines two readers: the rules, and Claude via the artifact `sample` capability (only inside claude.ai; `modelTier: "quick"`, JSON output validated against the symptom ids). The rules decide. **Safety merge:** a red flag stays if either reader heard it (disagreement is shown in the panel); Claude may overrule rules only on minor symptoms. Lumi echoes what it understood ("I heard headache, and no chest pain") so the user can correct it.
- Agent panel section "How Lumi understood you" shows the utterance, chips (present / no …), the source (AI + rules or Rules only) and an AI on/off toggle.
- Never weaken the safety merge or delete test cases to make tests pass; add the failing phrase to `redflags.json` and fix the lexicon.

## The medical agent (playbook v0.6.0)

Severity: 0–1 Green (nobody told), 2 Amber (crew medical officer told what to do), 3 Red (medical officer now plus Earth). Roles: crew, cmo, cmd (commander), earth.

Rules: RF-1 chest pain or sudden breathlessness (red), RF-2 sudden severe headache / vision loss / weakness / slurred speech (red), VT-1 suspected clot on scan (red, NASA protocol: treatment protocol, no EVA or resistive exercise 30+ days), MED-1 anticoagulant stock short of course, LD-2 anticoagulant with landing ≤2 days (NASA pause 48 h treatment / 24 h prevention), VT-2 head/face/neck symptoms and no scan today → scan within 24 h, VT-3 stagnant flow + risk factor → flight surgeon reviews preventive protocol, VT-4 stagnant flow without risk factors → more scans + hydration, FV-1 fever or chills, or temperature ≥ 1 °C above the personal in-flight baseline (Amber: CMO checks vitals, rest, fluids, hygiene, fever medicine only via CMO; demo threshold because resting core temperature runs ~1 °C higher in space, Stahn et al. 2017), FV-2 temperature ≥ 2 °C above baseline or fever + stiff neck (Red), MED-2 fever while on an anticoagulant → avoid ibuprofen and aspirin (both in the ISS kit), flight surgeon confirms a safe option such as paracetamol, CV-1 palpitations, CV-2 resting HR high 3 days (demo threshold), NO-1 gradual vision change (SANS), OP-1 spacewalk ≤3 days while not at baseline → go/no-go, LAB-1 lab marker outside own pre-flight range (demo threshold, design from OSD-575), LD-1 landing ≤7 days → landing checklist, EX-1 exercise <60 min/day (demo threshold), AN-1 tired on exertion after day 90 → blood count, BH-1 3+ rough nights or low days → private Earth note offer, WB-1 one short night or low mood, WB-0 baseline fallback.

Daily missions (`maintenance.tasks`): symptom check (auto), with fever: temperature check twice a day, rest day, extra hydration (and no exercise block), hydration (6 drink bags, 8 with stagnant flow), exercise 90 min / high-intensity 30 min after EX-1 / aerobic-only 45 min after a clot, neck scan, treatment check-in, weekly vision test, blood draw, landing checklist, bank a good moment. Goals are demo values.

Demo scenarios come from the HemoMind engine (fictional crew member "Dr. Elena Vance" with an LNG-IUD and no risk factors; CMO "Ines"; 232-day mission). All 3 are at flight day ~50, matching Marshall-Goebel 2019, and only the left IJV finding changes: NOMINAL (forward flow) → Green; PRETHROMBOTIC (stagnant flow, no risk factors) → Amber, no apixaban, hydration and more frequent scans (VT-4); EMERGENCY_THROMBOSIS (occlusive clot) → Red, EVA/ARED blocked ≥30 days, apixaban treatment regimen (VT-1). The page derives the playbook's signals (scan, heart rate, sleep, risk factors) from the stream; symptoms and mood come only from the check-in. A fourth demo button, FEVER, overlays the check-in on the NOMINAL stream (39.0 °C, fever, still on clot treatment) → Amber with FV-1 and the MED-2 ibuprofen/aspirin warning first.
- Body scan has 5 steps: head and eyes, neck (incl. stiffness), heart and lungs, whole body (fever, temperature number), mind and sleep. The torso on the body map is the "Whole body" zone.

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
3. Branch + pull request workflow (agent tests run automatically); Vercel previews per PR; freeze `main` before the demo.
3b. For AI understanding outside claude.ai (Vercel), add a small backend endpoint that calls the Claude API with a server-side key; the page currently falls back to rules only there.
4. Get a doctor to review the playbook; replace demo thresholds.
5. Optional features discussed: guided ultrasound scan mode, landing-readiness countdown, heart-rate trends; future-countermeasures slide (LBNP, thigh cuffs, compression garments, fluid loading, SPRINT exercise, circadian lighting, VR, self-guided therapy). Don't recommend iron supplements for space anemia.
