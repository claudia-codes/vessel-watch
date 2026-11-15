/* VesselWatch V2 · console model (pure logic, no DOM).
   Turns what already exists (engine metrics, the playbook assessment, the OCHMO-MTB-007 decision,
   the playbook's daily tasks) into explicit UI states: vital status, clinical alerts, task states,
   connectivity and a traceable action log. Nothing here adds clinical content: every alert, action and
   explanation is copied from the engine or the playbook, so Lumi and the alerts can never disagree.
   Tested by ui/model.test.mjs (node ui/model.test.mjs). */

/* ---------------- vital status ----------------
   Status compares a reading with the PUBLISHED ISS crew range, not with the crew member's own normal:
   the engine has no individual baseline yet (signalsOf(): "no individual baseline"), and the UI says so.
   normal   inside the published range
   watch    inside, but the median of recent readings sits in the outer 15 % of the band (demo threshold;
            the median and a wider exit band keep it from flickering with sensor noise)
   warning  outside the published range
   critical only from an approved protocol (OCHMO-MTB-007 RED); a population range alone never makes a
            reading critical */
export const VITAL_LEVELS = ["normal", "watch", "warning", "critical"];
export const VITAL_LABEL = { normal: "Normal", watch: "Watch", warning: "Warning", critical: "Critical" };
export const WATCH_ENTER = 0.15, WATCH_EXIT = 0.25;

const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };

/** Distance from the nearest edge of [lo, hi], as a fraction of the band width (0 = on the edge, 0.5 = centre). */
export function edgeFraction(v, lo, hi) { const w = hi - lo; return w > 0 ? Math.min(v - lo, hi - v) / w : 0.5; }

export function vitalStatus(metric, prevLevel = "normal", window = 10) {
  const { lo, hi } = metric.ref;
  if (!metric.withinPublished) return { level: "warning", reason: `Outside the published ISS crew range (${lo}–${hi} ${metric.unit}).` };
  const recent = (metric.history || []).slice(-window);
  const m = recent.length ? median(recent) : metric.value;
  const f = edgeFraction(m, lo, hi);
  const limit = prevLevel === "watch" ? WATCH_EXIT : WATCH_ENTER;
  if (f < limit) return { level: "watch", reason: `Inside the ISS crew range, but recent readings sit near its ${m - lo < hi - m ? "lower" : "upper"} edge (demo threshold).` };
  return { level: "normal", reason: "Inside the published ISS crew range." };
}

/** Change against earlier readings: direction and size, from the reading history. */
export function trend(history, decimals = 1) {
  const h = (history || []).filter(Number.isFinite);
  if (h.length < 4) return { dir: "flat", text: "Not enough readings for a trend yet" };
  const half = Math.floor(h.length / 2);
  const a = median(h.slice(0, half)), b = median(h.slice(half));
  const d = b - a, rel = Math.abs(d) / (Math.abs(a) || 1);
  if (rel < 0.01) return { dir: "flat", delta: d, text: "Steady compared with earlier readings" };
  return { dir: d > 0 ? "up" : "down", delta: d, text: `${d > 0 ? "Up" : "Down"} ${Math.abs(d).toFixed(decimals)} compared with earlier readings` };
}

export const STALE_AFTER_MS = 5000;
export function freshness(lastAt, now) {
  if (!lastAt) return { stale: true, text: "No reading yet" };
  const s = Math.max(0, Math.round((now - lastAt) / 1000));
  return { stale: now - lastAt > STALE_AFTER_MS, ageSec: s, text: s < 2 ? "Updated just now" : s < 60 ? `Updated ${s} s ago` : `Updated ${Math.floor(s / 60)} min ago` };
}

/* ---------------- clinical alerts ----------------
   One hierarchy for everything: informational < advisory < warning < critical.
   Sources keep their nature visible:
     protocol   approved NASA protocol (OCHMO-MTB-007, or a playbook rule whose evidence is a NASA protocol)
     redflag    standard clinical emergency sign
     lumi       Lumi's playbook rule (peer-reviewed or demo evidence), pending clinician review
     range      a reading outside the published ISS crew range
   A clinician's authorisation is a separate field and is never set by the app. */
