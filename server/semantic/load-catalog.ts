import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  DOMAIN_FILES,
  getSemanticRoot,
  type DomainId,
} from './paths.ts'
import type {
  DomainCatalog,
  GetSummaryOptions,
  GlossaryCatalog,
  RelationshipsCatalog,
  SemanticCatalog,
  SynonymMatch,
} from './types.ts'

function readYamlFile<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf8')
  return parseYaml(raw) as T
}

function loadDomain(domainId: DomainId, root: string): DomainCatalog {
  const filePath = path.join(root, 'domains', `${domainId}.yaml`)
  return readYamlFile<DomainCatalog>(filePath)
}

export function loadSemanticCatalog(root = getSemanticRoot()): SemanticCatalog {
  const domains = DOMAIN_FILES.map((id) => loadDomain(id, root))
  const glossary = readYamlFile<GlossaryCatalog>(
    path.join(root, 'glossary.yaml'),
  )
  const relationships = readYamlFile<RelationshipsCatalog>(
    path.join(root, 'relationships.yaml'),
  )
  const version = domains[0]?.version ?? glossary.version
  return { version, domains, glossary, relationships }
}

let cached: SemanticCatalog | undefined

export function getSemanticCatalog(): SemanticCatalog {
  cached ??= loadSemanticCatalog()
  return cached
}

function normalizeTerm(value: string): string {
  return value.trim().toLowerCase()
}

export function resolveSynonym(term: string): SynonymMatch[] {
  const catalog = getSemanticCatalog()
  const needle = normalizeTerm(term)
  if (!needle) {
    return []
  }

  const matches: SynonymMatch[] = []

  for (const domain of catalog.domains) {
    for (const attribute of domain.attributes) {
      const candidates = [
        attribute.id.replaceAll('_', ' '),
        attribute.physicalField,
        ...(attribute.synonyms ?? []),
      ]
      for (const candidate of candidates) {
        const normalized = normalizeTerm(candidate)
        if (normalized === needle || normalized.includes(needle)) {
          matches.push({
            datasetId: domain.datasetId,
            entityId: domain.entity.id,
            attributeId: attribute.id,
            physicalField: attribute.physicalField,
            matchedSynonym: candidate,
            source: 'attribute',
          })
        }
      }
    }
  }

  for (const glossaryTerm of catalog.glossary.terms) {
    const candidates = [
      glossaryTerm.label,
      glossaryTerm.id.replaceAll('_', ' '),
      ...(glossaryTerm.synonyms ?? []),
    ]
    for (const candidate of candidates) {
      const normalized = normalizeTerm(candidate)
      if (normalized === needle || normalized.includes(needle)) {
        matches.push({
          datasetId: '',
          entityId: '',
          glossaryTermId: glossaryTerm.id,
          matchedSynonym: candidate,
          source: 'glossary',
        })
      }
    }
  }

  const seen = new Set<string>()
  return matches.filter((m) => {
    const key =
      m.source === 'attribute'
        ? `${m.datasetId}:${m.attributeId}:${m.matchedSynonym}`
        : `glossary:${m.glossaryTermId}:${m.matchedSynonym}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export function getSemanticSummaryForLlm(
  options: GetSummaryOptions = {},
): string {
  const maxChars = options.maxChars ?? 12_000
  const catalog = getSemanticCatalog()
  const parts: string[] = [
    `# Semantic catalog v${catalog.version}`,
    '',
    '## Join keys',
  ]

  for (const join of catalog.relationships.joinKeys ?? []) {
    parts.push(`- ${join.id}: ${join.description.trim()}`)
    for (const key of join.keys) {
      parts.push(`  - ${key.name} (${key.type})`)
    }
  }

  parts.push('', '## Relationships')
  for (const rel of catalog.relationships.relationships) {
    parts.push(
      `- ${rel.id}: ${rel.from.dataset} → ${rel.to.dataset}. ${rel.llmHint?.trim() ?? ''}`,
    )
  }

  for (const domain of catalog.domains) {
    parts.push('', `## ${domain.displayName} (${domain.datasetId})`)
    parts.push(domain.entity.description.trim())
    for (const attribute of domain.attributes) {
      parts.push(
        `- ${attribute.physicalField}: ${attribute.description.trim().replace(/\s+/g, ' ')}`,
      )
      if (attribute.synonyms?.length) {
        parts.push(`  Synonyms: ${attribute.synonyms.join(', ')}`)
      }
    }
    if (domain.enums) {
      for (const [field, values] of Object.entries(domain.enums)) {
        parts.push(`  Enum ${field}:`)
        for (const v of values) {
          parts.push(`    - ${v.value}: ${v.description.trim().replace(/\s+/g, ' ')}`)
        }
      }
    }
  }

  parts.push('', '## Glossary')
  for (const term of catalog.glossary.terms) {
    parts.push(`- ${term.label}: ${term.description.trim().replace(/\s+/g, ' ')}`)
  }

  let summary = parts.join('\n')
  if (summary.length > maxChars) {
    summary = `${summary.slice(0, maxChars - 20)}\n… [truncated]`
  }
  return summary
}

export function getRelationshipHints(): string {
  const catalog = getSemanticCatalog()
  return catalog.relationships.relationships
    .map((r) => r.llmHint?.trim())
    .filter(Boolean)
    .join('\n\n')
}
