# LIUM Platform — Securitisation Data Index

## How to read this document

This is a companion to [`actor-data-index.md`](./actor-data-index.md). It defines a third phase — `QUALIFY` — that sits after `CATALOG` in the Project Developer lifecycle. It covers every data field required to qualify an operating energy asset for tokenised securitisation on the LIUM Network.

**Phases**
- `ONBOARD` — actor registers themselves (defined in `actor-data-index.md`)
- `CATALOG` — actor publishes a project seeking debt financing (defined in `actor-data-index.md`, PD-1 to PD-82)
- `QUALIFY` — Project Developer submits an operating asset for securitisation assessment — this document

**Directions**
- `PUSH` — the Project Developer sends this data to the platform
- `PULL` — the Securities Agent, Rating Agent, or Risk Provider requests this data from the platform or directly from the developer

**Field IDs**
PD field numbering continues from `actor-data-index.md` (which ends at PD-82). QUALIFY fields run PD-83 onwards.

**Required / Conditional convention (encoded in Notes)**
- `REQUIRED` — must be populated to pass the relevant qualification gate
- `CONDITIONAL` — required only when a specific condition is met (stated in Notes)
- `OPTIONAL` — improves assessment but does not block gate

**Qualification Gates**
Every QUALIFY submission is assessed against seven gates. All seven must PASS for the asset to be routed to full securitisation.

| Gate | Name | Key Test |
|---|---|---|
| G1 | Physical Asset Gate | Asset commissioned, capacity ≥ 1 MW, remaining life ≥ financing tenor |
| G2 | Revenue Contract Gate | Contracted revenue ≥ 70% projected DSCR; assignment to SPV obtained; take-or-pay present |
| G3 | Cash Flow Gate | Average DSCR ≥ 1.0x; LQ ≥ 0.80 for ≥ 3 consecutive months |
| G4 | Legal & Title Gate | Clear title; SPV formed; true sale achieved; no material litigation |
| G5 | Credit Enhancement Gate | OC ≥ 10%; cash reserve ≥ 2% of pool; insurance assigned to trustee |
| G6 | Technology & Oracle Gate | IEEE 2030.5 compliant DER client; UNITS oracle integration tested; data latency ≤ 30s |
| G7 | Regulatory Gate | All material permits current; no outstanding notices; SEC Reg AB compliant |

---

## PD — Project Developer

> The QUALIFY phase begins when an operating asset is ready to be assessed for securitisation. This is distinct from the CATALOG phase, which covers a pre-COD project seeking debt financing. A QUALIFY submission is asset-level — each operating asset requires its own submission. The Securities Agent (SA) consumes the QUALIFY outputs to drive pool formation, tranche architecture, and UNITS token issuance.

### QUALIFY — Per securitisation qualification submission

#### PUSH — Developer submits to platform

---

##### CAT1 — Physical Asset

> Tests G1: asset exists, is commissioned, meets minimum capacity threshold, and has sufficient remaining life to cover the financing tenor.

**A1 — Asset Identification**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-83 | asset_name | string | REQUIRED — Legal project name as per interconnection agreement or offtake contract |
| PD-84 | asset_lium_id | string | REQUIRED — Assigned by LIUM on registration. Format: `LIUM-{ISO2}-{TYPE}-{YEAR}-{SEQ}` |
| PD-85 | asset_type | enum | REQUIRED — `BESS` / `SOLAR_PV` / `WIND` / `SOLAR_BESS_HYBRID` / `WIND_BESS_HYBRID` / `TRANSMISSION` / `DER_CLUSTER` / `OTHER` |
| PD-86 | asset_subtype | string | REQUIRED — Battery chemistry / panel technology / turbine type (e.g., `Lithium Iron Phosphate — LFP`) |
| PD-87 | state | string | REQUIRED — US state abbreviation (ISO 3166-2, e.g., `TX`, `CA`, `NY`) |
| PD-88 | gps_coordinates | object | REQUIRED — Site centroid: `lat`, `lon`. Used for UNITS oracle verification |
| PD-89 | site_address | string | OPTIONAL — Human-readable site address |
| PD-90 | balancing_authority | enum | REQUIRED — `ERCOT` / `PJM` / `CAISO` / `MISO` / `NYISO` / `SPP` / `WECC_OTHER` / `OTHER` |

