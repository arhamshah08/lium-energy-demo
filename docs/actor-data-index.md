# LIUM Platform — Actor Data Index

## How to read this document

Every data field in the platform has a unique ID, a type, a phase, and a direction.

**Field ID format:** `[ACTOR_CODE]-[NUMBER]`
Example: `PD-1` = Project Developer, field 1 (their legal name)

**Phase**
- `ONBOARD` — data submitted when the actor registers themselves on the platform (who they are)
- `CATALOG` — data submitted when the actor publishes a project, offer, or service (what they are listing)

**Direction**
- `PUSH` — the actor sends this data to the platform
- `PULL` — the platform or another actor requests this data from the actor or from a registry

**Layer**
- `NETWORK` — Finternet layer: financial identity, trust, ownership, risk, valuation, composability
- `APP` — Beckn layer: protocol registration, API endpoints, discovery, routing

**Types used**
- `string` — free text
- `uuid` — unique identifier (auto-generated)
- `number` — integer or decimal
- `boolean` — true / false
- `date` — ISO 8601 date (YYYY-MM-DD)
- `datetime` — ISO 8601 datetime
- `enum` — one value from a fixed list (options shown in Notes)
- `array<string>` — list of strings
- `array<uuid>` — list of unique IDs
- `array<object>` — list of structured sub-objects
- `object` — nested key-value structure

---

## Actor Index

| Code | Actor | Role |
|---|---|---|
| PD | Project Developer | Originates energy assets, raises debt, publishes projects |
| FN | Financier | Provides debt financing, sets guarantees, locks disbursements |
| SA | Securities Agent | Packages loans into securitised offerings, lists for investors |
| PM | Portfolio Manager | Discovers and purchases securities, monitors holdings |
| RIF | Risk Provider | Reads telemetry, generates signed risk indicators |
| UTL | Utility / Procurer | Publishes grid flexibility needs, allocates grid revenue |
| DC | DC Operator / Offtaker | Consumes energy, confirms dispatch delivery |
| OP | Asset Operator | Runs the physical asset, exposes operational telemetry |
| TEL | Telemetry Provider | Collects and streams signed real-time device data |
| RA | Rating / Valuation Agent | Rates instruments and tranches, publishes surveillance |
| CUS | Custodian / Token Registry | Holds ownership records, manages token transfers |
| EDGE | EdgeGrid Platform | Routes grid dispatch, allocates utility revenue |

---

## PD — Project Developer

> The Project Developer originates energy assets (BESS, microgrids, DER clusters) and seeks financing.
> Onboarding establishes who they are as a legal entity and whether they are credible.
> Each project they upload is a separate catalog submission — they get questioned about each one.

### ONBOARD — Who the actor is

#### PUSH — Actor submits to platform

**Network layer — legal identity and financial credibility**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-1 | legal_entity_id | uuid | Auto-generated on submission |
| PD-2 | legal_name | string | Registered company name |
| PD-3 | incorporation_country | string | ISO 3166-1 alpha-2 country code |
| PD-4 | incorporation_date | date | Date of company registration |
| PD-5 | incorporation_number | string | Government-issued company registration number |
| PD-6 | beneficial_owners | array\<object\> | Each entry: name, ownership_pct, nationality, id_type, id_number |
| PD-7 | tax_identifier | string | Tax ID / EIN / PAN — jurisdiction dependent |
| PD-8 | bank_account_id | string | Primary bank account for disbursements |
| PD-9 | authorized_signers | array\<string\> | Names of individuals who can sign agreements |
| PD-10 | did_wallet | string | Decentralized identifier — used for credential binding |
| PD-11 | license_type | enum | `DEVELOPER` / `ORIGINATOR` / `EPC_DEVELOPER` |
| PD-12 | license_number | string | Government-issued developer or energy license number |
| PD-13 | license_jurisdiction | string | Jurisdiction that issued the license |
| PD-14 | license_expiry | date | License expiry date |
| PD-15 | credit_score | number | Numeric credit score from credit bureau |
| PD-16 | credit_rating | enum | `AAA` / `AA` / `A` / `BBB` / `BB` / `B` / `CCC` / `UNRATED` |
| PD-17 | prior_default_history | boolean | Has the entity defaulted on a financial obligation before |
| PD-18 | default_count | number | Number of prior defaults (0 if PD-17 is false) |
| PD-19 | trust_credential_ids | array\<uuid\> | IDs of existing trust credentials from third parties |

**App layer — Beckn protocol registration**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-20 | beckn_subscriber_id | string | Unique ID on the Beckn network |
| PD-21 | domain_role | enum | Fixed: `project_originator` |
| PD-22 | subscriber_url | string | HTTPS endpoint for Beckn protocol messages |
| PD-23 | callback_url | string | Webhook to receive async responses |
| PD-24 | public_key | string | RSA or Ed25519 public key for message signing |
| PD-25 | protocol_permissions | array\<enum\> | `PUBLISH_PROJECT` / `RECEIVE_OFFER` / `SIGN_AGREEMENT` |

**App layer — profile and capability**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-26 | email | string | Primary contact email |
| PD-27 | organization_name | string | Trading / brand name if different from legal_name |
| PD-28 | service_geographies | array\<string\> | Countries or regions where they operate |
| PD-29 | supported_asset_categories | array\<enum\> | `BESS` / `MICROGRID` / `SOLAR` / `WIND` / `DER_CLUSTER` |
| PD-30 | project_experience_years | number | Years of project development experience |
| PD-31 | technology_track_record | string | Brief description of past technology deployments |
| PD-32 | epc_partners | array\<string\> | Names of engineering, procurement, construction partners |
| PD-33 | om_partners | array\<string\> | Names of operations and maintenance partners |
| PD-34 | financial_closure_history | boolean | Has the entity successfully closed project financing before |
| PD-35 | insurance_history | boolean | Does the entity carry active project insurance |
| PD-36 | compliance_attestations | array\<string\> | Self-declared compliance standards met |
| PD-37 | document_upload_api | string | HTTPS endpoint for receiving document uploads |
| PD-38 | project_details_webhook | string | Webhook for receiving project-related notifications |

