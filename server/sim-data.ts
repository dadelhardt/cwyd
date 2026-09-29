import { generateSimDatasets } from './sim-data-generate.ts'
import {
  getSimDataDirectory,
  loadSimDatasetsFromDisk,
  simDataFilesExist,
  writeSimDatasetsToDisk,
} from './sim-data-store.ts'

export type {
  DcmRecord,
  SccRecord,
  SimDatasets,
  SlmRecord,
  SrcRecord,
  SupplyOnService,
} from './sim-data-types.ts'

export { generateSimDatasets, getSimDataDirectory }

let cached: import('./sim-data-types.ts').SimDatasets | undefined

function loadOrCreateSimDatasets(): import('./sim-data-types.ts').SimDatasets {
  const dir = getSimDataDirectory()
  if (simDataFilesExist(dir)) {
    return loadSimDatasetsFromDisk(dir)
  }
  const generated = generateSimDatasets()
  writeSimDatasetsToDisk(generated, dir)
  return generated
}

export function getSimDatasets(): import('./sim-data-types.ts').SimDatasets {
  cached ??= loadOrCreateSimDatasets()
  return cached
}

/** Regenerate JSON files under data/sim (or CWYD_DATA_DIR). */
export function refreshSimDatasets(seed = 42): import('./sim-data-types.ts').SimDatasets {
  const datasets = generateSimDatasets(seed)
  writeSimDatasetsToDisk(datasets)
  cached = datasets
  return datasets
}

/** Suppliers enrolled in more than one SupplyOn service (for tests and demos). */
export function suppliersWithMultipleServices(
  datasets = getSimDatasets(),
): {
  supplierId: string
  supplierName: string
  services: import('./sim-data-types.ts').SupplyOnService[]
}[] {
  const bySupplier = new Map<
    string,
    {
      supplierName: string
      services: Set<import('./sim-data-types.ts').SupplyOnService>
    }
  >()
  for (const row of datasets.slm) {
    let entry = bySupplier.get(row.supplierId)
    if (!entry) {
      entry = { supplierName: row.supplierName, services: new Set() }
      bySupplier.set(row.supplierId, entry)
    }
    entry.services.add(row.supplyOnService)
  }
  return [...bySupplier.entries()]
    .filter(([, v]) => v.services.size > 1)
    .map(([supplierId, v]) => ({
      supplierId,
      supplierName: v.supplierName,
      services: [...v.services].sort(),
    }))
}
