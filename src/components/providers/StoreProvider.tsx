"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { CART_STORAGE_KEY } from "@/constants/site";
import { useAppStore } from "@/redux/hooks";
import { hydrateCart, type CartLine } from "@/redux/slices/cartSlice";
import { makeStore } from "@/redux/store";

function readSavedCart(): CartLine[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? (saved as CartLine[]) : [];
  } catch {
    return [];
  }
}

/** Loads the saved cart after mount and keeps localStorage in step with it. */
function CartPersistence() {
  const store = useAppStore();

  useEffect(() => {
    store.dispatch(hydrateCart(readSavedCart()));

    let previous = store.getState().cart.lines;
    return store.subscribe(() => {
      const next = store.getState().cart.lines;
      if (next === previous) return;
      previous = next;
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode or a full disk: the cart still works for this visit.
      }
    });
  }, [store]);

  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazy initial state: the store is created once per mount, never shared across requests.
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <CartPersistence />
      {children}
    </Provider>
  );
}