**A2 — Technical Specifications**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-91 | installed_capacity_mw | number | REQUIRED — AC output capacity at point of interconnection |
| PD-92 | energy_capacity_mwh | number | CONDITIONAL — Required for BESS and hybrid assets |
| PD-93 | duration_hours | number | CONDITIONAL — Storage duration = MWh ÷ MW. Required for BESS |
| PD-94 | cod_date | date | REQUIRED — Commercial Operation Date (ISO 8601 YYYY-MM-DD) |
| PD-95 | expected_asset_life_years | number | REQUIRED — Per OEM warranty or independent engineer report |
| PD-96 | remaining_useful_life_years | number | REQUIRED — Expected asset life minus years in operation |
| PD-97 | oem_manufacturer | string | REQUIRED — Primary equipment OEM (e.g., CATL, Fluence, First Solar) |
| PD-98 | epc_contractor | string | OPTIONAL — Engineering, Procurement & Construction contractor |
| PD-99 | om_service_provider | string | REQUIRED — Entity responsible for operations and maintenance |
| PD-100 | grid_interconnection_kv | number | REQUIRED — Transmission or distribution interconnection voltage |
| PD-101 | iso_rto_offtaker_code | string | CONDITIONAL — ISO/RTO or utility offtaker entity identifier. Required for capacity market assets |

**A3 — Performance History**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-102 | p50_annual_generation_mwh | number | REQUIRED — P50 estimate from independent energy assessor |
| PD-103 | actual_availability_12m_pct | number | REQUIRED — Trailing 12-month uptime ÷ total scheduled hours × 100 |
| PD-104 | degradation_rate_pct_per_year | number | REQUIRED — Annual capacity degradation per OEM spec or measured actuals |
| PD-105 | round_trip_efficiency_pct | number | CONDITIONAL — AC–AC round-trip efficiency. Required for BESS assets |
| PD-106 | cycles_to_80pct_soh | number | CONDITIONAL — OEM warranty cycle count before 20% capacity fade. Required for BESS |

---

##### CAT2 — Contract & Revenue

> Tests G2: contracted revenue covers ≥ 70% of projected DSCR; contract is legally assignable to SPV; take-or-pay clause is present.

**C1 — Primary Revenue Contract**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-107 | contract_type | enum | REQUIRED — `PPA` / `CPPA` / `CAPACITY_AGREEMENT` / `TOLLING` / `REC` / `MERCHANT` / `GRID_SERVICES` / `BTM` |
| PD-108 | offtaker_name | string | REQUIRED — Legal name of offtaker or buyer |
| PD-109 | offtaker_credit_rating | string | REQUIRED — Rating agency and current rating (e.g., `A+ (S&P)`, `Aa2 (Moody's)`) |
| PD-110 | offtaker_entity_type | enum | REQUIRED — `INVESTMENT_GRADE_CORPORATE` / `INVESTOR_OWNED_UTILITY` / `MUNI_UTILITY` / `ELECTRIC_COOPERATIVE` / `FEDERAL_POWER_AGENCY` / `MERCHANT` |
| PD-111 | contract_execution_date | date | REQUIRED — Date PPA / CPPA fully executed |
| PD-112 | contract_start_date | date | REQUIRED — COD date triggering payment obligations |
| PD-113 | contract_tenor_years | number | REQUIRED — Total contracted revenue period in years |
| PD-114 | contract_expiry_date | date | REQUIRED — Contract end date |
| PD-115 | annual_contracted_revenue_usd | number | REQUIRED — Base year contracted revenue in USD |
| PD-116 | escalation_mechanism | enum | REQUIRED — `FIXED_RATE` / `CPI_LINKED` / `PPI_LINKED` / `NONE` / `NEGOTIATED` |
| PD-117 | escalation_rate_pct | number | CONDITIONAL — Annual escalation rate. Required if PD-116 = `FIXED_RATE` |
| PD-118 | availability_guarantee_pct | number | CONDITIONAL — Contracted minimum availability % triggering payment obligation |
| PD-119 | take_or_pay_clause | boolean | REQUIRED — Whether minimum payment applies regardless of dispatch |
| PD-120 | contract_assignable_to_spv | enum | REQUIRED — `YES` / `PENDING` / `NO` — CRITICAL: contract must be assignable to SPV for securitisation |
| PD-121 | assignment_consent_status | enum | REQUIRED — `OBTAINED` / `PENDING` / `NOT_REQUIRED` / `REFUSED` — Offtaker consent to assignment |

**C2 — Secondary / Ancillary Revenue**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-122 | secondary_revenue_type | enum | OPTIONAL — `CAPACITY_MARKET` / `ANCILLARY_SERVICES` / `REC` / `DEMAND_RESPONSE` / `NONE` — Additional revenue beyond primary contract |
| PD-123 | secondary_revenue_annual_usd | number | OPTIONAL — Conservative estimate. Excluded from base DSCR unless contracted |
| PD-124 | rec_annual_mwh_equiv | number | OPTIONAL — Estimated annual REC generation equivalent |

