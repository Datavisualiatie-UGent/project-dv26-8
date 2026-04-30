import {loadLocaties} from "./bike.data.js";

process.stdout.write(JSON.stringify(await loadLocaties()));