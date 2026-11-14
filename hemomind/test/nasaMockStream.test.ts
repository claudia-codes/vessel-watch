import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { METRIC_KEYS, MetricKey, NasaMockStream, SimulationState, TelemetryPacket } from '../src/nasaMockStream';
import { DEMO_ASTRONAUT, DEMO_COMMS_DELAY, DEMO_STREAM_CONFIG } from '../src/demo/demoScenario';
import { EARTH_MARS_DISTANCE, INFLIGHT_MEASUREMENTS, MARS_COMMS_DELAY } from '../src/reference/literature';
import { EVIDENCE_SCENARIOS } from '../src/reference/scenarios';

const STATES: SimulationState[] = ['NOMINAL', 'PRETHROMBOTIC', 'EMERGENCY_THROMBOSIS'];

const valueOf = (p: TelemetryPacket, k: MetricKey): number =>
  ({
    heartRateBpm: p.vitals.heartRateBpm,
    systolicMmHg: p.vitals.bloodPressure.systolic,
    diastolicMmHg: p.vitals.bloodPressure.diastolic,
    meanArterialMmHg: p.vitals.bloodPressure.map,
    hrvRmssdMs: p.neuro.hrvRmssdMs,
    sleepHours: p.neuro.sleepHours,
    ijvCsaMm2: p.ultrasound.csaMm2,
  })[k];

/** Normaliza la cita: punto medio "6·09" → "6.09". */
const norm = (s: string) => s.replace(/·/g, '.');

describe('Rigor de los datos de referencia', () => {
  it('cada número de INFLIGHT_MEASUREMENTS aparece literalmente en su cita', () => {
    for (const [k, m] of Object.entries(INFLIGHT_MEASUREMENTS)) {
      const q = norm(m.quote);
      expect(q, `${k}: valor central`).toContain(m.center.toFixed(m.decimals === 0 ? 0 : String(m.center).split('.')[1]?.length ?? 0));
      if (m.intervalType === 'CI95') {
        expect(q, `${k}: IC inferior`).toContain(String(m.interval.lo));
        expect(q, `${k}: IC superior`).toContain(String(m.interval.hi));
      } else {
        const half = +(m.interval.hi - m.center).toFixed(2);
        expect(q, `${k}: dispersión`).toContain(String(half));
      }
      expect(m.source.url, k).toMatch(/^https:\/\//);
      expect(m.n, k).toBeGreaterThan(0);
    }
  });

  it('delay = distancia NASA / c; las distancias aparecen en sus citas y el máximo concuerda con el white paper (22 min)', () => {
    expect(EARTH_MARS_DISTANCE.min.quote).toContain('33.9 million miles');
    expect(EARTH_MARS_DISTANCE.max.quote).toContain('400 million km');
    expect(MARS_COMMS_DELAY.minOneWaySec).toBe(182); // 54.56e6 km / 299792.458 km/s
    expect(MARS_COMMS_DELAY.maxOneWaySec).toBe(1334); // 400e6 km / 299792.458 km/s
    expect(Math.round(MARS_COMMS_DELAY.maxOneWaySec / 60)).toBe(22);
    expect(MARS_COMMS_DELAY.corroboration.quote).toContain('22 minutes');
    expect(DEMO_COMMS_DELAY.minSec).toBe(MARS_COMMS_DELAY.minOneWaySec);
    expect(DEMO_COMMS_DELAY.maxSec).toBe(MARS_COMMS_DELAY.maxOneWaySec);
    expect(DEMO_COMMS_DELAY.minBasis + DEMO_COMMS_DELAY.maxBasis).not.toMatch(/reto|challenge/i);
  });

  it('cada escenario aporta evidencia citada', () => {
    for (const s of STATES) {
      expect(EVIDENCE_SCENARIOS[s].evidence.length, s).toBeGreaterThan(0);
      for (const e of EVIDENCE_SCENARIOS[s].evidence) expect(e.source.doi ?? e.source.url).toBeTruthy();
    }
  });

  it('ni el motor ni src/nasa contienen números fisiológicos ni datos de demo', () => {
    for (const f of ['src/nasaMockStream.ts', 'src/nasa/ochmoMtb007.ts', 'src/nasa/vteAlgorithm.ts']) {
      const code = readFileSync(resolve(process.cwd(), f), 'utf8');
      expect(code, f).not.toMatch(/from\s+['"][^'"]*demo/);
      expect(code, f).not.toMatch(/Elena|ASTRO-04|Artemis/);
    }
  });
});

describe('Paquetes emitidos', () => {
  for (const state of STATES) {
    it(`${state}: 500 paquetes, todas las métricas dentro del intervalo publicado`, () => {
      const s = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 42, initialState: state });
      for (let i = 0; i < 500; i++) {
        s.tick(true);
        const p = s.getSnapshot().packet;
        for (const k of METRIC_KEYS) {
          const { lo, hi } = INFLIGHT_MEASUREMENTS[k].interval;
          const v = valueOf(p, k);
          expect(v, `${state}.${k}`).toBeGreaterThanOrEqual(lo - 1e-9);
          expect(v, `${state}.${k}`).toBeLessThanOrEqual(hi + 1e-9);
        }
        expect(p.comms.oneWayDelaySec).toBeGreaterThanOrEqual(DEMO_COMMS_DELAY.minSec);
        expect(p.comms.oneWayDelaySec).toBeLessThanOrEqual(DEMO_COMMS_DELAY.maxSec);
      }
    });
  }

  it('cada paquete lleva la fuente de cada métrica y la lista de variables no disponibles', () => {
    const p = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 1 }).getSnapshot().packet;
    for (const k of METRIC_KEYS) {
      expect(p.metricSources[k].quote).toBe(INFLIGHT_MEASUREMENTS[k].quote);
      expect(p.metricSources[k].url).toMatch(/^https:\/\//);
    }
    expect(p.unavailable.map((u) => u.variable).join(' ')).toMatch(/Glucosa/);
    expect(p.provenance).toEqual({
      clinicalRules: 'OCHMO-MTB-007 rev 8-Jan-26',
      crewProfile: 'FICTIONAL_DEMO',
      measurements: 'PUBLISHED_INFLIGHT_DATA',
      temporalDynamics: 'SYNTHETIC_WITHIN_PUBLISHED_INTERVAL',
    });
  });

  it('el paquete no expone variables sin fuente', () => {
    const p = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 1 }).getSnapshot().packet as unknown as Record<string, unknown>;
    expect(p).not.toHaveProperty('readinessScore');
    expect(p.vitals).not.toHaveProperty('glucoseMgDl');
    expect(p.vitals).not.toHaveProperty('temperatureC');
    expect(p.neuro).not.toHaveProperty('cortisolSweatNgMl');
    expect(p.neuro).not.toHaveProperty('moodScore');
    expect((p.ultrasound as Record<string, unknown>).right).toBeNull();
  });
});

