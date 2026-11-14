/**
 * Algoritmo "Spaceflight Venous Thrombosis Management" — OCHMO-MTB-007 p.14
 * (modificado de Bostick et al., 2025). Función pura: sin datos de demo.
 *
 *   ¿Trombosis? ── Sí → Tratamiento Apixaban 10 mg 2×/día 7 d → 5 mg 2×/día; EVA+ARED ≥30 d; lavado 48 h
 *        │
 *        No → ¿Estasis? ── No → Sin tratamiento
 *                  │
 *                  Sí → ¿Trombofilia, historia familiar u hormona de mayor riesgo?
 *                          ├─ Sí → Profilaxis Apixaban 2.5 mg 2×/día; lavado 24 h
 *                          └─ No → Monitorización aumentada + hidratación
 */
import {
  ALGORITHM_RISK_FACTORS,
  APIXABAN,
  Citation,
  DosePhase,
  ESTROGEN_COC_WITH_DOAC,
  FLOW_RISK_INTERPRETATION,
  HORMONE_TABLE,
  HORMONE_TABLE_CITATION,
  HormoneId,
  IJVFlowPattern,
  LANDING_WASHOUT_HOURS,
  STASIS_WITHOUT_RISK_FACTORS,
  THROMBOSIS_OPERATIONS,
  isEstrogenCOC,
  isHigherRiskHormone,
} from './ochmoMtb007';

/** Entradas clínicas que exige el algoritmo (sin nombre, misión ni otros datos personales). */
export interface VteRiskProfile {
  thrombophilia: boolean;
  /** Trombosis no provocada en familiares inmediatos. */
  familyHistoryUnprovokedVTE: boolean;
  hormone: HormoneId;
}

export interface IJVFinding {
  /** null = patrón no reportado; solo se admite si hay trombo (el algoritmo trata con o sin estasis). */
  flowPattern: IJVFlowPattern | null;
  thrombus: boolean;
}

export type VteBranch = 'TREATMENT' | 'PROPHYLAXIS' | 'INCREASED_MONITORING' | 'NO_TREATMENT';
export type StatusColor = 'GREEN' | 'YELLOW' | 'RED';

export interface VteDecision {
  branch: VteBranch;
  status: StatusColor;
  stasis: boolean;
  riskFactorsPresent: string[];
  regimen: DosePhase[];
  regimenSummary: string;
  evaAuthorized: boolean;
  aredAuthorized: boolean;
  restrictionDays: number | null;
  landingWashoutHours: number | null;
  hormoneAction: string;
  actions: string[];
  citations: Citation[];
}

export function riskFactorsOf(p: VteRiskProfile): string[] {
  const out: string[] = [];
  if (p.thrombophilia) out.push('Trombofilia');
  if (p.familyHistoryUnprovokedVTE) out.push('Historia familiar de TEV no provocada');
  if (isHigherRiskHormone(p.hormone)) out.push(`Hormona de mayor riesgo: ${HORMONE_TABLE[p.hormone].label} (${HORMONE_TABLE[p.hormone].relativeRisk})`);
  return out;
}

export const formatRegimen = (phases: DosePhase[]): string =>
  phases
    .map((ph) => `${ph.drug} ${ph.doseMg} mg ${ph.timesPerDay === 2 ? 'dos veces al día' : `${ph.timesPerDay}×/día`}${ph.durationDays ? ` × ${ph.durationDays} días` : ''}`)
    .join(', luego ');

function hormoneActionFor(hormone: HormoneId, onDoac: boolean): string {
  const h = HORMONE_TABLE[hormone];
  if (hormone === 'NONE') return 'Sin terapia hormonal activa.';
  if (onDoac && isEstrogenCOC(hormone)) return `No suspender ${h.label} durante el DOAC (riesgo de sangrado uterino anormal, OCHMO p.12).`;
  if (h.vteRisk === 'LOW_NO_INCREASE') return `${h.label}: riesgo de TEV bajo/sin aumento (tabla OCHMO p.6); el brief no indica retirarlo.`;
  return `${h.label}: hormona de mayor riesgo de TEV (${h.relativeRisk}, tabla OCHMO p.6).`;
}

/** Implementa el diagrama de flujo de OCHMO-MTB-007 p.14. */
export function evaluateVteAlgorithm(finding: IJVFinding, profile: VteRiskProfile): VteDecision {
  const stasis = finding.flowPattern === 'stagnant';
  const riskFactorsPresent = riskFactorsOf(profile);

  if (finding.thrombus) {
    // "treatment consists of administering an anticoagulant regardless of stasis status" (p.12)
    return {
      branch: 'TREATMENT',
      status: 'RED',
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
        `Restringir EVA y ARED durante al menos ${THROMBOSIS_OPERATIONS.restrictEvaDays} días.`,
        `${THROMBOSIS_OPERATIONS.allowedExercise}.`,
        `Si está clínicamente estable, favorecer permanecer en órbita ≥${THROMBOSIS_OPERATIONS.favorRemainOnOrbitDays} días para completar la terapia.`,
        `Suspender Apixaban al menos ${LANDING_WASHOUT_HOURS.treatment} h antes del aterrizaje.`,
      ],
      citations: [APIXABAN.treatmentCitation, THROMBOSIS_OPERATIONS.citation, LANDING_WASHOUT_HOURS.citation, ESTROGEN_COC_WITH_DOAC.citation],
    };
  }

  if (finding.flowPattern === null) {
    throw new Error('evaluateVteAlgorithm: sin trombo, el patrón de flujo es obligatorio para evaluar la estasis.');
  }

  if (!stasis) {
    const retro = finding.flowPattern === 'retrograde';
    return {
      branch: 'NO_TREATMENT',
      status: 'GREEN',
      stasis,
      riskFactorsPresent,
      regimen: [],
      regimenSummary: 'Sin tratamiento',
      evaAuthorized: true,
      aredAuthorized: true,
      restrictionDays: null,
      landingWashoutHours: null,
      hormoneAction: hormoneActionFor(profile.hormone, false),
      actions: retro
        ? ['Flujo retrógrado sin estasis ni trombo: no es contribuyente principal; vigilar por si se forma un trombo.']
        : ['Sin hallazgos: continuar cribado según calendario.'],
      citations: [FLOW_RISK_INTERPRETATION.citation],
    };
  }

  if (riskFactorsPresent.length > 0) {
    return {
      branch: 'PROPHYLAXIS',
      status: 'YELLOW',
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
      citations: [APIXABAN.prophylaxisCitation, ALGORITHM_RISK_FACTORS.citation, HORMONE_TABLE_CITATION, LANDING_WASHOUT_HOURS.citation],
    };
  }

  return {
    branch: 'INCREASED_MONITORING',
    status: 'YELLOW',
    stasis,
    riskFactorsPresent,
    regimen: [],
    regimenSummary: 'Sin anticoagulación',
    evaAuthorized: true,
    aredAuthorized: true,
    restrictionDays: null,
    landingWashoutHours: null,
    hormoneAction: hormoneActionFor(profile.hormone, false),
    actions: [STASIS_WITHOUT_RISK_FACTORS.action],
    citations: [STASIS_WITHOUT_RISK_FACTORS.citation, ALGORITHM_RISK_FACTORS.citation],
  };
}
