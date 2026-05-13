import type { Project } from '@/types'
import { supabase } from './supabase'
import { dbToProject } from './project-helpers'

// Module-level singleton survives HMR in dev; replaced per-process in prod.
// Swap this Map for a real DB client (Postgres, Prisma, etc.) without touching
// any route handlers — they all go through the functions below.

declare global {
  // eslint-disable-next-line no-var
  var __projectStore: Map<string, Project> | undefined
}

const store: Map<string, Project> =
  globalThis.__projectStore ?? (globalThis.__projectStore = new Map())

export function getProject(id: string): Project | undefined {
  return store.get(id)
}

// Async version: checks in-memory first, falls back to Supabase.
// Use this in server page components where the project may have been
// created by an API route in a different worker/lambda instance.
export async function getProjectById(id: string): Promise<Project | undefined> {
  const cached = store.get(id)
  if (cached) return cached
  try {
    const { data } = await supabase.from('projects').select('*').eq('id', id).single()
    if (data) return dbToProject(data as Record<string, unknown>)
  } catch {}
  return undefined
}

export function saveProject(project: Project): Project {
  store.set(project.id, project)
  return project
}

export function listProjects(): Project[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

