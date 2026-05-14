import { NextRequest, NextResponse } from 'next/server'
import { generateKeyPairSync } from 'crypto'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
const DEDI_API_KEY = process.env.DEDI_API_KEY ?? ''
const DEDI_NAMESPACE = process.env.DEDI_NAMESPACE ?? ''

const VALID_ROLES = ['developer', 'financier', 'securitisation_agent', 'portfolio_manager', 'investor']


function buildRegistryName(companyName: string, fullName: string, role: string): string {
  const base = (companyName || fullName).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  return `lium_${role}_${base}`
}

function generateEd25519KeyPair(): { publicKeyBase64: string; privateKeyBase64: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const privateKeyBase64 = privateKey.export({ type: 'pkcs8', format: 'der' }).slice(-32).toString('base64')
  const publicKeyBase64 = publicKey.export({ type: 'spki', format: 'der' }).slice(-32).toString('base64')
  return { publicKeyBase64, privateKeyBase64 }
}

async function createDediRegistry(companyName: string, fullName: string, role: string): Promise<string | null> {
  try {
    const url = `https://api.dedi.global/dedi/${DEDI_NAMESPACE}/create-registry`
    const body = {
      registry_name: buildRegistryName(companyName, fullName, role),
      description: `${companyName || fullName} - ${role}`,
      tag: 'beckn_subscriber',
      meta: { version: '1.0' },
    }
    console.log('[DeDi] createRegistry URL:', url)
    console.log('[DeDi] createRegistry body:', JSON.stringify(body))
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEDI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    console.log('[DeDi] createRegistry response:', res.status, JSON.stringify(json))
    // 409 means registry already exists — that's fine, still usable
    if (!res.ok && res.status !== 409) return null
    return json.data?.registry_id ?? buildRegistryName(companyName, fullName, role)
  } catch (e) {
    console.error('[DeDi] createRegistry error:', e)
    return null
  }
}

async function createDediSubscriberRecord(
  userId: string,
  companyName: string,
  fullName: string,
  country: string | null,
  publicKeyBase64: string,
  role: string,
): Promise<string | null> {
  try {
    const registryName = buildRegistryName(companyName, fullName, role)
    const countries = ['USA']
    const type = role === 'financier' ? 'BAP' : 'BPP'
    const companyBase = (companyName || fullName).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const recordName = `${companyBase}-${type}`
    const subscriberId = `${registryName}.lium.beckn.io`
    const url = `https://api.dedi.global/dedi/${DEDI_NAMESPACE}/${registryName}/save-record-as-draft?publish=true`
    const body = {
      record_name: recordName,
      description: `${companyName || fullName} ${role} ${type} record`,
      details: {
        url: `https://lium.beckn.io/${userId}`,
        type,
        domain: '*',
        countries,
        subscriber_id: subscriberId,
        signing_public_key: publicKeyBase64,
      },
      meta: { created_by: 'lium_energy' },
      valid_till: '2035-12-31T23:59:59Z',
    }
    console.log('[DeDi] saveRecord URL:', url)
    console.log('[DeDi] saveRecord body:', JSON.stringify(body))
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEDI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    console.log('[DeDi] saveRecord response:', res.status, JSON.stringify(json))
    if (!res.ok) return null

    // Lookup the newly created record to get the actual record_id from DeDi
    const lookupUrl = `https://api.dedi.global/dedi/lookup/${DEDI_NAMESPACE}/${registryName}/${recordName}`
    console.log('[DeDi] recordLookup URL:', lookupUrl)
    const lookupRes = await fetch(lookupUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${DEDI_API_KEY}` },
    })
    const lookupJson = await lookupRes.json()
    console.log('[DeDi] recordLookup response:', lookupRes.status, JSON.stringify(lookupJson))
    return lookupJson.data?.record_id ?? lookupJson.record_id ?? recordName
  } catch (e) {
    console.error('[DeDi] saveRecord error:', e)
    return null
  }
}

async function createDediParticipantsRecord(
  userId: string,
  companyName: string,
  fullName: string,
  role: string,
): Promise<string | null> {
  try {
    const registryName = buildRegistryName(companyName, fullName, role)
    const type = role === 'financier' ? 'BAP' : 'BPP'
    const url = `https://api.dedi.global/dedi/${DEDI_NAMESPACE}/lium_energy_participants/save-record-as-draft?publish=true`
    const body = {
      record_name: registryName,
      description: `${companyName || fullName} ${role} ${type} record`,
      details: {
        url: `https://api.dedi.global/dedi/lookup/${DEDI_NAMESPACE}/${registryName}`,
        type: 'Registry',
        subscriber_id: `${registryName}.lium.beckn.io`,
      },
      meta: { created_by: 'lium_energy' },
      valid_till: '2035-12-31T23:59:59Z',
    }
    console.log('[DeDi] participants URL:', url)
    console.log('[DeDi] participants body:', JSON.stringify(body))
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEDI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    console.log('[DeDi] participants response:', res.status, JSON.stringify(json))
    if (!res.ok) return null
    return registryName
  } catch (e) {
    console.error('[DeDi] participants error:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  const {
    email, password, role, fullName,
    companyName, website, country, jobTitle, financierType,
  } = await req.json()

  if (!email || !password || !role || !fullName) {
    return NextResponse.json(
      { error: 'email, password, role, and fullName are required' },
      { status: 400 },
    )
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const userId = data.user!.id

  // Step 1 — create registry for all roles
  const registryId = await createDediRegistry(companyName, fullName, role)

  // Step 2 — developer only: generate Ed25519 keypair + publish BPP subscriber record
  let signingPublicKey: string | null = null
  let signingPrivateKey: string | null = null
  let becknRecordId: string | null = null
  let participantsRecordId: string | null = null

  if (role === 'developer' || role === 'financier') {
    // Wait for DeDi registry to be ready before publishing records
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Step 2 — generate Ed25519 keypair + publish subscriber record
    const { publicKeyBase64, privateKeyBase64 } = generateEd25519KeyPair()
    signingPublicKey = publicKeyBase64
    signingPrivateKey = privateKeyBase64
    becknRecordId = await createDediSubscriberRecord(userId, companyName, fullName, country, publicKeyBase64, role)

    // Step 3 — add entry to central participants index
    participantsRecordId = await createDediParticipantsRecord(userId, companyName, fullName, role)
  }

  const profile: Record<string, unknown> = {
    id: userId,
    email,
    role,
    full_name: fullName,
    company_name: companyName ?? null,
    website: website ?? null,
    country: country ?? null,
    job_title: jobTitle ?? null,
    financier_type: financierType ?? null,
    registry_id: registryId,
    signing_public_key: signingPublicKey,
    signing_private_key: signingPrivateKey,
    beckn_record_id: becknRecordId,
    participants_record_id: participantsRecordId,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await supabase.from('profiles').insert(profile as any)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  const token = jwt.sign(
    { id: userId, email, role, fullName },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
  return NextResponse.json(
    { token, user: { id: userId, email, role, fullName } },
    { status: 201 },
  )
}
