import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import type { SimDatasets } from './sim-data-types.ts'

const DATASET_FILES = {
  slm: 'slm.json',
  scc: 'scc.json',
  dcm: 'dcm.json',
  src: 'src.json',
} as const satisfies Record<keyof SimDatasets, string>

export function getSimDataDirectory(): string {
  const configured = process.env.CWYD_DATA_DIR
  if (configured) {
    return path.resolve(configured)
  }
  return path.join(process.cwd(), 'data', 'sim')
}

function filePath(dir: string, key: keyof SimDatasets): string {
  return path.join(dir, DATASET_FILES[key])
}

export function simDataFilesExist(dir = getSimDataDirectory()): boolean {
  return (Object.keys(DATASET_FILES) as (keyof SimDatasets)[]).every((key) =>
    existsSync(filePath(dir, key)),
  )
}

export function loadSimDatasetsFromDisk(dir = getSimDataDirectory()): SimDatasets {
  const slm = JSON.parse(
    readFileSync(filePath(dir, 'slm'), 'utf8'),
  ) as SimDatasets['slm']
  const scc = JSON.parse(
    readFileSync(filePath(dir, 'scc'), 'utf8'),
  ) as SimDatasets['scc']
  const dcm = JSON.parse(
    readFileSync(filePath(dir, 'dcm'), 'utf8'),
  ) as SimDatasets['dcm']
  const src = JSON.parse(
    readFileSync(filePath(dir, 'src'), 'utf8'),
  ) as SimDatasets['src']
  return { slm, scc, dcm, src }
}

export function writeSimDatasetsToDisk(
  datasets: SimDatasets,
  dir = getSimDataDirectory(),
): void {
  mkdirSync(dir, { recursive: true })
  for (const key of Object.keys(DATASET_FILES) as (keyof SimDatasets)[]) {
    writeFileSync(
      filePath(dir, key),
      `${JSON.stringify(datasets[key], null, 2)}\n`,
      'utf8',
    )
  }
}