export const ALERT_LEVELS = ["informational", "advisory", "warning", "critical"];
export const ALERT_LABEL = { informational: "Informational", advisory: "Advisory", warning: "Warning", critical: "Critical" };
export const SOURCE_LABEL = {
  protocol: "Approved NASA protocol",
  redflag: "Clinical red flag",
  lumi: "Lumi recommendation · pending clinician review",
  range: "Published ISS crew range",
  system: "System status"
};
const RULE_LEVEL = ["informational", "advisory", "warning", "critical"];
export const rank = level => ALERT_LEVELS.indexOf(level);

function ruleSource(evidenceLevel) {
  if (evidenceLevel === "nasa-protocol") return "protocol";
  if (evidenceLevel === "clinical-red-flag") return "redflag";
  return "lumi";
}

/**
 * @param {object} p
 * @param {object|null} p.assessment  agent.assess() result (null before any check-in)
 * @param {object} p.decision         buildVesselView().decision (OCHMO-MTB-007)
 * @param {Array} p.vitals            [{key,name,value,unit,level,reason,trend}] from vitalStatus()
 * @param {object} p.observations     {ruleId: "observed value"} written by the UI from the agent's inputs
 */
export function deriveAlerts({ assessment, decision, vitals = [], observations = {} }) {
  const out = [];
  if (decision && decision.status !== "GREEN") {
    out.push({
      id: "OCHMO", level: decision.status === "RED" ? "critical" : "warning", source: "protocol",
      parameter: "Left neck vein (IJV)", observed: `${decision.ijv.flow} · ${decision.ijv.grade}`,
      title: decision.headline, explanation: decision.diagnosis,
      action: decision.operational, ref: `${decision.protocol} · branch ${decision.branch}`,
      needsClinician: true
    });
  }
  // The scan rules (VT-1 clot, VT-3/VT-4 stagnant flow) restate the OCHMO finding: one alert, the protocol's
  // wording, with the playbook rule's actions and who is told attached.
  const ochmo = out.find(a => a.id === "OCHMO");
  if (ochmo && assessment) {
    const scanRule = assessment.rules.find(r => ["VT-1", "VT-3", "VT-4"].includes(r.id));
    if (scanRule) {
      const acts = assessment.actions.filter(a => a.rule === scanRule.id);
      ochmo.rule = scanRule.id;
      ochmo.who = [...new Set(acts.map(a => a.whoLabel))];
      if (acts.length) ochmo.action = (acts.find(a => a.who === "crew") || acts[0]).text;
      ochmo.ref += ` · playbook rule ${scanRule.id}`;
    }
  }
  if (assessment) for (const r of assessment.rules) {
    if (r.severity < 1) continue;                                   // the green fallback is not an alert
    if (ochmo && ochmo.rule === r.id) continue;                     // same scan finding, shown once
    const acts = assessment.actions.filter(a => a.rule === r.id);
    out.push({
      id: r.id, level: RULE_LEVEL[r.severity], source: ruleSource(r.evidenceLevel),
      parameter: r.title, observed: observations[r.id] || "Reported in your check-in",
      title: r.title, explanation: r.why,
      action: (acts.find(a => a.who === "crew") || acts[0] || {}).text || "Follow today’s plan",
      who: [...new Set(acts.map(a => a.whoLabel))],
      ref: `Rule ${r.id} · ${r.evidence.join(" · ") || "playbook"}`,
      needsClinician: r.severity >= 2
    });
  }
  for (const v of vitals) {
    if (v.level !== "warning" && v.level !== "critical") continue;
    out.push({
      id: "V-" + v.key, level: v.level, source: "range", parameter: v.name,
      observed: `${v.value} ${v.unit}`, title: `${v.name} outside the ISS crew range`,
      explanation: v.reason + " The range describes ISS crews, not your personal normal.",
      action: "Re-check the sensor and repeat the reading. No playbook rule acts on this reading alone; mention it to your medical officer",
      ref: v.ref || "Published ISS in-flight range", needsClinician: false, trend: v.trend
    });
  }
  return out.sort((a, b) => rank(b.level) - rank(a.level));
}

/** Alerts keep their first-seen time and their review state across re-derivations. */
export function mergeAlerts(prev, next, now) {
  const old = Object.fromEntries((prev || []).map(a => [a.id + "|" + a.level, a]));
  return next.map(a => {
    const o = old[a.id + "|" + a.level];
    return { ...a, detectedAt: o ? o.detectedAt : now, review: o ? o.review : (a.needsClinician ? "awaiting" : "none"), ackAt: o ? o.ackAt : null };
  });
}
export const REVIEW_LABEL = {
  none: "No clinician review needed",
  awaiting: "Awaiting medical officer review",
  escalated: "Escalated · medical officer notified",
  sent: "Sent to Earth flight surgeons"
};

