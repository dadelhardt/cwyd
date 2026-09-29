import { validateSemanticCatalog } from './semantic/validate-catalog.ts'

const result = validateSemanticCatalog()
if (result.ok) {
  console.log('Semantic catalog validation passed.')
} else {
  console.error('Semantic catalog validation failed:')
  for (const error of result.errors) {
    console.error(`  - ${error}`)
  }
  process.exit(1)
}
