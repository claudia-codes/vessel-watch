"""VesselWatch medical agent: the same rule engine as agent.js, for Python backends.

The clinical knowledge lives in playbook.json; this file only evaluates it.

    from agent import Agent
    agent = Agent.from_file("playbook.json")
    result = agent.assess({"day": 47, "sleepH": 5.2, "symptoms": ["headache"]})

Decision support only. It never diagnoses and never outputs drug doses.
"""
from __future__ import annotations

import copy
import json
import re
from pathlib import Path
from typing import Any

DEFAULT_SIGNALS: dict[str, Any] = {
    "day": 0, "sleepH": 7.2, "baselineSleepH": 7.2, "shortNights": 0, "mood": None, "lowDays": 0,
    "symptoms": [], "scan": {"day": -1, "result": "antegrade"},
    "risk": {"family": False, "thrombophilia": False, "hormone": False},
    "evaIn": 999, "landingIn": 999, "exerciseMin7d": 120,
    "restingHR": None, "baselineHR": None, "hrHighDays": 0,
    "anticoag": "none", "anticoagCoverageDays": 999, "anticoagCourseDays": 0,
    "labsOutOfRange": [],
}


def normalize_signals(data: dict | None = None) -> dict:
    data = data or {}
    s = copy.deepcopy(DEFAULT_SIGNALS)
    s.update({k: v for k, v in data.items() if k not in ("scan", "risk", "symptoms")})
    s["scan"].update(data.get("scan") or {})
    s["risk"].update(data.get("risk") or {})
    seen, sym = set(), []
    for x in data.get("symptoms") or []:
        if x and x != "none" and x not in seen:
            seen.add(x)
            sym.append(x)
    s["symptoms"] = sym
    labs = data.get("labsOutOfRange")
    s["labsOutOfRange"] = list(labs) if isinstance(labs, list) else []
    return s


def _get(obj: Any, path: str) -> Any:
    for key in path.split("."):
        if key == "length" and isinstance(obj, (list, str)):
            obj = len(obj)
        elif isinstance(obj, dict):
            obj = obj.get(key)
        else:
            return None
    return obj


def _value(v: Any, s: dict) -> Any:
    if isinstance(v, dict) and "path" in v:
        base = _get(s, v["path"])
        add = v.get("add")
        return base + add if isinstance(add, (int, float)) and isinstance(base, (int, float)) else base
    return v


def _num(x: Any) -> bool:
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def _strict_eq(a: Any, b: Any) -> bool:
    # Match JavaScript ===: no True == 1 coercion.
    return type(a) is type(b) and a == b


_CMP = {
    "eq": _strict_eq,
    "neq": lambda a, b: not _strict_eq(a, b),
    "lt": lambda a, b: _num(a) and _num(b) and a < b,
    "lte": lambda a, b: _num(a) and _num(b) and a <= b,
    "gt": lambda a, b: _num(a) and _num(b) and a > b,
    "gte": lambda a, b: _num(a) and _num(b) and a >= b,
    "every": lambda a, b: _num(a) and _num(b) and b > 0 and a > 0 and a % b == 0,
}


def evaluate(cond: Any, s: dict) -> bool:
    if cond is True:
        return True
    if "all" in cond:
        return all(evaluate(c, s) for c in cond["all"])
    if "any" in cond:
        return any(evaluate(c, s) for c in cond["any"])
    if "not" in cond:
        return not evaluate(cond["not"], s)
    if "has" in cond:
        path, v = cond["has"]
        arr = _get(s, path)
        return isinstance(arr, list) and v in arr
    for op, fn in _CMP.items():
        if op in cond:
            path, v = cond[op]
            return bool(fn(_get(s, path), _value(v, s)))
    raise ValueError(f"Unknown condition: {json.dumps(cond)}")


def negation_checker(cfg: dict | None):
    """Return is_negated(t, start, end, before_only=False) for a match in text t. Mirrors agent.js."""
    if not cfg:
        return lambda *a, **k: False
    brk = re.compile(cfg["clauseBreak"], re.I)
    before = re.compile(cfg["before"], re.I)
    inside = re.compile(cfg["inside"], re.I)
    after = re.compile(cfg["after"], re.I)
    n = cfg.get("beforeWords", 3)

    def is_negated(t: str, start: int, end: int, before_only: bool = False) -> bool:
        cs, ce = 0, len(t)
        for m in brk.finditer(t):
            if not m.group(0):
                continue
            if m.end() <= start:
                cs = max(cs, m.end())
            elif m.start() >= end:
                ce = min(ce, m.start())
                break
        pre = " ".join(re.findall(r"[a-z0-9']+", t[cs:start])[-n:])
        if before.search(pre):
            return True
        if before_only:
            return False
        if inside.search(t[start:end]):
            return True
        return bool(after.search(t[end:ce]))

    return is_negated


def _first_sentence(text: str) -> str:
    m = re.match(r"^.*?[.?!](\s|$)", text)
    return (m.group(0) if m else text).strip()


def _js_regex(p: str) -> str:
    # Playbook patterns are written for JavaScript; they are also valid Python regex.
    return p


