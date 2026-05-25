import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Package, Check, X } from "lucide-react";
import api, { backendUrl } from "../api";

function StockCell({ product, onStockUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(String(product.stock ?? 0));
  const [saving,  setSaving]  = useState(false);
  const inputRef = useRef(null);

  const open = () => {
    setValue(String(product.stock ?? 0));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const cancel = () => {
    setValue(String(product.stock ?? 0));
    setEditing(false);
  };

  const save = async () => {
    const newStock = parseInt(value, 10);
    if (isNaN(newStock) || newStock < 0) { cancel(); return; }
    if (newStock === product.stock) { setEditing(false); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("stock", newStock);
      // carry required fields so backend validation passes
      fd.append("name",        product.name);
      fd.append("price",       product.price);
      fd.append("description", product.description || "");
      fd.append("category",    product.category);
      const { data } = await api.put(`/api/product/update/${product._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        onStockUpdate(product._id, newStock);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter")  save();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          ref={inputRef}
          type="number" min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          style={{
            width: "72px", padding: "6px 10px", fontSize: "14px",
            border: "2px solid #4f46e5", borderRadius: "8px",
            outline: "none", color: "#1e293b", fontWeight: 600,
          }}
        />
        <button
          onClick={save} disabled={saving}
          style={{ width: "28px", height: "28px", background: "#4f46e5", border: "none", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {saving ? <div style={{ width: "12px", height: "12px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <Check size={13} color="#fff" />}
        </button>
        <button
          onClick={cancel}
          style={{ width: "28px", height: "28px", background: "#f1f5f9", border: "none", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={13} color="#64748b" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={open}
      title="Click to edit stock"
      style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "5px 8px", borderRadius: "8px", transition: "background 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <span style={{ fontSize: "15px", fontWeight: 700, color: product.stock === 0 ? "#ef4444" : "#1e293b" }}>
        {product.stock ?? 0}
      </span>
      <Pencil size={12} color="#94a3b8" />
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.delete(`/api/product/delete/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleStockUpdate = (id, newStock) => {
    setProducts((prev) =>
      prev.map((p) => p._id === id ? { ...p, stock: newStock, inStock: newStock > 0 } : p)
    );
  };

  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `${backendUrl}/images/${img}`;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const card = {
    background: "#fff", borderRadius: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden",
  };

  const thStyle = {
    textAlign: "left", padding: "14px 24px",
    fontSize: "11px", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.06em",
    whiteSpace: "nowrap", background: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Products</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>{products.length} total products</p>
        </div>
        <Link
          to="/products/add"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#4f46e5", color: "#fff", fontSize: "14px", fontWeight: 600,
            padding: "12px 20px", borderRadius: "12px", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
          }}
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div style={{ ...card, marginBottom: "16px", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px" }}>
          <Search size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category…"
            style={{ flex: 1, fontSize: "14px", color: "#374151", border: "none", outline: "none", background: "transparent" }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ fontSize: "13px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: "64px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading products…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <Package size={44} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>No products found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ ...thStyle, textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <tr key={product._id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none" }}>

                    {/* Product */}
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          style={{ width: "50px", height: "50px", borderRadius: "12px", objectFit: "cover", background: "#f1f5f9", flexShrink: 0 }}
                          onError={(e) => { e.target.src = "https://placehold.co/50x50?text=?"; }}
                        />
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: 0, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {product.name}
                          </p>
                          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                            ID: {product._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569", background: "#f1f5f9", padding: "4px 10px", borderRadius: "8px" }}>
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "18px 24px" }}>
                      <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        ₹{Number(product.price).toFixed(2)}
                      </p>
                    </td>

                    {/* Stock — inline editable */}
                    <td style={{ padding: "18px 24px" }}>
                      <StockCell product={product} onStockUpdate={handleStockUpdate} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 700, padding: "5px 12px", borderRadius: "999px",
                        background: product.inStock ? "#dcfce7" : "#fee2e2",
                        color: product.inStock ? "#15803d" : "#dc2626",
                      }}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <Link
                          to={`/products/edit/${product._id}`}
                          title="Edit product"
                          style={{
                            width: "36px", height: "36px", display: "flex", alignItems: "center",
                            justifyContent: "center", borderRadius: "10px",
                            border: "1px solid #e2e8f0", color: "#64748b", textDecoration: "none",
                            background: "#fff",
                          }}
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          title="Delete product"
                          style={{
                            width: "36px", height: "36px", display: "flex", alignItems: "center",
                            justifyContent: "center", borderRadius: "10px",
                            border: "1px solid #e2e8f0", color: "#64748b",
                            background: "#fff", cursor: deleting === product._id ? "not-allowed" : "pointer",
                            opacity: deleting === product._id ? 0.4 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hint */}
      <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "14px", textAlign: "center" }}>
        💡 Click on any stock number to edit it inline
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
