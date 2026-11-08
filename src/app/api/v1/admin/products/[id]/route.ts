import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { productPatchSchema } from "@/schemas/product.schema";
import { ok, route } from "@/server/http/route";
import { deleteProduct, getAdminProduct, updateProduct } from "@/server/modules/product/product.service";
import { destroyImages } from "@/server/modules/upload/upload.service";

/** The shop reads products through a cache; a save has to show on the next visit. */
function refreshStorefront(...slugs: string[]) {
  revalidateTag("products", { expire: 0 });
  for (const slug of slugs) revalidateTag(`product:${slug}`, { expire: 0 });
}

export const GET = route({ auth: true }, async ({ params }) => ok(await getAdminProduct(params.id)));

export const PATCH = route({ auth: true, body: productPatchSchema }, async ({ params, body }) => {
  const { product, previousSlug, removedImages } = await updateProduct(params.id, body);
  refreshStorefront(previousSlug, product.slug);
  if (removedImages.length > 0) after(() => destroyImages(removedImages));
  return ok(product);
});

export const DELETE = route({ auth: true }, async ({ params }) => {
  const { slug, removedImages } = await deleteProduct(params.id);
  refreshStorefront(slug);
  if (removedImages.length > 0) after(() => destroyImages(removedImages));
  return ok();
});
