# LIUM Energy Demo — Full Setup & Integration Guide
**Reference document for rebuilding this from scratch**

---

## 1. Supabase Schema

### Correct Project
- **Project name:** lium-network
- **Project ID:** `aclazhnjwanhtcxmiwlq`
- **URL:** `https://aclazhnjwanhtcxmiwlq.supabase.co`
- The second project (`vlhdbvxvehztfilonevj`) is empty — never use it

### Run all migrations at once in Supabase → SQL Editor

```sql
-- profiles columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registry_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signing_public_key text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signing_private_key text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS beckn_record_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS participants_record_id text;

-- Fix role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('developer', 'financier', 'securitisation_agent', 'portfolio_manager', 'investor'));

-- projects columns
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS asset_type text,
  ADD COLUMN IF NOT EXISTS jurisdiction text,
  ADD COLUMN IF NOT EXISTS location text;
```

---

## 2. Environment Variables

Must be in `.env.local` in the project root AND in Vercel environment variables before deploying:

```
SUPABASE_URL="https://aclazhnjwanhtcxmiwlq.supabase.co"
SUPABASE_ANON_KEY="<anon key from Supabase dashboard>"
DEDI_API_KEY="0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac"
DEDI_NAMESPACE="did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS"
```

**Always restart the dev server after changing `.env.local`:**
```
pkill -f "next dev"; sleep 2; cd ~/lium-energy-demo && npm run dev
```

---

## 3. DeDi Integration — Full 3-Step Flow

This runs automatically on developer signup only. All other roles (financier, investor, etc.) skip Steps 2 and 3.

### Registry Name Format
Always built dynamically from the company name — never hardcoded:
```
lium_developer_{company_name_lowercase_underscored}
```
- "GPS Systems" → `lium_developer_gps_systems`
- "Acme Energy" → `lium_developer_acme_energy`
- "Emboss Electric" → `lium_developer_emboss_electric`

---

### Step 1 — Create Registry

**What it does:** Creates a container on DeDi for the developer's identity data.

**Endpoint:** `POST /dedi/{namespace}/create-registry`

**Single-line curl:**
```
curl -s -X POST 'https://api.dedi.global/dedi/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/create-registry' -H 'Content-Type: application/json' -H 'Authorization: Bearer 0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac' -d '{"registry_name":"lium_developer_{company_name}","description":"{Company Name} - developer","tag":"beckn_subscriber","meta":{"version":"1.0"}}'
```

**Payload:**
```json
{
  "registry_name": "lium_developer_{company_name}",
  "description": "{Company Name} - developer",
  "tag": "beckn_subscriber",
  "meta": { "version": "1.0" }
}
```

**Responses:**
- Success: `{"message":"...","data":{"registry_id":"..."}}`
- Already exists: `{"message":"Registry already exists"}` — 409 status, treat as success, fall back to storing the registry name as `registry_id`

**Saved to Supabase:** `profiles.registry_id`

---

### Step 2 — Publish BPP Subscriber Record

**What it does:** Publishes the developer's Beckn identity record into their registry. Uses an Ed25519 keypair generated fresh at signup.

**Must wait 3 seconds after Step 1** — DeDi needs time to index the registry.

**Endpoint:** `POST /dedi/{namespace}/{registry_name}/save-record-as-draft?publish=true`

**Single-line curl:**
```
curl -s -X POST 'https://api.dedi.global/dedi/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_developer_{company_name}/save-record-as-draft?publish=true' -H 'Content-Type: application/json' -H 'Authorization: Bearer 0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac' -d '{"record_name":"{supabase_user_uuid}","description":"{Company Name} developer BPP record","details":{"url":"https://lium.beckn.io/{supabase_user_uuid}","type":"BPP","domain":"*","countries":["USA"],"subscriber_id":"{supabase_user_uuid}","signing_public_key":"{ed25519_public_key_base64}"},"meta":{"created_by":"lium_energy"},"valid_till":"2035-12-31T23:59:59Z"}'
```

