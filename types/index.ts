export type Jurisdiction = 'ERCOT' | 'PJM' | 'CAISO' | 'MISO' | 'NYISO' | 'SPP' | 'WECC'
export type AssetType = 'BESS' | 'MICROGRID' | 'DER_CLUSTER' | 'SOLAR_PV' | 'WIND' | 'SOLAR_BESS_HYBRID'
export type ConnectionMethod = 'DIRECT_API' | 'IOT_GATEWAY' | 'DATA_BRIDGE' | 'IEEE_2030_5'

export type PtoStatus = 'PRE_PROCESSING' | 'PROCESSING' | 'APPROVED' | 'REJECTED'

export type ProjectStatus =
  | 'DRAFT'
  | 'COMING_SOON'
  | 'DOCUMENTS_PENDING'
  | 'TELEMETRY_PENDING'
  | 'SUBMITTED'
  | 'ACTIVE'
  | 'PUBLISHED_FOR_FINANCE'  // developer published; financiers can submit offers
  | 'OFFER_RECEIVED'          // at least one offer received
  | 'FINANCING_ACCEPTED'      // developer accepted an offer
  | 'PUBLISHED_FOR_SA'        // developer published for securitisation (requires PTO=APPROVED)
  | 'TRANSACTING'
  | 'TOKENISED'

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUESTED' | 'EXPIRED' | 'WITHDRAWN'
export type InterestRateType = 'FIXED' | 'FLOATING'

export interface ProjectFinancials {
  capacityMW?: number
  capacityMWh?: number
  codDate?: string
  assetLifeYears?: number
  ppaCounterparty?: string
  ppaTariffMwh?: number
  ppaContractEndDate?: string
  totalCapexM?: number
  debtPct?: number
  equityPct?: number
  annualRevenueM?: number
  annualOpexM?: number
  annualDebtServiceM?: number
  gapFundingEligible?: boolean
  gapFundingProgram?: string
  assetDetails?: Record<string, unknown>
}