#### PULL — Platform or counterparty queries from actor

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-39 | verifiable_credential | object | Pulled by LIUM from OpenCred after onboarding — credential_id, role_claims, valid_to, proof |
| PD-40 | registry_id | uuid | Pulled by LIUM from DeDI after registration |

---

### CATALOG — Per project submission

> Every project the developer uploads is a separate questionnaire. The platform questions them about the asset, the financials, the documents, and the technical setup.

#### PUSH — Developer submits per project

**Network layer — financial asset definition**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-41 | financial_asset_id | uuid | Auto-generated on project submission |
| PD-42 | ownership_model | enum | `BOO` (Build-Own-Operate) / `BOT` / `BOOT` / `PPA` / `LEASE` |
| PD-43 | collateral_definition | string | What is pledged as collateral for financing |
| PD-44 | composability_rules | array\<enum\> | `BUNDLE` / `TRANCHE_AFTER_COD` / `PLEDGE_CASH_FLOWS` / `TOKENIZE` |
| PD-45 | transaction_rules | string | Rules governing how this asset can be transacted |
| PD-46 | eligible_for_financing | boolean | Is this asset currently seeking debt financing |
| PD-47 | eligible_for_securitization | boolean | Can this asset be securitised post-COD |
| PD-48 | estimated_cost | number | Total project cost in base currency |
| PD-49 | estimated_cost_currency | enum | `USD` / `INR` / `EUR` / `GBP` |
| PD-50 | monthly_cost | number | Monthly operating cost estimate |
| PD-51 | bom_boq_document_id | uuid | Bill of materials / bill of quantities document reference |
| PD-52 | irr_post_tax_pct | number | Project IRR post tax, as a percentage |
| PD-53 | equity_irr_post_tax_pct | number | Equity IRR post tax, as a percentage |
| PD-54 | average_cost_of_interest_pct | number | Weighted average cost of debt, as a percentage |
| PD-55 | debt_equity_ratio | number | Debt to equity ratio (e.g. 0.7 = 70% debt) |
| PD-56 | risk_profile | enum | `LOW` / `MEDIUM` / `HIGH` |
| PD-57 | cash_flow_timeseries | array\<object\> | Per year: year, revenue, opex, debt_service, dscr |
| PD-58 | project_timeline_months | number | Months from start to COD |
| PD-59 | target_cod | date | Target commercial operation date |
| PD-60 | revenue_assumptions | string | Key assumptions behind revenue projections |
| PD-61 | performance_requirements | object | min_availability_pct, min_rte_pct, measurement_window |

**App layer — project listing and discovery**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-62 | project_title | string | Human-readable project name |
| PD-63 | project_description | string | Summary of the project |
| PD-64 | asset_type | enum | `BESS` / `MICROGRID` / `SOLAR` / `WIND` / `DER_CLUSTER` |
| PD-65 | asset_location | string | Human-readable location (city, state, country) |
| PD-66 | asset_location_lat | number | Latitude coordinate |
| PD-67 | asset_location_lon | number | Longitude coordinate |
| PD-68 | capacity_mw | number | Power capacity in megawatts |
| PD-69 | energy_capacity_mwh | number | Energy capacity in megawatt-hours |
| PD-70 | jurisdiction | enum | `ERCOT` / `PJM` / `CAISO` / `MISO` / `NYISO` / `OTHER` |
| PD-71 | current_stage | enum | `PRE_DEVELOPMENT` / `DEVELOPMENT` / `CONSTRUCTION` / `OPERATIONAL` |
| PD-72 | document_manifest | array\<object\> | Each entry: doc_type, doc_id, filename, uploaded_at, verified |
| PD-73 | project_images | array\<string\> | URLs to site images or renderings |
| PD-74 | project_map_url | string | URL to a map or satellite image of the site |
| PD-75 | telemetry_endpoint | string | API endpoint for telemetry data access |
| PD-76 | offer_intake_endpoint | string | API endpoint for receiving financing offers |
| PD-77 | financing_need | number | Amount of debt financing being sought |
| PD-78 | financing_need_currency | enum | `USD` / `INR` / `EUR` / `GBP` |

**Required documents per project (within document_manifest)**

| Doc Type | Description | Required |
|---|---|---|
| `TECHNICAL_AUDIT` | Independent technical audit of the asset | true |
| `PPA_AGREEMENT` | Power Purchase Agreement or offtake contract | true |
| `INTERCONNECTION_STUDY` | Grid interconnection feasibility study | true |
| `INSURANCE_CERTIFICATE` | Active insurance policy certificate | true |
| `DPR` | Detailed Project Report | true |
| `FINANCIAL_MODEL` | Financial model with assumptions | true |
| `LAND_TITLE` | Land ownership or lease documentation | true |
| `ENVIRONMENTAL_CLEARANCE` | Environmental impact clearance | conditional |
| `GRID_APPROVAL` | Grid authority approval letter | conditional |

#### PULL — Platform queries from project

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-79 | live_telemetry | object | Pulled by Financier/Risk Provider via AccessToken after consent |
| PD-80 | actual_irr | number | Pulled by Securities Agent post-COD for securitisation |
| PD-81 | dscr_history | array\<object\> | Pulled by Risk Provider during risk assessment |
| PD-82 | operational_performance | object | Pulled by Portfolio Manager for portfolio monitoring |

