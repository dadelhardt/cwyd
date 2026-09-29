import { readFileSync } from 'node:fs'
import path from 'node:path'
import { DOMAIN_FILES, getSimDataDirectory } from './paths.ts'
import { loadSemanticCatalog } from './load-catalog.ts'

export type ValidationResult = {
  ok: boolean
  errors: string[]
}

function physicalFieldsFromSimJson(simPath: string): string[] {
  const raw = readFileSync(simPath, 'utf8')
  const rows = JSON.parse(raw) as Record<string, unknown>[]
  const first = rows[0]
  if (!first) {
    return []
  }
  return Object.keys(first).sort()
}

export function validateSemanticCatalog(): ValidationResult {
  const errors: string[] = []
  const catalog = loadSemanticCatalog()
  const simDir = getSimDataDirectory()

  for (const domainId of DOMAIN_FILES) {
    const domain = catalog.domains.find((d) => d.datasetId === domainId)
    if (!domain) {
      errors.push(`Missing domain catalog for ${domainId}`)
      continue
    }

    const simFile = path.join(simDir, `${domainId}.json`)
    let simFields: string[]
    try {
      simFields = physicalFieldsFromSimJson(simFile)
    } catch {
      errors.push(`Cannot read sim data: ${simFile}`)
      continue
    }

    const mapped = new Set(domain.attributes.map((a) => a.physicalField))
    for (const field of simFields) {
      if (!mapped.has(field)) {
        errors.push(
          `${domainId}: sim column "${field}" is not documented in semantic/domains/${domainId}.yaml`,
        )
      }
    }
    for (const field of mapped) {
      if (!simFields.includes(field)) {
        errors.push(
          `${domainId}: semantic field "${field}" has no column in ${simFile}`,
        )
      }
    }

    if (domain.enums) {
      for (const attribute of domain.attributes) {
        if (attribute.type !== 'enum') {
          continue
        }
        const enumDef = domain.enums[attribute.physicalField]
        if (!enumDef?.length) {
          errors.push(
            `${domainId}: enum attribute "${attribute.physicalField}" missing enums.${attribute.physicalField}`,
          )
        }
      }
    }
  }

  if (!catalog.relationships.relationships.some((r) => r.id === 'slm_to_scc')) {
    errors.push('relationships.yaml: missing slm_to_scc relationship')
  }

  const joinText = JSON.stringify(catalog.relationships.joinKeys ?? [])
  if (!joinText.includes('customerId') || !joinText.includes('supplierId')) {
    errors.push('relationships.yaml: join keys must document customerId and supplierId')
  }

  const purchaseOrderMatches = catalog.domains
    .find((d) => d.datasetId === 'scc')
    ?.attributes.flatMap((a) => a.synonyms ?? [])
    .some((s) => s.toLowerCase().includes('purchase order'))
  if (!purchaseOrderMatches) {
    errors.push('scc.yaml: expected a "purchase order" synonym on an attribute')
  }

  return { ok: errors.length === 0, errors }
}
