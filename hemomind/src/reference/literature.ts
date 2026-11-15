/**
 * Valores medidos en vuelo, con cita de la publicación de origen.
 * ------------------------------------------------------------------
 * REGLAS:
 *  1. Cada número aparece literalmente en la fuente (campo `quote`, verificado contra
 *     el texto completo en PMC o en el PDF de la NASA).
 *  2. No se derivan desviaciones estándar: se usa el intervalo tal cual se publicó
 *     (media ± SEM, media ± SD o IC 95 %), indicando su tipo en `intervalType`.
 *  3. Las variables sin fuente verificable NO se simulan: están en `UNAVAILABLE_VARIABLES`.
 */

export interface SourceRef {
  id: string;
  citation: string;
  doi: string | null;
  url: string;
  /** Qué se leyó para verificar el número. */
  verifiedAgainst: 'FULL_TEXT_PMC' | 'NASA_PDF' | 'NASA_WEB_PAGE' | 'SI_DEFINITION';
}

export const SOURCES = {
  NORSK_2015: {
    id: 'NORSK_2015',
    citation:
      'Norsk P, Asmar A, Damgaard M, Christensen NJ. Fluid shifts, vasodilatation and ambulatory blood pressure reduction during long duration spaceflight. J Physiol. 2015;593(3):573–584.',
    doi: '10.1113/jphysiol.2014.284869',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4324706/',
    verifiedAgainst: 'FULL_TEXT_PMC',
  },
  OTSUKA_2019: {
    id: 'OTSUKA_2019',
    citation:
      'Otsuka K, Cornelissen G, Kubo Y, Shibata K, Mizuno K, Ohshima H, Furukawa S, Mukai C. Anti-aging effects of long-term space missions, estimated by heart rate variability. Sci Rep. 2019;9:8995.',
    doi: '10.1038/s41598-019-45387-6',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6586662/',
    verifiedAgainst: 'FULL_TEXT_PMC',
  },
  BARGER_2014: {
    id: 'BARGER_2014',
    citation:
      'Barger LK, Flynn-Evans EE, Kubey A, Walsh L, Ronda JM, Wang W, Wright KP Jr, Czeisler CA. Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight: an observational study. Lancet Neurol. 2014;13(9):904–912.',
    doi: '10.1016/S1474-4422(14)70122-X',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436/',
    verifiedAgainst: 'FULL_TEXT_PMC',
  },
  MARSHALL_GOEBEL_2019: {
    id: 'MARSHALL_GOEBEL_2019',
    citation:
      'Marshall-Goebel K, Laurie SS, Alferova IV, et al. Assessment of jugular venous blood flow stasis and thrombosis during spaceflight. JAMA Netw Open. 2019;2(11):e1915011.',
    doi: '10.1001/jamanetworkopen.2019.15011',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6902784/',
    verifiedAgainst: 'FULL_TEXT_PMC',
  },
  NASA_M2M_COMMS_2023: {
    id: 'NASA_M2M_COMMS_2023',
    citation: 'NASA. Mars Communications Disruption and Delay. 2023 Moon to Mars Architecture Concept Review, white paper.',
    doi: null,
    url: 'https://www.nasa.gov/wp-content/uploads/2024/01/mars-communications-disruption-and-delay.pdf',
    verifiedAgainst: 'NASA_PDF',
  },
  NASA_BLOG_MARS_2018: {
    id: 'NASA_BLOG_MARS_2018',
    citation: 'Harbaugh JA. Go Outside and See Mars! NASA Watch the Skies blog, 30 Jul 2018.',
    doi: null,
    url: 'https://www.nasa.gov/blogs/watch-the-skies/2018/07/30/go-outside-and-see-mars/',
    verifiedAgainst: 'NASA_WEB_PAGE',
  },
  NASA_BLOG_MARS_2020: {
    id: 'NASA_BLOG_MARS_2020',
    citation: "Davis LD. It's All About Mars in October. NASA Watch the Skies blog, 9 Oct 2020.",
    doi: null,
    url: 'https://www.nasa.gov/blogs/watch-the-skies/2020/10/09/its-all-about-mars-in-october/',
    verifiedAgainst: 'NASA_WEB_PAGE',
  },
  SI_BROCHURE_2019: {
    id: 'SI_BROCHURE_2019',
    citation:
      'BIPM. The International System of Units (SI), 9th ed., 2019: c = 299 792 458 m/s (exacta por definición). Milla internacional = 1609.344 m (exacta, acuerdo internacional de 1959; NIST SP 811).',
    doi: null,
    url: 'https://www.bipm.org/en/publications/si-brochure',
    verifiedAgainst: 'SI_DEFINITION',
  },
} as const satisfies Record<string, SourceRef>;