---

## FN — Financier

> Provides debt financing to Project Developers. Sets performance guarantees and locks purpose-bound funds. Later enlists loans for securitisation.

### ONBOARD — Who the actor is

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| FN-1 | legal_entity_id | uuid | Auto-generated |
| FN-2 | legal_name | string | Registered name |
| FN-3 | lending_license_number | string | License to provide debt financing |
| FN-4 | lending_license_jurisdiction | string | Jurisdiction of lending license |
| FN-5 | lending_license_expiry | date | Expiry of lending license |
| FN-6 | capital_source | enum | `BANK` / `NBFC` / `DFI` / `FUND` / `FAMILY_OFFICE` |
| FN-7 | bank_rails | array\<string\> | Payment rails used (SWIFT, RTGS, ACH) |
| FN-8 | did_wallet | string | Decentralized identifier |
| FN-9 | authorized_signers | array\<string\> | Names of authorized deal signatories |
| FN-10 | risk_limit_per_project | number | Maximum exposure per single project |
| FN-11 | risk_limit_total | number | Total book limit across all projects |
| FN-12 | compliance_profile | string | AML/KYC compliance framework reference |
| FN-13 | aum | number | Assets under management |
| FN-14 | credit_policy | string | Internal credit policy document reference |
| FN-15 | sector_exposure_limits | object | Max exposure by sector (BESS, SOLAR, etc.) |
| FN-16 | underwriting_methodology | string | Description of underwriting approach |
| FN-17 | collections_capability | boolean | Does the entity have in-house collections capability |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| FN-18 | beckn_subscriber_id | string | Beckn network ID |
| FN-19 | domain_role | enum | Fixed: `financier` |
| FN-20 | offer_api_endpoint | string | Endpoint to receive project discovery results |
| FN-21 | callback_urls | array\<string\> | Webhook URLs for async deal updates |
| FN-22 | service_geographies | array\<string\> | Regions where the financier lends |
| FN-23 | protocol_permissions | array\<enum\> | `DISCOVER_PROJECTS` / `MAKE_OFFER` / `TOKENIZE_LOAN` / `AUTHORIZE_TELEMETRY` |
| FN-24 | organization_name | string | Brand name |
| FN-25 | contact_email | string | Deal intake email |
| FN-26 | supported_instruments | array\<enum\> | `SENIOR_DEBT` / `MEZZANINE` / `EQUITY` / `GUARANTEE` |
| FN-27 | document_requirements | array\<string\> | List of documents required from developer before offer |
| FN-28 | sla_offer_response_hours | number | Committed turnaround for offer response |

### CATALOG — Per loan offer

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| FN-29 | loan_asset_id | uuid | Auto-generated per loan |
| FN-30 | target_project_id | uuid | The PD project this offer is for |
| FN-31 | loan_amount | number | Principal amount |
| FN-32 | loan_amount_currency | enum | `USD` / `INR` / `EUR` |
| FN-33 | coupon_rate_pct | number | Interest rate as a percentage |
| FN-34 | tenor_months | number | Loan duration in months |
| FN-35 | moratorium_months | number | Principal repayment holiday in months |
| FN-36 | dscr_covenant | number | Minimum DSCR required throughout loan life |
| FN-37 | collateral_coverage_ratio | number | Required collateral as multiple of loan |
| FN-38 | ltv_advance_rate_pct | number | Loan-to-value advance rate percentage |
| FN-39 | average_cost_of_funds_pct | number | Financier's blended cost of funds |
| FN-40 | target_yield_pct | number | Target net yield for this instrument |
| FN-41 | repayment_waterfall | string | Order of debt service payments |
| FN-42 | disbursement_rules | string | Conditions for fund disbursement |
| FN-43 | security_interest | string | What is secured against the loan |
| FN-44 | exit_preference | enum | `HOLD` / `SECURITIZE` / `SELL` |
| FN-45 | transfer_restrictions | string | Any lock-up or transfer conditions |
| FN-46 | loan_repayment_cashflow | array\<object\> | Per period: period, principal, interest, total |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| FN-47 | indicative_terms_summary | string | Human-readable summary of offer |
| FN-48 | eligible_project_types | array\<enum\> | Asset types this offer applies to |
| FN-49 | processing_timeline_days | number | Estimated days from acceptance to disbursement |
| FN-50 | required_documents | array\<string\> | Additional docs needed before closing |
| FN-51 | offer_status | enum | `DRAFT` / `ACTIVE` / `ACCEPTED` / `EXPIRED` / `WITHDRAWN` |
| FN-52 | offer_expiry | datetime | When this offer expires |
| FN-53 | acceptance_endpoint | string | API to call when developer accepts the offer |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| FN-54 | project_listing | object | Pulls PD project from Beckn Catalog |
| FN-55 | telemetry_stream | object | Pulls from TEL after TelemetryConsent is granted (AccessToken scoped) |
| FN-56 | performance_proofs | array\<object\> | Pulls from Pincer — for monitoring guarantee compliance |

---

## SA — Securities Agent