**C3 — Contract Risk Flags**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-125 | change_in_law_protection | enum | REQUIRED — `FULL` / `PARTIAL` / `NONE` — Whether revenue is protected from adverse regulatory change |
| PD-126 | force_majeure_provisions | enum | REQUIRED — `STANDARD` / `EXTENDED` / `NONE` |
| PD-127 | termination_payment_type | enum | REQUIRED — `FULL_NPV_RECOVERY` / `PARTIAL` / `NONE` — Payment due if offtaker terminates early |
| PD-128 | dispute_resolution_mechanism | enum | REQUIRED — `ARBITRATION_AAA` / `ARBITRATION_ICC` / `FEDERAL_COURT` / `STATE_COURT` / `FERC` |

---

##### CAT3 — Cash Flow & Qualification Scoring

> Tests G3: average DSCR ≥ 1.0x across the securitisation period; composite LQ score ≥ 0.80 for ≥ 3 consecutive months.

**F1 — CAPEX & Financing**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-129 | total_project_capex_usd | number | REQUIRED — Total capital expenditure per final project cost |
| PD-130 | equity_component_usd | number | REQUIRED — Sponsor / developer equity contribution |
| PD-131 | debt_component_usd | number | REQUIRED — Total senior + subordinate debt |
| PD-132 | itc_ptc_grant_usd | number | CONDITIONAL — ITC / PTC / DOE grant component. Leave blank if none |
| PD-133 | leverage_ratio_pct | number | REQUIRED — Debt ÷ Total CAPEX × 100 |

**F2 — Revenue & OPEX Projections**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-134 | base_year_revenue_usd | number | REQUIRED — Year 1 contracted revenue |
| PD-135 | annual_opex_usd | number | REQUIRED — O&M, insurance, admin, land lease per year |
| PD-136 | annual_debt_service_usd | number | REQUIRED — Principal + interest on senior debt per year |
| PD-137 | ebitda_margin_pct | number | OPTIONAL — (Revenue − Opex) ÷ Revenue × 100 |

**F3 — DSCR & LQ Scoring**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-138 | dscr_year_1 | number | REQUIRED — (Revenue − Opex) ÷ Debt Service. Must be ≥ 1.0x for Gate G3 |
| PD-139 | dscr_average | number | REQUIRED — Weighted average DSCR over full contract term. Must be ≥ 1.0x |
| PD-140 | dscr_minimum | number | REQUIRED — Lowest single-year DSCR. If < 1.0x, mitigation plan required |
| PD-141 | dscr_minimum_year | number | CONDITIONAL — Year in which DSCR is at minimum. Required if PD-140 < 1.0x |
| PD-142 | lq_availability_score | number | REQUIRED — A(t): trailing-90-day actual availability ÷ contracted minimum. Range 0.0–1.0 |
| PD-143 | lq_dscr_score | number | REQUIRED — D(t): normalised DSCR on 0–1 scale. max(0, min(1, (DSCR − 0.90) ÷ (1.25 − 0.90))) |
| PD-144 | lq_verification_score | number | REQUIRED — V(t): oracle-verified milestones ÷ expected milestones. Range 0.0–1.0 |
| PD-145 | lq_degradation_factor | number | REQUIRED — δ(t): battery capacity loss per agreed schedule. Range 0.00–0.10 |
| PD-146 | lq_composite_score | number | REQUIRED — [A×0.40 + D×0.35 + V×0.25] × (1−δ). Must be ≥ 0.80 for Gate G3 |
| PD-147 | lq_consecutive_months_above_threshold | number | REQUIRED — Must be ≥ 3 for qualification gate to open |
| PD-148 | cash_flow_timeseries | array\<object\> | REQUIRED — Per year: `year`, `capacity_pct`, `revenue_usd`, `opex_usd`, `debt_service_usd`, `dscr` |
| PD-149 | capacity_degradation_schedule | array\<object\> | REQUIRED — Per year: `year`, `min_dispatchable_capacity_pct` |

**F4 — Grant / ITC / PTC Milestone Status**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-150 | grant_total_usd | number | CONDITIONAL — Total ITC / PTC / DOE grant tranche. Leave blank if none |
| PD-151 | grant_tranches_count | number | CONDITIONAL — Number of oracle-gated milestone tranches |
| PD-152 | grant_released_to_date_usd | number | CONDITIONAL — Cumulative grant disbursed to date |
| PD-153 | next_grant_milestone | string | CONDITIONAL — Description of next locked milestone (e.g., `M3: 6-month LQ ≥ 0.80 continuous`) |

---

##### CAT4 — Legal & Title

> Tests G4: clear and unencumbered title; SPV formed; true sale of receivables achieved; no material litigation or insolvency.