export type IntervalType = 'MEAN_SEM' | 'MEAN_SD' | 'CI95';

export interface CitedMeasurement {
  variable: string;
  unit: string;
  /** Valor central publicado (media o media modelada). */
  center: number;
  /** Intervalo publicado: center ± dispersión, o los límites del IC 95 %. */
  interval: { lo: number; hi: number };
  intervalType: IntervalType;
  decimals: number;
  n: number;
  population: string;
  timepoint: string;
  condition: string;
  source: SourceRef;
  quote: string;
}

const pm = (c: number, d: number) => ({ lo: c - d, hi: c + d });

/** Métricas que el stream simula. Todas: astronautas ISS, en vuelo. */
export const INFLIGHT_MEASUREMENTS = {
  heartRateBpm: {
    variable: 'Frecuencia cardíaca (ambulatoria, periodo diurno)',
    unit: 'bpm',
    center: 64,
    interval: pm(64, 3),
    intervalType: 'MEAN_SEM',
    decimals: 0,
    n: 8,
    population: 'Astronautas varones de la ISS',
    timepoint: 'Registro de 24 h entre los días de vuelo 85 y 192',
    condition: 'Periodo diurno ambulatorio en vuelo',
    source: SOURCES.NORSK_2015,
    quote: 'the in-flight ambulatory day-time period (64 ± 3 beats min–1; P = 0.034)',
  },
  systolicMmHg: {
    variable: 'Presión arterial sistólica (media de 24 h)',
    unit: 'mmHg',
    center: 121,
    interval: pm(121, 2),
    intervalType: 'MEAN_SEM',
    decimals: 0,
    n: 8,
    population: 'Astronautas varones de la ISS',
    timepoint: 'Registro de 24 h entre los días de vuelo 85 y 192',
    condition: 'Presión braquial ambulatoria de 24 h',
    source: SOURCES.NORSK_2015,
    quote: 'The mean systolic arterial pressure of the 24 h period decreased from 129 ± 2 mmHg (mean ± sem) to 121 ± 2 mmHg',
  },
  diastolicMmHg: {
    variable: 'Presión arterial diastólica (media de 24 h)',
    unit: 'mmHg',
    center: 76,
    interval: pm(76, 2),
    intervalType: 'MEAN_SEM',
    decimals: 0,
    n: 8,
    population: 'Astronautas varones de la ISS',
    timepoint: 'Registro de 24 h entre los días de vuelo 85 y 192',
    condition: 'Presión braquial ambulatoria de 24 h',
    source: SOURCES.NORSK_2015,
    quote: 'diastolic arterial pressure from 85 ± 2 mmHg to 76 ± 2 mmHg',
  },
  meanArterialMmHg: {
    variable: 'Presión arterial media (media de 24 h)',
    unit: 'mmHg',
    center: 92,
    interval: pm(92, 1),
    intervalType: 'MEAN_SEM',
    decimals: 0,
    n: 8,
    population: 'Astronautas varones de la ISS',
    timepoint: 'Registro de 24 h entre los días de vuelo 85 y 192',
    condition: 'Presión braquial ambulatoria de 24 h',
    source: SOURCES.NORSK_2015,
    quote: 'mean arterial pressure from 102 ± 3 mmHg to 92 ± 1 mmHg',
  },
  hrvRmssdMs: {
    variable: 'Variabilidad de la frecuencia cardíaca (r-MSSD)',
    unit: 'ms',
    center: 29.7,
    interval: pm(29.7, 14.5),
    intervalType: 'MEAN_SD',
    decimals: 1,
    n: 7,
    population: 'Astronautas de la ISS (6 varones, 1 mujer)',
    timepoint: 'ISS01: 20.6 ± 2.7 días tras el lanzamiento (rango 18–25)',
    condition: 'ECG ambulatorio de 48 h; días geomagnéticamente tranquilos',
    source: SOURCES.OTSUKA_2019,
    quote: 'Table 2, r-MSSD, ISS01 (n = 7), Quiet: mean 29.7, SD 14.5 (msec)',
  },
  sleepHours: {
    variable: 'Duración del sueño por noche (actigrafía)',
    unit: 'h',
    center: 6.09,
    interval: pm(6.09, 0.67),
    intervalType: 'MEAN_SD',
    decimals: 2,
    n: 21,
    population: 'Astronautas de la ISS (13 expediciones)',
    timepoint: '3248 días en vuelo',
    condition: 'Actigrafía durante misiones de larga duración',
    source: SOURCES.BARGER_2014,
    quote: 'crewmembers aboard long-duration ISS missions also averaged 6·09 ± 0·67 h per night',
  },
  ijvCsaMm2: {
    variable: 'Área de sección transversal de la IJV izquierda',
    unit: 'mm²',
    center: 70.3,
    interval: { lo: 59.3, hi: 81.2 },
    intervalType: 'CI95',
    decimals: 1,
    n: 11,
    population: 'Tripulantes de la ISS',
    timepoint: 'Día de vuelo ~50 (rango 33–63)',
    condition: 'Ecografía de la IJV izquierda en vuelo',
    source: SOURCES.MARSHALL_GOEBEL_2019,
    quote: '70.3 [95% CI, 59.3-81.2] mm2',
  },
} as const satisfies Record<string, CitedMeasurement>;