> Packages financed loan agreements into securitised offerings. Structures tranches, tokenises in UNITS, lists for investors.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| SA-1 | legal_entity_id | uuid | Auto-generated |
| SA-2 | legal_name | string | Registered name |
| SA-3 | arranger_license_number | string | Capital markets arranger license |
| SA-4 | trustee_license_number | string | Debenture trustee or equivalent license |
| SA-5 | arranger_license_jurisdiction | string | |
| SA-6 | did_wallet | string | Decentralized identifier |
| SA-7 | signer_authority | string | Name of authorized deal signer |
| SA-8 | bank_trust_account_ids | array\<string\> | Escrow and trust accounts |
| SA-9 | rating_agency_relationships | array\<string\> | Names of rating agencies the SA works with |
| SA-10 | issuance_history_count | number | Number of prior securitisations completed |
| SA-11 | structuring_methodology | string | Description of structuring approach |
| SA-12 | waterfall_templates | array\<string\> | IDs or names of standard waterfall templates used |
| SA-13 | credit_enhancement_policy | string | Overcollateralisation, reserve funds, guarantees |
| SA-14 | tokenization_capability | boolean | Can the SA tokenise instruments on UNITS |
| SA-15 | servicer_relationships | array\<string\> | Names of servicers for collections |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| SA-16 | beckn_subscriber_id | string | |
| SA-17 | domain_role | enum | Fixed: `securitization_agent` |
| SA-18 | structuring_api_endpoint | string | |
| SA-19 | issuance_callback_urls | array\<string\> | |
| SA-20 | protocol_permissions | array\<enum\> | `DISCOVER_LOANS` / `STRUCTURE_OFFERING` / `TOKENIZE_SECURITY` / `LIST_OFFERING` |
| SA-21 | accepted_asset_categories | array\<enum\> | Asset types they will securitise |
| SA-22 | service_geographies | array\<string\> | |
| SA-23 | required_documents | array\<string\> | Docs needed from financier before structuring |
| SA-24 | structuring_timeline_days | number | |
| SA-25 | contact_endpoint | string | |

### CATALOG — Per securitisation offering

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| SA-26 | pool_id | uuid | Auto-generated |
| SA-27 | underlying_loan_ids | array\<uuid\> | Loan IDs included in this pool |
| SA-28 | senior_tranche_pct | number | Percentage of pool in senior tranche |
| SA-29 | mezzanine_tranche_pct | number | |
| SA-30 | equity_tranche_pct | number | |
| SA-31 | expected_rating | enum | `AAA` / `AA` / `A` / `BBB` |
| SA-32 | target_yield_pct | number | |
| SA-33 | expected_loss_pct | number | |
| SA-34 | dscr_history | array\<object\> | Historical DSCR of underlying assets |
| SA-35 | cashflow_waterfall | array\<object\> | Payment priority waterfall |
| SA-36 | eligibility_tests | array\<string\> | Tests that underlying loans must pass |
| SA-37 | stress_scenarios | array\<object\> | Scenario name, DSCR impact, loss estimate |
| SA-38 | credit_enhancement_type | enum | `OVERCOLLATERALIZATION` / `RESERVE_FUND` / `GUARANTEE` / `NONE` |
| SA-39 | transfer_rules | string | Restrictions on secondary transfers |
| SA-40 | ownership_registry_id | string | UNITS registry where tokens are recorded |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| SA-41 | issuance_summary | string | Human-readable offering summary |
| SA-42 | document_checklist | array\<string\> | Due diligence documents available to investors |
| SA-43 | investor_presentation_url | string | URL to investor deck |
| SA-44 | book_building_status | enum | `OPEN` / `CLOSED` / `ALLOCATED` / `CANCELLED` |
| SA-45 | book_building_deadline | datetime | |
| SA-46 | minimum_subscription | number | Minimum ticket size |
| SA-47 | minimum_subscription_currency | enum | |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| SA-48 | loan_agreements | array\<object\> | Pulls from Beckn Catalog — loans listed by Financier |
| SA-49 | risk_indicators | object | Pulls from UNITS — RIF-signed metadata on SecurityToken |
| SA-50 | performance_proofs | array\<object\> | Pulls from LIUM on query |

---

## PM — Portfolio Manager

> Discovers and purchases securitised instruments. Monitors live risk on holdings.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| PM-1 | legal_entity_id | uuid | |
| PM-2 | legal_name | string | |
| PM-3 | fund_identity | string | Fund name or vehicle name |
| PM-4 | investor_classification | enum | `INSTITUTIONAL` / `PENSION_FUND` / `FAMILY_OFFICE` / `HNI` / `SOVEREIGN` |
| PM-5 | custody_account_id | string | Account where securities are held |
| PM-6 | did_wallet | string | |
| PM-7 | signer_authority | string | |
| PM-8 | risk_limit_per_instrument | number | Maximum exposure per single security |
| PM-9 | risk_limit_total | number | Total portfolio limit |
| PM-10 | investment_mandate | string | Summary of fund mandate and constraints |
| PM-11 | aum | number | Assets under management |
| PM-12 | target_sectors | array\<enum\> | Preferred asset types |
| PM-13 | concentration_limits | object | Max % per issuer, sector, geography |
| PM-14 | rating_constraints | array\<enum\> | Minimum acceptable ratings (e.g. BBB and above) |
| PM-15 | duration_limit_months | number | Maximum duration of instruments |
| PM-16 | liquidity_preference | enum | `DAILY` / `MONTHLY` / `QUARTERLY` / `LOCKED` |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| PM-17 | beckn_subscriber_id | string | |
| PM-18 | domain_role | enum | Fixed: `portfolio_manager` |
| PM-19 | subscription_api_endpoint | string | |
| PM-20 | callback_urls | array\<string\> | |
| PM-21 | protocol_permissions | array\<enum\> | `DISCOVER_SECURITIES` / `SUBSCRIBE` / `MONITOR_PORTFOLIO` |
| PM-22 | discovery_preferences | object | Filters: rating, yield, sector, geography |
| PM-23 | notification_preferences | object | Alert types and delivery method |

