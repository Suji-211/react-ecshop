import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function makeKey(productId, variantId) {
  return `${productId}__${variantId || "no-variant"}`;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item, maxAllowedQty } = action.payload;
      const key = makeKey(item.productId, item.variantId);
      const existing = state.itemsByKey[key];

      const nextQty = Math.min(
        maxAllowedQty,
        (existing?.qty || 0) + item.qty
      );

      return {
        ...state,
        itemsByKey: {
          ...state.itemsByKey,
          [key]: { ...item, qty: nextQty },
        },
      };
    }

    case "SET_QTY": {
      const { productId, variantId, qty, maxAllowedQty } = action.payload;
      const key = makeKey(productId, variantId);
      const existing = state.itemsByKey[key];
      if (!existing) return state;

      const safeQty = Math.max(1, Math.min(maxAllowedQty, qty));

      return {
        ...state,
        itemsByKey: {
          ...state.itemsByKey,
          [key]: { ...existing, qty: safeQty },
        },
      };
    }

    case "REMOVE_ITEM": {
      const { productId, variantId } = action.payload;
      const key = makeKey(productId, variantId);
      const next = { ...state.itemsByKey };
      delete next[key];
      return { ...state, itemsByKey: next };
    }

    case "CLEAR":
      return { itemsByKey: {} };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { itemsByKey: {} });

  const items = useMemo(() => Object.values(state.itemsByKey), [state.itemsByKey]);

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items]
  );

  const totalPriceCents = useMemo(
    () => items.reduce((sum, it) => sum + it.priceCents * it.qty, 0),
    [items]
  );

  const api = useMemo(() => ({
    items,
    totalItems,
    totalPriceCents,

    addToCart: ({ product, variantId, qty, maxAllowedQty }) => {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          maxAllowedQty,
          item: {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            priceCents: product.priceCents,
            variantId: variantId || null,
            qty,
          },
        },
      });
    },

    setQty: ({ productId, variantId, qty, maxAllowedQty }) => {
      dispatch({
        type: "SET_QTY",
        payload: { productId, variantId: variantId || null, qty, maxAllowedQty },
      });
    },

    removeItem: ({ productId, variantId }) => {
      dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId: variantId || null } });
    },

    clearCart: () => dispatch({ type: "CLEAR" }),
  }), [items, totalItems, totalPriceCents]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}