describe('Escenarios → algoritmo OCHMO', () => {
  it('NOMINAL (grado 1) → NO_TREATMENT, verde', () => {
    const p = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 3 }).getSnapshot().packet;
    expect(p.status).toBe('GREEN');
    expect(p.clinical.branch).toBe('NO_TREATMENT');
    expect(p.ultrasound.left.flowGrade).toBe(1);
    expect(p.ultrasound.screening.nextScreeningDay).toBe(60);
  });

  it('PRETHROMBOTIC (grado 3, perfil sin factores) → INCREASED_MONITORING sin fármaco', () => {
    const p = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 3, initialState: 'PRETHROMBOTIC' }).getSnapshot().packet;
    expect(p.status).toBe('YELLOW');
    expect(p.clinical.branch).toBe('INCREASED_MONITORING');
    expect(p.medication.drug).toBeNull();
    expect(p.countermeasures.map((c) => c.citation.page)).toEqual([12, 12]);
  });

  it('PRETHROMBOTIC + trombofilia → PROPHYLAXIS 2.5 mg c/12h, lavado 24 h', () => {
    const crew = { ...DEMO_ASTRONAUT, vteRisk: { ...DEMO_ASTRONAUT.vteRisk, thrombophilia: true } };
    const p = new NasaMockStream({ ...DEMO_STREAM_CONFIG, crew, seed: 3, initialState: 'PRETHROMBOTIC' }).getSnapshot().packet;
    expect(p.clinical.branch).toBe('PROPHYLAXIS');
    expect(p.medication.phases).toEqual([{ doseMg: 2.5, intervalHours: 12, durationDays: null, label: 'Profilaxis' }]);
    expect(p.medication.preLandingWashoutHours).toBe(24);
  });

  it('EMERGENCY_THROMBOSIS → TREATMENT; flujo no reportado; un paquete a Houston por entrada', () => {
    const s = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 3 });
    s.setSimulationState('EMERGENCY_THROMBOSIS');
    for (let i = 0; i < 20; i++) s.tick(true);
    const p = s.getSnapshot().packet;
    expect(p.status).toBe('RED');
    expect(p.ultrasound.flowPattern).toBeNull();
    expect(p.ultrasound.left.occlusive).toBe(true);
    expect(p.medication.phases.map((x) => [x.doseMg, x.intervalHours, x.durationDays])).toEqual([[10, 12, 7], [5, 12, null]]);
    expect(p.flightRules).toMatchObject({ evaAuthorized: false, aredAuthorized: false, restrictionDays: 30 });
    expect(p.medication.preLandingWashoutHours).toBe(48);
    expect(p.comms.queue).toHaveLength(1);
    s.setSimulationState('NOMINAL');
    s.setSimulationState('EMERGENCY_THROMBOSIS');
    expect(s.getSnapshot().packet.comms.queue).toHaveLength(2);
  });
});

describe('Motor', () => {
  it('exige configuración completa', () => {
    // @ts-expect-error — config obligatoria
    expect(() => new NasaMockStream()).toThrow(/config/);
    const { measurements, ...rest } = DEMO_STREAM_CONFIG;
    const partial = { ...measurements } as Partial<typeof measurements>;
    delete partial.sleepHours;
    expect(() => new NasaMockStream({ ...rest, measurements: partial as typeof measurements })).toThrow(/sleepHours/);
  });

  it('reproducible con la misma semilla', () => {
    const run = () => {
      const s = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 99 });
      for (let i = 0; i < 50; i++) s.tick(true);
      const p = s.getSnapshot().packet;
      return METRIC_KEYS.map((k) => valueOf(p, k));
    };
    expect(run()).toEqual(run());
  });

  it('pausa: tick normal no emite; resume sí', () => {
    const s = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 5 });
    s.pause();
    const seq = s.getSnapshot().packet.seq;
    s.tick();
    expect(s.getSnapshot().packet.seq).toBe(seq);
    s.resume();
    expect(s.getSnapshot().packet.seq).toBe(seq + 1);
    s.stop();
  });

  it('subscribe y cancelación; historial acotado', () => {
    const s = new NasaMockStream({ ...DEMO_STREAM_CONFIG, seed: 5, historySize: 20 });
    const seen: number[] = [];
    const off = s.subscribe((snap) => seen.push(snap.packet.seq));
    s.tick(true);
    off();
    s.tick(true);
    expect(seen).toHaveLength(1);
    for (let i = 0; i < 100; i++) s.tick(true);
    expect(s.getSnapshot().history).toHaveLength(20);
  });
});
