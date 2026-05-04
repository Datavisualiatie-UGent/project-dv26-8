import {loadBikeSummary} from "./bike.data.js";

process.stdout.write(JSON.stringify(await loadBikeSummary()));