### CATALOG — Per investment

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| PM-24 | subscribe_amount | number | Amount being subscribed into offering |
| PM-25 | subscribe_currency | enum | |
| PM-26 | target_tranche | enum | `SENIOR` / `MEZZANINE` / `EQUITY` |
| PM-27 | settlement_account_id | string | Account to use for settlement |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| PM-28 | securities_offerings | array\<object\> | Pulls from Beckn Catalog — listed by SA |
| PM-29 | risk_indicators | object | Pulls from UNITS SecurityToken metadata (live, updated by RIF) |
| PM-30 | portfolio_performance | object | Pulls from LIUM — RiskIndicator + PerformanceProof for holdings |
| PM-31 | payout_schedule | object | Pulls from UNITS — scheduled distributions |

---

## RIF — Risk Provider

> Reads telemetry via scoped AccessToken. Generates provenanced, signed risk indicators. Attaches to SecurityTokens.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| RIF-1 | legal_entity_id | uuid | |
| RIF-2 | legal_name | string | |
| RIF-3 | certification_number | string | Recognised risk analytics or credit rating certification |
| RIF-4 | license_type | enum | `CREDIT_RATING_AGENCY` / `DATA_ANALYTICS` / `RISK_ANALYTICS` |
| RIF-5 | did_wallet | string | |
| RIF-6 | data_attestation_rights | string | Description of attestation authority |
| RIF-7 | model_governance_profile | string | Description of model governance and validation |
| RIF-8 | signer_authority | string | Who signs risk indicators on behalf of RIF |
| RIF-9 | risk_methodology | string | Summary of risk scoring methodology |
| RIF-10 | model_version | string | Current production model version |
| RIF-11 | conflict_policy | string | Policy for managing conflicts of interest |
| RIF-12 | audit_log_endpoint | string | Endpoint for auditing model outputs |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| RIF-13 | beckn_subscriber_id | string | |
| RIF-14 | domain_role | enum | Fixed: `risk_provider` |
| RIF-15 | risk_api_endpoint | string | |
| RIF-16 | alert_webhook | string | |
| RIF-17 | supported_domains | array\<enum\> | `BESS` / `MICROGRID` / `SOLAR` / `WIND` |
| RIF-18 | coverage_areas | array\<string\> | Geographies covered |
| RIF-19 | update_frequency_minutes | number | How often risk indicators are refreshed |
| RIF-20 | report_formats | array\<enum\> | `JSON` / `PDF` / `CSV` |

### CATALOG — Per risk indicator submission

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| RIF-21 | risk_indicator_id | uuid | Auto-generated per submission |
| RIF-22 | target_asset_id | uuid | The project or security this indicator covers |
| RIF-23 | provider_id | uuid | RIF's own entity ID |
| RIF-24 | methodology_version | string | Model version used for this calculation |
| RIF-25 | risk_score | number | 0–100 composite risk score |
| RIF-26 | confidence_interval_pct | number | Confidence range of the score |
| RIF-27 | telemetry_uptime_pct | number | Asset telemetry availability over measurement window |
| RIF-28 | data_latency_ms | number | Average telemetry latency |
| RIF-29 | performance_variance_pct | number | Variance from expected performance |
| RIF-30 | anomaly_count | number | Number of detected anomalies in the window |
| RIF-31 | default_probability_pct | number | Probability of default on underlying loan |
| RIF-32 | loss_given_default_pct | number | Estimated loss if default occurs |
| RIF-33 | contract_risk_score | number | Risk score of the offtake or PPA contract |
| RIF-34 | counterparty_risk_score | number | Risk score of the offtaker counterparty |
| RIF-35 | score_trend | enum | `IMPROVING` / `STABLE` / `DETERIORATING` |
| RIF-36 | alert_flags | array\<string\> | List of active risk alerts |
| RIF-37 | attestation_signature | string | Cryptographic signature from RIF's DID |
| RIF-38 | measurement_window_start | datetime | |
| RIF-39 | measurement_window_end | datetime | |
| RIF-40 | report_url | string | Full report URL |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| RIF-41 | telemetry_stream | object | Pulls from TEL using AccessToken granted by Financier |
| RIF-42 | access_token | object | Pulls from UNITS — FN-authorised scoped token |

---

## UTL — Utility / Procurer

> Publishes grid flexibility needs. Signs offtake contracts. Allocates revenue after delivery.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| UTL-1 | legal_entity_id | uuid | |
| UTL-2 | legal_name | string | |
| UTL-3 | regulatory_license_number | string | Grid operator or utility license |
| UTL-4 | regulatory_license_jurisdiction | string | |
| UTL-5 | payment_credibility_score | number | Credit score for payment obligations |
| UTL-6 | procurement_authority | string | Description of procurement authority |
| UTL-7 | did_wallet | string | |
| UTL-8 | signer_authority | string | |
| UTL-9 | grid_jurisdiction | string | `ERCOT` / `PJM` / `CAISO` / `MISO` |
| UTL-10 | payment_history_score | number | Track record of on-time payments |
| UTL-11 | tariff_approval_references | array\<string\> | Regulator-approved tariff document IDs |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| UTL-12 | beckn_subscriber_id | string | |
| UTL-13 | domain_role | enum | Fixed: `utility_procurer` |
| UTL-14 | dispatch_api_endpoint | string | |
| UTL-15 | demand_api_endpoint | string | |
| UTL-16 | callback_urls | array\<string\> | |
| UTL-17 | service_territory | string | Geographic region served |
| UTL-18 | grid_nodes | array\<string\> | Grid connection point IDs |
| UTL-19 | metering_requirements | string | Metering standard required |
| UTL-20 | procurement_contact | string | Email or API for procurement queries |

