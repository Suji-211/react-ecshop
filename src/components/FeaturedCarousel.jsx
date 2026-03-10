import { Link } from "react-router-dom";
import Money from "./Money.jsx";

export default function FeaturedCarousel({ products }) {
  if (!products?.length) return null;

  return (
    <div className="card">
      <div className="h2">Featured</div>
      <div className="carousel">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="card">
            <img className="product-img" src={p.imageUrl} alt={p.name} />
            <div style={{ marginTop: 8 }}>
              <div><strong>{p.name}</strong></div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <Money cents={p.priceCents} />
                <span className="muted">Stock: {p.quantity}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}