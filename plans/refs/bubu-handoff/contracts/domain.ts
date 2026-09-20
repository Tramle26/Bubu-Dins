/** Framework-independent proposed domain contracts. These are NOT PathMX exports.
 * Map them to the destination repo's verified Sources/Views/Actions and schemas.
 * Runtime validation, authorization, and durable uniqueness are still required.
 */
export type TopicId = 'housing' | 'investing';
export type ScenarioId = 'house-v1' | 'bank-v1';
export type CurrencyCents = number; // finite safe integer; validate at boundaries
export type Coins = number; // nonnegative safe integer for balances
export type BasisPoints = number; // integer 0..10000
export type DemoMode = 'live' | 'rehearsal';
export type CriterionId =
  | 'H1.costs' | 'H2.term' | 'H3.context'
  | 'I1.diversification' | 'I2.goal' | 'I3.uncertainty';
export type CriterionStatus = 'not_shown' | 'needs_revision' | 'met';

export interface VersionedContext {
  demoEpoch: string;
  mode: DemoMode;
  topicId: TopicId;
  topicVersion: string;
  rubricVersion: string;
}

/** Identity comes from the admitted server context, never a browser payload. */
export interface LearnerScope {
  actorSourceId: string;
  demoEpoch: string;
  mode: DemoMode;
}

export interface StudentMessage {
  id: string;
  reviewId: string;
  answerVersion: number;
  questionId: string;
  text: string;
}

export interface CriterionEvidence {
  criterionId: CriterionId;
  status: CriterionStatus;
  evidence: ReadonlyArray<{ messageId: string; quote: string }>;
  feedback: string; // concise explanation, not hidden chain-of-thought
}

export interface EvaluatorResult {
  reviewId: string;
  answerVersion: number;
  rubricVersion: string;
  criteria: ReadonlyArray<CriterionEvidence>;
  nextQuestionId: string | null; // validated against authored question registry
  studentFeedback: string;
  sourceIds: ReadonlyArray<string>; // validated registry entries only
}

/** Browser may submit this, but cannot submit an EvaluatorResult as authority. */
export interface AnswerRequest {
  reviewId: string;
  questionId: string;
  expectedAnswerVersion: number;
  clientRequestId: string;
  text: string;
}

export interface ReviewRecord extends VersionedContext {
  id: string;
  revision: number;
  status: 'ready' | 'in_progress' | 'pending' | 'needs_revision' | 'passed';
  studentMessageIds: ReadonlyArray<string>;
  acceptedEvaluationIds: ReadonlyArray<string>;
  criterionState: ReadonlyArray<CriterionEvidence>;
  passedAt: string | null; // server calculated from accepted criteria/prerequisites
}

export interface LedgerEvent {
  id: string;
  scope: LearnerScope;
  uniqueDomainKey: string;
  deltaCoins: number; // signed safe integer; amount derived by server policy
  reason: 'topic_pass' | 'scenario_provision' | 'demo_seed';
  relatedRecordId: string;
  rewardPolicyVersion: string;
  createdAt: string;
}

export interface Entitlement {
  id: string;
  scope: LearnerScope;
  scenarioId: ScenarioId;
  debitEventId: string;
  provisionedAt: string;
}

export interface ProvisionRequest {
  scenarioId: ScenarioId;
  clientRequestId: string;
  // No caller-supplied price, balance, target record path, or actorId.
}

export interface HousingInputs {
  downPaymentBps: 1000 | 2000;
  termMonths: 180 | 360;
  stayMonths: 24 | 84;
}

export interface InvestmentInputs {
  allocationBps: Readonly<Record<'bobo' | 'cedar' | 'meadow' | 'cash', BasisPoints>>;
}

export interface RunRecord {
  id: string;
  scope: LearnerScope;
  scenarioId: ScenarioId;
  fixtureVersion: string;
  calculationVersion: string;
  revision: number;
  mode: 'guided' | 'explore';
  inputs: HousingInputs | InvestmentInputs;
  prediction: string;
  revealedRound: number;
  // Replace unknown with a validated discriminated union in implementation.
  outputSnapshot: unknown;
  reflection: string;
  status: 'draft' | 'predicted' | 'observing' | 'reflected';
}

export interface AdvanceRoundRequest {
  runId: string;
  expectedRunRevision: number;
  expectedPreviousRound: number;
  clientRequestId: string;
}

export interface TutorContext extends VersionedContext {
  reviewId: string;
  answerVersion: number;
  currentQuestionId: string;
  learnerMessages: ReadonlyArray<StudentMessage>;
  acceptedEvidence: ReadonlyArray<CriterionEvidence>;
  sourcePacket: ReadonlyArray<{ id: string; title: string; reviewedText: string }>;
  allowedQuestionIds: ReadonlyArray<string>;
  revealedSimulationSnapshot: unknown;
}

export interface TeachingContext extends VersionedContext {
  activityId: string;
  modeOfInstruction: 'learn' | 'practice' | 'explore';
  prompt: string;
  sourcePacket: ReadonlyArray<{ id: string; title: string; reviewedText: string }>;
  revealedSimulationSnapshot: unknown;
}

export interface TutorReply {
  text: string;
  sourceIds: ReadonlyArray<string>;
  chartRequest: ChartRequest | null;
}

export interface TutorProvider {
  /** Topic-bounded teaching response; all requested tools are separately authorized. */
  respond(context: TeachingContext, signal: AbortSignal): Promise<TutorReply>;
  /** Network call outside a storage transaction. Provider/model are configured server-side. */
  evaluate(context: TutorContext, signal: AbortSignal): Promise<EvaluatorResult>;
}

/** Proposed internal tool choices, NOT arbitrary generated chart code. */
export type ChartRequest =
  | { kind: 'housing_comparison'; runId: string; metric: 'cash_flow' | 'ending_position' }
  | { kind: 'portfolio_history'; runId: string }
  | { kind: 'allocation'; runId: string };

export interface AssetPlacement {
  assetId: string;
  centerX: number; // scene logical pixels, not browser viewport pixels
  baselineY: number;
  width: number;
  labelX: number;
  labelY: number;
}
