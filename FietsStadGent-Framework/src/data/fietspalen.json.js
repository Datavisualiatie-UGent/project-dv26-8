import {loadBikeSummary} from "../components/bike-data.js";

process.stdout.write(JSON.stringify(await loadBikeSummary()));