import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUserFromHeader } from '@/lib/project-helpers'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FIELD_PROMPTS: Record<string, string> = {
  TECHNICAL_AUDIT: 'Return JSON: { "asset_capacity_mw": string|null, "technology_type": string|null, "commissioning_date": string|null, "asset_location": string|null, "efficiency_pct": string|null, "manufacturer": string|null }',
  PPA_AGREEMENT: 'Return JSON: { "counterparty_name": string|null, "contract_term_years": string|null, "strike_price_per_mwh": string|null, "offtake_structure": string|null, "start_date": string|null }',
  INTERCONNECTION_STUDY: 'Return JSON: { "interconnection_point": string|null, "capacity_limit_mw": string|null, "study_date": string|null, "grid_operator": string|null }',
  INSURANCE_CERTIFICATE: 'Return JSON: { "insurer_name": string|null, "coverage_amount_usd": string|null, "policy_number": string|null, "expiry_date": string|null }',
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const user = getUserFromHeader(req.headers.get('Authorization'))
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 },
    )
  }

  await params

  const { docType, fileBase64, filename, mimeType } = await req.json()

  const fieldPrompt = FIELD_PROMPTS[docType as string] ?? 'Extract key fields as a JSON object.'
  const instruction = `You are parsing an energy project document for institutional due diligence. ${fieldPrompt}. Return ONLY the JSON object with no markdown or explanation. Use null for any field not found in the document.`

  try {
    const response = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              filename: filename as string,
              file_data: `data:${mimeType as string};base64,${fileBase64 as string}`,
            },
            {
              type: 'input_text',
              text: instruction,
            },
          ],
        },
      ],
    })

    const text = response.output_text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const extracted: Record<string, string | null> = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json({ ok: true, data: { extracted, filename, docType } })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: { code: 'PARSE_ERROR', message: String(err) } },
      { status: 500 },
    )
  }
}
