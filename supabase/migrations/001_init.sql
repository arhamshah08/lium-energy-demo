-- Supabase migration: init profiles, projects, tokens, pools
-- Run this in the Supabase SQL Editor

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  website TEXT,
  country TEXT,
  job_title TEXT,
  financier_type TEXT,
  registry_id TEXT,
  signing_public_key TEXT,
  signing_private_key TEXT,
  beckn_record_id TEXT,
  participants_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table (JSONB for documents/telemetry)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  name TEXT,
  location TEXT,
  jurisdiction TEXT,
  asset_type TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  telemetry JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Tokens table (full JSONB payload)
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_project_id ON tokens(project_id);

-- Pools table (full JSONB payload)
CREATE TABLE IF NOT EXISTS pools (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed data ──

INSERT INTO tokens (id, project_id, data, created_at) VALUES (
  'tkn-guvnl-bess-001',
  'project-guvnl-bess-001',
  '{
    "id": "tkn-guvnl-bess-001",
    "projectId": "project-guvnl-bess-001",
    "tokenId": "UNITS-IN-BESS-2026-001",
    "status": "LOCKED",
    "nominalValueINR": 1799,
    "currency": "INR",
    "issuedTo": "LIUM Pool 2026-01",
    "issuedAt": "2026-01-15T09:00:00Z",
    "operations": [
      { "id": "op-001", "operation": "ISSUE", "timestamp": "2026-01-15T09:00:00Z", "amount": 1799, "recipient": "LIUM Pool 2026-01", "notes": "Initial token issuance — GUVNL BESS 100MW/200MWh", "txHash": "0x4a3b7f2c1d8e9a0b3c5f6d7e8a9b0c1d2e3f4a5b", "status": "CONFIRMED" },
      { "id": "op-002", "operation": "LOCK", "timestamp": "2026-01-20T11:30:00Z", "amount": 816, "notes": "Senior tranche locked into Pool 2026-01", "txHash": "0x5b4c8g3d2e9f0b4d6g7e9f0a1b2c3d4e5f6a7b", "status": "CONFIRMED" },
      { "id": "op-003", "operation": "PLEDGE", "timestamp": "2026-02-01T14:00:00Z", "amount": 540, "notes": "VGF-03/04/05 pledged as collateral — pending oracle confirmation", "txHash": "0x6c5d9h4e3f0g1c5e7h8f1g2b3c4d5e6f7g8b9c", "status": "CONFIRMED" }
    ],
    "lqScore": { "availability": 0.974, "dscr": 0.923, "verification": 1.000, "penalty": 0.000, "composite": 0.944, "consecutiveMonths": 6, "timestamp": "2026-04-30T00:00:00Z", "gate": "PASS" },
    "vgfMilestones": [
      { "id": "vgf-01", "label": "VGF-01", "description": "Financial close & COD achieved", "amountINR": 108, "status": "RELEASED", "releasedAt": "2024-03-20T00:00:00Z", "condition": "Financial close + Commercial Operation Date confirmed" },
      { "id": "vgf-02", "label": "VGF-02", "description": "First 90-day operating record", "amountINR": 108, "status": "RELEASED", "releasedAt": "2024-06-30T00:00:00Z", "condition": "LQ ≥ 0.80 for first 3 consecutive months post-COD" },
      { "id": "vgf-03", "label": "VGF-03", "description": "6-month continuous LQ gate", "amountINR": 108, "status": "LOCKED", "condition": "LQ ≥ 0.80 for 6 consecutive months (currently: 6 months ✓ — pending oracle confirmation)" },
      { "id": "vgf-04", "label": "VGF-04", "description": "Year 2 availability milestone", "amountINR": 108, "status": "LOCKED", "condition": "Avg availability ≥ 95% in Year 2 of operation" },
      { "id": "vgf-05", "label": "VGF-05", "description": "Year 3 DSCR milestone", "amountINR": 108, "status": "LOCKED", "condition": "Average DSCR ≥ 1.0x through Year 3" }
    ],
    "dscrProjection": [
      { "year": 1, "revenue": 271.18, "opex": 35, "debtService": 180, "dscr": 1.31 },
      { "year": 2, "revenue": 271.18, "opex": 37, "debtService": 195, "dscr": 1.20 },
      { "year": 3, "revenue": 271.18, "opex": 39, "debtService": 238, "dscr": 0.97 },
      { "year": 4, "revenue": 271.18, "opex": 41, "debtService": 210, "dscr": 1.09 },
      { "year": 5, "revenue": 271.18, "opex": 43, "debtService": 245, "dscr": 0.93 },
      { "year": 6, "revenue": 271.18, "opex": 45, "debtService": 200, "dscr": 1.13 },
      { "year": 7, "revenue": 271.18, "opex": 47, "debtService": 195, "dscr": 1.15 },
      { "year": 8, "revenue": 271.18, "opex": 49, "debtService": 190, "dscr": 1.17 },
      { "year": 9, "revenue": 271.18, "opex": 51, "debtService": 195, "dscr": 1.13 },
      { "year": 10, "revenue": 271.18, "opex": 53, "debtService": 240, "dscr": 0.91 },
      { "year": 11, "revenue": 271.18, "opex": 55, "debtService": 225, "dscr": 0.95 },
      { "year": 12, "revenue": 271.18, "opex": 57, "debtService": 180, "dscr": 1.19 }
    ],
    "totalCapexINR": 2398,
    "debtINR": 1799,
    "equityINR": 599,
    "annualRevenueINR": 271.18,
    "annualOpexINR": 35,
    "annualDebtServiceINR": 180
  }'::jsonb,
  '2026-01-15T09:00:00Z'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO pools (id, data, created_at) VALUES (
  'pool-2026-01',
  '{
    "id": "pool-2026-01",
    "name": "LIUM Pool 2026-01",
    "arranger": "LIUM Energy Finternet Pvt Ltd",
    "ratingAgency": "CRISIL",
    "tokenIds": ["tkn-guvnl-bess-001"],
    "projectIds": ["project-guvnl-bess-001"],
    "status": "LISTED",
    "totalSizeINR": 1799,
    "currency": "INR",
    "tranches": [
      { "id": "tranche-senior-01", "poolId": "pool-2026-01", "class": "SENIOR", "rating": "AAA", "sizeINR": 816, "coupon": 8.5, "tenorYears": 12, "isin": "INE000XX0001", "status": "SUBSCRIBED", "subscribedINR": 816, "subscribers": [{ "id": "sub-001", "investorType": "PENSION_FUND", "amountINR": 400, "subscribedAt": "2026-01-28T00:00:00Z" }, { "id": "sub-002", "investorType": "INSURANCE", "amountINR": 416, "subscribedAt": "2026-01-30T00:00:00Z" }], "notes": "Pension funds & insurance mandates. Zero default history in Indian energy ABS." },
      { "id": "tranche-mez-01", "poolId": "pool-2026-01", "class": "MEZZANINE", "rating": "BBB", "sizeINR": 594, "coupon": 11.0, "tenorYears": 10, "isin": "INE000XX0002", "status": "SUBSCRIBED", "subscribedINR": 594, "subscribers": [{ "id": "sub-003", "investorType": "DFI", "amountINR": 594, "subscribedAt": "2026-02-05T00:00:00Z" }], "notes": "Investment-grade credit funds and development finance institutions." },
      { "id": "tranche-junior-01", "poolId": "pool-2026-01", "class": "JUNIOR", "rating": "BB", "sizeINR": 389, "coupon": 14.0, "tenorYears": 8, "isin": "INE000XX0003", "status": "OPEN", "subscribedINR": 250, "subscribers": [{ "id": "sub-004", "investorType": "CREDIT_FUND", "amountINR": 250, "subscribedAt": "2026-02-10T00:00:00Z" }], "notes": "High-yield — alternative asset managers. First-loss protection via OC & cash reserve." }
    ],
    "qualificationGates": [
      { "id": "g1", "label": "G1  Physical Asset Gate", "category": "CAT1", "status": "PASS", "metric": "100MW / 200MWh, COD Mar 2024", "notes": "Asset commissioned and operating" },
      { "id": "g2", "label": "G2  Revenue Contract Gate", "category": "CAT2", "status": "PASS", "metric": "BESPA ₹271.18 Mn/yr — GUVNL AA+", "notes": "Take-or-pay, assignment obtained" },
      { "id": "g3", "label": "G3  Cash Flow Gate", "category": "CAT3", "status": "REVIEW", "metric": "LQ 0.944 ✓ | Avg DSCR 1.04x", "notes": "DSCR dips Y3/Y5/Y10 — mitigated by reserve" },
      { "id": "g4", "label": "G4  Legal & Title Gate", "category": "CAT4", "status": "PASS", "metric": "Clear title — SPV formed", "notes": "Bankruptcy remoteness opinion obtained" },
      { "id": "g5", "label": "G5  Credit Enhancement Gate", "category": "CAT5", "status": "PASS", "metric": "OC 25% | Cash reserve ₹50 Mn", "notes": "Senior fully subscribed" },
      { "id": "g6", "label": "G6  Technology Gate", "category": "CAT6", "status": "PASS", "metric": "IEEE 2030.5 — latency 8ms", "notes": "Oracle integration test passed" },
      { "id": "g7", "label": "G7  Regulatory Gate", "category": "CAT7", "status": "PASS", "metric": "All permits current", "notes": "SEBI AIF registered" }
    ],
    "createdAt": "2026-01-10T00:00:00Z",
    "ratedAt": "2026-01-18T00:00:00Z",
    "listedAt": "2026-01-25T00:00:00Z",
    "closingDate": "2026-03-31T00:00:00Z",
    "overallDSCR": 1.04,
    "overallLQ": 0.944,
    "oc": 25,
    "cashReserveINR": 50
  }'::jsonb,
  '2026-01-10T00:00:00Z'
) ON CONFLICT (id) DO NOTHING;
