/**
 * DEMO — perfil ficticio + ensamblado de la configuración.
 * ------------------------------------------------------------------
 * Lo único inventado de este archivo es la identidad de la tripulante (nombre, ID y
 * misión), marcada como `FICTIONAL_DEMO`. Sus entradas de riesgo son las variables
 * del algoritmo OCHMO, no datos medidos.
 * Todos los valores numéricos vienen de src/reference/ (con cita) o de src/nasa/ (OCHMO-MTB-007).
 */
import type { CrewProfile, NasaMockStreamConfig } from '../nasaMockStream';
import { EARTH_MARS_DISTANCE, INFLIGHT_MEASUREMENTS, MARS_COMMS_DELAY, UNAVAILABLE_VARIABLES } from '../reference/literature';
import { EVIDENCE_SCENARIOS } from '../reference/scenarios';

/** Tripulante ficticia (identidad tomada del brief del equipo, no es una persona real). */
export const DEMO_ASTRONAUT: CrewProfile = {
  id: 'ASTRO-04',
  name: 'Dra. Elena Vance',
  mission: 'Artemis IV / Mars Transit',
  role: 'Especialista de Misión',
  source: 'FICTIONAL_DEMO',
  vteRisk: {
    thrombophilia: false,
    familyHistoryUnprovokedVTE: false,
    hormone: 'LNG_IUD',
  },
};

/**
 * Delay por sentido Tierra–Marte, derivado como distancia publicada por la NASA / c.
 * (El enunciado del reto Space Apps 2026 "Health Monitoring Software" no fija ningún delay.)
 */
export const DEMO_COMMS_DELAY = {
  minSec: MARS_COMMS_DELAY.minOneWaySec,
  maxSec: MARS_COMMS_DELAY.maxOneWaySec,
  minBasis: `${EARTH_MARS_DISTANCE.min.source.citation} "${EARTH_MARS_DISTANCE.min.quote}" → 33.9e6 mi × 1.609344 km/mi / c`,
  maxBasis: `${EARTH_MARS_DISTANCE.max.source.citation} "${EARTH_MARS_DISTANCE.max.quote}" → 400e6 km / c. Corroborado: ${MARS_COMMS_DELAY.corroboration.source.citation} "${MARS_COMMS_DELAY.corroboration.quote}"`,
};

export const DEMO_STREAM_CONFIG: NasaMockStreamConfig = {
  crew: DEMO_ASTRONAUT,
  scenarios: EVIDENCE_SCENARIOS,
  measurements: INFLIGHT_MEASUREMENTS,
  commsDelay: DEMO_COMMS_DELAY,
  unavailable: UNAVAILABLE_VARIABLES,
};