**L1 — Ownership & Title**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-154 | asset_owner_legal_entity | string | REQUIRED — Legal entity currently holding title to the asset |
| PD-155 | ein | string | REQUIRED — US Employer Identification Number of asset-owning entity |
| PD-156 | land_ownership_type | enum | REQUIRED — `FEE_SIMPLE` / `LEASEHOLD_GOVT` / `LEASEHOLD_PRIVATE` / `EASEMENT` / `LICENSE` / `OTHER` |
| PD-157 | land_lease_term_remaining_years | number | CONDITIONAL — Required if leasehold. Must exceed securitisation tenor |
| PD-158 | title_search_completed | enum | REQUIRED — `YES_CLEAR` / `YES_ENCUMBRANCES_FOUND` / `NO` — Independent title search by qualified counsel |
| PD-159 | encumbrances | enum | REQUIRED — `NONE` / `MORTGAGE` / `DEED_OF_TRUST` / `UCC_LIEN` / `COURT_ORDER` / `OTHER` — Any existing charge that must be released before securitisation |

**L2 — SPV Structure**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-160 | spv_formed | enum | REQUIRED — `YES_OPERATIONAL` / `YES_SHELL_ONLY` / `IN_FORMATION` / `NOT_YET` |
| PD-161 | spv_name | string | CONDITIONAL — Legal name of SPV. Required if PD-160 ≠ NOT_YET |
| PD-162 | spv_jurisdiction | string | CONDITIONAL — US state of formation. Required if PD-160 ≠ NOT_YET. Delaware preferred for ABS structures |
| PD-163 | spv_entity_type | enum | CONDITIONAL — `LLC` / `LP` / `STATUTORY_TRUST` / `BUSINESS_TRUST` — Required if PD-160 ≠ NOT_YET |
| PD-164 | true_sale_achieved | enum | REQUIRED — `YES` / `PENDING_LEGAL_OPINION` / `NO` — Receivables must be isolated from originator balance sheet |
| PD-165 | bankruptcy_remoteness_opinion | enum | REQUIRED — `OBTAINED` / `PENDING` / `NOT_REQUIRED` — Independent legal opinion confirming SPV cannot be consolidated with originator insolvency |

**L3 — Consents & Litigation**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-166 | ferc_consent_for_transfer | enum | REQUIRED — `OBTAINED` / `PENDING` / `NOT_REQUIRED` / `REFUSED` — FERC approval for assignment to SPV if jurisdictional facility |
| PD-167 | state_puc_transfer_consent | enum | REQUIRED — `OBTAINED` / `PENDING` / `NOT_REQUIRED` / `REFUSED` — State PUC consent if regulated utility asset |
| PD-168 | material_litigation_pending | enum | REQUIRED — `NONE` / `YES_DISCLOSED` / `YES_UNDISCLOSED` — Any court or FERC proceedings material to asset value |
| PD-169 | bankruptcy_proceedings | enum | REQUIRED — `NONE` / `CHAPTER_11_FILED` / `CHAPTER_7` / `OTHER` — Insolvency status of originator or asset owner |

**L4 — Key Document Checklist**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-170 | doc_ppa_cppa_uploaded | enum | REQUIRED — `UPLOADED` / `PENDING` / `NOT_APPLICABLE` |
| PD-171 | doc_land_title_uploaded | enum | REQUIRED — `UPLOADED` / `PENDING` |
| PD-172 | doc_interconnection_agreement_uploaded | enum | REQUIRED — `UPLOADED` / `PENDING` |
| PD-173 | doc_epc_contract_uploaded | enum | OPTIONAL — `UPLOADED` / `PENDING` / `NOT_APPLICABLE` |
| PD-174 | doc_om_agreement_uploaded | enum | REQUIRED — `UPLOADED` / `PENDING` |
| PD-175 | doc_insurance_policies_uploaded | enum | REQUIRED — `UPLOADED` / `PENDING` |

---

##### CAT5 — Credit Enhancement

> Tests G5: overcollateralisation ≥ 10% of pool; cash reserve ≥ 2% of pool; insurance proceeds assigned to trustee.

**E1 — Structural Credit Enhancement**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-176 | overcollateralisation_pct | number | REQUIRED — Pool assets ÷ Securities issued − 1. Minimum 10% for Gate G5 |
| PD-177 | cash_reserve_fund_usd | number | REQUIRED — Upfront cash deposited to cover payment shortfalls |
| PD-178 | cash_reserve_pct_of_pool | number | REQUIRED — PD-177 ÷ Pool Size × 100. Minimum 2% for Gate G5 |
| PD-179 | excess_spread_bps | number | REQUIRED — Revenue yield minus blended note coupon in basis points |
| PD-180 | subordination_structure | enum | REQUIRED — `SENIOR_MEZZ_JUNIOR` / `SENIOR_JUNIOR` / `SENIOR_ONLY` / `BULLET` |
| PD-181 | senior_tranche_size_usd | number | CONDITIONAL — Required if PD-180 includes senior tranche |
| PD-182 | senior_tranche_coupon_pct | number | CONDITIONAL — Required if PD-181 is set |
| PD-183 | mezzanine_tranche_size_usd | number | CONDITIONAL — Required if PD-180 = SENIOR_MEZZ_JUNIOR |
| PD-184 | mezzanine_tranche_coupon_pct | number | CONDITIONAL — Required if PD-183 is set |
| PD-185 | junior_tranche_size_usd | number | CONDITIONAL — Required if PD-180 includes junior tranche |
| PD-186 | junior_tranche_coupon_pct | number | CONDITIONAL — Required if PD-185 is set |

