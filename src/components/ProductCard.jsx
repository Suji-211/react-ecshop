import { Link } from "react-router-dom";
import Money from "./Money.jsx";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <img className="product-img" src={product.imageUrl} alt={product.name} />
      <div className="h2">{product.name}</div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Money cents={product.priceCents} />
        <span className="muted">Stock: {product.quantity}</span>
      </div>
    </Link>
  );
}