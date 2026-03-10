import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products }) {
  if (!products?.length) return <div className="card">No products.</div>;
  return (
    <div className="grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}