export interface FinancierOffer {
  id: string
  projectId: string
  financierId: string
  financierName?: string
  financierCompany?: string
  loanAmountM: number
  rateType: InterestRateType
  ratePct?: number
  sofrSpreadPct?: number
  tenorYears: number
  dscrCovenant: number
  securityRequirements?: string
  conditionsPrecedent?: string
  expiresAt: string
  status: OfferStatus
  revisionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SavedQualificationGate {
  id: string
  label: string
  category: string
  status: 'PASS' | 'FAIL' | 'REVIEW'
  metric: string
  icon: string
}

export interface DocumentRecord {
  type: 'TECHNICAL_AUDIT' | 'PPA_AGREEMENT' | 'INTERCONNECTION_STUDY' | 'INSURANCE_CERTIFICATE' | 'BESPA_AGREEMENT' | 'LEGAL_TITLE'
  filename: string
  uploadedAt: string
  parsed?: Record<string, string | null>
}

export interface RiskProfile {
  availability: number    // A(t) 0–1
  dscrScore: number       // D(t) 0–1
  verification: number    // V(t) 0–1
  penalty: number         // δ 0–1
  lqComposite: number     // [A×0.40 + D×0.35 + V×0.25] × (1−δ)
  gate: 'PASS' | 'REVIEW' | 'FAIL'
  assessedAt: string
}

export interface TelemetryConfig {
  connectionMethod: ConnectionMethod
  apiEndpoint: string
  assetIdMapping: string
  verified: boolean
  verifiedAt?: string
  riskProfile?: RiskProfile
  dscrProjection?: DSCRYear[]
  qualificationGates?: SavedQualificationGate[]
}

export interface Project {
  id: string
  status: ProjectStatus
  name: string
  location: string
  jurisdiction: Jurisdiction
  assetType: AssetType
  ptoStatus?: PtoStatus
  financials?: ProjectFinancials
  createdAt: string
  updatedAt: string
  documents: DocumentRecord[]
  telemetry?: TelemetryConfig
}

// ─────────────────────────────────────────
//  TOKEN TYPES
// ─────────────────────────────────────────

export type TokenOperationType =
  | 'ISSUE'
  | 'TRANSFER'
  | 'LOCK'
  | 'UNLOCK'
  | 'PLEDGE'
  | 'REDEEM'
  | 'BURN'
  | 'SPLIT'
  | 'MERGE'

export type TokenStatus = 'ACTIVE' | 'LOCKED' | 'PLEDGED' | 'REDEEMED' | 'BURNED'

export interface LQScore {
  availability: number       // A(t) 0–1
  dscr: number               // D(t) 0–1
  verification: number       // V(t) 0–1
  penalty: number            // δ(t) 0–1
  composite: number          // [A×0.40 + D×0.35 + V×0.25] × (1−δ)
  consecutiveMonths: number
  timestamp: string
  gate: 'PASS' | 'FAIL' | 'PENDING'
}

export interface VGFMilestone {
  id: string
  label: string
  description: string
  amountINR: number
  status: 'RELEASED' | 'LOCKED' | 'PENDING'
  releasedAt?: string
  condition: string
}

export interface TokenOperationRecord {
  id: string
  operation: TokenOperationType
  timestamp: string
  amount?: number
  recipient?: string
  sender?: string
  notes?: string
  txHash?: string
  status: 'CONFIRMED' | 'PENDING' | 'FAILED'
}

export interface DSCRYear {
  year: number
  revenue: number
  opex: number
  debtService: number
  dscr: number
}

export interface Token {
  id: string
  projectId: string
  tokenId: string           // e.g. UNITS-US-ASSET-2026-001
  status: TokenStatus
  nominalValueINR: number   // USD M
  currency: string
  issuedTo: string
  issuedAt: string
  operations: TokenOperationRecord[]
  lqScore: LQScore
  vgfMilestones: VGFMilestone[]
  dscrProjection: DSCRYear[]
  totalCapexINR: number
  debtINR: number
  equityINR: number
  annualRevenueINR: number
  annualOpexINR: number
  annualDebtServiceINR: number
}

// ─────────────────────────────────────────
//  SECURITIES / POOL TYPES
// ─────────────────────────────────────────

export type TrancheClass = 'SENIOR' | 'MEZZANINE' | 'JUNIOR' | 'EQUITY'
export type TrancheRating = 'AAA' | 'AA+' | 'AA' | 'A+' | 'A' | 'BBB' | 'BB' | 'B' | 'NR'
export type TrancheStatus = 'OPEN' | 'SUBSCRIBED' | 'CLOSED' | 'REDEEMED'
export type PoolStatus = 'STRUCTURING' | 'RATED' | 'LISTED' | 'CLOSED' | 'REDEEMED'
export type InvestorType = 'PENSION_FUND' | 'INSURANCE' | 'CREDIT_FUND' | 'DFI' | 'RETAIL' | 'HEDGE_FUND'

export interface TrancheSubscriber {
  id: string
  investorId?: string
  investorType: InvestorType
  amountINR: number
  subscribedAt: string
}

export interface Tranche {
  id: string
  poolId: string
  class: TrancheClass
  rating: TrancheRating
  sizeINR: number           // USD M
  coupon: number            // % p.a.
  tenorYears: number
  isin?: string
  status: TrancheStatus
  subscribedINR: number
  subscribers: TrancheSubscriber[]
  notes?: string
}

export interface QualificationGate {
  id: string
  label: string
  category: string
  status: 'PASS' | 'FAIL' | 'REVIEW'
  metric: string
  notes: string
}

export interface Pool {
  id: string
  name: string
  arranger: string
  ratingAgency?: string
  tokenIds: string[]
  projectIds: string[]
  status: PoolStatus
  totalSizeINR: number
  currency: string
  tranches: Tranche[]
  qualificationGates: QualificationGate[]
  createdAt: string
  ratedAt?: string
  listedAt?: string
  closingDate?: string
  overallDSCR: number
  overallLQ: number
  oc: number                // overcollateralisation %
  cashReserveINR: number
}

// ─────────────────────────────────────────
//  API REQUEST / RESPONSE SHAPES
// ─────────────────────────────────────────

export interface CreateProjectBody {
  name: string
  location: string
  jurisdiction: Jurisdiction
  assetType: AssetType
  actorRole?: string
  revenueTypes?: string[]
  financials?: ProjectFinancials
}

export interface CreateOfferBody {
  loanAmountM: number
  rateType: InterestRateType
  ratePct?: number
  sofrSpreadPct?: number
  tenorYears: number
  dscrCovenant: number
  securityRequirements?: string
  conditionsPrecedent?: string
  expiresAt: string
}

export interface UpdateOfferBody {
  action: 'accept' | 'reject' | 'request_revision' | 'resubmit'
  revisionNotes?: string
  updatedTerms?: Partial<CreateOfferBody>
}

export interface UpdatePtoBody {
  ptoStatus: PtoStatus
}

export interface PublishProjectBody {
  target: 'finance' | 'sa'
}

export interface UpdateDocumentsBody {
  documents: Array<{
    type: DocumentRecord['type']
    filename: string
    parsed?: Record<string, string | null>
  }>
}

export interface UpdateTelemetryBody {
  connectionMethod: ConnectionMethod
  apiEndpoint: string
  assetIdMapping: string
  secretKey: string
}

export interface TelemetryTestResult {
  success: boolean
  latencyMs: number
  metrics: {
    stateOfCharge: number
    netExportMW: number
    voltageLagMs: number
    heatIndexC: number
  }
}

export interface IssueTokenBody {
  projectId: string
  nominalValueINR: number
  issuedTo: string
}

export interface TokenOperationBody {
  operation: TokenOperationType
  amount?: number
  recipient?: string
  notes?: string
}

export interface CreatePoolBody {
  name: string
  tokenIds: string[]
  tranches: Array<{
    class: TrancheClass
    rating: TrancheRating
    sizeINR: number
    coupon: number
    tenorYears: number
  }>
}

export interface SubscribeTrancheBody {
  investorType: InvestorType
  amountINR: number
}

// Discriminated union API envelope — all routes return this
export type ApiSuccess<T> = { ok: true; data: T }
export type ApiError = { ok: false; error: { code: string; message: string } }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// Step routing
export const ONBOARD_STEPS = [
  { step: 1, label: 'PROJECT DETAILS', href: '/onboard/project-details', icon: 'edit_document' },
  { step: 2, label: 'DOCUMENT VAULT',  href: '/onboard/document-vault',  icon: 'shield_lock' },
  { step: 3, label: 'TELEMETRY LINK',  href: '/onboard/telemetry',        icon: 'sensors' },
  { step: 4, label: 'CREDIT PACK',     href: '/onboard/credit-pack',      icon: 'account_balance_wallet' },
  { step: 5, label: 'SUBMISSION',      href: '/onboard/submission',       icon: 'assignment_turned_in' },
] as const

export type OnboardStep = (typeof ONBOARD_STEPS)[number]['step']
