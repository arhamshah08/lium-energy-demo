import type { Project } from '@/types'

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

export function saveProject(project: Project): Project {
  store.set(project.id, project)
  return project
}

export function listProjects(): Project[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}
