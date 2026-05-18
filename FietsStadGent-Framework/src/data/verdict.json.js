import { loadVerdictSummary } from "./bike.data.js";

process.stdout.write(JSON.stringify(await loadVerdictSummary()));