**E2 — External Credit Enhancement**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-187 | credit_rating_obtained | enum | REQUIRED — `YES_POOL_RATED` / `YES_TRANCHE_RATED` / `PENDING` / `NO` |
| PD-188 | rating_agency | enum | CONDITIONAL — `MOODYS` / `SP` / `FITCH` / `KROLL` / `DBRS_MORNINGSTAR` / `NONE` — Required if PD-187 ≠ NO |
| PD-189 | senior_tranche_rating | string | CONDITIONAL — e.g., `AAA(sf)`. Required if PD-187 ≠ NO |
| PD-190 | guarantee_type | enum | OPTIONAL — `DOE_LOAN_GUARANTEE` / `USAID_DCA` / `WORLD_BANK_PCG` / `FHFA_COVERED_BOND` / `CORPORATE_GUARANTEE` / `NONE` |
| PD-191 | guarantee_amount_usd | number | CONDITIONAL — Required if PD-190 ≠ NONE |

**E3 — Insurance**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-192 | property_insurance | enum | REQUIRED — `IN_PLACE` / `PENDING` / `NONE` — All-risk property insurance on physical asset |
| PD-193 | insurer_name | string | CONDITIONAL — Required if PD-192 = IN_PLACE |
| PD-194 | business_interruption_insurance | enum | REQUIRED — `IN_PLACE` / `PENDING` / `NONE` — Revenue loss coverage during forced outage |
| PD-195 | insurance_coverage_years | number | CONDITIONAL — Must cover at minimum the full securitisation tenor |
| PD-196 | insurance_assigned_to_trustee | enum | REQUIRED — `YES` / `PENDING` / `NO` — Insurance proceeds must flow to security trustee, not originator |

---

##### CAT6 — Technology & Oracle (IEEE 2030.5 / NERC CIP)

> Tests G6: IEEE 2030.5 compliant DER client certified; UNITS oracle integration tested end-to-end; data latency ≤ 30 seconds; NERC CIP compliance where applicable.

**T1 — Telemetry Standard Compliance**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-197 | primary_telemetry_standard | enum | REQUIRED — `IEEE_2030_5` / `IEC_61850` / `IEEE_1547` / `MODBUS_TCP` / `DNP3` / `PROPRIETARY` — IEEE 2030.5 required for G6 PASS. SCADA alone is not accepted |
| PD-198 | ieee_2030_5_compliant | enum | REQUIRED — `YES` / `NO` / `IN_PROGRESS` — Must be YES for Gate G6 |
| PD-199 | der_client_certification | enum | REQUIRED — `CERTIFIED_SUNSPEC` / `CERTIFIED_UCA_IUG` / `SELF_CERTIFIED` / `IN_CERTIFICATION` / `NONE` — Conformance certification body |
| PD-200 | ieee_2030_5_server_endpoint | string | REQUIRED — HTTPS endpoint for LIUM oracle to connect. Must be live before G6 |
| PD-201 | tls_certificate_valid | enum | REQUIRED — `YES` / `NO` / `PENDING` — TLS 1.2+ mandatory per IEEE 2030.5 security model |
| PD-202 | authentication_method | enum | REQUIRED — `OAUTH2_CLIENT_CREDENTIALS` / `MTLS_CERTIFICATE` / `HMAC` / `API_KEY` / `NONE` — OAuth2 or mTLS required. API key alone is insufficient |
| PD-203 | oauth2_token_endpoint | string | CONDITIONAL — Required if PD-202 = OAUTH2_CLIENT_CREDENTIALS |
| PD-204 | mtls_client_cert_provided | enum | CONDITIONAL — `YES` / `PENDING` / `NOT_APPLICABLE` — Required if PD-202 = MTLS_CERTIFICATE |
| PD-205 | nerc_cip_compliance | enum | REQUIRED — `COMPLIANT` / `NOT_APPLICABLE` / `IN_PROGRESS` — NERC CIP-002 through CIP-013 as applicable to BES Cyber Systems |