export type InflightMetricKey = keyof typeof INFLIGHT_MEASUREMENTS;

/* ------------------------------------------------------------------
 * Hallazgos de la IJV izquierda (Marshall-Goebel 2019)
 * ------------------------------------------------------------------ */
export const IJV_FLOW_GRADES = {
  1: { pattern: 'antegrade', quote: 'nominal continuous forward flow (ie, head to heart direction) was scored as grade 1' },
  2: { pattern: 'antegrade', quote: 'nominal forward flow with pulsatility was scored as grade 2' },
  3: { pattern: 'stagnant', quote: 'stagnant flow was scored as grade 3' },
  4: { pattern: 'retrograde', quote: 'reverse flow toward the head was scored as grade 4' },
} as const;
export type IJVFlowGrade = keyof typeof IJV_FLOW_GRADES;

export const IJV_FINDINGS_FD50 = {
  sessionTiming: { quote: 'approximately 50 (range, 33-63) days into spaceflight', source: SOURCES.MARSHALL_GOEBEL_2019 },
  stagnantFlow: { quote: 'in 5 of 11 crew members (45%) on flight day 50', source: SOURCES.MARSHALL_GOEBEL_2019 },
  stagnantOrReverse: { quote: 'stagnant or reverse flow in the IJV was observed in 6 crew members (55%) on approximate flight day 50', source: SOURCES.MARSHALL_GOEBEL_2019 },
  occlusiveThrombus: { quote: '1 crew member developed an occlusive thrombus that was discovered on flight day 50', source: SOURCES.MARSHALL_GOEBEL_2019 },
  onlyLeftImaged: { quote: 'only the left IJV was imaged as part of this study', source: SOURCES.MARSHALL_GOEBEL_2019 },
} as const;

/* ------------------------------------------------------------------
 * Delay de comunicación Tierra–Marte
 * ------------------------------------------------------------------ */
