import { orderListQuerySchema } from "@/schemas/order.schema";
import { ok, route } from "@/server/http/route";
import { listOrders } from "@/server/modules/order/order.service";

export const GET = route({ auth: true, query: orderListQuerySchema }, async ({ query }) => {
  const { rows, meta } = await listOrders(query);
  return ok(rows, { meta });
});
