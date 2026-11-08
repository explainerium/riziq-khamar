import type { ProductFormValues } from "@/schemas/product.schema";
import type { AdminProduct } from "@/types/catalog";
import type { UploadSignature } from "@/utils/cloudinary";
import { baseApi } from "./baseApi";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminProducts: build.query<AdminProduct[], void>({
      query: () => "/admin/products",
      providesTags: ["Product"],
    }),
    adminProduct: build.query<AdminProduct, string>({
      query: (id) => `/admin/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: build.mutation<AdminProduct, ProductFormValues>({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateProduct: build.mutation<AdminProduct, { id: string; body: Partial<ProductFormValues> }>({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Product"],
      // The stock dropdown shows the choice at once, instead of jumping back until the list reloads.
      async onQueryStarted({ id, body: { availability } }, { dispatch, queryFulfilled }) {
        if (!availability) return;
        const patch = dispatch(
          productApi.util.updateQueryData("adminProducts", undefined, (products) => {
            const product = products.find((entry) => entry.id === id);
            if (product) product.availability = availability;
          }),
        );
        await queryFulfilled.catch(() => patch.undo());
      },
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    signUpload: build.mutation<UploadSignature, void>({
      query: () => ({ url: "/admin/uploads/sign", method: "POST" }),
    }),
  }),
});

export const {
  useAdminProductsQuery,
  useAdminProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSignUploadMutation,
} = productApi;
