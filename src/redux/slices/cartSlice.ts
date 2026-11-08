import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MAX_LINE_QUANTITY, type Availability } from "@/constants/catalog";

/** Enough to draw a cart line. Prices shown at checkout always come from the server. */
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  nameEn: string | null;
  packSize: number;
  packUnit: string;
  price: number;
  availability: Availability;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  /** False until the saved cart has been read in the browser. */
  hydrated: boolean;
}

const initialState: CartState = { lines: [], hydrated: false };

const clamp = (quantity: number) => Math.min(MAX_LINE_QUANTITY, Math.max(1, quantity));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload;
      state.hydrated = true;
    },
    addToCart(state, action: PayloadAction<CartLine>) {
      const existing = state.lines.find((line) => line.productId === action.payload.productId);
      if (existing) existing.quantity = clamp(existing.quantity + action.payload.quantity);
      else state.lines.push({ ...action.payload, quantity: clamp(action.payload.quantity) });
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const line = state.lines.find((entry) => entry.productId === action.payload.productId);
      if (line) line.quantity = clamp(action.payload.quantity);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.productId !== action.payload);
    },
    clearCart(state) {
      state.lines = [];
    },
  },
});

export const { hydrateCart, addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

type WithCart = { cart: CartState };

export const selectCartLines = (state: WithCart) => state.cart.lines;
export const selectCartHydrated = (state: WithCart) => state.cart.hydrated;
export const selectCartCount = (state: WithCart) => state.cart.lines.reduce((sum, line) => sum + line.quantity, 0);