**T2 — Data Points & Metering**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-206 | mirror_usage_point_configured | enum | REQUIRED — `YES` / `NO` / `IN_PROGRESS` — IEEE 2030.5 MirrorUsagePoint for energy metering push to LIUM oracle |
| PD-207 | der_control_interface_available | enum | REQUIRED — `YES` / `NO` — IEEE 2030.5 DERControl for dispatch and control signals from ISO/RTO |
| PD-208 | realtime_power_kw_available | enum | REQUIRED — `YES` / `NO` — Instantaneous active power output |
| PD-209 | state_of_charge_available | enum | CONDITIONAL — `YES` / `NO` — Required for BESS assets |
| PD-210 | cumulative_energy_kwh_available | enum | REQUIRED — `YES` / `NO` — Rolling cumulative generation or discharge counter |
| PD-211 | alarm_fault_stream_available | enum | REQUIRED — `YES` / `NO` — Real-time fault flags feeding availability score A(t) |
| PD-212 | data_polling_interval_seconds | number | REQUIRED — Frequency at which LIUM oracle polls the endpoint. ≤ 300s required |
| PD-213 | data_latency_max_seconds | number | REQUIRED — End-to-end latency from event to IEEE 2030.5 server. ≤ 30s required for G6 |

**T3 — UNITS Oracle Integration**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-214 | units_oracle_integration_tested | enum | REQUIRED — `YES_PASSED` / `YES_PARTIAL` / `IN_PROGRESS` / `NOT_STARTED` |
| PD-215 | oracle_test_report_reference | string | CONDITIONAL — Report reference ID or URL. Required if PD-214 = YES_PASSED or YES_PARTIAL |
| PD-216 | historical_data_availability_months | number | REQUIRED — Months of back-history available via IEEE 2030.5 endpoint. Minimum 3 months for LQ scoring; 12 preferred |
| PD-217 | units_token_wallet_address | string | OPTIONAL — If token already issued on UNITS, provide wallet address |
| PD-218 | on_chain_asset_id | string | OPTIONAL — UNITS registry identifier if previously onboarded |

**T4 — EMS / SCADA Migration**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-219 | current_ems_scada_system | string | OPTIONAL — Existing EMS/SCADA system. Documentation only — SCADA is not accepted as oracle standard |
| PD-220 | ieee_2030_5_migration_plan | enum | CONDITIONAL — `COMPLETED` / `Q1_2026` / `Q2_2026` / `Q3_2026` / `Q4_2026` / `2027` / `NOT_PLANNED` — Required if PD-197 ≠ IEEE_2030_5. Migration mandatory for G6 |
| PD-221 | migration_budget_usd | number | CONDITIONAL — Cost to upgrade legacy EMS/SCADA to IEEE 2030.5 compliant system |

---

##### CAT7 — Regulatory & Compliance

> Tests G7: all material permits are current; no outstanding regulatory notices; SEC Regulation AB compliant for ABS issuance.

**R1 — FERC, ISO/RTO & Grid Permits**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-222 | ferc_authorization | enum | REQUIRED — `EWG_REGISTERED` / `QF_CERTIFIED_PURPA` / `MARKET_BASED_RATE_AUTH` / `EXEMPT` / `PENDING` — FERC Exempt Wholesale Generator or Qualifying Facility status |
| PD-223 | interconnection_agreement | enum | REQUIRED — `EXECUTED` / `PENDING` / `NOT_REQUIRED` — ISO/RTO or utility interconnection agreement (LGIA or SGIA) |
| PD-224 | transmission_service_agreement | enum | REQUIRED — `EXECUTED` / `PENDING` / `NOT_REQUIRED` — ISO/RTO or utility TSA for power evacuation |
| PD-225 | revenue_grade_metering_approved | enum | REQUIRED — `APPROVED` / `PENDING` — Revenue-grade metering per ISO/RTO tariff or ANSI C12 standard |
| PD-226 | balancing_authority_registration | enum | REQUIRED — `REGISTERED` / `PENDING` / `NOT_REQUIRED` — Asset registered with relevant balancing authority (ERCOT, PJM, CAISO, MISO, NYISO, SPP) |

**R2 — Environmental Clearances**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-227 | nepa_review_status | enum | REQUIRED — `CATEGORICAL_EXCLUSION` / `EA_COMPLETED_FONSI` / `EIS_COMPLETED_ROD` / `PENDING` / `NOT_REQUIRED` — National Environmental Policy Act review |
| PD-228 | epa_air_permit | enum | REQUIRED — `OBTAINED` / `NOT_REQUIRED` / `PENDING` — EPA Title V major source or minor source permit as applicable |
| PD-229 | army_corps_404_permit | enum | CONDITIONAL — `NOT_REQUIRED` / `NATIONWIDE_PERMIT` / `INDIVIDUAL_PERMIT_OBTAINED` / `PENDING` — Required if wetlands or waters of the US impacted |
| PD-230 | endangered_species_clearance | enum | CONDITIONAL — `NOT_REQUIRED` / `BIOLOGICAL_OPINION_OBTAINED` / `INCIDENTAL_TAKE_PERMIT_ITP` / `PROGRAMMATIC_AGREEMENT` / `PENDING` — USFWS Section 7 or Section 10 clearance |
| PD-231 | hazardous_materials_declaration | enum | REQUIRED — `SUBMITTED` / `NOT_REQUIRED` / `PENDING` — BESS: battery chemistry hazardous material declaration per EPA RCRA and local fire codes |

