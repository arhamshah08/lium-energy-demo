-- Migration: add financing lifecycle fields to projects, create offers table

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS pto_status TEXT NOT NULL DEFAULT 'PRE_PROCESSING',
  ADD COLUMN IF NOT EXISTS capacity_mw DECIMAL,
  ADD COLUMN IF NOT EXISTS capacity_mwh DECIMAL,
  ADD COLUMN IF NOT EXISTS cod_date DATE,
  ADD COLUMN IF NOT EXISTS asset_life_years INTEGER,
  ADD COLUMN IF NOT EXISTS ppa_counterparty TEXT,
  ADD COLUMN IF NOT EXISTS ppa_tariff_mwh DECIMAL,
  ADD COLUMN IF NOT EXISTS ppa_contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS total_capex_m DECIMAL,
  ADD COLUMN IF NOT EXISTS debt_pct DECIMAL,
  ADD COLUMN IF NOT EXISTS equity_pct DECIMAL,
  ADD COLUMN IF NOT EXISTS annual_revenue_m DECIMAL,
  ADD COLUMN IF NOT EXISTS annual_opex_m DECIMAL,
  ADD COLUMN IF NOT EXISTS annual_debt_service_m DECIMAL,
  ADD COLUMN IF NOT EXISTS gap_funding_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gap_funding_program TEXT,
  ADD COLUMN IF NOT EXISTS asset_details JSONB;

CREATE TABLE IF NOT EXISTS project_offers (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  financier_id TEXT NOT NULL REFERENCES profiles(id),
  loan_amount_m DECIMAL NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'FIXED',
  rate_pct DECIMAL,
  sofr_spread_pct DECIMAL,
  tenor_years INTEGER NOT NULL,
  dscr_covenant DECIMAL NOT NULL,
  security_requirements TEXT,
  conditions_precedent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  revision_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_project_id ON project_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_offers_financier_id ON project_offers(financier_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON project_offers(status);
