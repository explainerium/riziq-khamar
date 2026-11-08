import { orderUpdateSchema } from "@/schemas/order.schema";
import { ok, route } from "@/server/http/route";
import { getOrder, updateOrder } from "@/server/modules/order/order.service";

export const GET = route({ auth: true }, async ({ params }) => ok(await getOrder(params.id)));

export const PATCH = route({ auth: true, body: orderUpdateSchema }, async ({ params, body }) =>
  ok(await updateOrder(params.id, body)),
);