### CATALOG — Per flexibility need

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| UTL-21 | need_id | uuid | Auto-generated |
| UTL-22 | service_type | enum | `FREQUENCY_REGULATION` / `SPINNING_RESERVE` / `PEAK_SHAVING` / `VOLTAGE_SUPPORT` |
| UTL-23 | capacity_mw | number | Required capacity in megawatts |
| UTL-24 | duration_hours | number | Required delivery duration |
| UTL-25 | response_time_seconds | number | Required response time |
| UTL-26 | delivery_window_start | datetime | When delivery must begin |
| UTL-27 | delivery_window_end | datetime | When delivery must end |
| UTL-28 | price_pool | number | Total revenue pool for this need |
| UTL-29 | price_pool_currency | enum | |
| UTL-30 | grid_node_id | string | Specific grid node for delivery |
| UTL-31 | offtake_contract_id | uuid | Reference to signed offtake contract |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| UTL-32 | delivery_confirmation | object | Pulls from LIUM after dispatch |
| UTL-33 | performance_proof | object | Pulls from LIUM — verifies delivery occurred |

---

## DC — DC Operator / Offtaker

> Consumes energy. Grants telemetry consent to financiers. Confirms dispatch delivery.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| DC-1 | legal_entity_id | uuid | |
| DC-2 | legal_name | string | |
| DC-3 | credit_profile_score | number | |
| DC-4 | offtake_authority | string | Legal authority to sign offtake agreements |
| DC-5 | did_wallet | string | |
| DC-6 | signer_authority | string | |
| DC-7 | payment_account_id | string | |
| DC-8 | peak_demand_mw | number | Facility peak demand |
| DC-9 | average_demand_mw | number | Facility average demand |
| DC-10 | sla_requirements | string | Required uptime and delivery SLA |
| DC-11 | sustainability_reporting | boolean | Does the entity require clean energy attribution |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| DC-12 | beckn_subscriber_id | string | |
| DC-13 | domain_role | enum | Fixed: `offtaker` |
| DC-14 | demand_api_endpoint | string | |
| DC-15 | delivery_confirmation_endpoint | string | |
| DC-16 | callback_urls | array\<string\> | |
| DC-17 | facility_locations | array\<object\> | name, address, lat, lon per facility |
| DC-18 | load_profile_api_endpoint | string | API to expose load profile data |
| DC-19 | consent_permissions | array\<enum\> | `SHARE_TELEMETRY` / `SIGN_CONTRACT` / `CONFIRM_DELIVERY` |

### CATALOG — Per offtake / telemetry consent

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| DC-20 | telemetry_consent_id | uuid | Auto-generated |
| DC-21 | consent_grantor | uuid | DC entity ID |
| DC-22 | consent_grantee | uuid | Financier or Risk Provider entity ID |
| DC-23 | data_scope | array\<enum\> | `STATE_OF_CHARGE` / `NET_EXPORT` / `VOLTAGE` / `TEMPERATURE` |
| DC-24 | consent_duration_days | number | |
| DC-25 | revocation_terms | string | Conditions under which consent can be revoked |
| DC-26 | contracted_load_mw | number | Contracted load under offtake agreement |
| DC-27 | delivery_sla | string | |
| DC-28 | billing_cycle | enum | `MONTHLY` / `QUARTERLY` |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| DC-29 | dispatch_instruction | object | Pulls from LIUM — tells DC when and how much to dispatch |
| DC-30 | invoice_status | object | Pulls from UNITS — payment and settlement status |

---

## OP — Asset Operator

> Runs the physical asset. Attests to operational performance. Maintains telemetry feed integrity.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| OP-1 | legal_entity_id | uuid | |
| OP-2 | legal_name | string | |
| OP-3 | om_authority | string | O&M contract reference |
| OP-4 | insurance_policy_id | string | Active project operations insurance |
| OP-5 | safety_certifications | array\<string\> | Applicable safety and operations certifications |
| OP-6 | did_wallet | string | |
| OP-7 | signer_authority | string | |
| OP-8 | om_contract_id | uuid | Reference to O&M agreement |
| OP-9 | ltsa_terms | string | Long-term service agreement summary |
| OP-10 | experience_years | number | Years of asset operations experience |
| OP-11 | incident_history_count | number | Number of prior incidents |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| OP-12 | beckn_subscriber_id | string | |
| OP-13 | domain_role | enum | Fixed: `asset_operator` |
| OP-14 | telemetry_api_endpoint | string | |
| OP-15 | maintenance_api_endpoint | string | |
| OP-16 | callback_urls | array\<string\> | |
| OP-17 | asset_ids_operated | array\<uuid\> | Projects / assets under operation |
| OP-18 | scada_endpoint | string | SCADA system API endpoint |

### CATALOG — Per asset operational report

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| OP-19 | actual_availability_pct | number | Actual availability over reporting window |
| OP-20 | actual_rte_pct | number | Actual round-trip efficiency |
| OP-21 | cycles_per_day | number | Battery charge/discharge cycles per day |
| OP-22 | throughput_mwh | number | Total energy throughput in reporting window |
| OP-23 | outage_events | array\<object\> | start_time, end_time, cause, duration_hours |
| OP-24 | maintenance_schedule | object | Planned maintenance windows |
| OP-25 | warranty_status | enum | `ACTIVE` / `EXPIRED` / `VOIDED` |
| OP-26 | failure_history | array\<object\> | date, component, resolution, root_cause |
| OP-27 | performance_attestation_id | uuid | Signed attestation of reported values |

---

## TEL — Telemetry Provider

