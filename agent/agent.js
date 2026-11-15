/**
 * VesselWatch medical agent: a transparent rule engine.
 *
 * The clinical knowledge lives in playbook.json. This file only evaluates it,
 * so a clinician can change the rules without touching code, and the same
 * playbook runs in any app (browser, Node, or the Python engine in agent.py).
 *
 *   import { createAgent, loadPlaybook } from "./agent.js";
 *   const agent = createAgent(await loadPlaybook("./playbook.json"));
 *   const result = agent.assess({ day: 47, sleepH: 5.2, symptoms: ["headache"], ... });
 *
 * Decision support only. It never diagnoses and never outputs drug doses.
 */

export async function loadPlaybook(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load playbook from ${url} (HTTP ${res.status})`);
  return res.json();
}

/** Default values so partial signals still evaluate safely. */
export const DEFAULT_SIGNALS = Object.freeze({
  day: 0, sleepH: 7.2, baselineSleepH: 7.2, shortNights: 0, mood: null, lowDays: 0,
  symptoms: [], scan: { day: -1, result: "antegrade" },
  risk: { family: false, thrombophilia: false, hormone: false },
  evaIn: 999, landingIn: 999, exerciseMin7d: 120,
  restingHR: null, baselineHR: null, hrHighDays: 0,
  anticoag: "none", anticoagCoverageDays: 999, anticoagCourseDays: 0,
  labsOutOfRange: [],
  tempC: null, baselineTempC: 37.8
});

export function normalizeSignals(input = {}) {
  const s = { ...DEFAULT_SIGNALS, ...input };
  s.scan = { ...DEFAULT_SIGNALS.scan, ...(input.scan || {}) };
  s.risk = { ...DEFAULT_SIGNALS.risk, ...(input.risk || {}) };
  const sym = input.symptoms instanceof Set ? [...input.symptoms] : Array.isArray(input.symptoms) ? input.symptoms : [];
  s.symptoms = [...new Set(sym.filter(x => x && x !== "none"))];
  s.labsOutOfRange = Array.isArray(input.labsOutOfRange) ? input.labsOutOfRange : [];
  return s;
}

function get(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function value(v, s) {
  if (v && typeof v === "object" && !Array.isArray(v) && "path" in v) {
    const base = get(s, v.path);
    return typeof v.add === "number" && typeof base === "number" ? base + v.add : base;
  }
  return v;
}

const CMP = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  lt: (a, b) => typeof a === "number" && typeof b === "number" && a < b,
  lte: (a, b) => typeof a === "number" && typeof b === "number" && a <= b,
  gt: (a, b) => typeof a === "number" && typeof b === "number" && a > b,
  gte: (a, b) => typeof a === "number" && typeof b === "number" && a >= b,
  every: (a, b) => typeof a === "number" && typeof b === "number" && b > 0 && a > 0 && a % b === 0
};

/** Evaluate a JSON condition against signals. Unknown operators are an error, never a silent pass. */
export function evaluate(cond, s) {
  if (cond === true) return true;
  if (cond.all) return cond.all.every(c => evaluate(c, s));
  if (cond.any) return cond.any.some(c => evaluate(c, s));
  if (cond.not) return !evaluate(cond.not, s);
  if (cond.has) { const [p, v] = cond.has; const arr = get(s, p); return Array.isArray(arr) && arr.includes(v); }
  for (const op of Object.keys(CMP)) {
    if (cond[op]) { const [p, v] = cond[op]; return CMP[op](get(s, p), value(v, s)); }
  }
  throw new Error(`Unknown condition: ${JSON.stringify(cond)}`);
}

/**
 * Build a checker that says whether a match at [start, end) in text t is negated.
 * Scope is the clause around the match; see lexicon.negation in the playbook.
 * beforeOnly skips the inside/after checks (used for sleep and mood phrases such as "didn't sleep").
 */
export function negationChecker(cfg) {
  if (!cfg) return () => false;
  const brk = new RegExp(cfg.clauseBreak, "gi");
  const before = new RegExp(cfg.before, "i"), inside = new RegExp(cfg.inside, "i"), after = new RegExp(cfg.after, "i");
  const n = cfg.beforeWords || 3;
  return function isNegated(t, start, end, beforeOnly = false) {
    let cs = 0, ce = t.length;
    for (const m of t.matchAll(brk)) {
      if (!m[0]) continue;
      const ms = m.index, me = ms + m[0].length;
      if (me <= start) cs = Math.max(cs, me);
      else if (ms >= end) { ce = Math.min(ce, ms); break; }
    }
    const pre = (t.slice(cs, start).match(/[a-z0-9']+/g) || []).slice(-n).join(" ");
    if (before.test(pre)) return true;
    if (beforeOnly) return false;
    if (inside.test(t.slice(start, end))) return true;
    return after.test(t.slice(end, ce));
  };
}

/** Read a spoken measurement. Temperature: Fahrenheit (unit f, or a value above 45) becomes °C; out-of-range values are ignored. */
export function readMeasure(kind, raw, unit) {
  let v = parseFloat(String(raw).replace(",", "."));
  if (!isFinite(v)) return null;
  if (kind === "temperature") {
    if (/^f/i.test(unit || "") || v > 45) v = (v - 32) * 5 / 9;
    v = Math.round(v * 10) / 10;
    return v >= 34 && v <= 43.5 ? v : null;
  }
  return v;
}

function firstSentence(text) {
  const m = text.match(/^.*?[.?!](\s|$)/);
  return (m ? m[0] : text).trim();
}

export function createAgent(playbook) {
  if (!playbook || !Array.isArray(playbook.rules)) throw new Error("Invalid playbook: missing rules");
  const { meta, rules, fallback, lexicon } = playbook;
  const roles = meta.roles || {};

  function assess(input) {
    const s = normalizeSignals(input);
    let fired = rules.filter(r => evaluate(r.when, s));
    if (!fired.length && fallback) fired = [fallback];
    fired = [...fired].sort((a, b) => b.severity - a.severity);
    const severity = Math.max(...fired.map(r => r.severity));
    const lead = fired[0];
    let message = lead.say;
    if (severity < 3) {
      const second = fired.find(r => r !== lead && r.severity >= 1);
      if (second) message += " " + firstSentence(second.say);
    }
    const seen = new Set(), actions = [];
    for (const r of fired) for (const a of r.actions) {
      if (seen.has(a.text)) continue; seen.add(a.text);
      actions.push({ ...a, whoLabel: roles[a.who] || a.who, rule: r.id });
    }
    actions.sort((a, b) => b.level - a.level);
    return {
      severity,
      level: (meta.severityNames || [])[severity] || String(severity),
      meaning: (meta.severityMeaning || [])[severity] || "",
      message,
      rules: fired.map(r => ({
        id: r.id, title: r.title, severity: r.severity, why: r.why,
        evidenceLevel: r.evidenceLevel, evidence: (r.sources || []).map(k => meta.sources?.[k] || k)
      })),
      actions,
      checked: rules.length + (fallback ? 1 : 0),
      playbookVersion: meta.version,
      disclaimer: "Decision support, not diagnosis. " + (meta.status || "")
    };
  }

  /**
   * Turn free speech or typed text into signal updates using the playbook's lexicon.
   * Negation-aware: "no chest pain", "my headache is gone" and "heart isn't racing"
   * do not count as symptoms, and clear a symptom that was logged earlier.
   * Returns the updated signals, what was understood (heard) and what was ruled out (negated).
   */
  function parse(text, input) {
    const s = normalizeSignals(input);
    const t = String(text || "").toLowerCase().replace(/[\u2018\u2019]/g, "'");
    const isNeg = negationChecker(lexicon?.negation);
    const heard = [], negated = [];
    const sym = new Set(s.symptoms);
    for (const entry of lexicon?.symptoms || []) {
      let pos = false, neg = false;
      for (const p of entry.patterns) {
        for (const m of t.matchAll(new RegExp(p, "gi"))) {
          if (!m[0]) continue;
          if (isNeg(t, m.index, m.index + m[0].length)) neg = true; else pos = true;
        }
      }
      if (pos) {
        if (entry.unless && sym.has(entry.unless)) continue;
        if (!sym.has(entry.symptom)) { sym.add(entry.symptom); heard.push(entry.label); }
      } else if (neg) {
        sym.delete(entry.symptom);
        negated.push(entry.label);
      }
    }
    s.symptoms = [...sym];
    for (const entry of lexicon?.state || []) {
      let pos = false;
      for (const p of entry.patterns) {
        for (const m of t.matchAll(new RegExp(p, "gi"))) {
          if (m[0] && !isNeg(t, m.index, m.index + m[0].length, true)) pos = true;
        }
      }
      if (!pos) continue;
      const set = entry.set || {};
      if ("sleepH" in set) s.sleepH = set.sleepH;
      if ("shortNightsMin" in set) s.shortNights = Math.max(s.shortNights, set.shortNightsMin);
      if ("mood" in set) s.mood = set.mood;
      heard.push(entry.label);
    }
    for (const entry of lexicon?.measures || []) {
      for (const p of entry.patterns) {
        const m = t.match(new RegExp(p, "i"));
        if (!m) continue;
        const v = readMeasure(entry.kind, m[1], m[2]);
        if (v == null) continue;
        s[entry.signal] = v;
        heard.push(`${entry.label} ${v} °C`);
        break;
      }
    }
    return { signals: s, heard, negated };
  }

  /**
   * Plan the day: today's assessment, the daily missions it implies, and where the
   * crew member is on the NASA schedule from launch to landing.
   */
  function planDay(input) {
    const assessment = assess(input);
    const s = normalizeSignals(input);
    s.fired = assessment.rules.map(r => r.id);
    const tasks = (playbook.maintenance?.tasks || [])
      .filter(t => evaluate(t.when, s))
      .map(({ when, ...t }) => ({ ...t, evidence: (t.sources || []).map(k => meta.sources?.[k] || k) }));

    const length = s.landingIn < 999 ? s.day + s.landingIn : null;
    const points = [];
    for (const c of playbook.schedule || []) {
      const day = "day" in c ? c.day : (length != null && "beforeLanding" in c ? length - c.beforeLanding : null);
      if (day == null || (length != null && day > length)) continue;
      points.push({ id: c.id, label: c.label, day, evidence: (c.sources || []).map(k => meta.sources?.[k] || k) });
    }
    if (s.scan.day > 0 && !points.some(p => p.day === s.scan.day && /scan/i.test(p.label))) {
      points.push({ id: "S-ACI", label: "As-needed neck scan", day: s.scan.day, evidence: [meta.sources?.STD100].filter(Boolean) });
    }
    points.sort((a, b) => a.day - b.day);
    points.forEach(p => { p.status = p.day < s.day ? "done" : p.day === s.day ? "today" : "upcoming"; });
    const next = points.find(p => p.day > s.day) || null;
    return { assessment, tasks, timeline: { today: s.day, length, checkpoints: points, next, daysToNext: next ? next.day - s.day : null } };
  }

  return { meta, rules, assess, parse, planDay, evaluate: c => (s => evaluate(c, normalizeSignals(s))) };
}
