import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="loader">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="product-list">
        {products.map((p) => (
          <Link key={p._id} to={`/products/${p._id}`} className="product-card">
            <div className="product-thumb">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} />
              ) : (
                <div className="placeholder">이미지 없음</div>
              )}
            </div>
            <div className="product-name">{p.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
