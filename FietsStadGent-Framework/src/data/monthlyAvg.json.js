import { monthlyAvg } from "./drukte.data.js";

process.stdout.write(JSON.stringify(await monthlyAvg()));