/** Constantes exactas por definición (SI). */
export const SPEED_OF_LIGHT_KM_S = 299792.458;
export const KM_PER_MILE = 1.609344;

/** Distancias Tierra–Marte publicadas por la NASA. */
export const EARTH_MARS_DISTANCE = {
  min: {
    miles: 33.9e6,
    quote: 'The minimum distance from the Earth to Mars is about 33.9 million miles and does not happen very often.',
    source: SOURCES.NASA_BLOG_MARS_2018,
  },
  max: {
    km: 400e6,
    quote: 'At its furthest, Mars reaches about 250 million miles (400 million km) from Earth.',
    source: SOURCES.NASA_BLOG_MARS_2020,
  },
} as const;

/** Tiempo de luz de una distancia (s) = distancia / c. */
export const lightTimeSec = (km: number): number => km / SPEED_OF_LIGHT_KM_S;

/**
 * Delay por sentido Tierra–Marte. DERIVADO: distancia publicada / c (constante SI).
 *  - mínimo ≈ 182 s (~3.0 min), con 33.9 millones de millas
 *  - máximo ≈ 1334 s (~22.2 min), con 400 millones de km
 * Corroboración independiente: el white paper de la NASA (2023) da un delay máximo de 22 min
 * por sentido para una misión tripulada. En tránsito cerca de la Tierra el delay es menor (Fig. 2–3).
 */
export const MARS_COMMS_DELAY = {
  minOneWaySec: Math.round(lightTimeSec(EARTH_MARS_DISTANCE.min.miles * KM_PER_MILE)),
  maxOneWaySec: Math.round(lightTimeSec(EARTH_MARS_DISTANCE.max.km)),
  derivation: 'distancia publicada por la NASA / c (SI, exacta)',
  corroboration: {
    quote: 'maximum one-way communications delay of 22 minutes',
    context: 'Figura 2: misión de ida y vuelta de 850 días, estancia corta (la Figura 3, de ~1000 días, da un máximo de 21 min)',
    source: SOURCES.NASA_M2M_COMMS_2023,
  },
  constants: SOURCES.SI_BROCHURE_2019,
} as const;

/* ------------------------------------------------------------------
 * Variables solicitadas SIN fuente verificable → no se simulan
 * ------------------------------------------------------------------ */
export const UNAVAILABLE_VARIABLES = [
  {
    variable: 'Temperatura corporal absoluta (°C)',
    reason:
      'Stahn et al. 2017 (Sci Rep 7:16180) solo da en el texto el aumento (~1.01 °C frente a la línea base); los valores absolutos están solo en una figura. No se simula: se registra a mano (packet.manual).',
  },
  {
    variable: 'Glucosa en sangre en vuelo',
    reason: 'Hughson et al. 2016 (Am J Physiol Heart Circ Physiol 310:H628) la midió, pero el texto completo no es de acceso abierto; no hay ningún valor verificado. No se simula: se registra a mano (packet.manual).',
  },
  {
    variable: 'Cortisol en sudor',
    reason: 'No hay valores publicados en astronautas; los sensores de sudor no se han probado en el espacio (Trusso Sfrazzetto 2022, Nanomaterials 12:3790).',
  },
  {
    variable: 'Puntuación de ánimo 1–5',
    reason: 'No existe una escala de ánimo 1–5 validada en datos NASA (el POMS da subescalas; Basner 2014, PLoS ONE 9:e93298, es un análogo). Se registra como texto libre (packet.manual).',
  },
  {
    variable: 'Readiness Score',
    reason: 'Índice compuesto sin definición publicada.',
  },
  {
    variable: 'Valores fisiológicos específicos de cada estado (verde/amarillo/rojo)',
    reason: 'Ninguna fuente asocia la estasis o la trombosis de la IJV con cambios de FC, PA, HRV o sueño; las constantes vitales usan los mismos valores en vuelo en todos los escenarios.',
  },
] as const;
