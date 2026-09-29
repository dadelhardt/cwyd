import { refreshSimDatasets } from './sim-data.ts'

const seed = Number(process.env.CWYD_DATA_SEED ?? 42)
const datasets = refreshSimDatasets(seed)
console.log(
  `Wrote data/sim: slm=${datasets.slm.length}, scc=${datasets.scc.length}, dcm=${datasets.dcm.length}, src=${datasets.src.length} (seed=${seed})`,
)
