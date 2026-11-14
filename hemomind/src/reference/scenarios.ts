/**
 * Escenarios basados en hallazgos publicados (no inventados).
 * ------------------------------------------------------------------
 * Los tres estados reproducen hallazgos reales de la IJV izquierda en la sesión de
 * ecografía del día de vuelo ~50 de Marshall-Goebel et al. 2019 (n = 11, ISS).
 * Solo cambia el hallazgo ecográfico. Las constantes vitales NO cambian entre estados,
 * porque ninguna fuente las asocia a la estasis o a la trombosis (ver UNAVAILABLE_VARIABLES).
 */
import type { IJVFlowPattern } from '../nasa/ochmoMtb007';
import { IJVFlowGrade, IJV_FINDINGS_FD50, IJV_FLOW_GRADES, SourceRef } from './literature';

export type SimulationState = 'NOMINAL' | 'PRETHROMBOTIC' | 'EMERGENCY_THROMBOSIS';

export interface Evidence {
  quote: string;
  source: SourceRef;
}

export interface EvidenceScenario {
  missionDay: number;
  missionDayLabel: string;
  ijvLeft: {
    /** Grado de Marshall-Goebel (1–4); null = no reportado en la fuente. */
    flowGrade: IJVFlowGrade | null;
    flowPattern: IJVFlowPattern | null;
    thrombus: boolean;
    occlusive: boolean;
  };
  description: string;
  evidence: Evidence[];
}

const MG = IJV_FINDINGS_FD50;
const grade = (g: IJVFlowGrade): Evidence => ({ quote: IJV_FLOW_GRADES[g].quote, source: MG.sessionTiming.source });

export const EVIDENCE_SCENARIOS: Record<SimulationState, EvidenceScenario> = {
  NOMINAL: {
    missionDay: 50,
    missionDayLabel: 'L+~50 (rango 33–63)',
    ijvLeft: { flowGrade: 1, flowPattern: 'antegrade', thrombus: false, occlusive: false },
    description: 'Flujo anterógrado continuo (grado 1), como en los 5 de 11 tripulantes sin flujo estancado ni inverso en el día de vuelo ~50.',
    evidence: [MG.sessionTiming, MG.stagnantOrReverse, grade(1)],
  },
  PRETHROMBOTIC: {
    missionDay: 50,
    missionDayLabel: 'L+~50 (rango 33–63)',
    ijvLeft: { flowGrade: 3, flowPattern: 'stagnant', thrombus: false, occlusive: false },
    description: 'Flujo estancado (grado 3), observado en 5 de 11 tripulantes en el día de vuelo ~50.',
    evidence: [MG.sessionTiming, MG.stagnantFlow, grade(3)],
  },
  EMERGENCY_THROMBOSIS: {
    missionDay: 50,
    missionDayLabel: 'L+50',
    ijvLeft: { flowGrade: null, flowPattern: null, thrombus: true, occlusive: true },
    description: 'Trombo oclusivo en la IJV izquierda descubierto en el día de vuelo 50. La fuente no publica el grado de flujo de ese caso.',
    evidence: [MG.occlusiveThrombus, MG.onlyLeftImaged],
  },
};
