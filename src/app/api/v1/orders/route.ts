import { after } from "next/server";
import { placeOrderSchema } from "@/schemas/order.schema";
import { clientIp, ok, route } from "@/server/http/route";
import { notifyNewOrder } from "@/server/modules/order/order.notify";
import { placeOrder } from "@/server/modules/order/order.service";

export const POST = route({ body: placeOrderSchema }, async ({ req, body }) => {
  const { order, created } = await placeOrder(body, clientIp(req));
  if (created) after(() => notifyNewOrder(order.id));
  return ok({ token: order.publicToken, orderNo: order.orderNo }, { status: created ? 201 : 200 });
});
