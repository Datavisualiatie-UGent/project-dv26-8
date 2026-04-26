import {loadLocaties} from "../components/bike-data.js";

process.stdout.write(JSON.stringify(await loadLocaties()));