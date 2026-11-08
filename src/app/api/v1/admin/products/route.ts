import { revalidateTag } from "next/cache";
import { productSchema } from "@/schemas/product.schema";
import { ok, route } from "@/server/http/route";
import { createProduct, listAdminProducts } from "@/server/modules/product/product.service";

export const GET = route({ auth: true }, async () => ok(await listAdminProducts()));

export const POST = route({ auth: true, body: productSchema }, async ({ body }) => {
  const product = await createProduct(body);
  revalidateTag("products", { expire: 0 });
  return ok(product, { status: 201 });
});