**R3 — Land & Structural Consents**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-232 | building_structural_permit | enum | REQUIRED — `OBTAINED` / `NOT_REQUIRED` / `PENDING` — Local jurisdiction building permit |
| PD-233 | faa_height_clearance | enum | CONDITIONAL — `NOT_REQUIRED` / `NO_HAZARD_DETERMINATION` / `PENDING` — Required for structures > 200ft or within airport notification zones (FAA Part 77) |

**R4 — Financial & Securities Regulatory**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-234 | sec_reg_ab_compliance | enum | REQUIRED — `COMPLIANT` / `PENDING` / `EXEMPT` — SEC Regulation AB II for registered ABS issuance. Required for public offerings |
| PD-235 | sec_rule_144a_status | enum | CONDITIONAL — `APPLICABLE` / `NOT_APPLICABLE` — Rule 144A / Reg S exemption for institutional private placement |
| PD-236 | spv_state_entity_filing | enum | REQUIRED — `ACTIVE` / `PENDING` / `NOT_REQUIRED` — SPV registered as LLC, LP, or statutory trust in state of formation |
| PD-237 | state_securities_exemption | enum | CONDITIONAL — `FILED` / `NOT_REQUIRED` / `PENDING` — State Blue Sky law exemption or registration |

**R5 — Compliance Summary**

| ID | Field | Type | Notes |
|---|---|---|---|
| PD-238 | overall_compliance_status | enum | REQUIRED — `FULLY_COMPLIANT` / `MINOR_GAPS_CURABLE` / `MATERIAL_GAPS` / `NON_COMPLIANT` — Self-assessed; LIUM verifies via independent legal review |
| PD-239 | outstanding_notices | enum | REQUIRED — `NONE` / `YES_DISCLOSED` / `YES_UNDISCLOSED` — Any outstanding regulatory notices, FERC orders, or show-cause orders |
| PD-240 | last_regulatory_audit_date | date | OPTIONAL — Date of most recent independent regulatory compliance audit |

---

#### PULL — Securities Agent and counterparties query from platform

> These objects are not submitted by the PD directly. They are generated by LIUM, pulled from the QUALIFY data, or requested from the PD by the Securities Agent (SA), Rating Agent (RA), or Risk Provider (RIF) during pool formation and credit analysis.

| ID | Field | Type | Consumed By | Notes |
|---|---|---|---|---|
| PD-241 | asset_qualification_report | object | SA | Generated by LIUM after G1–G7 evaluation — gate statuses, scores, and go/no-go routing decision |
| PD-242 | pool_schedule | object | SA | Pulled by SA for pool formation — all receivables with amounts, dates, obligor, and payment mechanism |
| PD-243 | independent_engineer_report | object | SA, RA | Asset condition, degradation model, P50 output projections from independent engineer |
| PD-244 | lq_history | array\<object\> | SA, RIF, RA | Monthly LQ scores, component breakdown (A/D/V/δ), consecutive months above threshold |
| PD-245 | dscr_model | object | SA, RA | Base case + three stress scenarios, annual DSCR Y1–Y12, DSRA drawdown requirement per year |
| PD-246 | true_sale_legal_opinion | object | SA | Independent counsel opinion confirming assignment from originator to SPV qualifies as a true sale under US law |
| PD-247 | spv_bankruptcy_remoteness_opinion | object | SA | Independent counsel opinion confirming SPV cannot be consolidated with originator insolvency under US bankruptcy law |
| PD-248 | scada_telemetry_sample | object | RIF | Pulled by RIF via UNITS AccessToken — 90-day availability, SOC, cycles, fault event log |
| PD-249 | financial_model_electronic | object | SA, RA | Auditable spreadsheet model with all revenue, OPEX, debt service, and DSCR assumptions |
| PD-250 | insurance_assignment_confirmation | object | SA | Confirmation that insurance proceeds are contractually assigned to security trustee, not originator |
| PD-251 | rating_agency_submission_pack | object | RA | SA-compiled package: DSCR model, pool schedule, credit enhancement schedule, legal opinions, IE report, PPA/CPPA |

---

## Qualification Gate Summary

