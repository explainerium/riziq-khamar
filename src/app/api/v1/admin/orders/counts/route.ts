import { ok, route } from "@/server/http/route";
import { orderCounts } from "@/server/modules/order/order.service";

export const GET = route({ auth: true }, async () => ok(await orderCounts()));
