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

tl = agent.plan_day({"day": 47, "landingIn": 185, "scan": {"day": 30, "result": "reduced"}})["timeline"]
tl_ok = tl["length"] == 232 and tl["next"]["id"] == "S-FD60" and tl["daysToNext"] == 13 and next(p for p in tl["checkpoints"] if p["id"] == "S-LANDWEEK")["day"] == 225
fail += not tl_ok
print(f"{'PASS' if tl_ok else 'FAIL'}  timeline: next {tl['next']['label']} in {tl['daysToNext']} days, mission {tl['length']} days")

print(f"\n{fail} failed" if fail else "\nAll passed")
sys.exit(1 if fail else 0)
