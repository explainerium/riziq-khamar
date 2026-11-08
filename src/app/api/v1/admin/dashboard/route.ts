import { ok, route } from "@/server/http/route";
import { dashboardSummary } from "@/server/modules/dashboard/dashboard.service";

export const GET = route({ auth: true }, async () => ok(await dashboardSummary()));
