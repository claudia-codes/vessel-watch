/**
 * Datos de referencia NASA — OCHMO-MTB-007 "Venous Thrombosis in Spaceflight"
 * NASA-STD-3001 Medical Technical Brief, revisión 8-Jan-26.
 * https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf
 *
 * REGLA DE ESTE ARCHIVO: solo contiene valores que aparecen literalmente en el brief,
 * cada uno con su página. Nada de datos de demo, perfiles ni rangos fisiológicos inventados.
 * El propio brief advierte: "for reference only ... not to deliver direct medical care
 * recommendations or guidance for individuals".
 */

export interface Citation {
  doc: 'OCHMO-MTB-007';
  revision: '8-Jan-26';
  page: number;
  /** Texto o resumen fiel del pasaje citado. */
  quote: string;
}

const cite = (page: number, quote: string): Citation => ({ doc: 'OCHMO-MTB-007', revision: '8-Jan-26', page, quote });

export const OCHMO_MTB_007 = {
  id: 'OCHMO-MTB-007',
  title: 'Venous Thrombosis in Spaceflight',
  revision: '8-Jan-26',
  url: 'https://www.nasa.gov/wp-content/uploads/2026/01/ochmo-mtb-007-venous-thrombosis-in-spaceflight.pdf',
  derivedFrom: 'NASA-STD-3001 / OCHMO-STD-100.1A Rev A',
} as const;

/* ------------------------------------------------------------------
 * Patrones de flujo de la IJV izquierda observados en vuelo (p.1, p.7)
 * ------------------------------------------------------------------ */
/** (a) anterógrado con tasas menores que la norma terrestre, (b) estancado, (c) retrógrado. */
export type IJVFlowPattern = 'antegrade' | 'stagnant' | 'retrograde';

export const IJV_FLOW_PATTERNS: Record<IJVFlowPattern, { label: string; citation: Citation }> = {
  antegrade: { label: 'Anterógrado (tasas menores que la norma terrestre)', citation: cite(1, 'antegrade but with lower rates than terrestrial norms') },
  stagnant: { label: 'Estancado / estasis', citation: cite(7, 'stasis (a stoppage or slowdown in the flow of blood)') },
  retrograde: { label: 'Retrógrado (RVBF)', citation: cite(7, 'retrograde venous blood flow (RVBF) (the backflow of venous blood towards the brain)') },
};

/** p.11: la estasis es el indicador pre-trombótico más preocupante; el flujo retrógrado no se considera contribuyente principal. */
export const FLOW_RISK_INTERPRETATION = {
  stasisIsPrimaryPrethromboticIndicator: true,
  retrogradeIsMainContributor: false,
  citation: cite(11, 'stasis/stagnant flow was the most concerning as a pre-thrombotic indicator. Retrograde flow was not considered to be a main contributor'),
} as const;

/* ------------------------------------------------------------------
 * Cribado ecográfico (p.10, p.16) — OCHMO-STD-100.1A [6041]
 * ------------------------------------------------------------------ */
export const IJV_SCREENING = {
  requirementId: '6041',
  method: 'Duplex ultrasound of the bilateral extracranial internal jugular veins, with breathing and compression maneuvers',
  /** Calendario de ejemplo para misión ISS de 180 días. */
  exampleSchedule180dISS: {
    preflight: 'L-12/3 m',
    inflightLaunchDays: [30, 60] as const,
    preReturnDays: 42,
    postflight: 'R+0/45 d',
    plus: 'ACI (as clinically indicated)',
  },
  citation: cite(16, 'Example Schedule based on 180-day ISS mission: L-12/3 m, L+30 days; L+60 days; R-42 days, R+0/45d, as clinically indicated (ACI)'),
} as const;

/* ------------------------------------------------------------------
 * Factores de riesgo usados por el algoritmo (p.11, p.14)
 * ------------------------------------------------------------------ */
export const ALGORITHM_RISK_FACTORS = {
  factors: ['thrombophilia', 'familyHistoryUnprovokedVTE', 'higherRiskHormoneUse'] as const,
  ageIsFactor: false,
  citation: cite(14, 'Thrombophilia, Family History, or higher-risk Hormone Use? ... Unprovoked thrombosis in immediate family members; hormones that increase the risk of VTE'),
} as const;

/* ------------------------------------------------------------------
 * Tabla comparativa de hormonas (p.6)
 * ------------------------------------------------------------------ */
export type HormoneId =
  | 'NONE'
  | 'PROGESTIN_ONLY_PILL'
  | 'LNG_IUD'
  | 'ETONOGESTREL_IMPLANT'
  | 'TESTOSTERONE'
  | 'ESTRADIOL_PATCH'
  | 'PREMARIN_ORAL'
  | 'MICRONIZED_PROGESTERONE_ORAL'
  | 'DMPA_DEPOT'
  | 'COC_1ST_GEN'
  | 'COC_2ND_GEN'
  | 'COC_3RD_GEN'
  | 'COC_4TH_GEN';

export type HormoneVteRisk = 'LOW_NO_INCREASE' | 'SOME_INCREASE' | 'MODERATE_INCREASE';

export interface HormoneEntry {
  label: string;
  containsEstrogen: boolean;
  vteRisk: HormoneVteRisk;
  /** Aumento relativo de riesgo reportado en la tabla (null = "Low/No increased risk"). */
  relativeRisk: string | null;
}

