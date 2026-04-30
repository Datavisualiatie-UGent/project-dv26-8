import { monthlyPerLocation } from "./drukte.data.js";

process.stdout.write(JSON.stringify(await monthlyPerLocation()));