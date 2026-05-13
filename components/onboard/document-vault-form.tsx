'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { projectsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-context'
import type { DocumentRecord } from '@/types'

type DocSlot = {
  type: DocumentRecord['type']
  label: string
  icon: string
  hint: string
  required: boolean
}

const DOC_SLOTS: DocSlot[] = [
  { type: 'TECHNICAL_AUDIT',      label: 'TECHNICAL AUDIT',       icon: 'upload_file',  hint: 'PDF, MAX 50MB', required: true  },
  { type: 'PPA_AGREEMENT',        label: 'PPA AGREEMENT',         icon: 'contract',     hint: 'PDF, DOCX',     required: true  },
  { type: 'INTERCONNECTION_STUDY',label: 'INTERCONNECTION STUDY', icon: 'account_tree', hint: 'PDF',           required: false },
  { type: 'INSURANCE_CERTIFICATE',label: 'INSURANCE CERTIFICATE', icon: 'verified',     hint: 'PDF, PNG',      required: false },
]

type ParseState = {
  status: 'idle' | 'parsing' | 'done' | 'error'
  fields?: Record<string, string | null>
  error?: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function DocumentVaultForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const { token } = useAuth()
  const [files, setFiles] = useState<Record<string, File>>({})
  const [parseStates, setParseStates] = useState<Record<string, ParseState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const parseFile = useCallback(async (type: DocumentRecord['type'], file: File) => {
    setParseStates(prev => ({ ...prev, [type]: { status: 'parsing' } }))
    try {
      const fileBase64 = await fileToBase64(file)
      const mimeType = file.type || 'application/pdf'
      const res = await fetch(`/api/projects/${projectId}/documents/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ docType: type, fileBase64, filename: file.name, mimeType }),
      })
      const json = await res.json()
      if (json.ok) {
        setParseStates(prev => ({ ...prev, [type]: { status: 'done', fields: json.data.extracted } }))
      } else {
        setParseStates(prev => ({ ...prev, [type]: { status: 'error', error: json.error?.message } }))
      }
    } catch {
      setParseStates(prev => ({ ...prev, [type]: { status: 'error', error: 'Failed to parse document' } }))
    }
  }, [projectId, token])

  function handleFile(type: DocumentRecord['type'], fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    setFiles(prev => ({ ...prev, [type]: file }))
    parseFile(type, file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing = DOC_SLOTS.filter(s => s.required && !files[s.type])
    if (missing.length) { setError(`Required: ${missing.map(s => s.label).join(', ')}`); return }

    setSubmitting(true)
    const documents = Object.entries(files).map(([type, file]) => ({
      type: type as DocumentRecord['type'],
      filename: file.name,
      parsed: parseStates[type]?.fields,
    }))
    const res = await projectsApi.updateDocuments(projectId, { documents })
    setSubmitting(false)

    if (!res.ok) { setError(res.error.message); return }
    router.push(`/onboard/telemetry?id=${projectId}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-[28px]">shield_lock</span>
            <h2 className="text-headline-md text-on-surface">Secure Document Vault</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DOC_SLOTS.map(({ type, label, icon, hint, required }) => {
              const file = files[type]
              const ps = parseStates[type]
              return (
                <div key={type} className="space-y-2">
                  <label className="block group cursor-pointer">
                    <p className="text-label-caps font-bold text-on-surface tracking-widest mb-2">
                      {label}
                      {required && <span className="text-error ml-1">*</span>}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.png"
                      className="sr-only"
                      onChange={e => handleFile(type, e.target.files)}
                    />
                    <div className={cn(
                      'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all min-h-[120px]',
                      file
                        ? 'border-secondary bg-secondary-container/10'
                        : 'border-outline-variant hover:border-secondary hover:bg-secondary-container/5',
                    )}>
                      {file ? (
                        <>
                          <span className="material-symbols-outlined text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          <p className="text-caption text-secondary font-bold truncate max-w-full px-2 text-center">{file.name}</p>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-outline group-hover:text-secondary mb-2">{icon}</span>
                          <p className="text-caption text-on-surface-variant text-center">
                            Drop file or <span className="text-secondary font-bold">browse</span>
                          </p>
                          <p className="text-caption text-outline mt-1">{hint}</p>
                        </>
                      )}
                    </div>
                  </label>

                  {ps?.status === 'parsing' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary-container/20 rounded-lg">
                      <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                      <p className="text-caption text-on-primary-container">Parsing with AI...</p>
                    </div>
                  )}

                  {ps?.status === 'done' && ps.fields && (
                    <div className="bg-surface-container-low rounded-lg border border-outline-variant/40 p-3">
                      <p className="text-label-caps text-secondary font-bold tracking-widest mb-2">EXTRACTED FIELDS</p>
                      <div className="space-y-1">
                        {Object.entries(ps.fields).map(([key, val]) => val && (
                          <div key={key} className="flex justify-between gap-4">
                            <span className="text-caption text-on-surface-variant capitalize shrink-0">{key.replace(/_/g, ' ')}</span>
                            <span className="text-caption text-on-surface font-medium text-right">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ps?.status === 'error' && (
                    <p className="text-caption text-error px-2">Parse failed: {ps.error}</p>
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <p className="text-caption text-error bg-error-container/30 px-4 py-3 rounded-lg">{error}</p>
          )}
        </CardBody>

        <CardFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push(`/onboard/project-details?id=${projectId}`)}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            BACK TO DETAILS
          </Button>
          <Button type="submit" variant="secondary" loading={submitting} className="gap-2">
            NEXT: CONNECT TELEMETRY
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
