import { db } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";

/**
 * Decrement stock for cart items using a transaction.
 * This ensures you can't "oversell" if multiple users buy at once.
 *
 * Assumes product document has `quantity` field (total stock).
 */
export async function checkoutAndDecrementStock(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  await runTransaction(db, async (tx) => {
    // 1) Read all products involved
    const productRefs = cartItems.map((it) => doc(db, "products", it.productId));
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    // 2) Validate stock
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const snap = productSnaps[i];

      if (!snap.exists()) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const data = snap.data();
      const stock = Number(data.quantity || 0);

      if (item.qty > stock) {
        throw new Error(`Not enough stock for "${data.name}". In stock: ${stock}`);
      }
    }

    // 3) Apply updates
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const snap = productSnaps[i];
      const data = snap.data();
      const stock = Number(data.quantity || 0);

      tx.update(productRefs[i], { quantity: stock - item.qty });
    }
  });
}