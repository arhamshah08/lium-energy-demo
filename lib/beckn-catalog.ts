import { randomUUID } from 'crypto'
import type { DbProject, DbProfile } from './db'

const DEDI_API_KEY = process.env.DEDI_API_KEY ?? ''
const DEDI_NAMESPACE = process.env.DEDI_NAMESPACE ?? ''

function buildFinanceCatalog(project: DbProject, profile: DbProfile): object {
  const registryName = profile.registry_id ?? `lium_developer_unknown`
  const subscriberId = `${registryName}.lium.beckn.io`

  const shortDescParts = [
    project.capacity_mw ? `${project.capacity_mw}MW` : null,
    project.capacity_mwh ? `${project.capacity_mwh}MWh` : null,
    project.asset_type,
    project.jurisdiction,
  ].filter(Boolean)

  return {
    context: {
      domain: 'deg:energy',
      action: 'on_discover',
      version: '2.0.0',
      bpp_id: subscriberId,
      bpp_uri: `https://lium.beckn.io/${profile.id}`,
      message_id: randomUUID(),
      transaction_id: randomUUID(),
      timestamp: new Date().toISOString(),
    },
    message: {
      catalog: {
        descriptor: {
          name: `${profile.company_name ?? profile.full_name} Energy Asset Catalog`,
        },
        provider: {
          id: registryName,
          descriptor: { name: profile.company_name ?? profile.full_name },
        },
        resources: [
          {
            id: `project-${project.id}`,
            descriptor: {
              name: project.name ?? 'Unnamed Project',
              short_desc: shortDescParts.join(' / '),
            },
            attributes: {
              '@context': 'https://deg.beckn.io/energy/context.jsonld',
              '@type': 'EnergyAsset',
              assetType: project.asset_type,
              capacityMW: project.capacity_mw,
              capacityMWh: project.capacity_mwh,
              jurisdiction: project.jurisdiction,
              location: project.location,
              ppaCounterparty: project.ppa_counterparty,
              ppaTariffMwh: project.ppa_tariff_mwh,
              totalCapexM: project.total_capex_m,
              debtPct: project.debt_pct,
              equityPct: project.equity_pct,
              annualRevenueM: project.annual_revenue_m,
              annualOpexM: project.annual_opex_m,
              annualDebtServiceM: project.annual_debt_service_m,
              quarterlyFundingAskM: project.quarterly_funding_ask_m,
            },
          },
        ],
        offers: [
          {
            descriptor: { name: 'Debt Financing Round' },
            item_ids: [`project-${project.id}`],
          },
        ],
      },
    },
  }
}

export async function publishEnergyAssetCatalog(
  project: DbProject,
  profile: DbProfile,
): Promise<string | null> {
  try {
    const registryName = profile.registry_id
    if (!registryName || !DEDI_API_KEY || !DEDI_NAMESPACE) {
      console.warn('[Beckn] publishEnergyAssetCatalog: missing credentials or registry_id, skipping')
      return null
    }

    const recordName = `project-${project.id}-finance`
    const catalog = buildFinanceCatalog(project, profile)

    const url = `https://api.dedi.global/dedi/${DEDI_NAMESPACE}/${registryName}/save-record-as-draft?publish=true`
    const body = {
      record_name: recordName,
      description: `Beckn energy asset catalog — ${project.name ?? project.id}`,
      details: catalog,
      meta: { created_by: 'lium_energy', catalog_type: 'developer_to_financier' },
      valid_till: '2035-12-31T23:59:59Z',
    }

    console.log('[Beckn] publishCatalog URL:', url)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEDI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    console.log('[Beckn] publishCatalog response:', res.status, JSON.stringify(json))
    if (!res.ok) return null
    return recordName
  } catch (e) {
    console.error('[Beckn] publishCatalog error:', e)
    return null
  }
}