**Payload:**
```json
{
  "record_name": "{supabase_user_uuid}",
  "description": "{Company Name} developer BPP record",
  "details": {
    "url": "https://lium.beckn.io/{supabase_user_uuid}",
    "type": "BPP",
    "domain": "*",
    "countries": ["USA"],
    "subscriber_id": "{supabase_user_uuid}",
    "signing_public_key": "{ed25519_public_key_base64}"
  },
  "meta": { "created_by": "lium_energy" },
  "valid_till": "2035-12-31T23:59:59Z"
}
```

**Response:** `{"message":"record created","data":{}}` — `data` is always empty, use Supabase UUID as the identifier.

**Saved to Supabase:** `profiles.beckn_record_id` (the Supabase user UUID), `profiles.signing_public_key`, `profiles.signing_private_key`

---

### Step 3 — Add Entry to Central Participants Index

**What it does:** Adds a reference record to `lium_energy_participants` — a central directory of all LIUM developers on the Beckn network. Points back to the Step 1 registry via a lookup URL.

**Endpoint:** `POST /dedi/{namespace}/lium_energy_participants/save-record-as-draft?publish=true`

**Single-line curl:**
```
curl -s -X POST 'https://api.dedi.global/dedi/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_energy_participants/save-record-as-draft?publish=true' -H 'Content-Type: application/json' -H 'Authorization: Bearer 0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac' -d '{"record_name":"lium_developer_{company_name}","description":"{Company Name} developer BPP record","details":{"url":"https://api.dedi.global/dedi/lookup/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_developer_{company_name}","type":"Registry","subscriber_id":"{supabase_user_uuid}"},"meta":{"created_by":"lium_energy"},"valid_till":"2035-12-31T23:59:59Z"}'
```

**Payload:**
```json
{
  "record_name": "lium_developer_{company_name}",
  "description": "{Company Name} developer BPP record",
  "details": {
    "url": "https://api.dedi.global/dedi/lookup/{namespace}/lium_developer_{company_name}",
    "type": "Registry",
    "subscriber_id": "{supabase_user_uuid}"
  },
  "meta": { "created_by": "lium_energy" },
  "valid_till": "2035-12-31T23:59:59Z"
}
```

**How `details.url` is constructed:**
```
https://api.dedi.global/dedi/lookup/{DEDI_NAMESPACE}/{registry_name_from_step1}
```
- Base is always `https://api.dedi.global/dedi/lookup/`
- Namespace is always the same — from `DEDI_NAMESPACE` env var
- Registry name at the end is the company's registry from Step 1

**Response:** `{"message":"record created","data":{}}`

**Saved to Supabase:** `profiles.participants_record_id` (the registry name e.g. `lium_developer_acme_energy`)

---

### How the 3 Steps Link Together

```
lium_energy_participants  (central index — Step 3 adds entry here)
        │
        │ details.url points to
        ▼
lium_developer_{company}  (company registry — created in Step 1)
        │
        │ contains
        ▼
BPP subscriber record     (published in Step 2)
  record_name     = supabase user UUID
  subscriber_id   = supabase user UUID
  signing_public_key = Ed25519 public key
```

---

### Ed25519 Key Generation

Keys must be raw 32-byte, Base64-encoded with RFC 4648 standard padding. Uses Node.js built-in `crypto` — no external libraries.

```js
import { generateKeyPairSync } from 'crypto'

const { privateKey, publicKey } = generateKeyPairSync('ed25519')

const privateKeyBase64 = privateKey
  .export({ type: 'pkcs8', format: 'der' })
  .slice(-32)
  .toString('base64')

const publicKeyBase64 = publicKey
  .export({ type: 'spki', format: 'der' })
  .slice(-32)
  .toString('base64')
```

---

## 4. What Broke and How It Was Fixed

| Problem | Root Cause | Fix |
|---|---|---|
| `supabaseUrl is required` | `.env.local` missing `SUPABASE_URL` and `SUPABASE_ANON_KEY` | Add both vars, restart server |
| `registry_id` always null | DeDi returns 409 when registry exists — treated as failure | Treat 409 as success, fall back to registry name string |
| `beckn_record_id` always null | DeDi returns `{"data":{}}` empty object | Fall back to Supabase UUID as the record ID |
| Records failing silently | No error logging in fetch calls | Added `console.log('[DeDi]...')` to all three functions |
| `encodeURIComponent` on namespace | Encodes colons as `%3A`, breaking the URL | Remove entirely — use namespace string directly |
| Countries schema error | Sending `"US"` (2-letter) — DeDi requires ISO alpha-3 | Hardcoded `["USA"]` for pilot |
| Step 2 timing failure | Registry not indexed by DeDi before Step 2 fires | 3 second delay between Step 1 and Steps 2+3 |
| Curl commands failing on paste | Multiline backslash continuations break when copied from chat | Always use single-line curls |

