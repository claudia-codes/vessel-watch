# src/nasaMockStream.ts

**Contenido:** Motor del stream: no contiene datos, recibe todo por configuración. La dinámica temporal (AR(1) acotado al intervalo publicado) es sintética y está declarada como tal.

**Qué verificar:** Comprueba que el motor no contiene números fisiológicos ni clínicos propios, que los valores emitidos nunca salen del intervalo publicado y que lo sintético está marcado en `provenance`.

**Líneas:** 671

```ts
/**
 * HemoMind AI — Motor del Mock Stream de telemetría
 * ------------------------------------------------------------------
 * El motor no contiene ningún valor fisiológico, umbral ni perfil. Todo se inyecta con
 * `NasaMockStreamConfig`:
 *   - measurements: valores medidos en vuelo y citados (src/reference/literature.ts)
 *   - scenarios:    hallazgos de la IJV publicados (src/reference/scenarios.ts)
 *   - crew:         perfil del tripulante (el de demo es ficticio: src/demo/)
 * Las decisiones clínicas salen de `evaluateVteAlgorithm()` (OCHMO-MTB-007).
 *
 * Qué es sintético: solo la dinámica temporal (paquete a paquete). Cada valor emitido
 * se mantiene siempre dentro del intervalo publicado de su fuente (media ± SEM/SD o
 * IC 95 %). No existen series temporales publicadas segundo a segundo.
 *
 * Prototipo educativo de hackathon. NO es un dispositivo médico.
 */
import { Citation, HormoneId, IJVFlowPattern, IJV_FLOW_PATTERNS, IJV_SCREENING, OCHMO_MTB_007, STASIS_WITHOUT_RISK_FACTORS } from './nasa/ochmoMtb007';
import { StatusColor, VteDecision, VteRiskProfile, evaluateVteAlgorithm } from './nasa/vteAlgorithm';
import type { CitedMeasurement, IJVFlowGrade, IntervalType, SourceRef } from './reference/literature';
import type { Evidence, EvidenceScenario, SimulationState } from './reference/scenarios';

export type { IJVFlowPattern, StatusColor, VteDecision, VteRiskProfile, HormoneId, Citation, SimulationState, CitedMeasurement, EvidenceScenario, SourceRef };

/* ================================================================
 * 1. TIPOS
 * ================================================================ */

export type Side = 'LEFT' | 'RIGHT';
export type ProfileSource = 'FICTIONAL_DEMO' | 'REAL';

export interface CrewProfile {
  id: string;
  name: string;
  mission: string;
  role: string;
  source: ProfileSource;
  /** Únicas entradas que usa el algoritmo OCHMO. */
  vteRisk: VteRiskProfile;
}

/** Claves de las métricas simuladas; cada una necesita una medición citada. */
export type MetricKey = 'heartRateBpm' | 'systolicMmHg' | 'diastolicMmHg' | 'meanArterialMmHg' | 'hrvRmssdMs' | 'sleepHours' | 'ijvCsaMm2';
export const METRIC_KEYS: MetricKey[] = ['heartRateBpm', 'systolicMmHg', 'diastolicMmHg', 'meanArterialMmHg', 'hrvRmssdMs', 'sleepHours', 'ijvCsaMm2'];

export interface CommsDelayConfig {
  minSec: number;
  maxSec: number;
  minBasis: string;
  maxBasis: string;
}

export interface NasaMockStreamConfig {
  crew: CrewProfile;
  scenarios: Record<SimulationState, EvidenceScenario>;
  measurements: Record<MetricKey, CitedMeasurement>;
  commsDelay: CommsDelayConfig;
  unavailable?: ReadonlyArray<{ variable: string; reason: string }>;
}

export interface NasaMockStreamOptions extends NasaMockStreamConfig {
  intervalMs?: number;
  initialState?: SimulationState;
  historySize?: number;
  /** Semilla para RNG reproducible. */
  seed?: number;
}

export interface VitalSigns {
  heartRateBpm: number;
  bloodPressure: { systolic: number; diastolic: number; map: number };
}

export interface NeuroBehavioral {
  hrvRmssdMs: number;
  sleepHours: number;
}

export interface IJVSide {
  flowGrade: IJVFlowGrade | null;
  flowPattern: IJVFlowPattern | null;
  thrombus: boolean;
  occlusive: boolean;
  csaMm2: number | null;
}

export interface IJVUltrasound {
  screening: {
    protocolDays: readonly number[];
    nextScreeningDay: number | null;
    /** OCHMO no fija el intervalo de reescaneo; solo indica "monitored more often". */
    rescanGuidance: string | null;
    citation: Citation;
  };
  left: IJVSide;
  /** Marshall-Goebel 2019 solo exploró la IJV izquierda: la derecha no se simula. */
  right: null;
  indexSide: Side;
  flowPattern: IJVFlowPattern | null;
  flowLabel: string;
  stasis: boolean;
  thrombus: boolean;
  thrombusSide: Side | null;
  csaMm2: number;
}

export interface MedicationPhase {
  doseMg: number;
  intervalHours: number;
  durationDays: number | null;
  label: string;
}

/** Vista de medicación derivada de la decisión OCHMO. */
export interface MedicationPlan {
  drug: 'Apixaban' | null;
  regimen: 'TREATMENT' | 'PROPHYLAXIS' | 'NONE';
  phases: MedicationPhase[];
  summary: string;
  rationale: string;
  hormonalTherapyAction: string;
  preLandingWashoutHours: number | null;
}

export interface FlightRules {
  evaAuthorized: boolean;
  aredAuthorized: boolean;
  restrictionDays: number | null;
  notes: string[];
}

export interface Countermeasure {
  id: string;
  label: string;
  detail: string;
  category: 'HYDRATION' | 'IMAGING' | 'EXERCISE' | 'PHARMA';
  citation: Citation;
}

export interface QueuedTransmission {
  id: string;
  createdAt: number;
  etaEarthAt: number;
  priority: 'MEDEVENT';
  status: 'QUEUED' | 'IN_FLIGHT' | 'DELIVERED';
  summary: string;
}

export interface CommsLink {
  oneWayDelaySec: number;
  roundTripSec: number;
  mode: 'LOCAL_AUTONOMOUS';
  queue: QueuedTransmission[];
  basis: { min: string; max: string };
}

export interface MetricProvenance {
  sourceId: string;
  citation: string;
  doi: string | null;
  url: string;
  quote: string;
  intervalType: IntervalType;
  interval: { lo: number; hi: number };
  n: number;
  timepoint: string;
}

/* ---------- Registro manual del astronauta ---------- */

/** Indicadores del enunciado del reto sin datos publicados en vuelo: los introduce el astronauta. */
export type ManualVariable = 'bloodGlucose' | 'bodyTemperature' | 'mood';
export type GlucoseUnit = 'mg/dL' | 'mmol/L';

export type ManualEntryInput =
  | { variable: 'bloodGlucose'; value: number; unit: GlucoseUnit; note?: string }
  | { variable: 'bodyTemperature'; value: number; unit: '°C'; note?: string }
  | { variable: 'mood'; text: string; note?: string };

export interface ManualEntry {
  id: string;
  variable: ManualVariable;
  /** Valor tal cual lo introdujo el astronauta (sin conversión de unidades). */
  value: number | null;
  unit: string | null;
  text: string | null;
  note: string | null;
  recordedAt: number;
  missionDay: number;
  source: 'ASTRONAUT_INPUT';
  /** El stream no interpreta estos valores: no hay umbrales publicados en vuelo. */
  interpretation: null;
  interpretationNote: string;
}

export interface ManualRecords {
  latest: Record<ManualVariable, ManualEntry | null>;
  log: ManualEntry[];
}

export const MANUAL_VARIABLES: Record<ManualVariable, { label: string; units: readonly string[]; kind: 'number' | 'text'; interpretationNote: string }> = {
  bloodGlucose: {
    label: 'Glucosa en sangre',
    units: ['mg/dL', 'mmol/L'],
    kind: 'number',
    interpretationNote: 'Sin interpretar: no hay valores de glucosa en vuelo de acceso abierto (ver packet.unavailable).',
  },
  bodyTemperature: {
    label: 'Temperatura corporal',
    units: ['°C'],
    kind: 'number',
    interpretationNote: 'Sin interpretar: Stahn 2017 solo publica en el texto un aumento de ~1.01 °C frente a la línea base, no un rango absoluto.',
  },
  mood: {
    label: 'Estado de ánimo',
    units: [],
    kind: 'text',
    interpretationNote: 'Registro de texto libre: no existe una escala de ánimo 1–5 validada en datos NASA.',
  },
};

const MAX_TEXT = 280;

/** Valida la forma de la entrada (tipo, unidad, número finito). No aplica umbrales clínicos. */
export function validateManualEntry(input: ManualEntryInput): string | null {
  const note = input.note ?? '';
  if (note.length > MAX_TEXT) return `La nota supera ${MAX_TEXT} caracteres.`;
  switch (input.variable) {
    case 'bloodGlucose':
      if (!Number.isFinite(input.value)) return 'La glucosa debe ser un número.';
      if (input.value <= 0) return 'La glucosa debe ser mayor que 0.';
      if (!MANUAL_VARIABLES.bloodGlucose.units.includes(input.unit)) return 'Unidad de glucosa no válida (mg/dL o mmol/L).';
      return null;
    case 'bodyTemperature':
      if (!Number.isFinite(input.value)) return 'La temperatura debe ser un número.';
      if (input.unit !== '°C') return 'Unidad de temperatura no válida (°C).';
      return null;
    case 'mood':
      if (!input.text || !input.text.trim()) return 'Describe el estado de ánimo.';
      if (input.text.length > MAX_TEXT) return `El texto supera ${MAX_TEXT} caracteres.`;
      return null;
    default:
      return 'Variable no reconocida.';
  }
}

export interface TelemetryPacket {
  seq: number;
  timestamp: number;
  state: SimulationState;
  status: StatusColor;
  missionDay: number;
  missionDayLabel: string;
  astronaut: CrewProfile;
  vitals: VitalSigns;
  neuro: NeuroBehavioral;
  ultrasound: IJVUltrasound;
  /** Salida completa del algoritmo OCHMO-MTB-007, con citas. */
  clinical: VteDecision;
  flightRules: FlightRules;
  medication: MedicationPlan;
  countermeasures: Countermeasure[];
  comms: CommsLink;
  /** Fuente de cada métrica emitida. */
  metricSources: Record<MetricKey, MetricProvenance>;
  /** Evidencia publicada del hallazgo de la IJV del escenario activo. */
  scenarioEvidence: Evidence[];
  /** Variables pedidas que no se emiten por falta de fuente. */
  unavailable: ReadonlyArray<{ variable: string; reason: string }>;
  /** Registros manuales del astronauta (glucosa, temperatura, ánimo), sin interpretar. */
  manual: ManualRecords;
  provenance: {
    clinicalRules: string;
    crewProfile: ProfileSource;
    measurements: 'PUBLISHED_INFLIGHT_DATA';
    temporalDynamics: 'SYNTHETIC_WITHIN_PUBLISHED_INTERVAL';
  };
}

/* ================================================================
 * 2. UTILIDADES
 * ================================================================ */

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const round = (v: number, d: number): number => {
  const k = Math.pow(10, d);
  return Math.round(v * k) / k;
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const provenanceOf = (m: CitedMeasurement): MetricProvenance => ({
  sourceId: m.source.id,
  citation: m.source.citation,
  doi: m.source.doi,
  url: m.source.url,
  quote: m.quote,
  intervalType: m.intervalType,
  interval: m.interval,
  n: m.n,
  timepoint: m.timepoint,
});

function toMedication(d: VteDecision): MedicationPlan {
  const labels = d.branch === 'TREATMENT' ? ['Días 1–7', 'Después de 7 días'] : ['Profilaxis'];
  return {
    drug: d.regimen.length ? 'Apixaban' : null,
    regimen: d.branch === 'TREATMENT' ? 'TREATMENT' : d.branch === 'PROPHYLAXIS' ? 'PROPHYLAXIS' : 'NONE',
    phases: d.regimen.map((p, i) => ({ doseMg: p.doseMg, intervalHours: 24 / p.timesPerDay, durationDays: p.durationDays, label: labels[i] ?? '' })),
    summary: d.regimenSummary,
    rationale: d.actions[0] ?? '',
    hormonalTherapyAction: d.hormoneAction,
    preLandingWashoutHours: d.landingWashoutHours,
  };
}

/** Solo acciones textuales de OCHMO-MTB-007, con su cita. */
function ochmoCountermeasures(d: VteDecision): Countermeasure[] {
  const byPage = (p: number) => d.citations.find((c) => c.page === p) ?? d.citations[0];
  switch (d.branch) {
    case 'INCREASED_MONITORING':
      return [
        { id: 'ochmo-hydration', label: 'Asegurar hidratación', detail: '"hydration should be ensured"', category: 'HYDRATION', citation: STASIS_WITHOUT_RISK_FACTORS.citation },
        { id: 'ochmo-monitoring', label: 'Monitorización más frecuente', detail: '"should be monitored more often" (el brief no fija un intervalo)', category: 'IMAGING', citation: STASIS_WITHOUT_RISK_FACTORS.citation },
      ];
    case 'PROPHYLAXIS':
      return [{ id: 'ochmo-prophylaxis', label: d.regimenSummary, detail: 'Profilaxis por estasis + factor de riesgo', category: 'PHARMA', citation: byPage(12) }];
    case 'TREATMENT':
      return [
        { id: 'ochmo-treatment', label: d.regimenSummary, detail: 'Tratamiento de la trombosis', category: 'PHARMA', citation: byPage(12) },
        { id: 'ochmo-exercise', label: 'T2 / CEVIS sin correas de hombro del arnés', detail: 'EVA y ARED restringidos al menos 30 días', category: 'EXERCISE', citation: byPage(12) },
      ];
    default:
      return [];
  }
}

/* ================================================================
 * 3. MOTOR DE EMISIÓN
 * ================================================================ */

export interface StreamSnapshot {
  packet: TelemetryPacket;
  history: TelemetryPacket[];
  state: SimulationState;
  paused: boolean;
  intervalMs: number;
}

type Listener = (snap: StreamSnapshot) => void;

/**
 * Dinámica temporal sintética: AR(1) acotado al intervalo publicado.
 * PERSISTENCE y STEP_FRACTION son parámetros de visualización, no datos.
 */
const PERSISTENCE = 0.75;
const STEP_FRACTION = 0.45;

export class NasaMockStream {
  private readonly config: NasaMockStreamConfig;
  private readonly metricSources: Record<MetricKey, MetricProvenance>;
  private state: SimulationState;
  private intervalMs: number;
  private readonly historySize: number;
  private readonly rand: () => number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private seq = 0;
  private listeners = new Set<Listener>();
  private dev = {} as Record<MetricKey, number>;
  private delaySec: number;
  private queue: QueuedTransmission[] = [];
  private lastStatus: StatusColor | null = null;
  private history: TelemetryPacket[] = [];
  private manualLog: ManualEntry[] = [];
  private manualSeq = 0;
  private snapshot: StreamSnapshot;

  constructor(opts: NasaMockStreamOptions) {
    if (!opts || !opts.crew || !opts.scenarios || !opts.measurements || !opts.commsDelay) {
      throw new Error('NasaMockStream: se requiere config con `crew`, `scenarios`, `measurements` y `commsDelay`.');
    }
    for (const k of METRIC_KEYS) {
      if (!opts.measurements[k]) throw new Error(`NasaMockStream: falta la medición citada para "${k}".`);
    }
    this.config = opts;
    this.metricSources = Object.fromEntries(METRIC_KEYS.map((k) => [k, provenanceOf(opts.measurements[k])])) as Record<MetricKey, MetricProvenance>;
    this.state = opts.initialState ?? 'NOMINAL';
    this.intervalMs = opts.intervalMs ?? 1000;
    this.historySize = opts.historySize ?? 60;
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

  start(): void {
    if (this.timer || this.paused) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  pause(): void {
    this.paused = true;
    this.stop();
    this.publish(this.snapshot.packet);
  }

  resume(): void {
    this.paused = false;
    this.start();
    this.tick();
  }

  togglePause(): void {
    if (this.paused) this.resume();
    else this.pause();
  }

  isPaused(): boolean {
    return this.paused;
  }

  setSimulationState(next: SimulationState): void {
    if (next === this.state) return;
    this.state = next;
    this.tick(true);
  }

  getSimulationState(): SimulationState {
    return this.state;
  }

  setIntervalMs(ms: number): void {
    const v = Math.max(100, ms);
    if (v === this.intervalMs) return;
    this.intervalMs = v;
    if (this.timer) {
      this.stop();
      this.start();
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot = (): StreamSnapshot => this.snapshot;

  /**
   * Registra un valor introducido por el astronauta y lo publica de inmediato
   * (también en pausa, sin generar nuevas constantes vitales). Lanza un Error si la entrada no es válida.
   */
  addManualEntry(input: ManualEntryInput, timestamp: number = Date.now()): ManualEntry {
    const error = validateManualEntry(input);
    if (error) throw new Error(error);
    const meta = MANUAL_VARIABLES[input.variable];
    const entry: ManualEntry = {
      id: `MAN-${++this.manualSeq}`,
      variable: input.variable,
      value: input.variable === 'mood' ? null : input.value,
      unit: input.variable === 'mood' ? null : input.unit,
      text: input.variable === 'mood' ? input.text.trim() : null,
      note: input.note?.trim() || null,
      recordedAt: timestamp,
      missionDay: this.config.scenarios[this.state].missionDay,
      source: 'ASTRONAUT_INPUT',
      interpretation: null,
      interpretationNote: meta.interpretationNote,
    };
    this.manualLog = [...this.manualLog, entry];
    this.publish({ ...this.snapshot.packet, manual: this.manualRecords() });
    return entry;
  }

  getManualLog(): ManualEntry[] {
    return this.manualLog;
  }

  private manualRecords(): ManualRecords {
    const latest = { bloodGlucose: null, bodyTemperature: null, mood: null } as Record<ManualVariable, ManualEntry | null>;
    for (const e of this.manualLog) latest[e.variable] = e;
    return { latest, log: this.manualLog };
  }

  /** Genera y emite un paquete inmediatamente (`force` ignora la pausa). */
  tick(force = false): void {
    if (this.paused && !force) return;
    const packet = this.generate(Date.now());
    this.history = [...this.history, packet].slice(-this.historySize);
    this.publish(packet);
  }

  /* ---------- Generación ---------- */

  private publish(packet: TelemetryPacket): void {
    this.snapshot = this.buildSnapshot(packet);
    this.listeners.forEach((l) => l(this.snapshot));
  }

  private buildSnapshot(packet: TelemetryPacket): StreamSnapshot {
    return { packet, history: this.history, state: this.state, paused: this.paused, intervalMs: this.intervalMs };
  }

  private gauss(): number {
    const u = 1 - this.rand();
    const v = this.rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Valor dentro del intervalo publicado [lo, hi] alrededor del valor central publicado. */
  private sample(k: MetricKey): number {
    const m = this.config.measurements[k];
    const { lo, hi } = m.interval;
    const sigma = ((hi - lo) / 2) * STEP_FRACTION;
    this.dev[k] = clamp(this.dev[k] * PERSISTENCE + sigma * this.gauss(), lo - m.center, hi - m.center);
    return round(clamp(m.center + this.dev[k], lo, hi), m.decimals);
  }

  private generate(timestamp: number): TelemetryPacket {
    const cfg = this.config;
    const scenario = cfg.scenarios[this.state];
    const v = {} as Record<MetricKey, number>;
    for (const k of METRIC_KEYS) v[k] = this.sample(k);

    this.delaySec = clamp(this.delaySec + this.gauss() * 1.5, cfg.commsDelay.minSec, cfg.commsDelay.maxSec);

    const left: IJVSide = { ...scenario.ijvLeft, csaMm2: v.ijvCsaMm2 };
    const decision = evaluateVteAlgorithm({ flowPattern: left.flowPattern, thrombus: left.thrombus }, cfg.crew.vteRisk);
    const screeningDays = IJV_SCREENING.exampleSchedule180dISS.inflightLaunchDays;
    const day = scenario.missionDay;

    const ultrasound: IJVUltrasound = {
      screening: {
        protocolDays: screeningDays,
        nextScreeningDay: screeningDays.find((d) => d > day) ?? null,
        rescanGuidance: decision.branch === 'NO_TREATMENT' ? null : STASIS_WITHOUT_RISK_FACTORS.citation.quote,
        citation: IJV_SCREENING.citation,
      },
      left,
      right: null,
      indexSide: 'LEFT',
      flowPattern: left.flowPattern,
      flowLabel: left.flowPattern ? IJV_FLOW_PATTERNS[left.flowPattern].label : 'No reportado en la fuente',
      stasis: decision.stasis,
      thrombus: left.thrombus,
      thrombusSide: left.thrombus ? 'LEFT' : null,
      csaMm2: v.ijvCsaMm2,
    };

    if (decision.status === 'RED' && this.lastStatus !== 'RED') {
      const entry: QueuedTransmission = {
        id: `HMD-${cfg.crew.id}-L${day}-${(timestamp % 0xfffff).toString(16).toUpperCase()}`,
        createdAt: timestamp,
        etaEarthAt: timestamp + this.delaySec * 1000,
        priority: 'MEDEVENT',
        status: 'QUEUED',
        summary: `Trombosis IJV izquierda · ${decision.regimenSummary}`,
      };
      this.queue = [...this.queue, entry].slice(-10);
    }
    this.lastStatus = decision.status;
    this.queue = this.queue.map((q): QueuedTransmission => ({
      ...q,
      status: timestamp >= q.etaEarthAt ? 'DELIVERED' : timestamp > q.createdAt + 2000 ? 'IN_FLIGHT' : 'QUEUED',
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
        bloodPressure: { systolic: v.systolicMmHg, diastolic: v.diastolicMmHg, map: v.meanArterialMmHg },
      },
      neuro: { hrvRmssdMs: v.hrvRmssdMs, sleepHours: v.sleepHours },
      ultrasound,
      clinical: decision,
      flightRules: {
        evaAuthorized: decision.evaAuthorized,
        aredAuthorized: decision.aredAuthorized,
        restrictionDays: decision.restrictionDays,
        notes: decision.actions,
      },
      medication: toMedication(decision),
      countermeasures: ochmoCountermeasures(decision),
      comms: {
        oneWayDelaySec: delay,
        roundTripSec: delay * 2,
        mode: 'LOCAL_AUTONOMOUS',
        queue: this.queue,
        basis: { min: cfg.commsDelay.minBasis, max: cfg.commsDelay.maxBasis },
      },
      metricSources: this.metricSources,
      scenarioEvidence: scenario.evidence,
      unavailable: cfg.unavailable ?? [],
      manual: this.manualRecords(),
      provenance: {
        clinicalRules: `${OCHMO_MTB_007.id} rev ${OCHMO_MTB_007.revision}`,
        crewProfile: cfg.crew.source,
        measurements: 'PUBLISHED_INFLIGHT_DATA',
        temporalDynamics: 'SYNTHETIC_WITHIN_PUBLISHED_INTERVAL',
      },
    };
  }
}

/* ================================================================
 * 4. SINGLETON (el hook de React está en src/useNasaTelemetry.ts)
 * ================================================================ */

let singleton: NasaMockStream | null = null;

export function initNasaStream(opts: NasaMockStreamOptions): NasaMockStream {
  if (singleton) singleton.stop();
  singleton = new NasaMockStream(opts);
  return singleton;
}

export function getNasaStream(): NasaMockStream {
  if (!singleton) throw new Error('NasaMockStream no inicializado: llama a initNasaStream(config) primero.');
  return singleton;
}

/* ================================================================
 * 5. UTILIDADES DE PRESENTACIÓN
 * ================================================================ */

export const formatDelay = (sec: number): string => `${Math.floor(sec / 60)}m ${String(Math.round(sec % 60)).padStart(2, '0')}s`;

export const STATE_LABELS: Record<SimulationState, string> = {
  NOMINAL: 'Nominal (Verde)',
  PRETHROMBOTIC: 'Estasis Pre-trombótica (Amarillo)',
  EMERGENCY_THROMBOSIS: 'Trombo IJV (Rojo)',
};

export const FLOW_LABELS: Record<IJVFlowPattern, string> = {
  antegrade: 'Anterógrado',
  stagnant: 'Estancado (estasis)',
  retrograde: 'Retrógrado',
};
```
