import { quoteSchema } from "@/schemas/order.schema";
import { ok, route } from "@/server/http/route";
import { quoteOrder } from "@/server/modules/order/order.service";

export const POST = route({ body: quoteSchema }, async ({ body }) => ok(await quoteOrder(body)));