> Collects and streams signed real-time device performance data. Issues AccessTokens.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| TEL-1 | legal_entity_id | uuid | |
| TEL-2 | legal_name | string | |
| TEL-3 | device_certification_number | string | Certification for measurement devices |
| TEL-4 | data_signing_authority | string | Description of data signing authority |
| TEL-5 | did_wallet | string | |
| TEL-6 | cybersecurity_profile | string | Security certifications (ISO 27001, SOC2, etc.) |
| TEL-7 | calibration_record_ids | array\<uuid\> | Device calibration records |
| TEL-8 | data_schema_version | string | Version of telemetry data schema |
| TEL-9 | measurement_confidence_pct | number | Stated measurement confidence level |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| TEL-10 | beckn_subscriber_id | string | |
| TEL-11 | domain_role | enum | Fixed: `telemetry_provider` |
| TEL-12 | stream_api_endpoint | string | |
| TEL-13 | alert_callback_url | string | |
| TEL-14 | supported_asset_types | array\<enum\> | |
| TEL-15 | stream_frequency_seconds | number | How often data is pushed |
| TEL-16 | data_availability_sla_pct | number | Guaranteed uptime of the data stream |

### CATALOG — Per telemetry data point (streamed)

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| TEL-17 | stream_id | uuid | |
| TEL-18 | asset_id | uuid | The project/asset being measured |
| TEL-19 | timestamp | datetime | Measurement timestamp (UTC) |
| TEL-20 | state_of_charge_pct | number | Battery state of charge |
| TEL-21 | charge_discharge_mw | number | Positive = charging, negative = discharging |
| TEL-22 | net_export_mw | number | Net export to grid |
| TEL-23 | throughput_mwh | number | Cumulative throughput in window |
| TEL-24 | rte_pct | number | Round-trip efficiency |
| TEL-25 | availability_pct | number | Availability in measurement window |
| TEL-26 | voltage_lag_ms | number | Voltage response lag |
| TEL-27 | temperature_c | number | Battery temperature in Celsius |
| TEL-28 | fault_codes | array\<string\> | Active fault codes |
| TEL-29 | data_latency_ms | number | Latency from measurement to delivery |
| TEL-30 | missing_data_points | number | Count of missing readings in window |
| TEL-31 | quality_flag | enum | `GOOD` / `DEGRADED` / `SUSPECT` / `BAD` |
| TEL-32 | measurement_signature | string | Cryptographic signature from TEL DID |
| TEL-33 | anomaly_detected | boolean | Whether an anomaly was detected |

---

## RA — Rating / Valuation Agent

> Rates securitised instruments and pools. Issues attested ratings with surveillance.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| RA-1 | legal_entity_id | uuid | |
| RA-2 | legal_name | string | |
| RA-3 | rating_license_number | string | Credit rating agency license |
| RA-4 | valuation_license_number | string | |
| RA-5 | license_jurisdiction | string | |
| RA-6 | did_wallet | string | |
| RA-7 | signer_authority | string | |
| RA-8 | conflict_policy | string | |
| RA-9 | rating_methodology | string | Published methodology document reference |
| RA-10 | stress_scenario_library | string | Available stress scenario set |
| RA-11 | surveillance_policy | string | How often ratings are reviewed |
| RA-12 | historical_accuracy_pct | number | Track record of rating accuracy |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| RA-13 | beckn_subscriber_id | string | |
| RA-14 | domain_role | enum | Fixed: `rating_valuation_agent` |
| RA-15 | rating_api_endpoint | string | |
| RA-16 | request_intake_api | string | |
| RA-17 | eligible_instrument_types | array\<enum\> | Instrument types RA will rate |
| RA-18 | turnaround_days | number | Time from request to published rating |

### CATALOG — Per rating issued

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| RA-19 | rating_id | uuid | |
| RA-20 | target_instrument_id | uuid | SecurityToken or pool being rated |
| RA-21 | tranche_rating | enum | `AAA` / `AA` / `A` / `BBB` / `BB` / `B` / `CCC` |
| RA-22 | pool_rating | enum | Same scale |
| RA-23 | probability_of_default_pct | number | |
| RA-24 | loss_given_default_pct | number | |
| RA-25 | stress_case_dscr | number | DSCR under stress scenario |
| RA-26 | fair_value | number | Mark-to-model valuation |
| RA-27 | discount_rate_pct | number | Discount rate used in valuation |
| RA-28 | rating_watch_flag | boolean | Is this rating under review |
| RA-29 | surveillance_state | enum | `STABLE` / `WATCH` / `NEGATIVE_OUTLOOK` / `POSITIVE_OUTLOOK` |
| RA-30 | methodology_reference | string | Published methodology used |
| RA-31 | attestation_signature | string | Signed by RA DID |
| RA-32 | valid_until | date | Rating expiry date |

---

## CUS — Custodian / Token Registry

> Holds ownership records for all tokens. Manages transfers, pledges, and redemptions.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| CUS-1 | custody_license_number | string | Custodian or token registry license |
| CUS-2 | legal_entity_id | uuid | |
| CUS-3 | legal_name | string | |
| CUS-4 | wallet_infrastructure | string | Blockchain or ledger system used |
| CUS-5 | did_wallet | string | |
| CUS-6 | compliance_controls | string | AML/KYC controls in place |
| CUS-7 | signer_authority | string | |
| CUS-8 | beneficial_owner_policy | string | Rules for identifying beneficial owners |
| CUS-9 | transfer_screening_rules | string | Rules for screening transfers |
| CUS-10 | pledge_lien_handling | string | How pledges and liens are recorded |
| CUS-11 | settlement_rails | array\<enum\> | `RTGS` / `ACH` / `BLOCKCHAIN` / `SWIFT` |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| CUS-12 | beckn_subscriber_id | string | |
| CUS-13 | domain_role | enum | Fixed: `custody_registry` |
| CUS-14 | transfer_api_endpoint | string | |
| CUS-15 | ownership_proof_api | string | |
| CUS-16 | redemption_api | string | |
| CUS-17 | supported_token_standards | array\<enum\> | Token standards supported |
| CUS-18 | compliance_api | string | |

