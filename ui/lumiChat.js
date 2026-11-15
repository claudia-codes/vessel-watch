/* Lumi conversation plan (local, offline, no AI needed).
   Pure functions, no DOM. index.html asks interpret(text) what a typed or spoken message means BEFORE anything
   reaches the medical agent, so Lumi never answers a question, a symptom it can't map, or an emergency with the
   default "you're fine" status.

   Order of the plan (first match wins, red flags always win):
     1. urgent     red-flag symptom (chest pain, can't breathe, worst headache, weakness/speech, stiff neck)
                   or a plea for help ("help me", "socorro", "I fainted")      → emergency card + agent at once
     2. symptoms   any symptom, temperature, short sleep or low mood           → agent reassesses, Lumi echoes
     3. unwell     "I feel bad" with nothing specific                            → Lumi asks what is wrong (chips)
     4. explain    "explain my heart rate", "¿cómo va mi tensión?"               → answer from the live data
     5. ask        "why?", "what do I do now?", "when do I call the medical officer?"
     6. mission    "drank water", "he bebido agua"                              → canonical English mission command
     7. status / greeting / thanks / capabilities / good
     8. unknown    never reassures: says it didn't understand and offers the next step

   English and Spanish. Symptom ids are the playbook's (agent/playbook.json lexicon); dizziness, nausea and muscle
   pain have no playbook rule and come back as `extra` (logged for the medical officer only). Nothing here adds a
   clinical rule: the agent still decides severity; this only routes and understands. */

export const SYMPTOM_IDS = ["severeHead","headache","puffy","stiffNeck","neck","chest","breath","neuro","vision","palp","exertionFatigue","fever"];
export const RED_IDS = ["chest","breath","severeHead","neuro","stiffNeck"];
export const VITAL_KEYS = ["heartRateBpm","systolicMmHg","hrvRmssdMs","sleepHours","ijvCsaMm2","flow"];

