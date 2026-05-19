import { MarketplaceView } from '@/components/marketplace/marketplace-view'
import { listPools } from '@/lib/token-store'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const allPools = await listPools()
  const pools = allPools.filter(p => ['LISTED', 'STRUCTURING'].includes(p.status))

  const tranches = pools.flatMap(p =>
    p.tranches
      .filter(t => t.status !== 'REDEEMED')
      .map(t => ({
        ...t,
        poolName:   p.name,
        poolId:     p.id,
        poolStatus: p.status,
        poolDSCR:   p.overallDSCR,
        poolLQ:     p.overallLQ,
      })),
  )

  return <MarketplaceView tranches={tranches} />
}