---

## 5. Manually Fixing a User Whose Records Were Not Created

Run this to check their current state:
```sql
SELECT id, email, company_name, registry_id, signing_public_key, beckn_record_id, participants_record_id
FROM profiles
WHERE email = '{their_email}';
```

**Fix missing `beckn_record_id` (Step 2):**
```
curl -s -X POST 'https://api.dedi.global/dedi/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_developer_{company_name}/save-record-as-draft?publish=true' -H 'Content-Type: application/json' -H 'Authorization: Bearer 0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac' -d '{"record_name":"{uuid}","description":"{Company Name} developer BPP record","details":{"url":"https://lium.beckn.io/{uuid}","type":"BPP","domain":"*","countries":["USA"],"subscriber_id":"{uuid}","signing_public_key":"{signing_public_key_from_supabase}"},"meta":{"created_by":"lium_energy"},"valid_till":"2035-12-31T23:59:59Z"}'
```
Then update Supabase:
```sql
UPDATE profiles SET beckn_record_id = '{uuid}' WHERE id = '{uuid}';
```

**Fix missing `participants_record_id` (Step 3):**
```
curl -s -X POST 'https://api.dedi.global/dedi/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_energy_participants/save-record-as-draft?publish=true' -H 'Content-Type: application/json' -H 'Authorization: Bearer 0xf29685ad02f69bb7d084f0b201661c821bb2511440b91394fea1d417f08fe2ac' -d '{"record_name":"lium_developer_{company_name}","description":"{Company Name} developer BPP record","details":{"url":"https://api.dedi.global/dedi/lookup/did:web:did.cord.network:76EU9CkuAWSW1T6YViz2afgfZMs7eds4zYi7RrX3nhJMAugR2upTNS/lium_developer_{company_name}","type":"Registry","subscriber_id":"{uuid}"},"meta":{"created_by":"lium_energy"},"valid_till":"2035-12-31T23:59:59Z"}'
```
Then update Supabase:
```sql
UPDATE profiles SET participants_record_id = 'lium_developer_{company_name}' WHERE id = '{uuid}';
```

---

## 6. Key Rules to Never Break

1. **Never use `encodeURIComponent` on the DeDi namespace** — colons must stay as-is in the URL
2. **Always wait 3 seconds** between Step 1 and Steps 2+3
3. **Countries must be `["USA"]`** — hardcoded for pilot, ISO alpha-3 required by DeDi
4. **Always use `beckn_subscriber` tag in Step 1** — never send both `tag` and `schema`
5. **Registry name must be identical across all 3 steps** — this is how they link together
6. **Never hardcode company names** — always build from `companyName` dynamically
7. **Always restart dev server** after changing `.env.local`
8. **Always use single-line curls** when copying — multiline backslash continuations break on paste
9. **Steps 2 and 3 are developer-only** for the pilot — other roles only get Step 1
10. **Step 3 `record_name` is the registry name** not a UUID — makes it identifiable on DeDi dashboard

---

## 7. Supabase Profiles Column Reference

| Column | Set at | Purpose |
|---|---|---|
| `registry_id` | Step 1 | DeDi registry ID or registry name |
| `signing_public_key` | Step 2 | Ed25519 public key sent to DeDi |
| `signing_private_key` | Step 2 | Ed25519 private key — stored securely |
| `beckn_record_id` | Step 2 | Supabase UUID — the subscriber record identifier |
| `participants_record_id` | Step 3 | Registry name — slot in central participants index |

---

## 8. Supabase Projects Reference

| Project | ID | Purpose |
|---|---|---|
| lium-network | `aclazhnjwanhtcxmiwlq` | Active project — all tables live here |
| arhamshah08's Project | `vlhdbvxvehztfilonevj` | Empty — not in use |