/** Overall status for the mission bar: the worst open alert, in the same words as the alert list. */
export function overallStatus(alerts, checkedIn) {
  const top = alerts[0];
  if (!top) return checkedIn ? { level: "normal", text: "Stable" } : { level: "pending", text: "Check-in due" };
  return { level: top.level, text: { critical: "Critical", warning: "Warning", advisory: "Advisory", informational: "Stable" }[top.level] };
}

/* ---------------- clinical follow-up tasks ----------------
   pending → in_progress → completed; any open task may be skipped (with a reason) or escalated.
   Completed and skipped tasks can be reopened. Every transition returns a log entry. */
export const TASK_STATES = ["pending", "in_progress", "completed", "skipped", "escalated"];
export const TASK_LABEL = { pending: "Pending", in_progress: "In progress", completed: "Completed", skipped: "Skipped", escalated: "Escalated" };
const ALLOWED = {
  pending: ["in_progress", "completed", "skipped", "escalated"],
  in_progress: ["completed", "skipped", "escalated"],
  escalated: ["in_progress", "completed"],
  completed: ["pending"],
  skipped: ["pending"]
};
export function canMove(from, to) { return (ALLOWED[from] || []).includes(to); }

export function goalTarget(t) { return t.goal.type === "check" ? 1 : t.goal.target; }

/** Apply an action to a task. Returns {task, entry} or throws on an illegal move. */
export function taskAction(task, action, { now = Date.now(), reason = "" } = {}) {
  const t = { ...task };
  const from = t.state;
  let to = from, note = "";
  if (action === "progress") {                       // +1 drink, a logged minute block, or "done" for a check
    if (!["pending", "in_progress", "escalated"].includes(from)) throw new Error(`Cannot log progress on a ${from} task`);
    t.progress = t.goal.type === "count" ? Math.min(goalTarget(t), (t.progress || 0) + 1) : goalTarget(t);
    to = t.progress >= goalTarget(t) ? "completed" : "in_progress";
    note = to === "completed" ? "Completed" : `Progress ${t.progress} of ${goalTarget(t)}${t.goal.unit ? " " + t.goal.unit : ""}`;
  } else if (action === "start") { to = "in_progress"; note = "Started"; }
  else if (action === "complete") { to = "completed"; t.progress = goalTarget(t); note = "Completed"; }
  else if (action === "skip") { if (!reason) throw new Error("A reason is required to skip"); to = "skipped"; note = `Skipped · ${reason}`; }
  else if (action === "escalate") { to = "escalated"; note = "Escalated to the crew medical officer"; }
  else if (action === "reopen") { to = "pending"; t.progress = 0; note = "Reopened"; }
  else throw new Error("Unknown action " + action);
  if (to !== from && !canMove(from, to)) throw new Error(`Illegal move ${from} → ${to}`);
  t.state = to; t.updatedAt = now;
  if (to === "completed") t.completedAt = now;
  if (to === "skipped") t.skipReason = reason;
  return { task: t, entry: { at: now, kind: "task", ref: t.id, text: `${t.title}: ${note}` } };
}

/* ---------------- connectivity and sync ----------------
   link: "online" | "offline". Entries made while offline wait locally; reconnecting shows "sync pending"
   until the upload finishes. Earth still receives them after the one-way light delay. */
export function connectivity({ link, queue, syncing, lastSyncAt }) {
  const pending = queue.filter(e => !e.syncedAt).length;
  if (link === "offline") return { mode: "offline", label: "Offline", pending, lastSyncAt };
  if (syncing || pending) return { mode: "pending", label: "Sync pending", pending, lastSyncAt };
  return { mode: "online", label: "Online", pending: 0, lastSyncAt };
}

export function ago(at, now) {
  if (!at) return "never";
  const s = Math.max(0, Math.round((now - at) / 1000));
  return s < 5 ? "just now" : s < 60 ? `${s} s ago` : s < 3600 ? `${Math.floor(s / 60)} min ago` : `${Math.floor(s / 3600)} h ago`;
}
