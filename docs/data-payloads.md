# LIUM — Data Payloads Reference

> **What this document is:** The complete set of data payloads that every actor publishes onto the LIUM network — structured by actor, phase, layer, and platform rail.
>
> **Companion document:** [`actor-data-index.md`](./actor-data-index.md) — field-level schema with types, IDs, and directions.

---

## The Two Rails

Every payload on LIUM is split across two platform rails:

| Rail | Owned by | Covers |
|------|----------|--------|
| **Finternet** | Financial asset layer | Asset definition · trust · ownership · risk · valuation · composability · cash flows |
| **Beckn** | Discovery / transaction protocol | Subscriber identity · catalog exposure · API endpoints · discovery · transaction flow |

## The Two Dimensions

| Dimension | Options | Meaning |
|-----------|---------|---------|
| **Phase** | `Onboarding` | Actor registers themselves — who they are, what authority they hold |
| | `Catalog` | Actor publishes a project, offer, or service — what they are listing |
| **Layer** | `Network` | Protocol level — identity, keys, roles, trust anchors, asset IDs |
| | `App` | Business level — financials, documents, data fields, API endpoints |

---

## Actor Index

| # | Actor | One-line role |
|---|-------|---------------|
| 1 | [Project Developer](#1-project-developer) | Originates BESS/DER projects, raises financing, publishes to catalog |
| 2 | [Financier](#2-financier) | Provides debt or structured financing |
| 3 | [Securitization Agent](#3-securitization-agent) | Packages loans and assets into tranches for investors |
| 4 | [Portfolio Manager](#4-portfolio-manager) | Evaluates securitized assets, allocates capital |
| 5 | [Investor](#5-investor) | Subscribes into tokenized instruments or securitized exposure |
| 6 | [Risk Provider](#6-risk-provider) | Produces signed risk indicators from telemetry and performance data |
| 7 | [Utility / Procurer](#7-utility--procurer) | Procures capacity, creates contracted revenue, validates dispatch |
| 8 | [EdgeGrid](#8-edgegrid) | Aggregates capacity, routes dispatch, allocates grid-service revenue |
| 9 | [Project / Asset Operator](#9-project--asset-operator) | Runs the asset, maintains telemetry, confirms availability |
| 10 | [Data Center / Offtaker](#10-data-center--offtaker) | Consumes energy or flexibility, signs offtake contracts |
| 11 | [Telemetry Provider](#11-telemetry-provider) | Provides signed device and performance data |
| 12 | [Rating / Valuation Agent](#12-rating--valuation-agent) | Rates instruments, tranches, pools; runs surveillance |
| 13 | [Custodian / Token Registry](#13-custodian--token-registry) | Maintains ownership records, transfer constraints, token registry |

---

## 1. Project Developer

> Originates and publishes energy storage or DER projects seeking financing. After COD, creates the operating asset trail needed for securitization.
>
> **Reference documents:** DPR (Kintech Synergy, 65 MW / 130 MWh BESS, Banaskantha) · GUVNL BESPPA Phase IV

### Onboarding · Network

| Finternet | Beckn |
|-----------|-------|
| Legal entity ID (CIN) | Beckn subscriber ID |
| Incorporation certificate (Companies Act 1956/2013) | Participant registry entry |
| Registered office address | Domain role: `project_originator` |
| Beneficial ownership + shareholding pattern (BESPA Schedule F) | Subscriber URL |
| Tax identifiers (PAN / GSTIN) | Callback URLs |
| Bank account details | Public key |
| Authorized signatories | Protocol permissions |
| DID / wallet | Bidding company vs SPV identity |
| Lending / EPC license | — |
| Credit profile | — |
| Prior default history | — |
| Performance Bank Guarantee capacity (Rs. 18.5 Lakh/MW) | — |

### Onboarding · App

| Finternet | Beckn |
|-----------|-------|
| Project experience (MW deployed, asset types) | Organization name |
| Technology track record (BESS / wind / solar EPC history) | Contact email |
| EPC and O&M partners | Service geographies (state-level) |
| Financial closure history | Supported asset categories |
| Regulatory approvals track record | Document upload API |
| Compliance attestations (CEA, CERC, GERC) | Project details webhook / API |
| Insurance history (Industrial All Risk) | Implementing agency relationships (NVVN, SECI, GUVNL) |
| VGF scheme eligibility history | — |

### Catalog · Network

| Finternet | Beckn |
|-----------|-------|
| Financial asset ID | Catalog provider ID |
| Asset definition (BESS type, chemistry) | Catalog item ID |
| SPV entity details | Search tags (BESS, VGF, ISTS, Gujarat) |
| Ownership model (BOO / BOOT) | Discovery filters (MW range, MWh, COD year, state, scheme) |
| Land arrangement (ROU from GETCO / STU) | Visibility rules |
| Collateral definition (asset + cash flows) | Transaction endpoint |
| Asset composability rules (bundle / tranche post-COD / pledge cash flows) | Status callback |
| Transfer restrictions (BESPA Article 15 — no third-party sale of contracted capacity) | — |
| LOA reference number and issuing authority | — |
| BESPA contract reference and term (12 years) | — |
| Eligibility for pre-COD financing | — |
| Eligibility for post-COD securitization | — |

### Catalog · App

#### Technical Specifications

| Field | Value (example: Banaskantha BESS) |
|-------|-----------------------------------|
| Asset type | Standalone BESS, grid-scale, ISTS-connected |
| Battery chemistry | Lithium-ion — LFP or NMC |
| Installed capacity | 65 MW / 130 MWh |
| Duration | 2-hour system |
| Daily cycles | 2 full charge–discharge cycles per day |
| Round-trip efficiency (RtE) | ≥ 85% AC–AC (design target 86–88%) |
| System availability | ≥ 95% annual average |
| Grid interconnection | 220 kV ISTS, Banaskantha Substation, Gujarat |
| Transmission line | Dedicated < 1 km overhead line to CTU feeder bay |
| Battery containers | ~30 × 5 MWh containerized units |
| Power Conversion System | 16 × bi-directional inverter units |
| Step-up transformer | 1 × 70 MVA (33/220 kV), ONAN/ONAF, with OLTC |
| SCADA | IEC 61850-compliant, integrated with SLDC / NVVN BESPA portal |
| Commissioning standard | BESPA Schedule D, certified by GEDA |
| Cycle life | Minimum 6,000 cycles at 80% DoD |
| SoC operating window | 10% – 90% |
| Commissioning procedure | BESPA Schedule D |

#### Offtake Contract

| Field | Detail |
|-------|--------|
| Offtaker | Gujarat Urja Vikas Nigam Limited (GUVNL) |
| Agreement type | Battery Energy Storage Purchase Agreement (BESPA) Phase IV |
| Implementing agency | NTPC Vidyut Vyapar Nigam Ltd (NVVN) |
| Scheme | VGF — 1000 MWh Tranche 1, Type I |
| Contract term | 12 years from Commercial Operation Date |
| Tariff structure | INR / MW / Month — fixed capacity charge for full term, discovered via competitive bidding |
| Charging power | Provided by GUVNL / Procurer at no cost to developer |
| Performance Bank Guarantee | Rs. 18.5 Lakh / MW |
| Financial closure deadline | 12 months from BESPA effective date |
| Scheduled Commissioning Date | 18 months from BESPA effective date |
| Land | Right of Use (ROU) from GETCO, valid for BESPA term |
| Insurance | Industrial All Risk policy, maintained throughout term |
| Scheduling authority | Gujarat SLDC, with CERC / GERC compliance |
| DSM charges | Borne by developer |
| RtE incentive | Rs. 0.50 / unit for every unit discharged above 85% RtE |
| RtE penalty band 1 | RtE 70–85%: liquidated damages at APPC rate |
| RtE penalty band 2 | RtE < 70%: no tariff payment + liquidated damages |
| Availability penalty | Liquidated damages = 2× capacity charges for shortfall below 95% annual average |
| Assignment restriction | No third-party sale of contracted capacity during BESPA term (Article 15) |
| Shareholding lock-in | Per BESPA Schedule F |
| Dispute resolution | GERC jurisdiction / arbitration (Article 16) |
| GST | Pass-through to GUVNL per RfS provisions |

#### Capacity Degradation Schedule

The minimum dispatchable capacity the developer must maintain each year as a % of original COD capacity:

| Year | Min. Dispatchable Capacity |
|:----:|:--------------------------:|
| 1 | 97.50% |
| 2 | 95.00% |
| 3 | 92.50% |
| 4 | 90.00% |
| 5 | 87.50% |
| 6 | 85.00% |
| 7 | 82.50% |
| 8 | 80.00% |
| 9 | 78.50% |
| 10 | 75.00% |
| 11 | 72.50% |
| 12 | 70.00% |

#### Financial Summary

| Field | Value |
|-------|-------|
| Total project cost | ₹ 181.49 Cr |
| Project IRR (post-tax) | 10.05% |
| Equity IRR (post-tax) | 16.78% |
| Average cost of interest | 8.50% |
| Debt / equity ratio | 80 : 20 |
| O&M model | 12-year outsourced LTSA |
| VGF support | Yes — Government of India via NVVN |

#### 12-Year Cash Flow Timeseries

Revenue scales with the capacity degradation schedule. Opex grows ~3% p.a. Debt service assumed fixed through Year 8 then falls as loan amortizes. Years 9–12 are equity free-cash-flow years.

| Year | COD Year | Capacity % | Revenue (₹ Cr) | Opex (₹ Cr) | Debt Service (₹ Cr) | DSCR |
|:----:|:--------:|:----------:|:--------------:|:-----------:|:-------------------:|:----:|
| 1 | 2027 | 97.5% | 18.52 | 1.30 | 14.50 | 1.18 |
| 2 | 2028 | 95.0% | 18.04 | 1.34 | 14.50 | 1.15 |
| 3 | 2029 | 92.5% | 17.57 | 1.38 | 14.50 | 1.11 |
| 4 | 2030 | 90.0% | 17.09 | 1.42 | 14.50 | 1.08 |
| 5 | 2031 | 87.5% | 16.62 | 1.46 | 14.50 | 1.04 |
| 6 | 2032 | 85.0% | 16.14 | 1.50 | 14.50 | 1.01 |
| 7 | 2033 | 82.5% | 15.66 | 1.55 | 10.88 | 1.30 |
| 8 | 2034 | 80.0% | 15.19 | 1.60 | 10.88 | 1.25 |
| 9 | 2035 | 78.5% | 14.90 | 1.65 | — | — |
| 10 | 2036 | 75.0% | 14.23 | 1.70 | — | — |
| 11 | 2037 | 72.5% | 13.76 | 1.75 | — | — |
| 12 | 2038 | 70.0% | 13.28 | 1.80 | — | — |

#### Licenses and Approvals

| Approval | Issuing Authority | Deadline |
|----------|-------------------|----------|
| Connectivity approval (CTU bay allocation) | CTU (GETCO) | Within 30 days of BESPA signing |
| Right of Use (ROU) / land lease | GETCO / STU | Within 60 days of BESPA signing |
| Financial closure | Banks / FIs | Within 12 months of BESPA effective date |
| Detailed Project Report (DPR) submission | NVVN | At financial closure |
| First-time charging approval | CTU + SLDC | Pre-commissioning |
| Commissioning certificate (COD / UCOD) | GEDA | Post-commissioning demonstration |
| Electrical Inspector clearance | CEA / CEIG | Before energization |
| Fire safety clearance | Local authority | Before energization |
| Environmental / factory clearances | MoEF | As applicable |
| Performance Bank Guarantee submission | GUVNL | At BESPA signing |

#### Beckn Catalog Fields

| Field | Value |
|-------|-------|
| Project title | 65 MW / 130 MWh Standalone BESS — Banaskantha ISTS, Gujarat |
| Asset class | `standalone_bess` |
| Scheme | NVVN VGF 1000 MWh Tranche 1 |
| Location | Banaskantha, Gujarat |
| Coordinates | 24°20′52″N, 71°29′12″E |
| Grid substation | 220 kV ISTS Banaskantha |
| Current stage | Post-LOA, pre-COD |
| Target COD | 2026-12-31 |
| Offtake summary | 12-year BESPA with GUVNL |
| Standards | IEC 62619 · IEC 61850 · UL 9540 · CEA Grid Connectivity 2007 · CERC Ancillary Services Code |

<details>
<summary><strong>Example API Payload</strong></summary>

```json
{
  "request_id": "req_pd_publish_001",
  "actor": "project_developer",
  "action": "publish_project",
  "finternet_payload": {
    "asset_definition": {
      "asset_id": "asset_bess_banaskantha_65mw",
      "asset_type": "standalone_bess",
      "battery_chemistry": "LFP",
      "capacity_mw": 65,
      "energy_capacity_mwh": 130,
      "duration_hours": 2,
      "cycles_per_day": 2,
      "rte_guaranteed_pct": 85,
      "availability_guaranteed_pct": 95,
      "grid_interconnection_kv": 220,
      "grid_interconnection_substation": "Banaskantha ISTS, Gujarat",
      "construct": "build_own_operate",
      "implementing_agency": "NVVN",
      "scheme": "VGF_1000MWh_Tranche1",
      "composability": ["bundle", "tranche_after_cod", "pledge_cash_flows"]
    },
    "offtake_contract": {
      "offtaker": "Gujarat Urja Vikas Nigam Limited (GUVNL)",
      "agreement_type": "BESPA Phase IV",
      "term_years": 12,
      "tariff_structure": "INR_per_MW_per_month_fixed",
      "tariff_discovery": "competitive_bidding",
      "scheduled_cod": "2026-12-31",
      "performance_bank_guarantee_lakh_per_mw": 18.5,
      "rte_incentive_rs_per_unit_above_85pct": 0.50,
      "land_arrangement": "ROU_from_GETCO",
      "scheduling_authority": "Gujarat_SLDC"
    },
    "financials": {
      "total_project_cost_inr": 1814900000,
      "project_irr_post_tax_pct": 10.05,
      "equity_irr_post_tax_pct": 16.78,
      "average_cost_of_interest_pct": 8.5,
      "debt_equity_ratio": "80:20",
      "vgf_supported": true,
      "om_model": "12_year_LTSA"
    },
    "capacity_degradation_schedule": [
      {"year": 1, "min_dispatchable_capacity_pct": 97.5},
      {"year": 2, "min_dispatchable_capacity_pct": 95.0},
      {"year": 3, "min_dispatchable_capacity_pct": 92.5},
      {"year": 4, "min_dispatchable_capacity_pct": 90.0},
      {"year": 5, "min_dispatchable_capacity_pct": 87.5},
      {"year": 6, "min_dispatchable_capacity_pct": 85.0},
      {"year": 7, "min_dispatchable_capacity_pct": 82.5},
      {"year": 8, "min_dispatchable_capacity_pct": 80.0},
      {"year": 9, "min_dispatchable_capacity_pct": 78.5},
      {"year": 10, "min_dispatchable_capacity_pct": 75.0},
      {"year": 11, "min_dispatchable_capacity_pct": 72.5},
      {"year": 12, "min_dispatchable_capacity_pct": 70.0}
    ],
    "cash_flow_yearly_timeseries": [
      {"year": 2027, "capacity_pct": 97.5, "revenue_inr_cr": 18.52, "opex_inr_cr": 1.30, "debt_service_inr_cr": 14.50, "dscr": 1.18},
      {"year": 2028, "capacity_pct": 95.0, "revenue_inr_cr": 18.04, "opex_inr_cr": 1.34, "debt_service_inr_cr": 14.50, "dscr": 1.15},
      {"year": 2029, "capacity_pct": 92.5, "revenue_inr_cr": 17.57, "opex_inr_cr": 1.38, "debt_service_inr_cr": 14.50, "dscr": 1.11},
      {"year": 2030, "capacity_pct": 90.0, "revenue_inr_cr": 17.09, "opex_inr_cr": 1.42, "debt_service_inr_cr": 14.50, "dscr": 1.08},
      {"year": 2031, "capacity_pct": 87.5, "revenue_inr_cr": 16.62, "opex_inr_cr": 1.46, "debt_service_inr_cr": 14.50, "dscr": 1.04},
      {"year": 2032, "capacity_pct": 85.0, "revenue_inr_cr": 16.14, "opex_inr_cr": 1.50, "debt_service_inr_cr": 14.50, "dscr": 1.01},
      {"year": 2033, "capacity_pct": 82.5, "revenue_inr_cr": 15.66, "opex_inr_cr": 1.55, "debt_service_inr_cr": 10.88, "dscr": 1.30},
      {"year": 2034, "capacity_pct": 80.0, "revenue_inr_cr": 15.19, "opex_inr_cr": 1.60, "debt_service_inr_cr": 10.88, "dscr": 1.25},
      {"year": 2035, "capacity_pct": 78.5, "revenue_inr_cr": 14.90, "opex_inr_cr": 1.65, "debt_service_inr_cr": 0, "dscr": null},
      {"year": 2036, "capacity_pct": 75.0, "revenue_inr_cr": 14.23, "opex_inr_cr": 1.70, "debt_service_inr_cr": 0, "dscr": null},
      {"year": 2037, "capacity_pct": 72.5, "revenue_inr_cr": 13.76, "opex_inr_cr": 1.75, "debt_service_inr_cr": 0, "dscr": null},
      {"year": 2038, "capacity_pct": 70.0, "revenue_inr_cr": 13.28, "opex_inr_cr": 1.80, "debt_service_inr_cr": 0, "dscr": null}
    ]
  },
  "beckn_payload": {
    "catalog_item": {
      "title": "65 MW / 130 MWh Standalone BESS — Banaskantha ISTS, Gujarat",
      "asset_class": "standalone_bess",
      "scheme": "NVVN VGF 1000 MWh Tranche 1",
      "location": "Banaskantha, Gujarat",
      "coordinates": {"lat": 24.3478, "lon": 71.4866},
      "grid_substation": "220 kV ISTS Banaskantha",
      "current_stage": "post_loa_pre_cod",
      "target_cod": "2026-12-31",
      "offtaker_summary": "12-year BESPA with GUVNL",
      "standards": ["IEC 62619", "IEC 61850", "UL 9540", "CEA Grid Connectivity 2007"],
      "project_details_url": "https://api.lium.example/projects/asset_bess_banaskantha_65mw",
      "offer_intake_url": "https://api.lium.example/projects/asset_bess_banaskantha_65mw/offers"
    }
  }
}
```

</details>

---

## 2. Financier

> Provides debt or structured financing and later seeks liquidity by unloading or securitizing exposure.

### Onboarding · Network
**Finternet:** Legal entity ID · Lending license · Capital source · Bank rails · DID/wallet · Authorized signers · Risk limits · Compliance profile

**Beckn:** Beckn subscriber ID · Domain role: `financier` · Offer API · Callback URLs · Service geographies · Protocol permissions

### Onboarding · App
**Finternet:** AUM / lending book · Credit policy · Sector exposure limits · Underwriting methodology · Collections capability

**Beckn:** Organization name · Contact email · Supported instruments · Document requirements · SLA for offer response

### Catalog · Network
**Finternet:** Loan asset ID · Security interest · Repayment waterfall · Disbursement rules · Exit/securitization preference · Transfer restrictions

**Beckn:** Loan offer catalog item · Offer submission endpoint · Loan status callback · Negotiation state · Quote expiry

### Catalog · App
**Finternet:** Loan amount · Coupon / interest rate · Term · Moratorium · DSCR covenant · Collateral coverage · LTV / advance rate · Average cost of funds · Target yield · Exposure by project · Loan repayment cash flow

**Beckn:** Indicative terms · Eligible project types · Processing timeline · Required documents · Offer status · Acceptance endpoint

---

## 3. Securitization Agent

> Packages operating assets, loans, or cash flows into pools and tranches for investors.

### Onboarding · Network
**Finternet:** Legal entity ID · Arranger/trustee licenses · DID/wallet · Signer authority · Bank/trust accounts · Rating agency relationships · Issuance history

**Beckn:** Beckn subscriber ID · Domain role: `securitization_agent` · Structuring API · Issuance callback URLs · Protocol permissions

### Onboarding · App
**Finternet:** Structuring methodology · Waterfall templates · Credit enhancement policy · Tokenization capability · Servicer relationships

**Beckn:** Accepted asset categories · Service geographies · Required documents · Structuring timeline · Contact endpoint

### Catalog · Network
**Finternet:** Pool ID · Tranche IDs · Ownership registry · Transfer rules · Credit enhancement · Waterfall logic · Rating target · Token metadata

**Beckn:** Securitization service item · Pool discovery endpoint · Structuring request endpoint · Issuance status callback

### Catalog · App
**Finternet:** Asset pool composition · Senior/mezz/equity tranche sizing · Expected rating · Target yield · Expected loss · DSCR history · Cash flow waterfall · Eligibility tests · Stress scenarios

**Beckn:** Issuance summary · Accepted loans/assets · Document checklist · Investor presentation URL · Book-building status

---

## 4. Portfolio Manager

> Evaluates securitized assets and allocates capital according to mandate, risk, rating, duration, and yield.

### Onboarding · Network
**Finternet:** Legal entity ID · Fund identity · Investor classification · Custody account · DID/wallet · Signer authority · Risk limits

**Beckn:** Beckn subscriber ID · Domain role: `portfolio_manager` · Buyer permissions · Subscription APIs · Callback URLs

### Onboarding · App
**Finternet:** Investment mandate · AUM · Target sectors · Concentration limits · Rating constraints · Duration limits · Liquidity preference

**Beckn:** Discovery preferences · Watchlist API · Reporting endpoint · Document access preferences · Notification preferences

### Catalog · Network
**Finternet:** Allocation account · Ownership record · Transfer eligibility · Valuation model · Risk attribution · Settlement account

**Beckn:** Investment order endpoint · Bid/subscribe flow · Allocation status callback · Portfolio reporting callback

### Catalog · App
**Finternet:** Target yield · Expected IRR by tranche · Rating · Tranche seniority · Duration · Expected loss · DSCR · Offtaker risk · Telemetry reliability · Portfolio concentration · Mark-to-model valuation

**Beckn:** Investment card · Diligence memo · Document room · Open diligence flags · Subscribe amount · Holding dashboard · Monitoring webhook

---

## 5. Investor

> Subscribes directly into tokenized instruments or securitized exposure within suitability limits.

### Onboarding · Network
**Finternet:** KYC/KYB · Investor classification · Tax profile · Bank account · DID/wallet · Suitability profile · Jurisdiction · Investment limits

**Beckn:** Beckn subscriber ID · Domain role: `investor` · Consent permissions · Callback URL · App identity

### Onboarding · App
**Finternet:** Risk tolerance · Income needs · Ticket size range · Accreditation documents · Payout instructions

**Beckn:** Notification preferences · Document access consent · Order API access · Dashboard preferences

### Catalog · Network
**Finternet:** Ownership record · Token holding · Transfer restrictions · Payout ledger · Tax treatment · Redemption rules

**Beckn:** Subscription endpoint · Holding update webhook · Redemption request endpoint · Notification callback

### Catalog · App
**Finternet:** Subscribed amount · Risk band · Expected return · Payment frequency · Lockup · Tranche type · Accrued payout · Realized return

**Beckn:** Investment listing · Minimum ticket · Risk label · Disclosure document · Holding dashboard · Payout schedule

---

## 6. Risk Provider

> Produces trusted risk indicators from telemetry, financial data, contracts, and performance signals.

### Onboarding · Network
**Finternet:** Legal entity ID · Certification/license · DID/wallet · Data attestation rights · Model governance profile · Signer authority

**Beckn:** Beckn subscriber ID · Domain role: `risk_provider` · Risk API endpoint · Callback URLs · Supported domains

### Onboarding · App
**Finternet:** Risk methodology · Validation history · Model version · Conflict policy · Audit logs

**Beckn:** Coverage areas · Update frequency · Report formats · Alert webhook

### Catalog · Network
**Finternet:** Risk signal ID · Attestation signature · Score provenance · Confidence interval · Risk indicator registry

**Beckn:** Risk signal catalog · Score API · Alert callback · Report publication endpoint

### Catalog · App
**Finternet:** Risk score · Telemetry uptime · Data latency · Performance variance · Anomaly count · Default probability · Loss-given-default · Contract risk · Counterparty risk

**Beckn:** Project coverage · Latest score · Score trend · Alert list · Report URL · Monitoring subscription

---

## 7. Utility / Procurer

> Procures capacity or flexibility, creates contracted revenue, and validates dispatch/payment obligations.

### Onboarding · Network
**Finternet:** Legal entity ID · Regulatory license · Payment credibility · Procurement authority · DID/wallet · Signer authority

**Beckn:** Beckn subscriber ID · Domain role: `utility_procurer` · Dispatch APIs · Demand APIs · Callback URLs

### Onboarding · App
**Finternet:** Grid jurisdiction · Payment history · Procurement rules · Tariff approval references

**Beckn:** Service territory · Grid nodes · Metering requirements · Procurement contact

### Catalog · Network
**Finternet:** Offtake contract ID · Payment obligation · Settlement logic · Default clauses · Tariff rules

**Beckn:** Flexibility need catalog · Dispatch request endpoint · Metering callback · Settlement endpoint

### Catalog · App
**Finternet:** Contracted capacity MW/MWh · Tariff · Availability calculation · RTE calculation · LD exposure · Billing cycle · Payment status · Dispatch obligation

**Beckn:** Capacity request · Location/grid node · Dispatch schedule · Delivery confirmation · Revenue pool · Settlement status

---

## 8. EdgeGrid

> Aggregates capacity, routes dispatch events, verifies delivery, and allocates grid-service revenue.

### Onboarding · Network
**Finternet:** Legal entity ID · Platform certification · DID/wallet · Telemetry permissions · Settlement account

**Beckn:** Beckn subscriber ID · Domain role: `edgegrid_platform` · Routing APIs · Dispatch APIs · Telemetry callbacks

### Onboarding · App
**Finternet:** Grid integration credentials · Aggregation methodology · Settlement allocation model · Cybersecurity profile

**Beckn:** Supported grid nodes · Asset onboarding API · Event notification API · Capacity discovery API

### Catalog · Network
**Finternet:** Aggregation pool ID · Capacity verification · Delivery attestation · Revenue allocation rules · Penalty allocation

**Beckn:** Available capacity catalog · Dispatch response endpoint · Telemetry stream endpoint · Revenue allocation endpoint

### Catalog · App
**Finternet:** Available capacity · Committed capacity · Dispatch success rate · Response time · Revenue earned · Asset contribution share

**Beckn:** Capacity listing · Active dispatches · Telemetry feed · Delivery confirmation · Revenue allocation report

---

## 9. Project / Asset Operator

> Runs the asset, exposes operational performance, confirms availability, and maintains telemetry feed integrity.

### Onboarding · Network
**Finternet:** Legal entity ID · O&M authority · Insurance · Safety certifications · DID/wallet · Signer authority

**Beckn:** Beckn subscriber ID · Domain role: `asset_operator` · Telemetry APIs · Maintenance APIs · Callback URLs

### Onboarding · App
**Finternet:** O&M contract · LTSA terms · Operator experience · Maintenance capability · Incident history

**Beckn:** Asset IDs operated · SCADA endpoint · Maintenance notification endpoint · Operator contact

### Catalog · Network
**Finternet:** Performance attestation · Telemetry trust score · Availability proof · Maintenance proof

**Beckn:** Operational status endpoint · Telemetry callback · Maintenance update callback · Incident alert webhook

### Catalog · App
**Finternet:** Actual availability · Actual RTE · Cycles/day · Throughput MWh · Outage events · Maintenance schedule · Warranty status · Failure history

**Beckn:** Live operational status · Availability dashboard · Outage schedule · Telemetry endpoint · Maintenance updates

---

## 10. Data Center / Offtaker

> Consumes energy or flexibility, signs offtake/contracted load, and confirms delivery or service value.

### Onboarding · Network
**Finternet:** Legal entity ID · Credit profile · Offtake authority · DID/wallet · Signer authority · Payment account

**Beckn:** Beckn subscriber ID · Domain role: `offtaker` · Demand APIs · Callback URLs · Consent permissions

### Onboarding · App
**Finternet:** Demand profile · SLA requirements · Payment history · Sustainability reporting needs

**Beckn:** Facility locations · Load profile API · Delivery confirmation endpoint · Contract API

### Catalog · Network
**Finternet:** Offtake agreement ID · Payment obligation · SLA rules · Curtailment rules · Settlement record

**Beckn:** Power request catalog · Contract status callback · Delivery confirmation endpoint · Settlement callback

### Catalog · App
**Finternet:** Contracted load · Demand forecast · Price/tariff · Delivery SLA · Payment status · Carbon/clean energy attribution

**Beckn:** Power request · Active contracts · Demand schedule · Delivery confirmation · Invoice status

---

## 11. Telemetry Provider

> Provides signed device and performance data used for risk, settlement, monitoring, and securitization proof.

### Onboarding · Network
**Finternet:** Legal entity ID · Device/data certification · Data signing authority · DID/wallet · Cybersecurity profile

**Beckn:** Beckn subscriber ID · Domain role: `telemetry_provider` · Stream APIs · Alert callbacks · Protocol permissions

### Onboarding · App
**Finternet:** Device registry · Calibration records · Data schema · Audit history · Measurement confidence methodology

**Beckn:** Supported asset types · Frequency · API documentation · Data availability SLA

### Catalog · Network
**Finternet:** Telemetry proof ID · Data provenance · Measurement signature · Anomaly attestation · Audit log

**Beckn:** Telemetry feed catalog · Stream endpoint · Alert webhook · Historical data endpoint

### Catalog · App
**Finternet:** State of charge · Charge/discharge MW · Throughput MWh · RTE · Availability · Temperature · Fault codes · Data latency · Missing data count

**Beckn:** Live feed URL · Frequency · Supported metrics · Alert types · Feed status

---

## 12. Rating / Valuation Agent

> Rates or values financial instruments, tranches, pools, and ongoing surveillance states.

### Onboarding · Network
**Finternet:** Legal entity ID · Rating/valuation license · DID/wallet · Signer authority · Conflict policy

**Beckn:** Beckn subscriber ID · Domain role: `rating_valuation_agent` · Rating API · Callback URLs

### Onboarding · App
**Finternet:** Rating methodology · Valuation model · Stress scenario library · Surveillance policy · Historical accuracy

**Beckn:** Eligible instrument types · Report formats · Request intake API · Publication endpoint

### Catalog · Network
**Finternet:** Rating ID · Valuation ID · Attestation signature · Surveillance state · Methodology reference

**Beckn:** Rating service catalog · Rating request endpoint · Report publication webhook · Surveillance callback

### Catalog · App
**Finternet:** Tranche rating · Pool rating · Probability of default · Loss-given-default · Stress case DSCR · Fair value · Discount rate · Rating watch flag

**Beckn:** Published rating · Valuation report · Surveillance updates · Required inputs · Turnaround time

---

## 13. Custodian / Token Registry

> Maintains ownership records, transfer constraints, custody status, and tokenized instrument registry.

### Onboarding · Network
**Finternet:** Custody license · Legal entity ID · Wallet infrastructure · DID/wallet · Compliance controls · Signer authority

**Beckn:** Beckn subscriber ID · Domain role: `custody_registry` · Transfer APIs · Ownership proof APIs · Callback URLs

### Onboarding · App
**Finternet:** Beneficial owner policy · Transfer screening rules · Pledge/lien handling · Settlement rails

**Beckn:** Supported token standards · Holding view API · Redemption API · Compliance API

### Catalog · Network
**Finternet:** Ownership ledger · Token metadata · Transfer restriction rules · Lien/pledge status · Settlement state

**Beckn:** Ownership proof endpoint · Transfer request endpoint · Redemption request endpoint · Event webhook

### Catalog · App
**Finternet:** Beneficial owner · Token quantity · Instrument ID · Holding value · Accrued payouts · Transfer history · Redemption eligibility

**Beckn:** Holding dashboard · Transfer request · Redemption request · Ownership certificate · Event notifications