### CATALOG — Per holding record

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| CUS-19 | token_id | uuid | The token being held |
| CUS-20 | beneficial_owner_id | uuid | Current beneficial owner entity ID |
| CUS-21 | instrument_id | uuid | The underlying instrument |
| CUS-22 | token_quantity | number | Number of units held |
| CUS-23 | holding_value | number | Current mark-to-model value |
| CUS-24 | accrued_payouts | number | Payouts accrued but not yet distributed |
| CUS-25 | lien_pledge_status | enum | `CLEAR` / `PLEDGED` / `LIENED` |
| CUS-26 | settlement_state | enum | `PENDING` / `SETTLED` / `FAILED` |
| CUS-27 | transfer_restrictions | string | Any lock-up or regulatory restrictions |
| CUS-28 | redemption_eligibility | boolean | Can this holding be redeemed |
| CUS-29 | redemption_eligibility_date | date | Earliest redemption date if locked |
| CUS-30 | transfer_history | array\<object\> | from_owner, to_owner, amount, timestamp per transfer |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| CUS-31 | ownership_proof | object | Queried by PM or Investor to verify their holding |
| CUS-32 | token_metadata | object | Queried by any holder — includes risk_indicator from RIF |

---

## EDGE — EdgeGrid Platform

> Routes utility grid service requests to LIUM. Allocates revenue after confirmed delivery.

### ONBOARD

#### PUSH

**Network layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| EDGE-1 | legal_entity_id | uuid | |
| EDGE-2 | legal_name | string | |
| EDGE-3 | platform_certification | string | Grid services platform certification |
| EDGE-4 | did_wallet | string | |
| EDGE-5 | settlement_account_id | string | Account for revenue collection and distribution |
| EDGE-6 | grid_integration_credentials | string | API credentials for grid operator integration |
| EDGE-7 | aggregation_methodology | string | How capacity is aggregated across assets |
| EDGE-8 | settlement_allocation_model | string | How revenue is split between participants |
| EDGE-9 | cybersecurity_profile | string | |

**App layer**

| ID | Field | Type | Notes |
|---|---|---|---|
| EDGE-10 | beckn_subscriber_id | string | |
| EDGE-11 | domain_role | enum | Fixed: `edgegrid_platform` |
| EDGE-12 | routing_api_endpoint | string | |
| EDGE-13 | dispatch_api_endpoint | string | |
| EDGE-14 | telemetry_callback_url | string | |
| EDGE-15 | supported_grid_nodes | array\<string\> | |
| EDGE-16 | asset_onboarding_api | string | For registering assets with EdgeGrid |
| EDGE-17 | capacity_discovery_api | string | |

### CATALOG — Per dispatch event

#### PUSH

| ID | Field | Type | Notes |
|---|---|---|---|
| EDGE-18 | need_id | uuid | FlexibilityNeed ID from UTL |
| EDGE-19 | available_capacity_mw | number | Total capacity available for dispatch |
| EDGE-20 | committed_capacity_mw | number | Capacity committed to this dispatch |
| EDGE-21 | dispatch_success_rate_pct | number | Historical dispatch success rate |
| EDGE-22 | response_time_ms | number | Average response time to dispatch instruction |
| EDGE-23 | revenue_earned | number | Revenue earned from this dispatch event |
| EDGE-24 | allocation_id | uuid | Revenue allocation record ID |
| EDGE-25 | allocation_rules | string | Rules for splitting revenue between participants |
| EDGE-26 | settlement_token_id | uuid | UNITS token for settlement |

#### PULL

| ID | Field | Type | Notes |
|---|---|---|---|
| EDGE-27 | delivery_confirmation | object | Pulls from LIUM after DC confirms dispatch |
| EDGE-28 | performance_proof | object | Pulls from LIUM — signed proof of delivery |

---

## System Components (not actors — infrastructure only)

These are not actors that onboard but internal components that store and process data.

| Component | Code | What it stores |
|---|---|---|
| LIUM Energy | LIUM | Routes all messages. Does not store — delegates to fabric. |
| LIUM Pincer | PINCER | GuaranteePolicies, PerformanceProofs, verification results |
| LIUM Vouch | VOUCH | PurposeBoundFunds, disbursement conditions, release records |
| Beckn Catalog | CATALOG | MicrogridProjects, LoanAgreements, SecurityOfferings |
| UNITS Tokenisation | UNITS | LoanTokens, SecurityTokens, AccessTokens, PaymentInstructions, ownership ledger |
| DeDI Registry | DEDI | ActorProfiles, registry_ids, DID/wallet mappings |
| OpenCred | OPENCRED | VerifiableCredentials, role_claims, validity, proofs |

---

## Field count summary

| Actor | ONBOARD fields | CATALOG fields | Total |
|---|---|---|---|
| PD | 38 | 42 | 80 |
| FN | 28 | 28 | 56 |
| SA | 25 | 25 | 50 |
| PM | 23 | 8 | 31 |
| RIF | 20 | 22 | 42 |
| UTL | 20 | 13 | 33 |
| DC | 19 | 11 | 30 |
| OP | 18 | 9 | 27 |
| TEL | 16 | 17 | 33 |
| RA | 18 | 14 | 32 |
| CUS | 18 | 14 | 32 |
| EDGE | 17 | 13 | 30 |
| **Total** | | | **~476** |
