import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, type Product } from "../services/api";
import "../styles/Auth.css";
import "../styles/Products.css";

export default function Products() {
  const { user, token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.getProducts();
        setProducts(list);
        const map: Record<string, string> = {};
        list.forEach((p) => (map[p.id] = p.image || ""));
        setInputs(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка загрузки товаров");
      }
    };
    load();
  }, []);

  const handleChange = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (product: Product) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const updated = await api.updateProductImage(token, product.id, (inputs[product.id] || "").trim());
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось обновить картинку");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card products-card">
        <h1>Товары</h1>
        <div style={{ marginBottom: 12 }}>
          <button className="auth-button" onClick={() => navigate("/profile")}>
            Назад
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="products-list">
          {products.map((p) => (
            <div key={p.id} className="product-item">
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                {p.image ? (
                  <img className="product-image" src={p.image} alt={p.name} />
                ) : (
                  <div className="product-image placeholder">Нет изображения</div>
                )}
              </div>
              <div className="product-actions">
                <input
                  type="url"
                  value={inputs[p.id] || ""}
                  onChange={(e) => handleChange(p.id, e.target.value)}
                  placeholder="Вставьте URL для картинки"
                />
                <button
                  className="auth-button save-button"
                  disabled={loading}
                  onClick={() => handleSave(p)}
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
