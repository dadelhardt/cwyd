import path from 'node:path'

export function getProjectRoot(): string {
  return process.cwd()
}

export function getSemanticRoot(): string {
  const configured = process.env.CWYD_SEMANTIC_DIR
  if (configured) {
    return path.resolve(configured)
  }
  return path.join(getProjectRoot(), 'semantic')
}

export function getSimDataDirectory(): string {
  const configured = process.env.CWYD_DATA_DIR
  if (configured) {
    return path.resolve(configured)
  }
  return path.join(getProjectRoot(), 'data', 'sim')
}

export const DOMAIN_FILES = ['slm', 'scc', 'dcm', 'src'] as const
export type DomainId = (typeof DOMAIN_FILES)[number]
