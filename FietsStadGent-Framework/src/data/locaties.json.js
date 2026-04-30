import {loadLocations} from "./bike.data.js";

process.stdout.write(JSON.stringify(await loadLocations()));