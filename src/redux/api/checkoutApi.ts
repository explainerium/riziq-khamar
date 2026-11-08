import type { PlaceOrderInput, QuoteInput } from "@/schemas/order.schema";
import type { PlacedOrder, Quote } from "@/types/order";
import { baseApi } from "./baseApi";

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // A POST because the cart goes in the body; it only reads.
    getQuote: build.query<Quote, QuoteInput>({
      query: (body) => ({ url: "/orders/quote", method: "POST", body }),
    }),
    placeOrder: build.mutation<PlacedOrder, PlaceOrderInput>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
    }),
  }),
});

export const { useGetQuoteQuery, usePlaceOrderMutation } = checkoutApi;
