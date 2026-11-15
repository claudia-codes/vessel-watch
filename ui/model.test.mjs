// node ui/model.test.mjs  → prints "All passed"
import assert from "node:assert/strict";
import { vitalStatus, trend, freshness, deriveAlerts, mergeAlerts, overallStatus, taskAction, canMove, connectivity, edgeFraction } from "./model.js";

const metric = (value, history, lo = 50, hi = 80) => ({ value, history, unit: "bpm", ref: { lo, hi }, withinPublished: value >= lo && value <= hi });

// vital status
assert.equal(vitalStatus(metric(65, [64, 65, 66, 65])).level, "normal");
assert.equal(vitalStatus(metric(85, [70, 85])).level, "warning");
assert.equal(vitalStatus(metric(52, [51, 52, 52, 51])).level, "watch");
// hysteresis: a reading just past the enter line stays "watch" while it is inside the exit band
assert.equal(vitalStatus(metric(56, [56, 56, 56]), "watch").level, "watch");
assert.equal(vitalStatus(metric(56, [56, 56, 56]), "normal").level, "normal");
assert.equal(edgeFraction(65, 50, 80), 0.5);
// a population range alone never makes a reading critical
assert.notEqual(vitalStatus(metric(200, [200])).level, "critical");

// trend and freshness
assert.equal(trend([60, 60, 60, 60, 70, 70, 70, 70]).dir, "up");
assert.equal(trend([60, 60]).dir, "flat");
assert.equal(freshness(1000, 3000).stale, false);
assert.equal(freshness(1000, 9000).stale, true);

// alerts: one hierarchy, protocol first, clot shown once, green fallback is not an alert
const decision = s => ({ status: s, headline: "h", diagnosis: "d", operational: "o", protocol: "OCHMO-MTB-007", branch: "B", ijv: { flow: "Clot", grade: "g" } });
const R = { rules: [{ id: "VT-1", severity: 3, why: "w", evidenceLevel: "nasa-protocol", evidence: [] }, { id: "WB-1", severity: 1, why: "w2", evidenceLevel: "peer-reviewed", evidence: [] }],
  actions: [{ text: "Rest", who: "crew", whoLabel: "You", rule: "WB-1", level: 1 }] };
const a = deriveAlerts({ assessment: R, decision: decision("RED"), vitals: [{ key: "hr", name: "Heart rate", value: 90, unit: "bpm", level: "warning", reason: "out" }] });
assert.deepEqual(a.map(x => x.id), ["OCHMO", "V-hr", "WB-1"]);
assert.equal(a[0].level, "critical"); assert.equal(a[0].source, "protocol");
// stagnant flow: the OCHMO warning absorbs rule VT-4 (one alert) and takes its actions
const R4 = { rules: [{ id: "VT-4", severity: 2, why: "w", evidenceLevel: "nasa-protocol", evidence: [] }],
  actions: [{ text: "More frequent neck scans", who: "cmo", whoLabel: "Crew medical officer", rule: "VT-4", level: 2 }] };
const a4 = deriveAlerts({ assessment: R4, decision: decision("YELLOW") });
assert.deepEqual(a4.map(x => x.id), ["OCHMO"]);
assert.equal(a4[0].action, "More frequent neck scans"); assert.deepEqual(a4[0].who, ["Crew medical officer"]);
assert.equal(a.find(x => x.id === "WB-1").source, "lumi");
assert.equal(deriveAlerts({ assessment: { rules: [{ id: "WB-0", severity: 0, evidence: [] }], actions: [] }, decision: decision("GREEN") }).length, 0);
// review state and first-seen time survive a re-derivation
const m1 = mergeAlerts([], a, 100); m1[0].review = "escalated";
const m2 = mergeAlerts(m1, a, 200);
assert.equal(m2[0].detectedAt, 100); assert.equal(m2[0].review, "escalated");
assert.equal(overallStatus(m2, true).text, "Critical");
assert.equal(overallStatus([], false).text, "Check-in due");

// tasks
const t0 = { id: "T-H2O", title: "Hydration", goal: { type: "count", target: 2, unit: "bags" }, progress: 0, state: "pending" };
let r = taskAction(t0, "progress"); assert.equal(r.task.state, "in_progress"); assert.match(r.entry.text, /1 of 2/);
r = taskAction(r.task, "progress"); assert.equal(r.task.state, "completed"); assert.ok(r.task.completedAt);
assert.throws(() => taskAction(r.task, "progress"));
assert.throws(() => taskAction(t0, "skip"));                 // reason required
assert.equal(taskAction(t0, "skip", { reason: "Medical officer said wait" }).task.state, "skipped");
assert.equal(taskAction(taskAction(t0, "escalate").task, "complete").task.state, "completed");
assert.equal(canMove("completed", "in_progress"), false);
assert.equal(taskAction(r.task, "reopen").task.state, "pending");

// connectivity
assert.equal(connectivity({ link: "offline", queue: [{}], syncing: false }).mode, "offline");
assert.equal(connectivity({ link: "online", queue: [{}], syncing: false }).mode, "pending");
assert.equal(connectivity({ link: "online", queue: [{ syncedAt: 1 }], syncing: false }).mode, "online");

console.log("All passed");
