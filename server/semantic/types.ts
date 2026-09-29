import type { DomainId } from './paths.ts'

export type EnumValueDef = {
  value: string
  label?: string
  description: string
}

export type SemanticAttribute = {
  id: string
  physicalField: string
  type: string
  description: string
  synonyms?: string[]
}

export type DomainCatalog = {
  version: string
  datasetId: DomainId
  displayName: string
  serviceCode?: string
  physicalSource: {
    kind: string
    path: string
    rowGrain?: string
  }
  entity: {
    id: string
    label: string
    description: string
  }
  attributes: SemanticAttribute[]
  enums?: Record<string, EnumValueDef[]>
}

export type GlossaryTerm = {
  id: string
  label: string
  description: string
  synonyms?: string[]
}

export type GlossaryCatalog = {
  version: string
  terms: GlossaryTerm[]
}

export type RelationshipDef = {
  id: string
  description?: string
  from: { dataset: string; entity: string }
  to: { dataset: string; entity: string }
  join?: Array<{ leftField: string; rightField: string }>
  llmHint?: string
}

export type RelationshipsCatalog = {
  version: string
  joinKeys?: Array<{
    id: string
    description: string
    keys: Array<{ name: string; type: string; format?: string }>
  }>
  relationships: RelationshipDef[]
}

export type SemanticCatalog = {
  version: string
  domains: DomainCatalog[]
  glossary: GlossaryCatalog
  relationships: RelationshipsCatalog
}

export type SynonymMatch = {
  datasetId: string
  entityId: string
  attributeId?: string
  physicalField?: string
  glossaryTermId?: string
  matchedSynonym: string
  source: 'attribute' | 'glossary'
}

export type GetSummaryOptions = {
  maxChars?: number
}
