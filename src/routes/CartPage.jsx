import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import Money from "../components/Money.jsx";
import QuantityPicker from "../components/quantitypicker.jsx";
import { checkoutAndDecrementStock } from "../services/checkout.js";
import { getProductById } from "../services/products.js";

export default function CartPage() {
  const { items, totalPriceCents, setQty, removeItem, clearCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleBuy = async () => {
    setErr("");
    setMsg("");
    if (items.length === 0) return;

    try {
      setBusy(true);

      // Quick re-check stock from Firestore to clamp quantities before checkout
      for (const it of items) {
        const p = await getProductById(it.productId);
        if (!p) throw new Error(`Missing product: ${it.productId}`);

        const stock = Number(p.quantity || 0);
        if (it.qty > stock) {
          // Clamp cart qty to stock
          setQty({
            productId: it.productId,
            variantId: it.variantId,
            qty: Math.max(1, stock),
            maxAllowedQty: stock,
          });
          throw new Error(`Cart updated: "${p.name}" stock changed. Please try again.`);
        }
      }

      await checkoutAndDecrementStock(items);
      clearCart();
      setMsg("Purchase complete ✅ Stock updated and cart cleared.");
    } catch (e) {
      setErr(e?.message || "Checkout failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="h1">Cart</div>
        <Link className="btn" to="/">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <div className="card">Your cart is empty.</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Variant</th>
                <th>Qty</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={`${it.productId}-${it.variantId || "no"}`}>
                  <td>
                    <div className="row">
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 10 }}
                      />
                      <div>
                        <div><strong>{it.name}</strong></div>
                        <div className="muted"><Money cents={it.priceCents} /> each</div>
                      </div>
                    </div>
                  </td>

                  <td className="muted">{it.variantId || "-"}</td>

                  <td>
                    <QuantityPicker
                      value={it.qty}
                      min={1}
                      max={99}
                      onChange={(n) =>
                        setQty({
                          productId: it.productId,
                          variantId: it.variantId,
                          qty: n,
                          // Cart page max is not known without product fetch;
                          // We clamp again during Buy. For strictness, fetch product per row if you want.
                          maxAllowedQty: 9999,
                        })
                      }
                    />
                  </td>

                  <td>
                    <Money cents={it.priceCents * it.qty} />
                  </td>

                  <td>
                    <button
                      className="btn"
                      onClick={() => removeItem({ productId: it.productId, variantId: it.variantId })}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="hr" />

          <div className="row" style={{ justifyContent: "space-between" }}>
            <div style={{ fontSize: 18 }}>
              Total: <strong><Money cents={totalPriceCents} /></strong>
            </div>

            <button className="btn primary" disabled={busy} onClick={handleBuy}>
              {busy ? "Processing..." : "Buy"}
            </button>
          </div>

          {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
          {err && <div style={{ marginTop: 10 }}>Error: {err}</div>}
        </div>
      )}
    </div>
  );
}