"use strict";
var HemoMindCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // build/vessel-entry.ts
  var vessel_entry_exports = {};
  __export(vessel_entry_exports, {
    ALGORITHM_RISK_FACTORS: () => ALGORITHM_RISK_FACTORS,
    APIXABAN: () => APIXABAN,
    BODY_NECK: () => BODY_NECK,
    DEMO_ASTRONAUT: () => DEMO_ASTRONAUT,
    DEMO_COMMS_DELAY: () => DEMO_COMMS_DELAY,
    DEMO_STREAM_CONFIG: () => DEMO_STREAM_CONFIG,
    EARTH_MARS_DISTANCE: () => EARTH_MARS_DISTANCE,
    ESTROGEN_COC_WITH_DOAC: () => ESTROGEN_COC_WITH_DOAC,
    EVIDENCE_SCENARIOS: () => EVIDENCE_SCENARIOS,
    FLOW_LABELS: () => FLOW_LABELS,
    FLOW_RISK_INTERPRETATION: () => FLOW_RISK_INTERPRETATION,
    HEADWARD_FLUID_SHIFT: () => HEADWARD_FLUID_SHIFT,
    HORMONE_TABLE: () => HORMONE_TABLE,
    HORMONE_TABLE_CITATION: () => HORMONE_TABLE_CITATION,
    IJV_FINDINGS_FD50: () => IJV_FINDINGS_FD50,
    IJV_FLOW_GRADES: () => IJV_FLOW_GRADES,
    IJV_FLOW_PATTERNS: () => IJV_FLOW_PATTERNS,
    IJV_SCREENING: () => IJV_SCREENING,
    INFLIGHT_MEASUREMENTS: () => INFLIGHT_MEASUREMENTS,
    KM_PER_MILE: () => KM_PER_MILE,
    LANDING_WASHOUT_HOURS: () => LANDING_WASHOUT_HOURS,
    MANUAL_VARIABLES: () => MANUAL_VARIABLES,
    MARS_COMMS_DELAY: () => MARS_COMMS_DELAY,
    METRIC_KEYS: () => METRIC_KEYS,
    METRIC_ORDER: () => METRIC_ORDER,
    MOOD_LABELS: () => MOOD_LABELS,
    NasaMockStream: () => NasaMockStream,
    OCHMO_MTB_007: () => OCHMO_MTB_007,
    RING_FILL: () => RING_FILL,
    SOURCES: () => SOURCES,
    SPEED_OF_LIGHT_KM_S: () => SPEED_OF_LIGHT_KM_S,
    STASIS_WITHOUT_RISK_FACTORS: () => STASIS_WITHOUT_RISK_FACTORS,
    STATE_LABELS: () => STATE_LABELS,
    SYMPTOMS_TO_MONITOR: () => SYMPTOMS_TO_MONITOR,
    THROMBOSIS_OPERATIONS: () => THROMBOSIS_OPERATIONS,
    UNAVAILABLE_VARIABLES: () => UNAVAILABLE_VARIABLES,
    buildDecisionView: () => buildDecisionView,
    buildIgcView: () => buildIgcView,
    buildVesselView: () => buildVesselView,
    createMockStream: () => createMockStream,
    evaluateVteAlgorithm: () => evaluateVteAlgorithm,
    formatDelay: () => formatDelay,
    formatDuration: () => formatDuration,
    formatRegimen: () => formatRegimen,
    getNasaStream: () => getNasaStream,
    heartStatus: () => heartStatus,
    initNasaStream: () => initNasaStream,
    isEstrogenCOC: () => isEstrogenCOC,
    isHigherRiskHormone: () => isHigherRiskHormone,
    lightTimeSec: () => lightTimeSec,
    mindStatus: () => mindStatus,
    riskFactorsOf: () => riskFactorsOf,
    shortCitation: () => shortCitation,
    validateManualEntry: () => validateManualEntry
  });

  // src/nasa/ochmoMtb007.ts
  var cite = (page2, quote) => ({ doc: "OCHMO-MTB-007", revision: "8-Jan-26", page: page2, quote });
  var OCHMO_MTB_007 = {
    id: "OCHMO-MTB-007",
    title: "Venous Thrombosis in Spaceflight",
    revision: "8-Jan-26",
    url: "https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf",
    derivedFrom: "NASA-STD-3001 / OCHMO-STD-100.1A Rev A"
  };
  var IJV_FLOW_PATTERNS = {
    antegrade: { label: "Anter\xF3grado (tasas menores que la norma terrestre)", citation: cite(1, "antegrade but with lower rates than terrestrial norms") },
    stagnant: { label: "Estancado / estasis", citation: cite(7, "stasis (a stoppage or slowdown in the flow of blood)") },
    retrograde: { label: "Retr\xF3grado (RVBF)", citation: cite(7, "retrograde venous blood flow (RVBF) (the backflow of venous blood towards the brain)") }
  };
  var FLOW_RISK_INTERPRETATION = {
    stasisIsPrimaryPrethromboticIndicator: true,
    retrogradeIsMainContributor: false,
    citation: cite(11, "stasis/stagnant flow was the most concerning as a pre-thrombotic indicator. Retrograde flow was not considered to be a main contributor")
  };
  var IJV_SCREENING = {
    requirementId: "6041",
    method: "Duplex ultrasound of the bilateral extracranial internal jugular veins, with breathing and compression maneuvers",
    /** Calendario de ejemplo para misión ISS de 180 días. */
    exampleSchedule180dISS: {
      preflight: "L-12/3 m",
      inflightLaunchDays: [30, 60],
      preReturnDays: 42,
      postflight: "R+0/45 d",
      plus: "ACI (as clinically indicated)"
    },
    citation: cite(16, "Example Schedule based on 180-day ISS mission: L-12/3 m, L+30 days; L+60 days; R-42 days, R+0/45d, as clinically indicated (ACI)")
  };
  var ALGORITHM_RISK_FACTORS = {
    factors: ["thrombophilia", "familyHistoryUnprovokedVTE", "higherRiskHormoneUse"],
    ageIsFactor: false,
    citation: cite(14, "Thrombophilia, Family History, or higher-risk Hormone Use? ... Unprovoked thrombosis in immediate family members; hormones that increase the risk of VTE")
  };
  var HORMONE_TABLE = {
    NONE: { label: "Sin terapia hormonal", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    PROGESTIN_ONLY_PILL: { label: "P\xEDldora solo progest\xE1geno (noretindrona)", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    LNG_IUD: { label: "DIU de levonorgestrel (LNG-IUD)", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    ETONOGESTREL_IMPLANT: { label: "Implante de etonogestrel", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    TESTOSTERONE: { label: "Testosterona (micronizada / cipionato)", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    ESTRADIOL_PATCH: { label: "Parche de estradiol", containsEstrogen: true, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    PREMARIN_ORAL: { label: "Premarin oral", containsEstrogen: true, vteRisk: "SOME_INCREASE", relativeRisk: "2-fold" },
    MICRONIZED_PROGESTERONE_ORAL: { label: "Progesterona micronizada 100 mg oral", containsEstrogen: false, vteRisk: "LOW_NO_INCREASE", relativeRisk: null },
    DMPA_DEPOT: { label: "Medroxiprogesterona depot 150 mg", containsEstrogen: false, vteRisk: "SOME_INCREASE", relativeRisk: "2.6-fold" },
    COC_1ST_GEN: { label: "COC progest\xE1geno 1\xAA generaci\xF3n", containsEstrogen: true, vteRisk: "SOME_INCREASE", relativeRisk: "3.2-fold" },
    COC_2ND_GEN: { label: "COC progest\xE1geno 2\xAA generaci\xF3n (levonorgestrel)", containsEstrogen: true, vteRisk: "SOME_INCREASE", relativeRisk: "2.8-fold" },
    COC_3RD_GEN: { label: "COC progest\xE1geno 3\xAA generaci\xF3n", containsEstrogen: true, vteRisk: "MODERATE_INCREASE", relativeRisk: "3.8-fold" },
    COC_4TH_GEN: { label: "COC progest\xE1geno 4\xAA generaci\xF3n (drospirenona)", containsEstrogen: true, vteRisk: "MODERATE_INCREASE", relativeRisk: "Similar to 3rd generation" }
  };
  var HORMONE_TABLE_CITATION = cite(6, "Hormone Comparison Table (Bostick et al., 2025)");
  var isHigherRiskHormone = (h) => HORMONE_TABLE[h].vteRisk !== "LOW_NO_INCREASE";
  var isEstrogenCOC = (h) => h.startsWith("COC_");
  var APIXABAN = {
    treatment: [
      { drug: "Apixaban", doseMg: 10, timesPerDay: 2, durationDays: 7 },
      { drug: "Apixaban", doseMg: 5, timesPerDay: 2, durationDays: null }
    ],
    treatmentCitation: cite(12, "Treatment: Apixaban 10 mg twice a day for 7 days; afterwards 5 mg twice a day"),
    prophylaxis: [{ drug: "Apixaban", doseMg: 2.5, timesPerDay: 2, durationDays: null }],
    prophylaxisCitation: cite(12, "Prophylaxis dose: Apixaban 2.5 mg twice a day"),
    halfLifeHours: 12
  };
  var THROMBOSIS_OPERATIONS = {
    restrictEvaDays: 30,
    restrictAredDays: 30,
    allowedExercise: "T2 y CEVIS pueden considerarse, retirando las correas de hombro del arn\xE9s",
    favorRemainOnOrbitDays: 30,
    citation: cite(12, "Restrict crew from both EVA and ARED for at least 30 days. Use of T2 and CEVIS can be considered, but harness shoulder straps should be removed.")
  };
  var LANDING_WASHOUT_HOURS = {
    treatment: 48,
    prophylaxis: 24,
    citation: cite(14, "For diagnosed thrombosis \u2013 48 hours prior to landing. For stasis plus a risk factor \u2013 24 hours prior to landing")
  };
  var STASIS_WITHOUT_RISK_FACTORS = {
    action: "Monitorizaci\xF3n m\xE1s frecuente y asegurar hidrataci\xF3n (sin anticoagulaci\xF3n)",
    /** El brief no fija el intervalo de reescaneo. */
    rescanIntervalSpecified: false,
    citation: cite(12, "should be monitored more often, and hydration should be ensured")
  };
  var ESTROGEN_COC_WITH_DOAC = {
    rule: "No suspender un COC con estr\xF3genos al iniciar DOAC por riesgo de sangrado uterino anormal (AUB)",
    citation: cite(12, "Crewmembers using an estrogen-based COC should not discontinue its use if direct oral anticoagulants (DOACs) are administered ... due to the risk of abnormal uterine bleeding (AUB)")
  };
  var SYMPTOMS_TO_MONITOR = {
    items: ["Hinchaz\xF3n visible de la IJV", 'Edema facial m\xE1s all\xE1 de la adaptaci\xF3n "nominal"', "Edema palpebral", "Midriasis", "Cefalea", "S\xEDntomas SANS"],
    citation: cite(11, 'IJV swelling, facial edema beyond "nominal" spaceflight adaptation, and/or eyelid edema, mydriasis, headache, and SANS symptoms')
  };
  var HEADWARD_FLUID_SHIFT = {
    effects: ["Hinchaz\xF3n facial", "Disminuci\xF3n del volumen de piernas", "Aumento del volumen sist\xF3lico", "Disminuci\xF3n del volumen plasm\xE1tico"],
    citation: cite(7, "facial puffiness, decreased leg volume, increased cardiac stroke volume, and decreased plasma volume")
  };

  // src/nasa/vteAlgorithm.ts
  function riskFactorsOf(p) {
    const out = [];
    if (p.thrombophilia) out.push("Trombofilia");
    if (p.familyHistoryUnprovokedVTE) out.push("Historia familiar de TEV no provocada");
    if (isHigherRiskHormone(p.hormone)) out.push(`Hormona de mayor riesgo: ${HORMONE_TABLE[p.hormone].label} (${HORMONE_TABLE[p.hormone].relativeRisk})`);
    return out;
  }
  var formatRegimen = (phases) => phases.map((ph) => `${ph.drug} ${ph.doseMg} mg ${ph.timesPerDay === 2 ? "dos veces al d\xEDa" : `${ph.timesPerDay}\xD7/d\xEDa`}${ph.durationDays ? ` \xD7 ${ph.durationDays} d\xEDas` : ""}`).join(", luego ");
  function hormoneActionFor(hormone, onDoac) {
    const h = HORMONE_TABLE[hormone];
    if (hormone === "NONE") return "Sin terapia hormonal activa.";
    if (onDoac && isEstrogenCOC(hormone)) return `No suspender ${h.label} durante el DOAC (riesgo de sangrado uterino anormal, OCHMO p.12).`;
    if (h.vteRisk === "LOW_NO_INCREASE") return `${h.label}: riesgo de TEV bajo/sin aumento (tabla OCHMO p.6); el brief no indica retirarlo.`;
    return `${h.label}: hormona de mayor riesgo de TEV (${h.relativeRisk}, tabla OCHMO p.6).`;
  }
  function evaluateVteAlgorithm(finding, profile) {
    const stasis = finding.flowPattern === "stagnant";
    const riskFactorsPresent = riskFactorsOf(profile);
    if (finding.thrombus) {
      return {
        branch: "TREATMENT",
        status: "RED",
        stasis,
        riskFactorsPresent,
        regimen: APIXABAN.treatment,
        regimenSummary: formatRegimen(APIXABAN.treatment),
        evaAuthorized: false,
        aredAuthorized: false,
        restrictionDays: THROMBOSIS_OPERATIONS.restrictEvaDays,
        landingWashoutHours: LANDING_WASHOUT_HOURS.treatment,
        hormoneAction: hormoneActionFor(profile.hormone, true),
        actions: [
          `Restringir EVA y ARED durante al menos ${THROMBOSIS_OPERATIONS.restrictEvaDays} d\xEDas.`,
          `${THROMBOSIS_OPERATIONS.allowedExercise}.`,
          `Si est\xE1 cl\xEDnicamente estable, favorecer permanecer en \xF3rbita \u2265${THROMBOSIS_OPERATIONS.favorRemainOnOrbitDays} d\xEDas para completar la terapia.`,
          `Suspender Apixaban al menos ${LANDING_WASHOUT_HOURS.treatment} h antes del aterrizaje.`
        ],
        citations: [APIXABAN.treatmentCitation, THROMBOSIS_OPERATIONS.citation, LANDING_WASHOUT_HOURS.citation, ESTROGEN_COC_WITH_DOAC.citation]
      };
    }
    if (finding.flowPattern === null) {
      throw new Error("evaluateVteAlgorithm: sin trombo, el patr\xF3n de flujo es obligatorio para evaluar la estasis.");
    }
    if (!stasis) {
      const retro = finding.flowPattern === "retrograde";
      return {
        branch: "NO_TREATMENT",
        status: "GREEN",
        stasis,
        riskFactorsPresent,
        regimen: [],
        regimenSummary: "Sin tratamiento",
        evaAuthorized: true,
        aredAuthorized: true,
        restrictionDays: null,
        landingWashoutHours: null,
        hormoneAction: hormoneActionFor(profile.hormone, false),
        actions: retro ? ["Flujo retr\xF3grado sin estasis ni trombo: no es contribuyente principal; vigilar por si se forma un trombo."] : ["Sin hallazgos: continuar cribado seg\xFAn calendario."],
        citations: [FLOW_RISK_INTERPRETATION.citation]
      };
    }
    if (riskFactorsPresent.length > 0) {
      return {
        branch: "PROPHYLAXIS",
        status: "YELLOW",
        stasis,
        riskFactorsPresent,
        regimen: APIXABAN.prophylaxis,
        regimenSummary: formatRegimen(APIXABAN.prophylaxis),
        evaAuthorized: true,
        aredAuthorized: true,
        restrictionDays: null,
        landingWashoutHours: LANDING_WASHOUT_HOURS.prophylaxis,
        hormoneAction: hormoneActionFor(profile.hormone, true),
        actions: [`Profilaxis por estasis + factor de riesgo. Suspender ${LANDING_WASHOUT_HOURS.prophylaxis} h antes del aterrizaje.`],
        citations: [APIXABAN.prophylaxisCitation, ALGORITHM_RISK_FACTORS.citation, HORMONE_TABLE_CITATION, LANDING_WASHOUT_HOURS.citation]
      };
    }
    return {
      branch: "INCREASED_MONITORING",
      status: "YELLOW",
      stasis,
      riskFactorsPresent,
      regimen: [],
      regimenSummary: "Sin anticoagulaci\xF3n",
      evaAuthorized: true,
      aredAuthorized: true,
      restrictionDays: null,
      landingWashoutHours: null,
      hormoneAction: hormoneActionFor(profile.hormone, false),
      actions: [STASIS_WITHOUT_RISK_FACTORS.action],
      citations: [STASIS_WITHOUT_RISK_FACTORS.citation, ALGORITHM_RISK_FACTORS.citation]
    };
  }

  // src/nasaMockStream.ts
  var METRIC_KEYS = ["heartRateBpm", "systolicMmHg", "diastolicMmHg", "meanArterialMmHg", "hrvRmssdMs", "sleepHours", "ijvCsaMm2"];
  var MANUAL_VARIABLES = {
    bloodGlucose: {
      label: "Glucosa en sangre",
      units: ["mg/dL", "mmol/L"],
      kind: "number",
      interpretationNote: "Sin interpretar: no hay valores de glucosa en vuelo de acceso abierto (ver packet.unavailable)."
    },
    bodyTemperature: {
      label: "Temperatura corporal",
      units: ["\xB0C"],
      kind: "number",
      interpretationNote: "Sin interpretar: Stahn 2017 solo publica en el texto un aumento de ~1.01 \xB0C frente a la l\xEDnea base, no un rango absoluto."
    },
    mood: {
      label: "Estado de \xE1nimo",
      units: [],
      kind: "text",
      interpretationNote: "Registro de texto libre: no existe una escala de \xE1nimo 1\u20135 validada en datos NASA."
    }
  };
  var MAX_TEXT = 280;
  function validateManualEntry(input) {
    var _a;
    const note = (_a = input.note) != null ? _a : "";
    if (note.length > MAX_TEXT) return `La nota supera ${MAX_TEXT} caracteres.`;
    switch (input.variable) {
      case "bloodGlucose":
        if (!Number.isFinite(input.value)) return "La glucosa debe ser un n\xFAmero.";
        if (input.value <= 0) return "La glucosa debe ser mayor que 0.";
        if (!MANUAL_VARIABLES.bloodGlucose.units.includes(input.unit)) return "Unidad de glucosa no v\xE1lida (mg/dL o mmol/L).";
        return null;
      case "bodyTemperature":
        if (!Number.isFinite(input.value)) return "La temperatura debe ser un n\xFAmero.";
        if (input.unit !== "\xB0C") return "Unidad de temperatura no v\xE1lida (\xB0C).";
        return null;
      case "mood":
        if (!input.text || !input.text.trim()) return "Describe el estado de \xE1nimo.";
        if (input.text.length > MAX_TEXT) return `El texto supera ${MAX_TEXT} caracteres.`;
        return null;
      default:
        return "Variable no reconocida.";
    }
  }
  var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  var round = (v, d) => {
    const k = Math.pow(10, d);
    return Math.round(v * k) / k;
  };
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var provenanceOf = (m) => ({
    sourceId: m.source.id,
    citation: m.source.citation,
    doi: m.source.doi,
    url: m.source.url,
    quote: m.quote,
    center: m.center,
    unit: m.unit,
    decimals: m.decimals,
    intervalType: m.intervalType,
    interval: m.interval,
    n: m.n,
    timepoint: m.timepoint
  });
  function toMedication(d) {
    var _a;
    const labels = d.branch === "TREATMENT" ? ["D\xEDas 1\u20137", "Despu\xE9s de 7 d\xEDas"] : ["Profilaxis"];
    return {
      drug: d.regimen.length ? "Apixaban" : null,
      regimen: d.branch === "TREATMENT" ? "TREATMENT" : d.branch === "PROPHYLAXIS" ? "PROPHYLAXIS" : "NONE",
      phases: d.regimen.map((p, i) => {
        var _a2;
        return { doseMg: p.doseMg, intervalHours: 24 / p.timesPerDay, durationDays: p.durationDays, label: (_a2 = labels[i]) != null ? _a2 : "" };
      }),
      summary: d.regimenSummary,
      rationale: (_a = d.actions[0]) != null ? _a : "",
      hormonalTherapyAction: d.hormoneAction,
      preLandingWashoutHours: d.landingWashoutHours
    };
  }
  function ochmoCountermeasures(d) {
    const byPage = (p) => {
      var _a;
      return (_a = d.citations.find((c) => c.page === p)) != null ? _a : d.citations[0];
    };
    switch (d.branch) {
      case "INCREASED_MONITORING":
        return [
          { id: "ochmo-hydration", label: "Asegurar hidrataci\xF3n", detail: '"hydration should be ensured"', category: "HYDRATION", citation: STASIS_WITHOUT_RISK_FACTORS.citation },
          { id: "ochmo-monitoring", label: "Monitorizaci\xF3n m\xE1s frecuente", detail: '"should be monitored more often" (el brief no fija un intervalo)', category: "IMAGING", citation: STASIS_WITHOUT_RISK_FACTORS.citation }
        ];
      case "PROPHYLAXIS":
        return [{ id: "ochmo-prophylaxis", label: d.regimenSummary, detail: "Profilaxis por estasis + factor de riesgo", category: "PHARMA", citation: byPage(12) }];
      case "TREATMENT":
        return [
          { id: "ochmo-treatment", label: d.regimenSummary, detail: "Tratamiento de la trombosis", category: "PHARMA", citation: byPage(12) },
          { id: "ochmo-exercise", label: "T2 / CEVIS sin correas de hombro del arn\xE9s", detail: "EVA y ARED restringidos al menos 30 d\xEDas", category: "EXERCISE", citation: byPage(12) }
        ];
      default:
        return [];
    }
  }
  var PERSISTENCE = 0.75;
  var STEP_FRACTION = 0.45;
  var NasaMockStream = class {
    constructor(opts) {
      this.timer = null;
      this.paused = false;
      this.seq = 0;
      this.listeners = /* @__PURE__ */ new Set();
      this.dev = {};
      this.queue = [];
      this.lastStatus = null;
      this.history = [];
      this.manualLog = [];
      this.manualSeq = 0;
      this.getSnapshot = () => this.snapshot;
      var _a, _b, _c;
      if (!opts || !opts.crew || !opts.scenarios || !opts.measurements || !opts.commsDelay) {
        throw new Error("NasaMockStream: se requiere config con `crew`, `scenarios`, `measurements` y `commsDelay`.");
      }
      for (const k of METRIC_KEYS) {
        if (!opts.measurements[k]) throw new Error(`NasaMockStream: falta la medici\xF3n citada para "${k}".`);
      }
      this.config = opts;
      this.metricSources = Object.fromEntries(METRIC_KEYS.map((k) => [k, provenanceOf(opts.measurements[k])]));
      this.state = (_a = opts.initialState) != null ? _a : "NOMINAL";
      this.intervalMs = (_b = opts.intervalMs) != null ? _b : 1e3;
      this.historySize = (_c = opts.historySize) != null ? _c : 60;
      this.rand = opts.seed != null ? mulberry32(opts.seed) : Math.random;
      for (const k of METRIC_KEYS) this.dev[k] = 0;
      const c = opts.commsDelay;
      this.delaySec = c.minSec + this.rand() * (c.maxSec - c.minSec);
      const now = Date.now();
      const prefill = Math.min(30, this.historySize - 1);
      for (let i = prefill; i > 0; i--) this.history.push(this.generate(now - i * this.intervalMs));
      const first = this.generate(now);
      this.history.push(first);
      this.snapshot = this.buildSnapshot(first);
    }
    /* ---------- API pública ---------- */
    start() {
      if (this.timer || this.paused) return;
      this.timer = setInterval(() => this.tick(), this.intervalMs);
    }
    stop() {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
    }
    pause() {
      this.paused = true;
      this.stop();
      this.publish(this.snapshot.packet);
    }
    resume() {
      this.paused = false;
      this.start();
      this.tick();
    }
    togglePause() {
      if (this.paused) this.resume();
      else this.pause();
    }
    isPaused() {
      return this.paused;
    }
    setSimulationState(next) {
      if (next === this.state) return;
      this.state = next;
      this.tick(true);
    }
    getSimulationState() {
      return this.state;
    }
    setIntervalMs(ms) {
      const v = Math.max(100, ms);
      if (v === this.intervalMs) return;
      this.intervalMs = v;
      if (this.timer) {
        this.stop();
        this.start();
      }
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }
    /**
     * Registra un valor introducido por el astronauta y lo publica de inmediato
     * (también en pausa, sin generar nuevas constantes vitales). Lanza un Error si la entrada no es válida.
     */
    addManualEntry(input, timestamp = Date.now()) {
      var _a;
      const error = validateManualEntry(input);
      if (error) throw new Error(error);
      const meta = MANUAL_VARIABLES[input.variable];
      const entry = {
        id: `MAN-${++this.manualSeq}`,
        variable: input.variable,
        value: input.variable === "mood" ? null : input.value,
        unit: input.variable === "mood" ? null : input.unit,
        text: input.variable === "mood" ? input.text.trim() : null,
        note: ((_a = input.note) == null ? void 0 : _a.trim()) || null,
        recordedAt: timestamp,
        missionDay: this.config.scenarios[this.state].missionDay,
        source: "ASTRONAUT_INPUT",
        interpretation: null,
        interpretationNote: meta.interpretationNote
      };
      this.manualLog = [...this.manualLog, entry];
      this.publish({ ...this.snapshot.packet, manual: this.manualRecords() });
      return entry;
    }
    getManualLog() {
      return this.manualLog;
    }
    manualRecords() {
      const latest = { bloodGlucose: null, bodyTemperature: null, mood: null };
      for (const e of this.manualLog) latest[e.variable] = e;
      return { latest, log: this.manualLog };
    }
    /** Genera y emite un paquete inmediatamente (`force` ignora la pausa). */
    tick(force = false) {
      if (this.paused && !force) return;
      const packet = this.generate(Date.now());
      this.history = [...this.history, packet].slice(-this.historySize);
      this.publish(packet);
    }
    /* ---------- Generación ---------- */
    publish(packet) {
      this.snapshot = this.buildSnapshot(packet);
      this.listeners.forEach((l) => l(this.snapshot));
    }
    buildSnapshot(packet) {
      return { packet, history: this.history, state: this.state, paused: this.paused, intervalMs: this.intervalMs };
    }
    gauss() {
      const u = 1 - this.rand();
      const v = this.rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    /** Valor dentro del intervalo publicado [lo, hi] alrededor del valor central publicado. */
    sample(k) {
      const m = this.config.measurements[k];
      const { lo, hi } = m.interval;
      const sigma = (hi - lo) / 2 * STEP_FRACTION;
      this.dev[k] = clamp(this.dev[k] * PERSISTENCE + sigma * this.gauss(), lo - m.center, hi - m.center);
      return round(clamp(m.center + this.dev[k], lo, hi), m.decimals);
    }
    generate(timestamp) {
      var _a, _b;
      const cfg = this.config;
      const scenario = cfg.scenarios[this.state];
      const v = {};
      for (const k of METRIC_KEYS) v[k] = this.sample(k);
      this.delaySec = clamp(this.delaySec + this.gauss() * 1.5, cfg.commsDelay.minSec, cfg.commsDelay.maxSec);
      const left = { ...scenario.ijvLeft, csaMm2: v.ijvCsaMm2 };
      const decision = evaluateVteAlgorithm({ flowPattern: left.flowPattern, thrombus: left.thrombus }, cfg.crew.vteRisk);
      const screeningDays = IJV_SCREENING.exampleSchedule180dISS.inflightLaunchDays;
      const day = scenario.missionDay;
      const ultrasound = {
        screening: {
          protocolDays: screeningDays,
          nextScreeningDay: (_a = screeningDays.find((d) => d > day)) != null ? _a : null,
          rescanGuidance: decision.branch === "NO_TREATMENT" ? null : STASIS_WITHOUT_RISK_FACTORS.citation.quote,
          citation: IJV_SCREENING.citation
        },
        left,
        right: null,
        indexSide: "LEFT",
        flowPattern: left.flowPattern,
        flowLabel: left.flowPattern ? IJV_FLOW_PATTERNS[left.flowPattern].label : "No reportado en la fuente",
        stasis: decision.stasis,
        thrombus: left.thrombus,
        thrombusSide: left.thrombus ? "LEFT" : null,
        csaMm2: v.ijvCsaMm2
      };
      if (decision.status === "RED" && this.lastStatus !== "RED") {
        const entry = {
          id: `HMD-${cfg.crew.id}-L${day}-${(timestamp % 1048575).toString(16).toUpperCase()}`,
          createdAt: timestamp,
          etaEarthAt: timestamp + this.delaySec * 1e3,
          priority: "MEDEVENT",
          status: "QUEUED",
          summary: `Trombosis IJV izquierda \xB7 ${decision.regimenSummary}`
        };
        this.queue = [...this.queue, entry].slice(-10);
      }
      this.lastStatus = decision.status;
      this.queue = this.queue.map((q) => ({
        ...q,
        status: timestamp >= q.etaEarthAt ? "DELIVERED" : timestamp > q.createdAt + 2e3 ? "IN_FLIGHT" : "QUEUED"
      }));
      const delay = Math.round(this.delaySec);
      return {
        seq: ++this.seq,
        timestamp,
        state: this.state,
        status: decision.status,
        missionDay: day,
        missionDayLabel: scenario.missionDayLabel,
        astronaut: cfg.crew,
        vitals: {
          heartRateBpm: v.heartRateBpm,
          bloodPressure: { systolic: v.systolicMmHg, diastolic: v.diastolicMmHg, map: v.meanArterialMmHg }
        },
        neuro: { hrvRmssdMs: v.hrvRmssdMs, sleepHours: v.sleepHours },
        ultrasound,
        clinical: decision,
        flightRules: {
          evaAuthorized: decision.evaAuthorized,
          aredAuthorized: decision.aredAuthorized,
          restrictionDays: decision.restrictionDays,
          notes: decision.actions
        },
        medication: toMedication(decision),
        countermeasures: ochmoCountermeasures(decision),
        comms: {
          oneWayDelaySec: delay,
          roundTripSec: delay * 2,
          mode: "LOCAL_AUTONOMOUS",
          queue: this.queue,
          basis: { min: cfg.commsDelay.minBasis, max: cfg.commsDelay.maxBasis }
        },
        metricSources: this.metricSources,
        scenarioEvidence: scenario.evidence,
        unavailable: (_b = cfg.unavailable) != null ? _b : [],
        manual: this.manualRecords(),
        provenance: {
          clinicalRules: `${OCHMO_MTB_007.id} rev ${OCHMO_MTB_007.revision}`,
          crewProfile: cfg.crew.source,
          measurements: "PUBLISHED_INFLIGHT_DATA",
          temporalDynamics: "SYNTHETIC_WITHIN_PUBLISHED_INTERVAL"
        }
      };
    }
  };
  var singleton = null;
  function initNasaStream(opts) {
    if (singleton) singleton.stop();
    singleton = new NasaMockStream(opts);
    return singleton;
  }
  function getNasaStream() {
    if (!singleton) throw new Error("NasaMockStream no inicializado: llama a initNasaStream(config) primero.");
    return singleton;
  }
  var formatDelay = (sec) => `${Math.floor(sec / 60)}m ${String(Math.round(sec % 60)).padStart(2, "0")}s`;
  var STATE_LABELS = {
    NOMINAL: "Nominal (Verde)",
    PRETHROMBOTIC: "Estasis Pre-tromb\xF3tica (Amarillo)",
    EMERGENCY_THROMBOSIS: "Trombo IJV (Rojo)"
  };
  var FLOW_LABELS = {
    antegrade: "Anter\xF3grado",
    stagnant: "Estancado (estasis)",
    retrograde: "Retr\xF3grado"
  };

  // src/reference/literature.ts
  var SOURCES = {
    NORSK_2015: {
      id: "NORSK_2015",
      citation: "Norsk P, Asmar A, Damgaard M, Christensen NJ. Fluid shifts, vasodilatation and ambulatory blood pressure reduction during long duration spaceflight. J Physiol. 2015;593(3):573\u2013584.",
      doi: "10.1113/jphysiol.2014.284869",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4324706/",
      verifiedAgainst: "FULL_TEXT_PMC"
    },
    OTSUKA_2019: {
      id: "OTSUKA_2019",
      citation: "Otsuka K, Cornelissen G, Kubo Y, Shibata K, Mizuno K, Ohshima H, Furukawa S, Mukai C. Anti-aging effects of long-term space missions, estimated by heart rate variability. Sci Rep. 2019;9:8995.",
      doi: "10.1038/s41598-019-45387-6",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6586662/",
      verifiedAgainst: "FULL_TEXT_PMC"
    },
    BARGER_2014: {
      id: "BARGER_2014",
      citation: "Barger LK, Flynn-Evans EE, Kubey A, Walsh L, Ronda JM, Wang W, Wright KP Jr, Czeisler CA. Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight: an observational study. Lancet Neurol. 2014;13(9):904\u2013912.",
      doi: "10.1016/S1474-4422(14)70122-X",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/",
      verifiedAgainst: "FULL_TEXT_PMC"
    },
    MARSHALL_GOEBEL_2019: {
      id: "MARSHALL_GOEBEL_2019",
      citation: "Marshall-Goebel K, Laurie SS, Alferova IV, et al. Assessment of jugular venous blood flow stasis and thrombosis during spaceflight. JAMA Netw Open. 2019;2(11):e1915011.",
      doi: "10.1001/jamanetworkopen.2019.15011",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6902784/",
      verifiedAgainst: "FULL_TEXT_PMC"
    },
    NASA_M2M_COMMS_2023: {
      id: "NASA_M2M_COMMS_2023",
      citation: "NASA. Mars Communications Disruption and Delay. 2023 Moon to Mars Architecture Concept Review, white paper.",
      doi: null,
      url: "https://www.nasa.gov/wp-content/uploads/2024/01/mars-communications-disruption-and-delay.pdf",
      verifiedAgainst: "NASA_PDF"
    },
    NASA_BLOG_MARS_2018: {
      id: "NASA_BLOG_MARS_2018",
      citation: "Harbaugh JA. Go Outside and See Mars! NASA Watch the Skies blog, 30 Jul 2018.",
      doi: null,
      url: "https://www.nasa.gov/blogs/watch-the-skies/2018/07/30/go-outside-and-see-mars/",
      verifiedAgainst: "NASA_WEB_PAGE"
    },
    NASA_BLOG_MARS_2020: {
      id: "NASA_BLOG_MARS_2020",
      citation: "Davis LD. It's All About Mars in October. NASA Watch the Skies blog, 9 Oct 2020.",
      doi: null,
      url: "https://www.nasa.gov/blogs/watch-the-skies/2020/10/09/its-all-about-mars-in-october/",
      verifiedAgainst: "NASA_WEB_PAGE"
    },
    SI_BROCHURE_2019: {
      id: "SI_BROCHURE_2019",
      citation: "BIPM. The International System of Units (SI), 9th ed., 2019: c = 299 792 458 m/s (exacta por definici\xF3n). Milla internacional = 1609.344 m (exacta, acuerdo internacional de 1959; NIST SP 811).",
      doi: null,
      url: "https://www.bipm.org/en/publications/si-brochure",
      verifiedAgainst: "SI_DEFINITION"
    }
  };
  var pm = (c, d) => ({ lo: c - d, hi: c + d });
  var INFLIGHT_MEASUREMENTS = {
    heartRateBpm: {
      variable: "Frecuencia card\xEDaca (ambulatoria, periodo diurno)",
      unit: "bpm",
      center: 64,
      interval: pm(64, 3),
      intervalType: "MEAN_SEM",
      decimals: 0,
      n: 8,
      population: "Astronautas varones de la ISS",
      timepoint: "Registro de 24 h entre los d\xEDas de vuelo 85 y 192",
      condition: "Periodo diurno ambulatorio en vuelo",
      source: SOURCES.NORSK_2015,
      quote: "the in-flight ambulatory day-time period (64 \xB1 3 beats min\u20131; P = 0.034)"
    },
    systolicMmHg: {
      variable: "Presi\xF3n arterial sist\xF3lica (media de 24 h)",
      unit: "mmHg",
      center: 121,
      interval: pm(121, 2),
      intervalType: "MEAN_SEM",
      decimals: 0,
      n: 8,
      population: "Astronautas varones de la ISS",
      timepoint: "Registro de 24 h entre los d\xEDas de vuelo 85 y 192",
      condition: "Presi\xF3n braquial ambulatoria de 24 h",
      source: SOURCES.NORSK_2015,
      quote: "The mean systolic arterial pressure of the 24 h period decreased from 129 \xB1 2 mmHg (mean \xB1 sem) to 121 \xB1 2 mmHg"
    },
    diastolicMmHg: {
      variable: "Presi\xF3n arterial diast\xF3lica (media de 24 h)",
      unit: "mmHg",
      center: 76,
      interval: pm(76, 2),
      intervalType: "MEAN_SEM",
      decimals: 0,
      n: 8,
      population: "Astronautas varones de la ISS",
      timepoint: "Registro de 24 h entre los d\xEDas de vuelo 85 y 192",
      condition: "Presi\xF3n braquial ambulatoria de 24 h",
      source: SOURCES.NORSK_2015,
      quote: "diastolic arterial pressure from 85 \xB1 2 mmHg to 76 \xB1 2 mmHg"
    },
    meanArterialMmHg: {
      variable: "Presi\xF3n arterial media (media de 24 h)",
      unit: "mmHg",
      center: 92,
      interval: pm(92, 1),
      intervalType: "MEAN_SEM",
      decimals: 0,
      n: 8,
      population: "Astronautas varones de la ISS",
      timepoint: "Registro de 24 h entre los d\xEDas de vuelo 85 y 192",
      condition: "Presi\xF3n braquial ambulatoria de 24 h",
      source: SOURCES.NORSK_2015,
      quote: "mean arterial pressure from 102 \xB1 3 mmHg to 92 \xB1 1 mmHg"
    },
    hrvRmssdMs: {
      variable: "Variabilidad de la frecuencia card\xEDaca (r-MSSD)",
      unit: "ms",
      center: 29.7,
      interval: pm(29.7, 14.5),
      intervalType: "MEAN_SD",
      decimals: 1,
      n: 7,
      population: "Astronautas de la ISS (6 varones, 1 mujer)",
      timepoint: "ISS01: 20.6 \xB1 2.7 d\xEDas tras el lanzamiento (rango 18\u201325)",
      condition: "ECG ambulatorio de 48 h; d\xEDas geomagn\xE9ticamente tranquilos",
      source: SOURCES.OTSUKA_2019,
      quote: "Table 2, r-MSSD, ISS01 (n = 7), Quiet: mean 29.7, SD 14.5 (msec)"
    },
    sleepHours: {
      variable: "Duraci\xF3n del sue\xF1o por noche (actigraf\xEDa)",
      unit: "h",
      center: 6.09,
      interval: pm(6.09, 0.67),
      intervalType: "MEAN_SD",
      decimals: 2,
      n: 21,
      population: "Astronautas de la ISS (13 expediciones)",
      timepoint: "3248 d\xEDas en vuelo",
      condition: "Actigraf\xEDa durante misiones de larga duraci\xF3n",
      source: SOURCES.BARGER_2014,
      quote: "crewmembers aboard long-duration ISS missions also averaged 6\xB709 \xB1 0\xB767 h per night"
    },
    ijvCsaMm2: {
      variable: "\xC1rea de secci\xF3n transversal de la IJV izquierda",
      unit: "mm\xB2",
      center: 70.3,
      interval: { lo: 59.3, hi: 81.2 },
      intervalType: "CI95",
      decimals: 1,
      n: 11,
      population: "Tripulantes de la ISS",
      timepoint: "D\xEDa de vuelo ~50 (rango 33\u201363)",
      condition: "Ecograf\xEDa de la IJV izquierda en vuelo",
      source: SOURCES.MARSHALL_GOEBEL_2019,
      quote: "70.3 [95% CI, 59.3-81.2] mm2"
    }
  };
  var IJV_FLOW_GRADES = {
    1: { pattern: "antegrade", quote: "nominal continuous forward flow (ie, head to heart direction) was scored as grade 1" },
    2: { pattern: "antegrade", quote: "nominal forward flow with pulsatility was scored as grade 2" },
    3: { pattern: "stagnant", quote: "stagnant flow was scored as grade 3" },
    4: { pattern: "retrograde", quote: "reverse flow toward the head was scored as grade 4" }
  };
  var IJV_FINDINGS_FD50 = {
    sessionTiming: { quote: "approximately 50 (range, 33-63) days into spaceflight", source: SOURCES.MARSHALL_GOEBEL_2019 },
    stagnantFlow: { quote: "in 5 of 11 crew members (45%) on flight day 50", source: SOURCES.MARSHALL_GOEBEL_2019 },
    stagnantOrReverse: { quote: "stagnant or reverse flow in the IJV was observed in 6 crew members (55%) on approximate flight day 50", source: SOURCES.MARSHALL_GOEBEL_2019 },
    occlusiveThrombus: { quote: "1 crew member developed an occlusive thrombus that was discovered on flight day 50", source: SOURCES.MARSHALL_GOEBEL_2019 },
    onlyLeftImaged: { quote: "only the left IJV was imaged as part of this study", source: SOURCES.MARSHALL_GOEBEL_2019 }
  };
  var SPEED_OF_LIGHT_KM_S = 299792.458;
  var KM_PER_MILE = 1.609344;
  var EARTH_MARS_DISTANCE = {
    min: {
      miles: 339e5,
      quote: "The minimum distance from the Earth to Mars is about 33.9 million miles and does not happen very often.",
      source: SOURCES.NASA_BLOG_MARS_2018
    },
    max: {
      km: 4e8,
      quote: "At its furthest, Mars reaches about 250 million miles (400 million km) from Earth.",
      source: SOURCES.NASA_BLOG_MARS_2020
    }
  };
  var lightTimeSec = (km) => km / SPEED_OF_LIGHT_KM_S;
  var MARS_COMMS_DELAY = {
    minOneWaySec: Math.round(lightTimeSec(EARTH_MARS_DISTANCE.min.miles * KM_PER_MILE)),
    maxOneWaySec: Math.round(lightTimeSec(EARTH_MARS_DISTANCE.max.km)),
    derivation: "distancia publicada por la NASA / c (SI, exacta)",
    corroboration: {
      quote: "maximum one-way communications delay of 22 minutes",
      context: "Figura 2: misi\xF3n de ida y vuelta de 850 d\xEDas, estancia corta (la Figura 3, de ~1000 d\xEDas, da un m\xE1ximo de 21 min)",
      source: SOURCES.NASA_M2M_COMMS_2023
    },
    constants: SOURCES.SI_BROCHURE_2019
  };
  var UNAVAILABLE_VARIABLES = [
    {
      variable: "Temperatura corporal absoluta (\xB0C)",
      reason: "Stahn et al. 2017 (Sci Rep 7:16180) solo da en el texto el aumento (~1.01 \xB0C frente a la l\xEDnea base); los valores absolutos est\xE1n solo en una figura. No se simula: se registra a mano (packet.manual)."
    },
    {
      variable: "Glucosa en sangre en vuelo",
      reason: "Hughson et al. 2016 (Am J Physiol Heart Circ Physiol 310:H628) la midi\xF3, pero el texto completo no es de acceso abierto; no hay ning\xFAn valor verificado. No se simula: se registra a mano (packet.manual)."
    },
    {
      variable: "Cortisol en sudor",
      reason: "No hay valores publicados en astronautas; los sensores de sudor no se han probado en el espacio (Trusso Sfrazzetto 2022, Nanomaterials 12:3790)."
    },
    {
      variable: "Puntuaci\xF3n de \xE1nimo 1\u20135",
      reason: "No existe una escala de \xE1nimo 1\u20135 validada en datos NASA (el POMS da subescalas; Basner 2014, PLoS ONE 9:e93298, es un an\xE1logo). Se registra como texto libre (packet.manual)."
    },
    {
      variable: "Readiness Score",
      reason: "\xCDndice compuesto sin definici\xF3n publicada."
    },
    {
      variable: "Valores fisiol\xF3gicos espec\xEDficos de cada estado (verde/amarillo/rojo)",
      reason: "Ninguna fuente asocia la estasis o la trombosis de la IJV con cambios de FC, PA, HRV o sue\xF1o; las constantes vitales usan los mismos valores en vuelo en todos los escenarios."
    }
  ];

  // src/reference/scenarios.ts
  var MG = IJV_FINDINGS_FD50;
  var grade = (g) => ({ quote: IJV_FLOW_GRADES[g].quote, source: MG.sessionTiming.source });
  var EVIDENCE_SCENARIOS = {
    NOMINAL: {
      missionDay: 50,
      missionDayLabel: "L+~50 (rango 33\u201363)",
      ijvLeft: { flowGrade: 1, flowPattern: "antegrade", thrombus: false, occlusive: false },
      description: "Flujo anter\xF3grado continuo (grado 1), como en los 5 de 11 tripulantes sin flujo estancado ni inverso en el d\xEDa de vuelo ~50.",
      evidence: [MG.sessionTiming, MG.stagnantOrReverse, grade(1)]
    },
    PRETHROMBOTIC: {
      missionDay: 50,
      missionDayLabel: "L+~50 (rango 33\u201363)",
      ijvLeft: { flowGrade: 3, flowPattern: "stagnant", thrombus: false, occlusive: false },
      description: "Flujo estancado (grado 3), observado en 5 de 11 tripulantes en el d\xEDa de vuelo ~50.",
      evidence: [MG.sessionTiming, MG.stagnantFlow, grade(3)]
    },
    EMERGENCY_THROMBOSIS: {
      missionDay: 50,
      missionDayLabel: "L+50",
      ijvLeft: { flowGrade: null, flowPattern: null, thrombus: true, occlusive: true },
      description: "Trombo oclusivo en la IJV izquierda descubierto en el d\xEDa de vuelo 50. La fuente no publica el grado de flujo de ese caso.",
      evidence: [MG.occlusiveThrombus, MG.onlyLeftImaged]
    }
  };

  // src/demo/demoScenario.ts
  var DEMO_ASTRONAUT = {
    id: "ASTRO-04",
    name: "Dra. Elena Vance",
    mission: "Artemis IV / Mars Transit",
    role: "Especialista de Misi\xF3n",
    source: "FICTIONAL_DEMO",
    vteRisk: {
      thrombophilia: false,
      familyHistoryUnprovokedVTE: false,
      hormone: "LNG_IUD"
    }
  };
  var DEMO_COMMS_DELAY = {
    minSec: MARS_COMMS_DELAY.minOneWaySec,
    maxSec: MARS_COMMS_DELAY.maxOneWaySec,
    minBasis: `${EARTH_MARS_DISTANCE.min.source.citation} "${EARTH_MARS_DISTANCE.min.quote}" \u2192 33.9e6 mi \xD7 1.609344 km/mi / c`,
    maxBasis: `${EARTH_MARS_DISTANCE.max.source.citation} "${EARTH_MARS_DISTANCE.max.quote}" \u2192 400e6 km / c. Corroborado: ${MARS_COMMS_DELAY.corroboration.source.citation} "${MARS_COMMS_DELAY.corroboration.quote}"`
  };
  var DEMO_STREAM_CONFIG = {
    crew: DEMO_ASTRONAUT,
    scenarios: EVIDENCE_SCENARIOS,
    measurements: INFLIGHT_MEASUREMENTS,
    commsDelay: DEMO_COMMS_DELAY,
    unavailable: UNAVAILABLE_VARIABLES
  };

  // src/igc/innerGroundAdapter.ts
  var BODY_NECK = 2;
  var MOOD_LABELS = ["Very good", "Good", "So-so", "Low", "Very low"];
  var RING_FILL = { ok: 1, warn: 0.62, care: 0.3, none: 0.06 };
  var METRIC_META = {
    heartRateBpm: { name: "Heart rate", short: "HR", device: "Wearable \xB7 daytime", pick: (p) => p.vitals.heartRateBpm },
    systolicMmHg: { name: "Systolic pressure", short: "SBP", device: "Ambulatory cuff", pick: (p) => p.vitals.bloodPressure.systolic },
    diastolicMmHg: { name: "Diastolic pressure", short: "DBP", device: "Ambulatory cuff", pick: (p) => p.vitals.bloodPressure.diastolic },
    meanArterialMmHg: { name: "Mean arterial pressure", short: "MAP", device: "Ambulatory cuff", pick: (p) => p.vitals.bloodPressure.map },
    hrvRmssdMs: { name: "Heart rate variability", short: "HRV", device: "Wearable ECG \xB7 rMSSD", pick: (p) => p.neuro.hrvRmssdMs },
    sleepHours: { name: "Sleep", short: "Sleep", device: "Actigraphy \xB7 last night", pick: (p) => p.neuro.sleepHours },
    ijvCsaMm2: { name: "Left jugular vein area", short: "IJV area", device: "Neck ultrasound \xB7 CSA", pick: (p) => p.ultrasound.csaMm2 }
  };
  var METRIC_ORDER = ["heartRateBpm", "systolicMmHg", "diastolicMmHg", "meanArterialMmHg", "hrvRmssdMs", "sleepHours", "ijvCsaMm2"];
  var INTERVAL_LABEL = { MEAN_SEM: "mean \xB1 SEM", MEAN_SD: "mean \xB1 SD", CI95: "95% CI" };
  function shortCitation(citation) {
    const author = (citation.match(/^([A-Za-zÀ-ÿ'-]+)/) || [, "Source"])[1];
    const year = (citation.match(/\b(19|20)\d{2}\b/) || [""])[0];
    return year ? `${author} ${year}` : author;
  }
  var fmt = (v, d) => v.toFixed(d);
  function formatDuration(sec) {
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    return m ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`;
  }
  function metricView(p, history, key) {
    const meta = METRIC_META[key];
    const src = p.metricSources[key];
    const value = meta.pick(p);
    const { lo, hi } = src.interval;
    const label = INTERVAL_LABEL[src.intervalType];
    const d = src.decimals;
    return {
      key,
      name: meta.name,
      short: meta.short,
      device: meta.device,
      unit: src.unit,
      value,
      display: fmt(value, d),
      history: history.map(meta.pick),
      withinPublished: value >= lo && value <= hi,
      ref: { center: src.center, lo, hi, intervalLabel: label, n: src.n },
      refText: src.intervalType === "CI95" ? `ISS crews ${fmt(src.center, d)} ${src.unit} (95% CI ${fmt(lo, d)}\u2013${fmt(hi, d)}, n=${src.n})` : `ISS crews ${fmt(src.center, d)} \xB1 ${fmt((hi - lo) / 2, d)} ${src.unit} (${label}, n=${src.n})`,
      cite: { short: shortCitation(src.citation), full: src.citation, url: src.url, quote: src.quote, doi: src.doi }
    };
  }
  function mindStatus(c) {
    const basis = "Self-report check-in";
    if (!c) return { word: "No check-in", cls: "none", basis: "Not inferred from wearables" };
    if (c.mood >= 3 || c.tension === 2 && c.rest === 2) return { word: "Needs care", cls: "care", basis };
    if (c.mood === 2 || c.tension >= 1 || c.rest >= 1) return { word: "Strained", cls: "warn", basis };
    return { word: "Good", cls: "ok", basis };
  }
  function heartStatus(p) {
    const basis = `${p.provenance.clinicalRules} \xB7 left IJV ultrasound`;
    if (p.status === "RED") return { word: "Needs care", cls: "care", basis };
    if (p.status === "YELLOW") return { word: "Watch", cls: "warn", basis };
    return { word: "Good", cls: "ok", basis };
  }
  function overallStatus(p, mind) {
    const basis = "OCHMO status first, then self-report";
    if (p.status === "RED") return { word: "Needs attention", cls: "care", basis };
    if (p.status === "YELLOW") return { word: "Under watch", cls: "warn", basis };
    if (mind.cls === "care") return { word: "Needs care", cls: "care", basis };
    if (mind.cls === "warn") return { word: "Under strain", cls: "warn", basis };
    return { word: "In sync", cls: "ok", basis };
  }
  function flowText(p) {
    const l = p.ultrasound.left;
    if (l.thrombus) return { flow: l.occlusive ? "Occlusive clot" : "Clot", grade: "Flow grade not reported by the source" };
    const flow = l.flowPattern === "antegrade" ? "Forward (antegrade)" : l.flowPattern === "stagnant" ? "Stagnant (stasis)" : l.flowPattern === "retrograde" ? "Reverse (retrograde)" : "Not reported";
    return { flow, grade: l.flowGrade ? `Grade ${l.flowGrade} (Marshall-Goebel 2019 scale)` : "Grade not reported" };
  }
  function regimenText(p) {
    const ph = p.medication.phases;
    if (!p.medication.drug || !ph.length) return null;
    const times = (h) => h === 12 ? "twice a day" : `every ${h} h`;
    return `${p.medication.drug} ${ph.map((x) => `${x.doseMg} mg ${times(x.intervalHours)}${x.durationDays ? ` for ${x.durationDays} days` : ""}`).join(", then ")}`;
  }
  function vascularView(p) {
    var _a, _b, _c, _d;
    const c = p.clinical;
    const ft = flowText(p);
    const restrictions = [];
    if (!c.evaAuthorized) restrictions.push({ icon: "astronaut", title: "Spacewalks (EVA) paused", detail: c.restrictionDays ? `For at least ${c.restrictionDays} days, then the Flight Surgeon decides.` : "Until the Flight Surgeon clears you." });
    if (!c.aredAuthorized) restrictions.push({ icon: "dumbbell", title: "Resistive exercise (ARED) paused", detail: c.restrictionDays ? `For at least ${c.restrictionDays} days.` : "Until the Flight Surgeon clears you." });
    return {
      finding: p.ultrasound.thrombus ? "THROMBUS" : p.ultrasound.stasis ? "STASIS" : "NORMAL",
      flowText: ft.flow,
      gradeText: ft.grade,
      csaText: `${fmt(p.ultrasound.csaMm2, p.metricSources.ijvCsaMm2.decimals)} mm\xB2`,
      branch: c.branch,
      restrictions,
      allowedExercise: c.branch === "TREATMENT" ? "Treadmill (T2) and cycle (CEVIS) can be considered with the harness shoulder straps removed." : null,
      regimenText: regimenText(p),
      firstDoseMg: (_b = (_a = p.medication.phases[0]) == null ? void 0 : _a.doseMg) != null ? _b : null,
      doseIntervalHours: (_d = (_c = p.medication.phases[0]) == null ? void 0 : _c.intervalHours) != null ? _d : null,
      washoutText: p.medication.preLandingWashoutHours ? `Stop ${p.medication.drug} at least ${p.medication.preLandingWashoutHours} h before landing.` : null,
      evidence: p.scenarioEvidence.map((e) => ({ quote: e.quote, cite: shortCitation(e.source.citation) })),
      ochmoQuotes: c.citations.map((x) => ({ page: x.page, quote: x.quote }))
    };
  }
  function sentence(p, c, v) {
    if (v.finding === "THROMBUS") return "Ultrasound shows a clot blocking your left jugular vein. That comes first today: the guided protocol takes about 5 minutes.";
    if (v.finding === "STASIS") {
      return p.clinical.branch === "PROPHYLAXIS" ? `Blood in your left jugular vein is stagnant and you have a risk factor. NASA protocol: preventive ${v.regimenText}.` : "Blood in your left jugular vein is stagnant. NASA protocol: no medication for you, but drink enough water and get scanned more often.";
    }
    if (c && c.body.includes(BODY_NECK)) return "You noticed discomfort in your neck. A quick check rules out problems in your jugular vein.";
    if (c && c.tension === 2) return "You feel a lot of tension. Breathing slowly for a few minutes can help.";
    if (c && c.mood >= 3) return "Your neck scan is clear, but your mood is low. Looking after your mind today matters too.";
    if (!c) return "Your neck scan is clear and your wearable readings sit inside the range measured on ISS crews. Check in to add how you feel.";
    return "Neck scan clear, wearable readings inside the ISS in-flight range, and you feel fine.";
  }
  function chips(p, v, metrics) {
    const out = [];
    if (v.finding === "THROMBUS") out.push({ cls: "care", icon: "scan", text: "Left jugular vein: occlusive clot" });
    if (v.finding === "STASIS") out.push({ cls: "warn", icon: "wave", text: "Left jugular flow: stagnant (grade 3)" });
    if (!p.clinical.evaAuthorized) out.push({ cls: "care", icon: "astronaut", text: `EVA and ARED paused \u2265${p.clinical.restrictionDays} days` });
    const outside = metrics.filter((m) => !m.withinPublished);
    outside.forEach((m) => out.push({ cls: "warn", icon: "dot", text: `${m.short} outside ISS in-flight range` }));
    if (!out.length) out.push({ cls: "ok", icon: "check", text: "All readings inside the ISS in-flight range" });
    return out;
  }
  function toolReasons(p, c, v) {
    return {
      vascular: v.finding === "THROMBUS" ? "Ultrasound found a clot in your left jugular vein (OCHMO-MTB-007: treat)." : v.finding === "STASIS" ? "Stagnant flow in your left jugular vein. The protocol asks for closer monitoring." : c && c.body.includes(BODY_NECK) ? "You noticed a swollen or sore neck." : null,
      breathe: c && c.tension >= 1 ? "You said you feel tense. A few slow minutes can help." : null,
      noise: c && c.rest === 2 ? "You said you rested badly." : null,
      voice: c && c.mood >= 2 ? "Saying it out loud helps you sort out your day." : null,
      talk: !c ? null : c.mood >= 3 ? "Your flight psychologist can listen in the next comms window." : c.tension === 2 && c.rest === 2 ? "Tension and poor rest at the same time. Better not to carry it alone." : null
    };
  }
  var UNAVAILABLE_EN = [
    { match: /cortisol/i, name: "Sweat cortisol", reason: "No published values in astronauts; sweat sensors not yet flown.", manual: false },
    { match: /temperatura/i, name: "Body temperature", reason: "No absolute in-flight range in the text of the source. Log it by hand.", manual: true },
    { match: /glucosa/i, name: "Blood glucose", reason: "No open-access in-flight values. Log it by hand.", manual: true },
    { match: /readiness/i, name: "Readiness score", reason: "Composite index with no published definition.", manual: false },
    { match: /ánimo/i, name: "Mood score (1\u20135)", reason: "No validated 1\u20135 mood scale in NASA data. Your check-in mood is logged as free text.", manual: false },
    { match: /cada estado/i, name: "State-specific vital signs", reason: "No source links jugular stasis or a clot to changes in heart rate, pressure, HRV or sleep, so vitals keep the same in-flight values in every state.", manual: false },
    { match: /derecha/i, name: "Right jugular vein", reason: "The source study imaged only the left side.", manual: false }
  ];
  function buildIgcView(packet, history, checkin) {
    const p = packet;
    const metrics = METRIC_ORDER.map((k) => metricView(p, history, k));
    const v = vascularView(p);
    const mind = mindStatus(checkin);
    const heart = heartStatus(p);
    const unavailable = p.unavailable.map((u) => {
      const en = UNAVAILABLE_EN.find((x) => x.match.test(u.variable));
      return en ? { name: en.name, reason: en.reason, manual: en.manual } : { name: u.variable, reason: u.reason, manual: false };
    });
    return {
      packet: p,
      status: p.status,
      overall: overallStatus(p, mind),
      mind,
      heart,
      ring: { mind: RING_FILL[mind.cls], heart: RING_FILL[heart.cls] },
      sentence: sentence(p, checkin, v),
      chips: chips(p, v, metrics),
      alert: p.status === "RED",
      metrics,
      unavailable,
      tools: toolReasons(p, checkin, v),
      vascular: v,
      comms: {
        oneWaySec: p.comms.oneWayDelaySec,
        oneWayText: formatDuration(p.comms.oneWayDelaySec),
        roundTripText: formatDuration(p.comms.roundTripSec),
        queue: p.comms.queue
      },
      missionDayText: p.state === "EMERGENCY_THROMBOSIS" ? `Flight day ${p.missionDay}` : `Flight day ~${p.missionDay}`,
      screening: {
        protocolDays: [...p.ultrasound.screening.protocolDays],
        today: p.missionDay,
        next: p.ultrasound.screening.nextScreeningDay,
        guidance: p.ultrasound.screening.rescanGuidance,
        quote: p.ultrasound.screening.citation.quote
      }
    };
  }

  // build/igc-entry.ts
  function createMockStream(opts = {}) {
    return initNasaStream({ ...DEMO_STREAM_CONFIG, intervalMs: 1e3, ...opts });
  }

  // src/vessel/vesselWatchAdapter.ts
  var HORMONE_EN = {
    NONE: "no hormonal therapy",
    PROGESTIN_ONLY_PILL: "progestin-only pill (norethindrone)",
    LNG_IUD: "levonorgestrel IUD (LNG-IUD)",
    ETONOGESTREL_IMPLANT: "etonogestrel implant",
    TESTOSTERONE: "testosterone",
    ESTRADIOL_PATCH: "estradiol patch",
    PREMARIN_ORAL: "oral Premarin",
    MICRONIZED_PROGESTERONE_ORAL: "oral micronized progesterone",
    DMPA_DEPOT: "depot medroxyprogesterone",
    COC_1ST_GEN: "1st-generation combined pill",
    COC_2ND_GEN: "2nd-generation combined pill (levonorgestrel)",
    COC_3RD_GEN: "3rd-generation combined pill",
    COC_4TH_GEN: "4th-generation combined pill (drospirenone)"
  };
  var fmt2 = (v, d) => v.toFixed(d);
  var page = (p) => `NASA OCHMO-MTB-007 p.${p}`;
  function crewOf(p) {
    const name = p.astronaut.name.replace(/^Dra?\.\s*/, "Dr. ");
    const firstName = name.replace(/^Dr\.\s*/, "").split(/\s+/)[0];
    return { name, firstName, mission: p.astronaut.mission, role: p.astronaut.role, fictional: p.astronaut.source === "FICTIONAL_DEMO" };
  }
  function tiles(p, d) {
    const m = (key, label, value, group) => {
      const s = p.metricSources[key];
      const iv = s.intervalType === "CI95" ? `95% CI ${fmt2(s.interval.lo, s.decimals)}\u2013${fmt2(s.interval.hi, s.decimals)}` : `${fmt2(s.center, s.decimals)} \xB1 ${fmt2((s.interval.hi - s.interval.lo) / 2, s.decimals)} (${s.intervalType === "MEAN_SEM" ? "mean \xB1 SEM" : "mean \xB1 SD"})`;
      return {
        key,
        label,
        value: fmt2(value, s.decimals),
        unit: s.unit,
        group,
        ref: `ISS crews ${iv} ${s.unit}, n=${s.n}`,
        cite: { short: shortCitation(s.citation), url: s.url, quote: s.quote },
        flag: null
      };
    };
    const bp = p.vitals.bloodPressure;
    const sbp = m("systolicMmHg", "Blood pressure", bp.systolic, "cardio");
    const dbp = p.metricSources.diastolicMmHg;
    sbp.value = `${fmt2(bp.systolic, p.metricSources.systolicMmHg.decimals)}/${fmt2(bp.diastolic, dbp.decimals)}`;
    const sys = p.metricSources.systolicMmHg;
    sbp.ref = `ISS crews ${fmt2(sys.center, sys.decimals)}/${fmt2(dbp.center, dbp.decimals)} ${sys.unit} (24 h, mean \xB1 SEM), n=${sys.n}`;
    const flowFlag = d.status === "RED" ? "alert" : d.status === "YELLOW" ? "watch" : "ok";
    return [
      m("heartRateBpm", "Heart rate", p.vitals.heartRateBpm, "cardio"),
      sbp,
      m("meanArterialMmHg", "Mean arterial pressure", bp.map, "cardio"),
      m("hrvRmssdMs", "HRV (rMSSD)", p.neuro.hrvRmssdMs, "neuro"),
      m("sleepHours", "Sleep last night", p.neuro.sleepHours, "neuro"),
      m("ijvCsaMm2", "Left IJV area", p.ultrasound.csaMm2, "vascular"),
      { key: "flow", label: "Left IJV flow", value: d.ijv.flow, unit: "", group: "vascular", ref: d.ijv.grade, cite: null, flag: flowFlag },
      { key: "stasis", label: "Stasis / thrombus", value: `${p.ultrasound.stasis ? "Stasis" : "No stasis"} \xB7 ${p.ultrasound.thrombus ? "Thrombus" : "No thrombus"}`, unit: "", group: "vascular", ref: null, cite: null, flag: flowFlag }
    ];
  }
  function ijvOf(p) {
    const l = p.ultrasound.left;
    const flow = l.thrombus ? l.occlusive ? "Occlusive clot" : "Clot" : l.flowPattern === "antegrade" ? "Forward (antegrade)" : l.flowPattern === "stagnant" ? "Stagnant (stasis)" : l.flowPattern === "retrograde" ? "Reverse (retrograde)" : "Not reported";
    const grade2 = l.thrombus ? "Flow grade not reported by the source" : l.flowGrade ? `Grade ${l.flowGrade} (Marshall-Goebel 2019 scale)` : "Grade not reported";
    return { flow, grade: grade2, csa: `${fmt2(p.ultrasound.csaMm2, p.metricSources.ijvCsaMm2.decimals)} mm\xB2`, side: "Left (the source imaged only the left side)" };
  }
  function hormoneText(h, onDoac) {
    const label = HORMONE_EN[h];
    if (h === "NONE") return "No hormonal therapy on record.";
    if (onDoac && isEstrogenCOC(h)) return `Do not stop the ${label} during anticoagulation: risk of abnormal uterine bleeding (${page(12)}).`;
    if (HORMONE_TABLE[h].vteRisk === "LOW_NO_INCREASE")
      return `Keep the ${label}: low or no increase in clot risk (${page(6)} table). The protocol does not ask to remove it${onDoac ? " during anticoagulation" : ""}.`;
    return `The ${label} is a higher-risk hormone (${HORMONE_TABLE[h].relativeRisk}, ${page(6)} table). The flight surgeon reviews it.`;
  }
  function regimenPhases(p) {
    const ph = p.medication.phases;
    const every = (h) => `every ${h} h`;
    return ph.map((x, i) => {
      var _a;
      return {
        label: p.medication.regimen === "TREATMENT" ? i === 0 ? `Days 1\u2013${x.durationDays}` : `From day ${((_a = ph[0].durationDays) != null ? _a : 0) + 1}` : "Prophylaxis",
        text: `${p.medication.drug} ${x.doseMg} mg ${every(x.intervalHours)}${x.durationDays ? ` for ${x.durationDays} days` : ""}`
      };
    });
  }
  function buildDecisionView(p) {
    const c = p.clinical;
    const hormone = p.astronaut.vteRisk.hormone;
    const ijv = ijvOf(p);
    const days = c.restrictionDays;
    const flightRules = [
      { id: "EVA", label: "Spacewalks (EVA)", authorized: c.evaAuthorized, text: c.evaAuthorized ? "Authorized" : `Blocked \u2265${days} days` },
      { id: "ARED", label: "Resistive exercise (ARED)", authorized: c.aredAuthorized, text: c.aredAuthorized ? "Authorized" : `Blocked \u2265${days} days` }
    ];
    const washout = p.medication.preLandingWashoutHours ? `Stop ${p.medication.drug} at least ${p.medication.preLandingWashoutHours} h before landing (${page(14)}).` : null;
    const evidence = p.scenarioEvidence.map((e) => ({ quote: e.quote, cite: shortCitation(e.source.citation) }));
    const protocol = p.provenance.clinicalRules;
    const riskNote = c.riskFactorsPresent.length ? `Risk factor on record: ${c.riskFactorsPresent.length} (OCHMO list).` : `No thrombophilia, no family history of unprovoked clots, and ${HORMONE_EN[hormone]} is not a higher-risk hormone.`;
    switch (c.branch) {
      case "TREATMENT":
        return {
          status: "RED",
          statusWord: "Emergency",
          branch: c.branch,
          headline: "Confirmed clot in the left internal jugular vein",
          diagnosis: `Ultrasound shows an ${p.ultrasound.left.occlusive ? "occlusive " : ""}thrombus in the left IJV. OCHMO-MTB-007 treats a clot with an anticoagulant whatever the stasis status.`,
          ijv,
          flightRules,
          operational: `Critical operational restriction: EVA and ARED blocked for at least ${days} days.`,
          prescription: {
            give: true,
            headline: "Start the guided apixaban treatment protocol",
            phases: regimenPhases(p),
            washout,
            hormone: hormoneText(hormone, true)
          },
          care: [
            { label: "Treadmill (T2) and cycle (CEVIS) only", detail: "Can be considered with the harness shoulder straps removed.", basis: page(12), ochmo: true },
            { label: `Favor staying on orbit \u2265${THROMBOSIS_OPERATIONS.favorRemainOnOrbitDays} days`, detail: "If clinically stable, to complete therapy before landing.", basis: page(12), ochmo: true },
            { label: "Medical event queued for Houston", detail: "Ultrasound, decision and regimen go out on the next link; the crew acts locally meanwhile.", basis: "Comms delay, NASA 2023", ochmo: false }
          ],
          evidence,
          protocol
        };
      case "PROPHYLAXIS":
        return {
          status: "YELLOW",
          statusWord: "Watch",
          branch: c.branch,
          headline: "Venous stasis in the left IJV, with a risk factor",
          diagnosis: `Stagnant flow without a clot. ${riskNote}`,
          ijv,
          flightRules,
          operational: "No flight-rule restriction from the protocol.",
          prescription: { give: true, headline: "Preventive apixaban (stasis plus a risk factor)", phases: regimenPhases(p), washout, hormone: hormoneText(hormone, true) },
          care: [{ label: "Ultrasound follow-up", detail: "Rescan as the flight surgeon directs.", basis: page(14), ochmo: true }],
          evidence,
          protocol
        };
      case "INCREASED_MONITORING":
        return {
          status: "YELLOW",
          statusWord: "Pre-thrombotic",
          branch: c.branch,
          headline: "Venous stasis in the left IJV",
          diagnosis: `Stagnant flow (grade 3) without a clot, the most concerning pre-clot sign. ${riskNote}`,
          ijv,
          flightRules,
          operational: "EVA and ARED stay authorized. Closer watch on the neck vein.",
          prescription: {
            give: false,
            headline: "Do not give apixaban: stasis without risk factors",
            phases: [],
            washout: null,
            hormone: hormoneText(hormone, false)
          },
          care: [
            { label: "Forced hydration", detail: "The protocol says hydration should be ensured.", basis: page(12), ochmo: true },
            { label: "More frequent neck ultrasound", detail: "Monitor more often. The protocol does not set an interval; the flight surgeon does.", basis: page(12), ochmo: true },
            { label: "Relaxation session or brown noise", detail: "Comfort and sleep support only. It does not treat or prevent a vein clot.", basis: "Team wellbeing suggestion, not OCHMO", ochmo: false }
          ],
          evidence,
          protocol
        };
      default:
        return {
          status: "GREEN",
          statusWord: "Nominal",
          branch: c.branch,
          headline: "No venous findings",
          diagnosis: p.ultrasound.left.flowPattern === "retrograde" ? "Reverse flow without stasis or clot: not a main contributor; watch in case a clot forms." : "Left IJV with continuous forward flow (grade 1). No stasis and no clot.",
          ijv,
          flightRules,
          operational: "Fully operational: no flight-rule restrictions.",
          prescription: { give: false, headline: "No anticoagulant indicated", phases: [], washout: null, hormone: hormoneText(hormone, false) },
          care: [
            { label: "Routine neck scan schedule", detail: p.ultrasound.screening.nextScreeningDay ? `Next scan on flight day ${p.ultrasound.screening.nextScreeningDay}.` : "Keep the screening schedule.", basis: "OCHMO-STD-100.1A", ochmo: true },
            { label: "Circadian lighting (SSLA)", detail: "Keep the station\u2019s solid-state lighting schedule to protect sleep timing.", basis: "Habitability, not OCHMO", ochmo: false },
            { label: "Exercise and rest routine", detail: "Daily exercise countermeasures and a protected sleep window, as planned.", basis: "Habitability, not OCHMO", ochmo: false }
          ],
          evidence,
          protocol
        };
    }
  }
  function signalsOf(p) {
    var _a;
    const l = p.ultrasound.left;
    const result = l.thrombus ? "thrombus" : (_a = l.flowPattern) != null ? _a : "antegrade";
    const r = p.astronaut.vteRisk;
    return {
      day: p.missionDay,
      sleepH: p.neuro.sleepHours,
      // Línea base = media publicada de tripulaciones ISS (no hay línea base individual).
      baselineSleepH: p.metricSources.sleepHours.center,
      restingHR: Math.round(p.vitals.heartRateBpm),
      baselineHR: p.metricSources.heartRateBpm.center,
      scan: { day: p.missionDay, result },
      risk: { family: r.familyHistoryUnprovokedVTE, thrombophilia: r.thrombophilia, hormone: isHigherRiskHormone(r.hormone) }
    };
  }
  var QUEUE_SUMMARY = /* @__PURE__ */ new Map();
  function queueOf(p, d) {
    const regimen = d.prescription.phases.map((x) => x.text).join(", then ");
    return p.comms.queue.map((q) => {
      var _a;
      if (!QUEUE_SUMMARY.has(q.id) && d.status === "RED") {
        QUEUE_SUMMARY.set(q.id, `MEDEVENT \xB7 left IJV thrombosis \xB7 EVA/ARED blocked${regimen ? ` \xB7 ${regimen}` : ""}`);
      }
      return {
        id: q.id,
        status: q.status,
        createdAt: q.createdAt,
        etaEarthAt: q.etaEarthAt,
        summary: (_a = QUEUE_SUMMARY.get(q.id)) != null ? _a : "MEDEVENT \xB7 left IJV thrombosis"
      };
    });
  }
  function buildVesselView(p) {
    const decision = buildDecisionView(p);
    return {
      seq: p.seq,
      state: p.state,
      crew: crewOf(p),
      missionDay: p.missionDay,
      missionDayText: p.state === "EMERGENCY_THROMBOSIS" ? `L+${p.missionDay}` : `L+~${p.missionDay}`,
      screening: { protocolDays: [...p.ultrasound.screening.protocolDays], next: p.ultrasound.screening.nextScreeningDay },
      comms: {
        oneWaySec: p.comms.oneWayDelaySec,
        roundTripSec: p.comms.roundTripSec,
        oneWayText: formatDuration(p.comms.oneWayDelaySec),
        roundTripText: formatDuration(p.comms.roundTripSec),
        queue: queueOf(p, decision)
      },
      tiles: tiles(p, decision),
      decision,
      signals: signalsOf(p),
      unavailable: [...p.unavailable],
      provenance: p.provenance
    };
  }
  return __toCommonJS(vessel_entry_exports);
})();
