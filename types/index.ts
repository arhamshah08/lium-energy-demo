export type Jurisdiction = 'ERCOT' | 'PJM' | 'CAISO' | 'MISO'
export type AssetType = 'BESS' | 'MICROGRID' | 'DER_CLUSTER'
export type ConnectionMethod = 'DIRECT_API' | 'IOT_GATEWAY' | 'DATA_BRIDGE'

export type ProjectStatus =
  | 'DRAFT'
  | 'DOCUMENTS_PENDING'
  | 'TELEMETRY_PENDING'
  | 'SUBMITTED'

export interface DocumentRecord {
  type: 'TECHNICAL_AUDIT' | 'PPA_AGREEMENT' | 'INTERCONNECTION_STUDY' | 'INSURANCE_CERTIFICATE'
  filename: string
  uploadedAt: string
}

export interface TelemetryConfig {
  connectionMethod: ConnectionMethod
  apiEndpoint: string
  assetIdMapping: string
  verified: boolean
  verifiedAt?: string
}

export interface Project {
  id: string
  status: ProjectStatus
  name: string
  location: string
  jurisdiction: Jurisdiction
  assetType: AssetType
  createdAt: string
  updatedAt: string
  documents: DocumentRecord[]
  telemetry?: TelemetryConfig
}

// API request/response shapes

export interface CreateProjectBody {
  name: string
  location: string
  jurisdiction: Jurisdiction
  assetType: AssetType
  actorRole?: string
  revenueTypes?: string[]
}

export interface UpdateDocumentsBody {
  documents: Array<{
    type: DocumentRecord['type']
    filename: string
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

// Discriminated union API envelope — all routes return this
export type ApiSuccess<T> = { ok: true; data: T }
export type ApiError = { ok: false; error: { code: string; message: string } }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// Step routing
export const ONBOARD_STEPS = [
  { step: 1, label: 'PROJECT DETAILS', href: '/onboard/project-details', icon: 'edit_document' },
  { step: 2, label: 'DOCUMENT VAULT', href: '/onboard/document-vault', icon: 'shield_lock' },
  { step: 3, label: 'TELEMETRY LINK', href: '/onboard/telemetry', icon: 'sensors' },
  { step: 4, label: 'CREDIT PACK', href: '/onboard/credit-pack', icon: 'account_balance_wallet' },
  { step: 5, label: 'SUBMISSION', href: '/onboard/submission', icon: 'assignment_turned_in' },
] as const

export type OnboardStep = (typeof ONBOARD_STEPS)[number]['step']