export const HORMONE_TABLE: Record<HormoneId, HormoneEntry> = {
  NONE: { label: 'Sin terapia hormonal', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  PROGESTIN_ONLY_PILL: { label: 'Píldora solo progestágeno (noretindrona)', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  LNG_IUD: { label: 'DIU de levonorgestrel (LNG-IUD)', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  ETONOGESTREL_IMPLANT: { label: 'Implante de etonogestrel', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  TESTOSTERONE: { label: 'Testosterona (micronizada / cipionato)', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  ESTRADIOL_PATCH: { label: 'Parche de estradiol', containsEstrogen: true, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  PREMARIN_ORAL: { label: 'Premarin oral', containsEstrogen: true, vteRisk: 'SOME_INCREASE', relativeRisk: '2-fold' },
  MICRONIZED_PROGESTERONE_ORAL: { label: 'Progesterona micronizada 100 mg oral', containsEstrogen: false, vteRisk: 'LOW_NO_INCREASE', relativeRisk: null },
  DMPA_DEPOT: { label: 'Medroxiprogesterona depot 150 mg', containsEstrogen: false, vteRisk: 'SOME_INCREASE', relativeRisk: '2.6-fold' },
  COC_1ST_GEN: { label: 'COC progestágeno 1ª generación', containsEstrogen: true, vteRisk: 'SOME_INCREASE', relativeRisk: '3.2-fold' },
  COC_2ND_GEN: { label: 'COC progestágeno 2ª generación (levonorgestrel)', containsEstrogen: true, vteRisk: 'SOME_INCREASE', relativeRisk: '2.8-fold' },
  COC_3RD_GEN: { label: 'COC progestágeno 3ª generación', containsEstrogen: true, vteRisk: 'MODERATE_INCREASE', relativeRisk: '3.8-fold' },
  COC_4TH_GEN: { label: 'COC progestágeno 4ª generación (drospirenona)', containsEstrogen: true, vteRisk: 'MODERATE_INCREASE', relativeRisk: 'Similar to 3rd generation' },
};
export const HORMONE_TABLE_CITATION = cite(6, 'Hormone Comparison Table (Bostick et al., 2025)');

export const isHigherRiskHormone = (h: HormoneId): boolean => HORMONE_TABLE[h].vteRisk !== 'LOW_NO_INCREASE';
export const isEstrogenCOC = (h: HormoneId): boolean => h.startsWith('COC_');

/* ------------------------------------------------------------------
 * Manejo médico (p.12–14)
 * ------------------------------------------------------------------ */
export interface DosePhase {
  drug: 'Apixaban';
  doseMg: number;
  timesPerDay: number;
  /** null = sin duración fija en el brief. */
  durationDays: number | null;
}

export const APIXABAN = {
  treatment: [
    { drug: 'Apixaban', doseMg: 10, timesPerDay: 2, durationDays: 7 },
    { drug: 'Apixaban', doseMg: 5, timesPerDay: 2, durationDays: null },
  ] as DosePhase[],
  treatmentCitation: cite(12, 'Treatment: Apixaban 10 mg twice a day for 7 days; afterwards 5 mg twice a day'),
  prophylaxis: [{ drug: 'Apixaban', doseMg: 2.5, timesPerDay: 2, durationDays: null }] as DosePhase[],
  prophylaxisCitation: cite(12, 'Prophylaxis dose: Apixaban 2.5 mg twice a day'),
  halfLifeHours: 12,
} as const;

export const THROMBOSIS_OPERATIONS = {
  restrictEvaDays: 30,
  restrictAredDays: 30,
  allowedExercise: 'T2 y CEVIS pueden considerarse, retirando las correas de hombro del arnés',
  favorRemainOnOrbitDays: 30,
  citation: cite(12, 'Restrict crew from both EVA and ARED for at least 30 days. Use of T2 and CEVIS can be considered, but harness shoulder straps should be removed.'),
} as const;

export const LANDING_WASHOUT_HOURS = {
  treatment: 48,
  prophylaxis: 24,
  citation: cite(14, 'For diagnosed thrombosis – 48 hours prior to landing. For stasis plus a risk factor – 24 hours prior to landing'),
} as const;

export const STASIS_WITHOUT_RISK_FACTORS = {
  action: 'Monitorización más frecuente y asegurar hidratación (sin anticoagulación)',
  /** El brief no fija el intervalo de reescaneo. */
  rescanIntervalSpecified: false,
  citation: cite(12, 'should be monitored more often, and hydration should be ensured'),
} as const;

export const ESTROGEN_COC_WITH_DOAC = {
  rule: 'No suspender un COC con estrógenos al iniciar DOAC por riesgo de sangrado uterino anormal (AUB)',
  citation: cite(12, 'Crewmembers using an estrogen-based COC should not discontinue its use if direct oral anticoagulants (DOACs) are administered ... due to the risk of abnormal uterine bleeding (AUB)'),
} as const;

/** p.11 / p.14: hallazgos clínicos a incluir en la valoración de riesgo. */
export const SYMPTOMS_TO_MONITOR = {
  items: ['Hinchazón visible de la IJV', 'Edema facial más allá de la adaptación "nominal"', 'Edema palpebral', 'Midriasis', 'Cefalea', 'Síntomas SANS'],
  citation: cite(11, 'IJV swelling, facial edema beyond "nominal" spaceflight adaptation, and/or eyelid edema, mydriasis, headache, and SANS symptoms'),
} as const;

/** p.7: efectos del desplazamiento cefálico de fluidos. */
export const HEADWARD_FLUID_SHIFT = {
  effects: ['Hinchazón facial', 'Disminución del volumen de piernas', 'Aumento del volumen sistólico', 'Disminución del volumen plasmático'],
  citation: cite(7, 'facial puffiness, decreased leg volume, increased cardiac stroke volume, and decreased plasma volume'),
} as const;
