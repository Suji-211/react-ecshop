import { useEffect, useState } from "react";
import { getAllProducts, getFeaturedProducts } from "../services/products.js";
import FeaturedCarousel from "../components/FeaturedCarousel.jsx";
import ProductGrid from "../components/ProductGrid.jsx";

export default function HomePage() {
  const [all, setAll] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [allProducts, featuredProducts] = await Promise.all([
          getAllProducts(),
          getFeaturedProducts(),
        ]);

        console.log("All products:", allProducts);
        console.log("Featured products:", featuredProducts);
        if (!alive) return;
        setAll(allProducts);
        setFeatured(featuredProducts);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load products.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="card">Loading...</div>;
  if (err) return <div className="card">Error: {err}</div>;

  return (
    <div>
      <div className="h1">Home</div>
      <FeaturedCarousel products={featured} />
      <div className="h2">All Products</div>
      <ProductGrid products={all} />
    </div>
  );
}