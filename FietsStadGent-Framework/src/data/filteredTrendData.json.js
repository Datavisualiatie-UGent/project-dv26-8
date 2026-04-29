import { filteredTrendData } from "./trendlijn.data";

process.stdout.write(JSON.stringify(await filteredTrendData()));