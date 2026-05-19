-- Dev seed: 5 actor profiles + 1 project for the developer
-- These are used by the DevActorSwitcher (no real passwords needed — switcher bypasses auth)
-- Run this in the Supabase SQL Editor after 001_init.sql

INSERT INTO profiles (id, email, password_hash, role, full_name, company_name, country, job_title, created_at)
VALUES
  ('dev-seed-pd-001',  'priya@embosselectric.com', 'DEV_PROFILE_NO_LOGIN', 'developer',            'Priya Nair',     'Emboss Electric',            'US', 'Head of Projects',       NOW()),
  ('dev-seed-fn-001',  'james@greencapital.com',   'DEV_PROFILE_NO_LOGIN', 'financier',            'James Okafor',   'Green Capital Partners',     'US', 'Managing Director',      NOW()),
  ('dev-seed-sa-001',  'chen@pacificsec.com',      'DEV_PROFILE_NO_LOGIN', 'securitisation_agent', 'Chen Wei',       'Pacific Securities LLC',     'US', 'Structuring Lead',       NOW()),
  ('dev-seed-pm-001',  'sara@meridian.com',        'DEV_PROFILE_NO_LOGIN', 'portfolio_manager',    'Sara Lindqvist', 'Meridian Asset Management',  'SE', 'Portfolio Manager',      NOW()),
  ('dev-seed-inv-001', 'marcus@personal.com',      'DEV_PROFILE_NO_LOGIN', 'investor',             'Marcus Bell',    NULL,                         'US', NULL,                     NOW())
ON CONFLICT (id) DO NOTHING;

-- Seeded project for the developer (Menlo Housing Microgrid)
INSERT INTO projects (id, user_id, status, name, location, jurisdiction, asset_type, documents, telemetry, created_at, updated_at)
VALUES (
  'dev-proj-menlo-001',
  'dev-seed-pd-001',
  'SUBMITTED',
  'Menlo Housing Microgrid',
  'Menlo Park, CA 94025',
  'CAISO',
  'SOLAR_BESS_HYBRID',
  '[
    {"type": "TECHNICAL_AUDIT",        "filename": "menlo_technical_audit.pdf",   "uploadedAt": "2026-02-01T10:00:00Z"},
    {"type": "INTERCONNECTION_STUDY",  "filename": "menlo_interconnection.pdf",   "uploadedAt": "2026-02-01T10:05:00Z"},
    {"type": "INSURANCE_CERTIFICATE",  "filename": "menlo_insurance.pdf",         "uploadedAt": "2026-02-01T10:10:00Z"}
  ]'::jsonb,
  '{"connectionMethod": "IEEE_2030_5", "apiEndpoint": "https://tel.embosselectric.com/menlo", "assetIdMapping": "MENLO-BESS-001", "verified": true, "verifiedAt": "2026-02-03T14:22:07Z"}'::jsonb,
  '2026-02-01T09:00:00Z',
  '2026-02-03T14:22:07Z'
) ON CONFLICT (id) DO NOTHING;

-- Second project for the developer (Oakland Port) — in DRAFT state
INSERT INTO projects (id, user_id, status, name, location, jurisdiction, asset_type, documents, created_at, updated_at)
VALUES (
  'dev-proj-oakland-001',
  'dev-seed-pd-001',
  'DRAFT',
  'Oakland Port Storage',
  'Oakland, CA 94607',
  'CAISO',
  'BESS',
  '[]'::jsonb,
  '2026-03-10T11:00:00Z',
  '2026-03-10T11:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- Seeded token for the Menlo project (TOKENISED state)
INSERT INTO tokens (id, project_id, data, created_at)
VALUES (
  'dev-tkn-menlo-001',
  'dev-proj-menlo-001',
  '{
    "id": "dev-tkn-menlo-001",
    "projectId": "dev-proj-menlo-001",
    "tokenId": "UNITS-US-CAISO-2026-001",
    "status": "ACTIVE",
    "nominalValueINR": 45,
    "currency": "USD",
    "issuedTo": "Emboss Electric — Priya Nair",
    "issuedAt": "2026-02-05T10:00:00Z",
    "operations": [
      {
        "id": "dev-op-001",
        "operation": "ISSUE",
        "timestamp": "2026-02-05T10:00:00Z",
        "amount": 45,
        "recipient": "Emboss Electric",
        "notes": "Initial issuance — Menlo Housing Microgrid 28.3kW solar + 420kWh BESS",
        "txHash": "0xdev1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
        "status": "CONFIRMED"
      }
    ],
    "lqScore": {
      "availability": 0.978,
      "dscr": 0.920,
      "verification": 1.000,
      "penalty": 0.000,
      "composite": 0.944,
      "consecutiveMonths": 3,
      "timestamp": "2026-05-01T00:00:00Z",
      "gate": "PASS"
    },
    "vgfMilestones": [
      { "id": "m1", "label": "M1 — COD", "description": "Commercial Operation Date", "amountINR": 10, "status": "RELEASED", "releasedAt": "2026-02-10T00:00:00Z", "condition": "First grid export confirmed" },
      { "id": "m2", "label": "M2 — Q1 Performance", "description": "90-day Pincer evaluation", "amountINR": 17, "status": "LOCKED", "condition": "LQ ≥ 0.80 for 90 consecutive days post-COD" },
      { "id": "m3", "label": "M3 — Q2 Performance", "description": "180-day Pincer evaluation", "amountINR": 18, "status": "PENDING", "condition": "LQ ≥ 0.80 for 180 consecutive days post-COD" }
    ],
    "dscrProjection": [
      { "year": 1, "revenue": 9.5,  "opex": 1.2, "debtService": 5.8, "dscr": 1.43 },
      { "year": 2, "revenue": 9.5,  "opex": 1.3, "debtService": 5.8, "dscr": 1.41 },
      { "year": 3, "revenue": 9.5,  "opex": 1.4, "debtService": 5.8, "dscr": 1.39 },
      { "year": 4, "revenue": 9.5,  "opex": 1.5, "debtService": 5.8, "dscr": 1.38 },
      { "year": 5, "revenue": 9.5,  "opex": 1.6, "debtService": 5.8, "dscr": 1.36 },
      { "year": 6, "revenue": 9.5,  "opex": 1.7, "debtService": 5.8, "dscr": 1.34 },
      { "year": 7, "revenue": 9.5,  "opex": 1.8, "debtService": 5.8, "dscr": 1.32 },
      { "year": 8, "revenue": 9.5,  "opex": 1.9, "debtService": 5.8, "dscr": 1.30 },
      { "year": 9, "revenue": 9.5,  "opex": 2.0, "debtService": 5.8, "dscr": 1.29 },
      { "year": 10, "revenue": 9.5, "opex": 2.1, "debtService": 5.8, "dscr": 1.27 }
    ],
    "totalCapexINR": 60,
    "debtINR": 45,
    "equityINR": 15,
    "annualRevenueINR": 9.5,
    "annualOpexINR": 1.2,
    "annualDebtServiceINR": 5.8
  }'::jsonb,
  '2026-02-05T10:00:00Z'
) ON CONFLICT (id) DO NOTHING;