class Agent:
    def __init__(self, playbook: dict):
        if not isinstance(playbook.get("rules"), list):
            raise ValueError("Invalid playbook: missing rules")
        self.playbook = playbook
        self.meta = playbook.get("meta", {})
        self.rules = playbook["rules"]
        self.fallback = playbook.get("fallback")
        self.lexicon = playbook.get("lexicon", {})

    @classmethod
    def from_file(cls, path: str | Path) -> "Agent":
        return cls(json.loads(Path(path).read_text(encoding="utf-8")))

    def assess(self, data: dict) -> dict:
        s = normalize_signals(data)
        fired = [r for r in self.rules if evaluate(r["when"], s)]
        if not fired and self.fallback:
            fired = [self.fallback]
        fired.sort(key=lambda r: -r["severity"])
        severity = max(r["severity"] for r in fired)
        lead = fired[0]
        message = lead["say"]
        if severity < 3:
            second = next((r for r in fired if r is not lead and r["severity"] >= 1), None)
            if second:
                message += " " + _first_sentence(second["say"])
        roles = self.meta.get("roles", {})
        seen, actions = set(), []
        for r in fired:
            for a in r["actions"]:
                if a["text"] in seen:
                    continue
                seen.add(a["text"])
                actions.append({**a, "whoLabel": roles.get(a["who"], a["who"]), "rule": r["id"]})
        actions.sort(key=lambda a: -a["level"])
        names = self.meta.get("severityNames", [])
        meaning = self.meta.get("severityMeaning", [])
        sources = self.meta.get("sources", {})
        return {
            "severity": severity,
            "level": names[severity] if severity < len(names) else str(severity),
            "meaning": meaning[severity] if severity < len(meaning) else "",
            "message": message,
            "rules": [{
                "id": r["id"], "title": r["title"], "severity": r["severity"], "why": r["why"],
                "evidenceLevel": r.get("evidenceLevel"),
                "evidence": [sources.get(k, k) for k in r.get("sources", [])],
            } for r in fired],
            "actions": actions,
            "checked": len(self.rules) + (1 if self.fallback else 0),
            "playbookVersion": self.meta.get("version"),
            "disclaimer": "Decision support, not diagnosis. " + self.meta.get("status", ""),
        }

    def parse(self, text: str, data: dict | None = None) -> dict:
        """Turn speech or text into signal updates. Negation-aware, like agent.js:
        negated symptoms don't count and clear a symptom logged earlier."""
        s = normalize_signals(data)
        t = (text or "").lower().replace("\u2018", "'").replace("\u2019", "'")
        is_neg = negation_checker(self.lexicon.get("negation"))
        heard: list[str] = []
        negated: list[str] = []
        sym = list(s["symptoms"])
        for entry in self.lexicon.get("symptoms", []):
            pos = neg = False
            for p in entry["patterns"]:
                for m in re.finditer(p, t, re.I):
                    if not m.group(0):
                        continue
                    if is_neg(t, m.start(), m.end()):
                        neg = True
                    else:
                        pos = True
            if pos:
                if entry.get("unless") and entry["unless"] in sym:
                    continue
                if entry["symptom"] not in sym:
                    sym.append(entry["symptom"])
                    heard.append(entry["label"])
            elif neg:
                if entry["symptom"] in sym:
                    sym.remove(entry["symptom"])
                negated.append(entry["label"])
        s["symptoms"] = sym
        for entry in self.lexicon.get("state", []):
            pos = any(m.group(0) and not is_neg(t, m.start(), m.end(), True)
                      for p in entry["patterns"] for m in re.finditer(p, t, re.I))
            if not pos:
                continue
            st = entry.get("set", {})
            if "sleepH" in st:
                s["sleepH"] = st["sleepH"]
            if "shortNightsMin" in st:
                s["shortNights"] = max(s["shortNights"], st["shortNightsMin"])
            if "mood" in st:
                s["mood"] = st["mood"]
            heard.append(entry["label"])
        return {"signals": s, "heard": heard, "negated": negated}

    def plan_day(self, data: dict) -> dict:
        """Today's assessment, the daily missions it implies, and the NASA schedule from launch to landing."""
        assessment = self.assess(data)
        s = normalize_signals(data)
        s["fired"] = [r["id"] for r in assessment["rules"]]
        sources = self.meta.get("sources", {})
        tasks = []
        for t in self.playbook.get("maintenance", {}).get("tasks", []):
            if evaluate(t["when"], s):
                task = {k: v for k, v in t.items() if k != "when"}
                task["evidence"] = [sources.get(k, k) for k in t.get("sources", [])]
                tasks.append(task)
        length = s["day"] + s["landingIn"] if s["landingIn"] < 999 else None
        points = []
        for c in self.playbook.get("schedule", []):
            if "day" in c:
                day = c["day"]
            elif length is not None and "beforeLanding" in c:
                day = length - c["beforeLanding"]
            else:
                continue
            if length is not None and day > length:
                continue
            points.append({"id": c["id"], "label": c["label"], "day": day,
                           "evidence": [sources.get(k, k) for k in c.get("sources", [])]})
        scan_day = s["scan"].get("day", -1)
        if scan_day > 0 and not any(p["day"] == scan_day and "scan" in p["label"].lower() for p in points):
            points.append({"id": "S-ACI", "label": "As-needed neck scan", "day": scan_day,
                           "evidence": [v for v in [sources.get("STD100")] if v]})
        points.sort(key=lambda p: p["day"])
        for p in points:
            p["status"] = "done" if p["day"] < s["day"] else "today" if p["day"] == s["day"] else "upcoming"
        nxt = next((p for p in points if p["day"] > s["day"]), None)
        return {"assessment": assessment, "tasks": tasks,
                "timeline": {"today": s["day"], "length": length, "checkpoints": points, "next": nxt,
                             "daysToNext": nxt["day"] - s["day"] if nxt else None}}


if __name__ == "__main__":
    import sys
    agent = Agent.from_file(Path(__file__).with_name("playbook.json"))
    signals = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    print(json.dumps(agent.assess(signals), indent=2, ensure_ascii=False))