/* lower case, no accents, no punctuation except digits, dots and commas inside numbers */
export function norm(t){
  return " " + String(t||"").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[‘’´`]/g,"'")
    .replace(/(\d)[,](\d)/g,"$1.$2")
    .replace(/[^a-z0-9'.°ºñ ]+/g," ")
    .replace(/(?<!\d)\.|\.(?!\d)/g," ")
    .replace(/\s+/g," ").trim() + " ";
}

const ES_HINT = /\b(tengo|me|mi|duele|estoy|siento|encuentro|que|como|por que|porque|cuando|hola|gracias|fiebre|cabeza|pecho|respirar|mareo|ayuda|socorro|dolor|bien|mal|explica|explicame|he|ya|no puedo|cansad[oa]|corazon|tension|sueno|dormi|vena|cuello|agua|bebido|ejercicio|hice|buenas|buenos|vale|muy|un poco|algo)\b/;
const EN_HINT = /\b(i|i'm|im|my|have|feel|what|how|why|when|hello|hi|thanks|thank|the|is|am|explain|can't|cant|chest|head|breathe|dizzy|help|drank|done|please)\b/;
export function detectLang(text){
  const n = norm(text);
  const es = (n.match(new RegExp(ES_HINT.source,"g"))||[]).length + (/[ñ¿¡áéíóú]/i.test(text) ? 2 : 0);
  const en = (n.match(new RegExp(EN_HINT.source,"g"))||[]).length;
  return es > en ? "es" : "en";
}

/* ---------- symptom lexicon (both languages) ----------
   Each entry: id, and patterns tested against norm(text). Specific entries come first: a match "consumes" its
   words so "worst headache" does not also count as a plain headache. */
const SYM = [
  { id:"severeHead", re:[/\bworst headache\b/, /\bmost painful headache\b/, /\bhead (suddenly )?exploded\b/,/\b(sudden|severe|terrible|unbearable|thunderclap|explosive)( and \w+)? headache\b/, /\bheadache\b.{0,20}\b(sudden|out of nowhere|worst|unbearable)\b/,
                         /\bpeor dolor de cabeza\b/, /\bdolor de cabeza (muy )?(fuerte|intenso|horrible|insoportable|repentino|subito|brutal)\b/, /\b(cefalea|jaqueca) (intensa|subita|repentina|brutal)\b/, /\bme va a estallar la cabeza\b/] },
  { id:"chest",      re:[/\bchest (pain|hurts?|ache|tight\w*|pressure|is tight)\b/, /\bpain in (my|the) chest\b/, /\btight(ness)? in (my|the) chest\b/, /\bheart attack\b/, /\btight chest\b/, /\bchest (feels|is) (tight|heavy|crushed)\b/, /\bcrushing\b.{0,15}\bchest\b/, /\baching chest\b/, /\bchest just feels tight\b/, /\bpressure in (my|the) chest\b/,/\bmy chest\b.{0,15}\b(hurts?|pain|tight|pressure)\b/,
                         /\bdolor (de|en el) pecho\b/, /\bme duele (el|mucho el) pecho\b/, /\b(presion|opresion|pinchazo|punzada)\w* en el pecho\b/, /\bpecho\b.{0,12}\b(duele|apretado|oprimido)\b/, /\binfarto\b/] },
  { id:"breath",     re:[/\b(can't|cant|cannot|can not) (breathe|breath)\b/, /\bshort(ness)? of breath\b/, /\bbreathless\w*\b/, /\b(trouble|difficulty|hard|struggling) (to )?breath\w*\b/, /\bsuffocat\w*\b/, /\bcan'?t catch my breath\b/, /\bcan'?t get enough air\b/, /\bbreathing is (really |very )?hard\b/,/\bgasping\b/,
                         /\bno puedo respirar\b/, /\bme falta (el )?aire\b/, /\bfalta de aire\b/, /\bme ahog\w*\b/, /\bahogo\b/, /\b(dificultad|problemas?) (para|al) respirar\b/, /\b(me )?cuesta respirar\b/, /\brespiro (mal|con dificultad)\b/, /\bsin aire\b/] },
  { id:"neuro",      re:[/\b(can't|cant|cannot) (move|feel) (my )?(arm|leg|hand|face|side)\b/, /\bweak(ness)? (in|on) (my )?(arm|leg|hand|face|one side|left|right)\b/, /\bslurr\w*\b/, /\b(can't|cant|cannot) (speak|talk)( properly)?\b/, /\bface (is )?droop\w*\b/, /\bnumb(ness)?\b/, /\b(arm|leg|hand) is (weak|numb)\b/, /\bcan'?t lift my (arm|leg)\b/, /\bcan'?t find (my )?words\b/,/\bone side\b.{0,15}\b(weak|numb)\b/,
                         /\bno puedo mover (el |la |mi )?(brazo|pierna|mano|cara|lado)\b/, /\bdebilidad (en|de) (el |la |un |mi )?(brazo|pierna|mano|cara|lado)\b/, /\bse me duerme (el |la )?(brazo|pierna|mano|cara)\b/, /\bentumecid\w*\b/, /\bhormigueo\b/, /\b(no puedo|me cuesta) hablar\b/, /\bhablo raro\b/, /\bse me tuerce la boca\b/, /\bparalis\w*\b/] },
  { id:"stiffNeck",  re:[/\bstiff neck\b/, /\bneck (is )?stiff\b/, /\b(can't|cant|cannot) (bend|move) my neck\b/,
                         /\brigidez (de|en el) cuello\b/, /\bcuello (rigido|tieso|duro)\b/, /\bno puedo (mover|doblar) el cuello\b/] },
  { id:"vision",     re:[/\bblurr\w* vision\b/, /\bvision\b.{0,12}\b(blurr\w*|change\w*|worse|dark|loss)\b/, /\b(can't|cant|cannot) see\b/, /\bdouble vision\b/, /\bseeing (double|spots|flashes)\b/, /\beverything (is )?blurr\w*\b/, /\blost (my )?vision\b/, /\bwent dark in (one|my) eye\b/, /\bsudden(ly)? (vision loss|can'?t see)\b/,
                         /\bvision (borrosa|doble|rara)\b/, /\bveo (borroso|doble|mal|manchas|destellos|raro)\b/, /\bno veo( bien)?\b/, /\bse me nubla la vista\b/, /\bperdi (la )?vista\b/] },
  { id:"headache",   re:[/\bheadache\b/, /\bhead (hurts?|aches?|is pounding)\b/, /\bmigraine\b/, /\bmy head\b.{0,10}\b(hurts?|pain|pounding)\b/,
                         /\bdolor de cabeza\b/, /\bme duele (la|mucho la) cabeza\b/, /\bcefalea\b/, /\bjaqueca\b/, /\bmigrana\b/] },
  { id:"puffy",      re:[/\bpuff(y|ier) face\b/, /\bface (is |looks |feels )?(puffy|puffier|swollen)\b/, /\bswollen face\b/,
                         /\bcara (hinchada|abotargada|mas hinchada)\b/, /\bhinchazon (en|de) la cara\b/, /\btengo la cara hinchada\b/] },
  { id:"neck",       re:[/\bneck (swelling|swollen|pain|hurts?|aches?|is swollen)\b/, /\bswollen neck\b/, /\bpain in (my|the) neck\b/, /\blump in (my|the) neck\b/,
                         /\bcuello hinchado\b/, /\bdolor (de|en el) cuello\b/, /\bme duele el cuello\b/, /\bhinchazon (en|de)l? cuello\b/, /\bbulto en el cuello\b/] },
  { id:"palp",       re:[/\bpalpitation\w*\b/, /\bheart (is )?(racing|pounding|skipping|fluttering|beating (fast|weird|strange))\b/, /\b(racing|pounding|skipping) heart\b/, /\birregular (heart ?beat|pulse)\b/,
                         /\bpalpitacion\w*\b/, /\bcorazon\b.{0,15}\b(acelerado|muy rapido|a mil|desbocado|late (raro|rapido|fuerte))\b/, /\bse me acelera el corazon\b/, /\btaquicardia\w*\b/, /\barritmia\w*\b/] },
  { id:"exertionFatigue", re:[/\b(tired|exhausted|fatigued?|worn out|no energy|drained|wiped out)\b/,
                         /\bcansad\w*\b/, /\bagotad\w*\b/, /\bfatiga\w*\b/, /\bsin (energia|fuerzas)\b/, /\bmuy debil\b/, /\breventad\w*\b/] },
  { id:"fever",      re:[/\bfever\w*\b/, /\bchills?\b/, /\bshiver\w*\b/, /\b(high|a) temperature\b/, /\brunning hot\b/,
                         /\bfiebre\b/, /\bescalofrio\w*\b/, /\bcalentura\b/, /\bfebril\b/, /\btengo temperatura\b/, /\btiritando\b/] }
];
const EXTRA = [
  { id:"dizzy",  re:[/\bdizz\w*\b/, /\blight ?headed\b/, /\bvertigo\b/, /\b(room|everything) (is )?spinning\b/, /\bmare\w*\b/, /\bvertigo\b/, /\btodo (me )?da vueltas\b/] },
  { id:"nausea", re:[/\bnause\w*\b/, /\bsick to my stomach\b/, /\bvomit\w*\b/, /\bthrow(ing)? up\b/, /\bthrew up\b/, /\bnausea\w*\b/, /\bganas de vomitar\b/, /\b(he )?vomitado\b/, /\bdevolver\b/, /\bestomago revuelto\b/] },
  { id:"muscle", re:[/\bmuscle (pain|ache|aches|sore)\b/, /\bjoint pain\b/, /\bback (pain|hurts?)\b/, /\bsore (muscles|back|legs|arms)\b/, /\bdolor (muscular|de espalda|de articulaciones|articular)\b/, /\bme duelen? (los musculos|la espalda|las articulaciones|las piernas)\b/, /\bagujetas\b/] }
];
/* pleas for help and events the playbook has no rule for, but which must never get a calm "all good" */
const URGENT = [/\bhelp me\b/, /\bi need help\b/, /\bemergency\b/, /\bsos\b/, /\bmayday\b/, /\b(fainted|passed out|blacked out|going to faint|about to faint|feel faint)\b/, /\b(i'?m bleeding|bleeding (a lot|badly|heavily)|blood everywhere|coughing (up )?blood)\b/, /\bcall (the )?(doctor|medical officer|cmo|ines)\b/, /\bi'?m dying\b/,
                /\bsocorro\b/, /\bauxilio\b/, /\bnecesito ayuda\b/, /\bayudame\b/, /\bayuda ya\b/, /\bemergencia\b/, /\burgencia\b/, /\bdesmay\w*\b/, /\bperdi el conocimiento\b/, /\bme voy a desmayar\b/, /\b(estoy sangrando|sangro|sangrando mucho|me sale (mucha )?sangre|toso sangre)\b/, /\bme muero\b/, /\bllama (al|a la) (medic\w*|doctor\w*)\b/];
const NEG = /\b(no|not|haven't|havent|hasn't|hasnt|neither|nor|zero|free of|don't|dont|doesn't|doesnt|didn't|didnt|without|never|none|sin|ni|nunca|tampoco|nada de|isn't|isnt|aren't|arent|no longer|ya no|any more|anymore)\b/;
const GONE = /^.{0,25}\b(is gone|went away|has gone|has passed|passed|gone now|is better now|stopped|se fue|se ha ido|se me (ha )?pas\w*|ya (se )?(paso|fue)|desaparec\w*|se me quit\w*|ya no)\b/;

function scan(n, list){
  let rest = n; const present = [], absent = [];
  for (const e of list){
    for (const re of e.re){
      const m = rest.match(re); if (!m) continue;
      const before = rest.slice(Math.max(0, m.index-28), m.index), after = rest.slice(m.index + m[0].length);
      const neg = /\b(doesn'?t|does not|isn'?t|is not|not|never|nunca)\b/.test(m[0]) || NEG.test(before.split(/\b(but|pero|y|and|aunque)\b/).pop()) || GONE.test(after);
      (neg ? absent : present).push(e.id);
      rest = rest.slice(0, m.index) + " # " + rest.slice(m.index + m[0].length);
      break;
    }
  }
  return { present:[...new Set(present)], absent:[...new Set(absent.filter(x=>!present.includes(x)))], rest };
}

function readTemp(n){
  const m = n.match(/\b(\d{2,3}(?:\.\d)?)\s*(?:°|º)?\s*(c|f|celsius|fahrenheit|grados?|degrees?)?\b/);
  if (!m) return null;
  const tempCtx = /\b(temp|temperature|fever|fiebre|temperatura|grados?|degrees?|°|º|celsius|fahrenheit)\b|°|º/.test(n);
  if (!tempCtx) return null;
  let v = parseFloat(m[1]);
  if (m[2] && /^f/.test(m[2]) || v > 45) v = (v - 32) * 5/9;
  return v >= 34 && v <= 43.5 ? Math.round(v*10)/10 : null;
}

/* ---------- vitals and questions ---------- */
const VITAL_WORDS = [
  ["flow",         /\b(neck vein|jugular|ijv|vein flow|blood flow|flujo|vena (del )?cuello|vena yugular|yugular|clot|trombo|coagulo|scan result)\b/],
  ["ijvCsaMm2",    /\b(vein area|neck area|area (de la )?vena|area del cuello)\b/],
  ["hrvRmssdMs",   /\b(hrv|heart rate variability|variabilidad)\b/],
  ["heartRateBpm", /\b(heart ?rate|pulse|hr|bpm|ritmo cardiaco|frecuencia cardiaca|pulso|pulsaciones|latidos)\b/],
  ["systolicMmHg", /\b(blood pressure|bp|pressure|tension( arterial)?|presion( arterial)?)\b/],
  ["sleepHours",   /\b(sleep|slept|sueno|dormir|dormido|descanso)\b/]
];
const EXPLAIN = /\b(explain|tell me about|what('s| is| does)|how('s| is)|show me|check|meaning|mean|explica\w*|cuentame|que (es|significa|tal)|como (esta|va|anda|ves)|dime|ensename|revisa|mira)\b/;
const ASK = [
  ["when", /\b(when (do|should|must) i (call|tell|contact|alert)|when to call|cuando (llamo|aviso|debo (llamar|avisar)|tengo que (llamar|avisar)|llamar))\b/],
  ["now",  /\b(what (do|should|can) i do|what now|next step|what should i be doing|que (hago|debo hacer|tengo que hacer|puedo hacer)|y ahora que|siguiente paso)\b/],
  ["why",  /^ ?(why|por que|porque)\b|\bwhy (this|is that|that)\b|\bpor que (esto|eso)\b/]
];
const STATUS = /\b(how am i|am i (ok|okay|fine|alright|good)|how('s| is) my health|my status|status|summary|overview|como estoy|mi estado|estado|resumen|que tal estoy)\b/;
const GREET = /^ ?(hi|hello|hey|hiya|good (morning|afternoon|evening)|hola|buenas|buenos dias|buenas tardes|buenas noches|que tal|hey lumi|hola lumi)\b/;
const THANKS = /\b(thanks|thank you|thx|cheers|gracias|mil gracias|genial gracias)\b/;
const CAPS = /\b(what can you do|how do(es)? (this|it|you) work|what are you|who are you|que puedes hacer|como funcionas|que eres|quien eres|para que sirves|que sabes hacer)\b/;
const HELP_ALONE = /^ ?(help|ayuda|help please|ayuda por favor)[ !?]*$/;
const UNWELL = /\b(feel(ing)? (bad|sick|unwell|ill|awful|terrible|off|weird|strange|horrible|not (so )?(good|well|great))|not feeling (well|good|great)|i'?m not (ok|okay|well|good|fine)|something('s| is) wrong|i don'?t feel (well|good|right)|me (encuentro|siento) (mal|fatal|raro|rara|regular)|estoy (mal|fatal|malo|mala)|no me (encuentro|siento) bien|no estoy bien|algo (va|anda) mal|me pasa algo|me duele( algo)?|it hurts|i'?m in pain|tengo dolor|estoy malit\w*)\b/;
const GOOD = /\b((i'?m|i am|feel(ing)?) (good|great|fine|ok|okay|well|alright)|all good|doing (good|well|great)|estoy (bien|genial|perfect\w*)|me (encuentro|siento) (bien|genial)|todo bien|todo ok|perfecto)\b/;
const SLEEP_BAD = /\b(slept (badly|poorly|bad|little|terribly)|couldn'?t sleep|didn'?t sleep|no sleep|bad night|short night|insomnia|dormi (mal|poco|fatal)|no (he )?dormido|no pude dormir|mala noche|insomnio|apenas dormi)\b/;
const SLEEP_GOOD = /\b(slept (well|great|good)|good night'?s sleep|dormi (bien|genial|de maravilla))\b/;
const MOOD_LOW = /\b(sad|down|depressed|stressed|anxious|lonely|overwhelmed|worried|homesick|triste|deprimid\w*|estresad\w*|ansios\w*|agobiad\w*|preocupad\w*|sol[oa]|bajo de animo|baja de animo|nervios\w*)\b/;
const MISSION = [
  ["drank water",   /\b(drank|drink|drinking|had|finished|bebi|he bebido|bebido|tome|me he tomado|termine)\b.{0,25}\b(water|bag|fluids?|agua|bolsa|liquido)\w*\b|\bhidrat\w*\b/],
  ["done exercise", /\b(done|did|finished|completed|hice|he hecho|termine|acabe)\b.{0,25}\b(exercise|workout|training|bike|treadmill|ejercicio|entreno|entrenamiento|bici|cinta)\b/],
  ["vision test",   /\b(test de vision|prueba de vision|vision test|eye test)\b/],
  ["did my scan",   /\b(hice|he hecho|termine) (el |mi )?(escaner|scan|ecografia)\b/]
];

export function interpret(text){
  const raw = String(text||"").trim(), n = norm(raw), lang = detectLang(raw);
  const s = scan(n, SYM), x = scan(s.rest, EXTRA);
  const tempC = readTemp(n);
  if (tempC != null && tempC >= 38 && !s.present.includes("fever")) s.present.push("fever");
  const urgentWords = URGENT.some(re=>{ const m = n.match(re); return m && !/\b(no|not|don't|dont|didn't|didnt|never|sin|nunca|ya no)\s*$/.test(n.slice(Math.max(0, m.index-14), m.index)); });
  const sleep = SLEEP_BAD.test(n) ? "short" : SLEEP_GOOD.test(n) ? "good" : null;
  const mood = MOOD_LOW.test(n) && !/\bnot (sad|down|stressed|anxious)\b|\bno estoy (triste|estresad\w*|agobiad\w*)\b/.test(n) ? "low" : null;
  const red = s.present.filter(id=>RED_IDS.includes(id));
  const base = { text:raw, lang, present:s.present, absent:s.absent, extra:x.present, extraAbsent:x.absent, tempC, sleep, mood, red, vital:null, ask:null, mission:null };

  const askWhen = ASK[0][1].test(n);
  if (red.length || (urgentWords && !askWhen)) return { ...base, kind:"urgent", urgentWords };
  const anySym = s.present.length || x.present.length || tempC != null || sleep || mood;
  if (anySym) return { ...base, kind:"symptoms" };
  // a question about one reading beats a negation like "no entiendo mi pulso"
  const vital = (VITAL_WORDS.find(([,re])=>re.test(n))||[])[0] || null;
  for (const [k, re] of ASK) if (re.test(n)) return { ...base, kind:"ask", ask:k, vital };
  if (vital && (EXPLAIN.test(n) || n.trim().split(" ").length <= 4)) return { ...base, kind:"explain", vital };
  const mission = (MISSION.find(([,re])=>re.test(n))||[])[0] || null;
  if (mission) return { ...base, kind:"mission", mission };
  if (s.absent.length || x.absent.length) return { ...base, kind:"symptoms" };     // "no tengo fiebre": clears it
  if (UNWELL.test(n)) return { ...base, kind:"unwell" };
  if (HELP_ALONE.test(n)) return { ...base, kind:"help" };
  if (CAPS.test(n)) return { ...base, kind:"capabilities" };
  if (STATUS.test(n)) return { ...base, kind:"status" };
  if (GOOD.test(n)) return { ...base, kind: raw.includes("?") ? "status" : "good" };
  if (THANKS.test(n)) return { ...base, kind:"thanks" };
  if (GREET.test(n)) return { ...base, kind:"greeting" };
  return { ...base, kind:"unknown" };
}

/* ---------- Lumi's words for the local replies (short: one idea per line, read aloud easily) ---------- */
const L = {
  en: {
    unknown: "Sorry, I didn’t understand that. Tell me how you feel in a few words, like “fever” or “headache”, or ask “explain my heart rate”.",
    unknownSub: "If it’s urgent, tap “Alert medical officer”.",
    unwell: "I’m sorry you feel unwell. What’s wrong? Tap what fits, or tell me in your own words.",
    help: "I’m here. Is it urgent? Tap “Alert medical officer”. If not, tell me what you feel.",
    caps: "I check how you feel against NASA’s medical protocol. Tell me a symptom, ask about a reading (“explain my heart rate”), or log water and exercise.",
    greeting: name => `Hi ${name}. How are you feeling?`,
    thanks: "Anytime. I’m here if anything changes.",
    good: "Glad to hear it. I’ll note that you feel good.",
    askBefore: "I can answer that after your check-in. It takes about 2 minutes.",
    statusNone: "No check-in yet today, so I can’t say how you are. Start your check-in and I’ll tell you.",
    urgentLead: "This is urgent. Stay where you are.",
    urgentPlea: "I’m alerting your medical officer. Stay where you are.",
    extraLogged: list => `Logged ${list} for your medical officer.`,
    understood: list => `Got it: ${list}. Checking it against the protocol…`,
    cleared: list => `Noted: no ${list}.`,
    sleepShort: "a short night", moodLow: "feeling low", temp: t => `${t} °C`,
    and: " and ",
    chips: [["fever","Fever"],["headache","Headache"],["dizzy","Dizziness"],["breath","Trouble breathing"],["chest","Chest pain"],["nausea","Nausea"]]
  },
  es: {
    unknown: "Perdona, no te he entendido. Dime cómo te encuentras en pocas palabras, por ejemplo «fiebre» o «dolor de cabeza», o pregunta «explica mi pulso».",
    unknownSub: "Si es urgente, pulsa «Avisar al médico».",
    unwell: "Siento que no te encuentres bien. ¿Qué te pasa? Toca lo que encaje o cuéntamelo con tus palabras.",
    help: "Estoy aquí. ¿Es urgente? Pulsa «Avisar al médico». Si no, dime qué sientes.",
    caps: "Compruebo cómo te encuentras con el protocolo médico de la NASA. Dime un síntoma, pregunta por un valor («explica mi pulso») o registra agua y ejercicio.",
    greeting: name => `Hola ${name}. ¿Cómo te encuentras?`,
    thanks: "Cuando quieras. Aquí estoy si algo cambia.",
    good: "Me alegro. Anoto que te encuentras bien.",
    askBefore: "Te lo puedo responder después del check-in. Son unos 2 minutos.",
    statusNone: "Aún no has hecho el check-in de hoy, así que no puedo decirte cómo estás. Empieza el check-in y te lo digo.",
    urgentLead: "Esto es urgente. Quédate donde estás.",
    urgentPlea: "Aviso a tu médico de a bordo. Quédate donde estás.",
    extraLogged: list => `Anotado para tu médico: ${list}.`,
    understood: list => `Entendido: ${list}. Lo compruebo con el protocolo…`,
    cleared: list => `Anotado: sin ${list}.`,
    sleepShort: "has dormido poco", moodLow: "ánimo bajo", temp: t => `${String(t).replace(".",",")} °C`,
    and: " y ",
    chips: [["fever","Fiebre"],["headache","Dolor de cabeza"],["dizzy","Mareo"],["breath","Me cuesta respirar"],["chest","Dolor de pecho"],["nausea","Náuseas"]]
  }
};
export const SYM_WORD = {
  en: { severeHead:"sudden severe headache", headache:"headache", puffy:"puffy face", stiffNeck:"stiff neck", neck:"neck swelling", chest:"chest pain", breath:"trouble breathing", neuro:"weakness or speech trouble", vision:"vision change", palp:"racing heart", exertionFatigue:"tiredness", fever:"fever", dizzy:"dizziness", nausea:"nausea", muscle:"muscle pain" },
  es: { severeHead:"dolor de cabeza fuerte y repentino", headache:"dolor de cabeza", puffy:"cara hinchada", stiffNeck:"rigidez de cuello", neck:"cuello hinchado", chest:"dolor de pecho", breath:"dificultad para respirar", neuro:"debilidad o problemas para hablar", vision:"cambio en la vista", palp:"corazón acelerado", exertionFatigue:"cansancio", fever:"fiebre", dizzy:"mareo", nausea:"náuseas", muscle:"dolor muscular" }
};
export function words(lang){ return L[lang] || L.en; }
export function listOf(ids, lang){
  const w = SYM_WORD[lang] || SYM_WORD.en, a = ids.map(id=>w[id]||id);
  return a.length <= 1 ? (a[0]||"") : a.slice(0,-1).join(", ") + (words(lang).and) + a.at(-1);
}
/* What Lumi says back before the agent answers: what it understood, in the user's language. */
export function understoodLine(I){
  const W = words(I.lang), bits = [...I.present.map(id=>(SYM_WORD[I.lang]||SYM_WORD.en)[id])];
  if (I.tempC != null) bits.push(W.temp(I.tempC));
  if (I.sleep==="short") bits.push(W.sleepShort);
  if (I.mood==="low") bits.push(W.moodLow);
  const parts = [];
  if (bits.length) parts.push(W.understood(bits.length<=1 ? bits[0] : bits.slice(0,-1).join(", ") + W.and + bits.at(-1)));
  if (I.absent.length) parts.push(W.cleared(listOf(I.absent, I.lang)));
  if (I.extra.length) parts.push(W.extraLogged(listOf(I.extra, I.lang)));
  return parts.join(" ");
}
