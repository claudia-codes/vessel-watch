"""Run: python test_agent.py   (checks the Python engine against the same scenarios as test.mjs)"""
import json
import sys
from pathlib import Path

from agent import Agent

here = Path(__file__).parent
agent = Agent.from_file(here / "playbook.json")
cases = json.loads((here / "scenarios.json").read_text(encoding="utf-8"))

fail = 0
for c in cases:
    r = agent.assess(c["signals"])
    ids = sorted(x["id"] for x in r["rules"])
    want = sorted(c["expect"]["rules"])
    ok = r["severity"] == c["expect"]["severity"] and ids == want
    task_ids = []
    tasks_ok = True
    if "tasks" in c["expect"]:
        task_ids = sorted(t["id"] for t in agent.plan_day(c["signals"])["tasks"])
        tasks_ok = task_ids == sorted(c["expect"]["tasks"])
    ok = ok and tasks_ok
    fail += not ok
    print(f"{'PASS' if ok else 'FAIL'}  {c['name']}" + (f" {{missions: {', '.join(task_ids)}}}" if task_ids else "") + f": {r['level']} [{', '.join(ids)}]" + ("" if ok else f"  expected {c['expect']['severity']} {want}"))

speech = [
    ("bad night and a headache", ["Headache", "Short sleep"]),
    ("my chest hurts and I can't breathe", ["Chest pain", "Sudden breathlessness"]),
    ("worst headache of my life", ["Sudden severe headache"]),
    ("so tired on the treadmill lately", ["Tired on exertion"]),
]
for text, want in speech:
    heard = agent.parse(text, {})["heard"]
    ok = all(w in heard for w in want) and len(heard) == len(want)
    fail += not ok
    print(f"{'PASS' if ok else 'FAIL'}  parse \"{text}\": {', '.join(heard)}")

# ---- red-flag safety set ----
RF = json.loads((here / "redflags.json").read_text(encoding="utf-8"))
RED = ["chest", "breath", "severeHead", "neuro"]
caught = present = false_alarm = absent = 0
for c in RF["present"]:
    sig = agent.parse(c["text"], {})["signals"]
    r = agent.assess(sig)
    ok = all(x in sig["symptoms"] for x in c["expect"]) and r["severity"] == 3
    present += 1
    if ok:
        caught += 1
    else:
        fail += 1
        print(f'FAIL  red flag missed: "{c["text"]}" -> {sig["symptoms"]} {r["level"]}')
for c in RF["absent"]:
    sig = agent.parse(c["text"], {})["signals"]
    r = agent.assess(sig)
    wrong = [x for x in c["expect"] if x in sig["symptoms"]]
    red_wrong = r["severity"] == 3 and any(x in c["expect"] for x in RED)
    absent += 1
    if wrong or red_wrong:
        false_alarm += 1
        fail += 1
        print(f'FAIL  negation missed: "{c["text"]}" -> {sig["symptoms"]} {r["level"]}')
for c in RF["mixed"]:
    sig = agent.parse(c["text"], {})["signals"]
    if not (all(x in sig["symptoms"] for x in c["present"]) and not any(x in sig["symptoms"] for x in c["absent"])):
        fail += 1
        print(f'FAIL  mixed: "{c["text"]}" -> {sig["symptoms"]}')
for c in RF["clears"]:
    sig = agent.parse(c["text"], {"symptoms": c["before"]})["signals"]
    if sorted(sig["symptoms"]) != sorted(c["after"]):
        fail += 1
        print(f'FAIL  clears: "{c["text"]}" {c["before"]} -> {sig["symptoms"]}, expected {c["after"]}')
print(f"{'PASS' if caught == present else 'FAIL'}  red flags caught: {caught} of {present}")
print(f"{'PASS' if false_alarm == 0 else 'FAIL'}  false alarms on negations: {false_alarm} of {absent}")
print(f"      mixed sentences: {len(RF['mixed'])}, clearing checks: {len(RF['clears'])}")

tl = agent.plan_day({"day": 47, "landingIn": 185, "scan": {"day": 30, "result": "reduced"}})["timeline"]
tl_ok = tl["length"] == 232 and tl["next"]["id"] == "S-FD60" and tl["daysToNext"] == 13 and next(p for p in tl["checkpoints"] if p["id"] == "S-LANDWEEK")["day"] == 225
fail += not tl_ok
print(f"{'PASS' if tl_ok else 'FAIL'}  timeline: next {tl['next']['label']} in {tl['daysToNext']} days, mission {tl['length']} days")

print(f"\n{fail} failed" if fail else "\nAll passed")
sys.exit(1 if fail else 0)