| Gate | Name | Key Metric | FAIL Consequence |
|---|---|---|---|
| G1 | Physical Asset Gate | Asset commissioned; capacity ≥ 1 MW; remaining life ≥ financing tenor | Not securitisable — exit to development finance |
| G2 | Revenue Contract Gate | Contracted revenue ≥ 70% projected DSCR; SPV assignment obtained; take-or-pay present | Restructure contract; or route to ancillary services monetisation |
| G3 | Cash Flow Gate | Average DSCR ≥ 1.0x; LQ ≥ 0.80 for ≥ 3 consecutive months | PPA/CPPA restructuring required before securitisation |
| G4 | Legal & Title Gate | Clear title; SPV formed; true sale achieved; no material litigation or insolvency | Legal remediation — not eligible until title is clear |
| G5 | Credit Enhancement Gate | OC ≥ 10%; cash reserve ≥ 2% of pool; insurance assigned to trustee | Increase OC or cash reserve; confirm insurance assignment |
| G6 | Technology & Oracle Gate | IEEE 2030.5 compliant; oracle integration tested; data latency ≤ 30s | 90-day upgrade path to IEEE 2030.5; then re-submit |
| G7 | Regulatory Gate | All material permits current; no outstanding FERC/SEC notices; Reg AB compliant | Address regulatory gaps; re-submit after clearance |

---

## Instrument Routing (post gate evaluation)

| Scenario | Gate Condition | Instrument | Next Steps |
|---|---|---|---|
| Full Securitisation | All 7 gates PASS | Senior AAA(sf) / Mezzanine BBB(sf) / Junior BB(sf) | Appoint Trustee and Rating Agency → SEC Reg AB or Rule 144A filing → UNITS token issuance (ISSUE operation) → Registered Holder distribution |
| Ancillary Services Path | G1+G3+G4+G7 PASS; G2 FAIL (merchant or no contracted offtake) | ISO/RTO ancillary services monetisation | Register as DR aggregator in ERCOT/PJM/CAISO → bid into frequency regulation / spinning reserve → build 12-month contracted track record → return to securitisation path |
| Technology Upgrade Path | G1–G5 + G7 PASS; G6 FAIL | Defer — IEEE 2030.5 upgrade required | Procure IEEE 2030.5 compliant EMS or inverter firmware → SunSpec/UCAIug certification → connect LIUM oracle endpoint → 90-day pilot data collection → re-submit G6 |
| Legal Remediation Path | G4 FAIL (title encumbrances or litigation) | Not eligible — legal hold | Engage independent US counsel → clear UCC liens / deeds of trust → resolve pending litigation → obtain bankruptcy remoteness opinion → re-submit G4 |
| PPA Restructuring Path | G1+G6+G7 PASS; G3 FAIL (DSCR < 1.0x average) | Defer — PPA restructure required | Engage offtaker to revise tariff or extend tenor → model revised DSCR → explore ancillary revenue (ERCOT capacity market, REC) to bridge DSCR gap → re-submit in 90 days post-execution |
| Not Securitisable | 3 or more gates FAIL, or G4 hard fail + G2 hard fail | Development finance or equity only | Refer to DOE Loan Program Office, CDFI, or IREDA equivalent → explore ITC/PTC monetisation → re-assessment available after 180 days of remediation |

---

## LQ Formula Reference

The Liveliness Quotient (LQ) is the composite real-time asset health score computed monthly by the UNITS oracle. Gate threshold: **LQ ≥ 0.80 for 3 consecutive months**.

**LQ(t) = [ A(t) × 0.40 + D(t) × 0.35 + V(t) × 0.25 ] × ( 1 − δ(t) )**

| Component | Definition | Formula | Range | Breach Action |
|---|---|---|---|---|
| A(t) — Availability Score | Trailing-90-day actual availability vs. contracted minimum | Actual 90-day availability % ÷ contracted minimum availability % | 0.0 – 1.0 | LQ < 0.80 → suspend grant/ITC tranche disbursement; Servicer alert |
| D(t) — DSCR Score | Normalised period DSCR on 0–1 scale | max(0, min(1, (DSCR − 0.90) ÷ (1.25 − 0.90))) | 0.0 – 1.0 | DSCR < 0.90 → D(t) = 0; DSRA drawdown; Trustee notification |
| V(t) — Verification Score | Oracle-verified milestones vs. expected milestones | On-chain verified milestones ÷ total expected milestones | 0.0 – 1.0 | Unverified milestones reduce score; milestone escrow suspended |
| δ(t) — Degradation Factor | Battery capacity loss vs. agreed OEM schedule | Actual capacity loss % per agreed degradation schedule | 0.00 – 0.10 | Applied as multiplier to raw LQ; annual recalibration per IE report |
| **LQ Gate** | Gate OPEN when LQ ≥ 0.80 for 3 consecutive months | — | 0.0 – 1.0 | Gate FAIL → suspend grant tranche; enhanced weekly monitoring; Trustee notified |

---

## Field Count Summary

| Actor | Phase | PUSH fields | PULL fields | Total |
|---|---|---|---|---|
| PD | QUALIFY | 158 (PD-83 to PD-240) | 11 (PD-241 to PD-251) | 169 |

*PD ONBOARD and CATALOG fields (PD-1 to PD-82) are defined in [`actor-data-index.md`](./actor-data-index.md).*
