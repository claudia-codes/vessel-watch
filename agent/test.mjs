// Run: node test.mjs
import { readFileSync } from "node:fs";
import { createAgent } from "./agent.js";

const here = new URL(".", import.meta.url);
const agent = createAgent(JSON.parse(readFileSync(new URL("playbook.json", here))));
const cases = JSON.parse(readFileSync(new URL("scenarios.json", here)));

let fail = 0;
for (const c of cases) {
  const r = agent.assess(c.signals);
  const ids = r.rules.map(x => x.id).sort();
  const want = [...c.expect.rules].sort();
  const ok = r.severity === c.expect.severity && JSON.stringify(ids) === JSON.stringify(want);
  let tasksOk = true, taskIds = [];
  if (c.expect.tasks) {
    taskIds = agent.planDay(c.signals).tasks.map(t => t.id).sort();
    tasksOk = JSON.stringify(taskIds) === JSON.stringify([...c.expect.tasks].sort());
  }
  const allOk = ok && tasksOk;
  if (!allOk) fail++;
  console.log(`${allOk ? "PASS" : "FAIL"}  ${c.name}${c.expect.tasks ? ` {missions: ${taskIds.join(", ")}}` : ""}: ${r.level} [${ids.join(", ")}]${allOk ? "" : `  expected ${c.expect.severity} [${want.join(", ")}] {${(c.expect.tasks||[]).join(", ")}}`}`);
}

const speech = [
  ["bad night and a headache", ["Headache", "Short sleep"]],
  ["my chest hurts and I can't breathe", ["Chest pain", "Sudden breathlessness"]],
  ["worst headache of my life", ["Sudden severe headache"]],
  ["so tired on the treadmill lately", ["Tired on exertion"]]
];
for (const [text, want] of speech) {
  const { heard } = agent.parse(text, {});
  const ok = want.every(w => heard.includes(w)) && heard.length === want.length;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  parse "${text}": ${heard.join(", ")}`);
}

const tl = agent.planDay({ day: 47, landingIn: 185, scan: { day: 30, result: "reduced" } }).timeline;
const tlOk = tl.length === 232 && tl.next?.id === "S-FD60" && tl.daysToNext === 13 && tl.checkpoints.find(p => p.id === "S-LANDWEEK")?.day === 225;
if (!tlOk) fail++;
console.log(`${tlOk ? "PASS" : "FAIL"}  timeline: next ${tl.next?.label} in ${tl.daysToNext} days, mission ${tl.length} days`);

console.log(fail ? `\n${fail} failed` : "\nAll passed");
process.exit(fail ? 1 : 0);
