// node ui/lumiChat.test.mjs : Lumi's local conversation plan. Must print "All passed".
import { interpret, understoodLine, detectLang } from "./lumiChat.js";

let fail = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function t(text, want){
  const I = interpret(text), bad = [];
  for (const [k, v] of Object.entries(want)){
    const got = k === "has" ? v.every(x=>I.present.includes(x)) : k === "hasExtra" ? v.every(x=>I.extra.includes(x)) : k === "hasAbsent" ? v.every(x=>I.absent.includes(x)) : k === "not" ? v.every(x=>!I.present.includes(x)) : eq(I[k], v);
    if (!got) bad.push(`${k}: want ${JSON.stringify(v)}, got ${JSON.stringify(k.startsWith("has")||k==="not" ? {present:I.present, extra:I.extra, absent:I.absent} : I[k])}`);
  }
  if (bad.length){ fail++; console.log(`FAIL "${text}" → ${I.kind}\n   ${bad.join("\n   ")}`); }
}

// Red flags and pleas for help: always urgent, in both languages
t("me duele el pecho", { kind:"urgent", has:["chest"], lang:"es" });
t("tengo dolor de pecho y me falta el aire", { kind:"urgent", has:["chest","breath"] });
t("no puedo respirar", { kind:"urgent", has:["breath"] });
t("I can't breathe", { kind:"urgent", has:["breath"], lang:"en" });
t("chest pain", { kind:"urgent", has:["chest"] });
t("worst headache of my life", { kind:"urgent", has:["severeHead"], not:["headache"] });
t("tengo un dolor de cabeza muy fuerte", { kind:"urgent", has:["severeHead"], not:["headache"] });
t("no puedo mover el brazo", { kind:"urgent", has:["neuro"] });
t("my speech is slurred", { kind:"urgent", has:["neuro"] });
t("tengo fiebre y el cuello rígido", { kind:"urgent", has:["fever","stiffNeck"] });
t("socorro", { kind:"urgent", urgentWords:true });
t("help me", { kind:"urgent", urgentWords:true });
t("me he desmayado", { kind:"urgent", urgentWords:true });
t("I think I fainted", { kind:"urgent", urgentWords:true });

// Symptoms: go to the agent, never "nothing health-related"
t("tengo fiebre", { kind:"symptoms", has:["fever"], lang:"es" });
t("I have a fever", { kind:"symptoms", has:["fever"] });
t("tengo 39 de fiebre", { kind:"symptoms", has:["fever"], tempC:39 });
t("mi temperatura es 38,4 grados", { kind:"symptoms", has:["fever"], tempC:38.4 });
t("temperature 101 F", { kind:"symptoms", tempC:38.3 });
t("me duele la cabeza", { kind:"symptoms", has:["headache"] });
t("estoy mareado", { kind:"symptoms", hasExtra:["dizzy"] });
t("I feel dizzy", { kind:"symptoms", hasExtra:["dizzy"] });
t("tengo náuseas", { kind:"symptoms", hasExtra:["nausea"] });
t("tengo la cara hinchada", { kind:"symptoms", has:["puffy"] });
t("el corazón me va a mil", { kind:"symptoms", has:["palp"] });
t("estoy muy cansada", { kind:"symptoms", has:["exertionFatigue"] });
t("dormí fatal", { kind:"symptoms", sleep:"short" });
t("estoy agobiado", { kind:"symptoms", mood:"low" });
t("tengo fiebre pero no dolor de cabeza", { kind:"symptoms", has:["fever"], hasAbsent:["headache"], not:["headache"] });

// Negations clear, they don't alarm
t("no tengo fiebre", { kind:"symptoms", present:[], hasAbsent:["fever"] });
t("no me duele el pecho", { kind:"symptoms", present:[], hasAbsent:["chest"] });
t("no chest pain", { present:[], hasAbsent:["chest"] });
t("ya no me duele la cabeza", { present:[], hasAbsent:["headache"] });
t("my headache is gone", { present:[], hasAbsent:["headache"] });

// Questions about a reading, and the playbook questions
t("Explain my heart rate", { kind:"explain", vital:"heartRateBpm" });
t("explícame mi pulso", { kind:"explain", vital:"heartRateBpm" });
t("¿cómo va mi tensión?", { kind:"explain", vital:"systolicMmHg" });
t("Explain my neck vein flow", { kind:"explain", vital:"flow" });
t("HRV", { kind:"explain", vital:"hrvRmssdMs" });
t("explain my sleep", { kind:"explain", vital:"sleepHours" });
t("What do I do now?", { kind:"ask", ask:"now" });
t("¿qué hago?", { kind:"ask", ask:"now" });
t("Why this?", { kind:"ask", ask:"why" });
t("When do I call the medical officer?", { kind:"ask", ask:"when" });
t("¿cuándo llamo al médico?", { kind:"ask", ask:"when" });

// Missions in Spanish map to the English commands
t("he bebido agua", { kind:"mission", mission:"drank water" });
t("ya hice el ejercicio", { kind:"mission", mission:"done exercise" });

// Conversation
t("hola", { kind:"greeting", lang:"es" });
t("hello Lumi", { kind:"greeting" });
t("gracias", { kind:"thanks" });
t("¿cómo estoy?", { kind:"status" });
t("estoy bien", { kind:"good" });
t("me encuentro mal", { kind:"unwell" });
t("I feel sick", { kind:"unwell" });
t("no me encuentro bien", { kind:"unwell" });
t("ayuda", { kind:"help" });
t("¿qué puedes hacer?", { kind:"capabilities" });

// Unknown never reassures
t("banana spaceship", { kind:"unknown" });
t("asdf", { kind:"unknown" });

// Echo line in the user's language
const e1 = understoodLine(interpret("tengo fiebre y estoy mareado"));
if (!/Entendido: fiebre/.test(e1) || !/mareo/.test(e1)) { fail++; console.log("FAIL echo es:", e1); }
const e2 = understoodLine(interpret("I have a headache, no fever"));
if (!/Got it: headache/.test(e2) || !/no fever/.test(e2)) { fail++; console.log("FAIL echo en:", e2); }
if (detectLang("¿Qué tal?") !== "es" || detectLang("How am I?") !== "en") { fail++; console.log("FAIL detectLang"); }

console.log(fail ? `${fail} failed` : "All passed");
process.exit(fail ? 1 : 0);
