import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Loader2, Check, ArrowLeft } from "lucide-react";
import api, { backendUrl } from "../api";

// Mirrors the main website's mega-menu structure exactly
const MENU_DATA = {
  Men: {
    Clothing:    ["T-Shirts", "Shirts", "Jackets", "Jeans", "Shorts", "Suits"],
    Shoes:       ["Sneakers", "Boots", "Loafers", "Sandals", "Formal", "Running"],
    Accessories: ["Watches", "Belts", "Sunglasses", "Wallets", "Hats", "Bags"],
  },
  Women: {
    Clothing:    ["Dresses", "Tops", "Blazers", "Jeans", "Skirts", "Coats"],
    Shoes:       ["Heels", "Flats", "Sneakers", "Boots", "Sandals", "Mules"],
    Accessories: ["Handbags", "Jewelry", "Scarves", "Sunglasses", "Hats", "Belts"],
  },
  Kids: {
    Boys:  ["T-Shirts", "Shorts", "Sneakers", "Jackets", "Jeans", "Hoodies"],
    Girls: ["Dresses", "Tops", "Shoes", "Skirts", "Leggings", "Coats"],
    Baby:  ["Onesies", "Rompers", "Shoes", "Bibs", "Sleepwear", "Sets"],
  },
  Electronics: {
    Phones:  ["Smartphones", "Cases", "Chargers", "Screen Guards", "Earphones", "Power Banks"],
    Laptops: ["Gaming", "Business", "Ultrabooks", "Accessories", "Monitors", "Keyboards"],
    Audio:   ["Headphones", "Earbuds", "Speakers", "Soundbars", "Microphones", "DACs"],
  },
  Sale: {},
};

const TOP_CATEGORIES = Object.keys(MENU_DATA);

const inputStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "13px 16px",
  fontSize: "14px",
  color: "#1e293b",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function Field({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: "11px", color: "#94a3b8" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function AddProduct() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [form, setForm] = useState({
    name: "", price: "", description: "",
    category: "Men", subCategory: "", stock: "",
  });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  // Sections within the selected top-level category  e.g. { Clothing: [...], Shoes: [...] }
  const sections     = MENU_DATA[form.category] || {};
  const sectionKeys  = Object.keys(sections);   // e.g. ["Clothing", "Shoes", "Accessories"]
  const hasSections  = sectionKeys.length > 0;

  // When category changes, reset subCategory
  const handleCategory = (e) => {
    setForm((prev) => ({ ...prev, category: e.target.value, subCategory: "" }));
  };

  // Load existing product when editing
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/product/${id}`).then(({ data }) => {
      if (!data.success) return;
      const p = data.product;
      setForm({
        name:        p.name,
        price:       p.price,
        description: p.description,
        category:    p.category,
        subCategory: p.subCategory || "",
        stock:       p.stock ?? "",
      });
      if (p.image) {
        setPreview(p.image.startsWith("http") ? p.image : `${backendUrl}/images/${p.image}`);
      }
    }).catch(console.error);
  }, [id]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate image on new product
    if (!isEdit && !image) {
      setError("Please upload a product image.");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name",        form.name);
      fd.append("price",       form.price);
      fd.append("description", form.description);
      fd.append("category",    form.category);
      fd.append("subCategory", form.subCategory);
      fd.append("stock",       form.stock || 0);
      if (image) fd.append("image", image);

      const { data } = isEdit
        ? await api.put(`/api/product/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post("/api/product/add", fd,        { headers: { "Content-Type": "multipart/form-data" } });

      if (!data.success) throw new Error(data.message || "Failed to save product");
      setSuccess(true);
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "36px 40px", maxWidth: "640px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
        <button
          onClick={() => navigate("/products")}
          style={{
            width: "42px", height: "42px", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "12px", border: "1px solid #e2e8f0",
            color: "#64748b", background: "#fff", cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "5px" }}>
            {isEdit ? "Update product details" : "Fill in the details to add a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={submit}>

        {/* ── Image Upload ── */}
        <div style={{
          background: "#fff", borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
          padding: "28px", marginBottom: "20px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Product Image
          </p>

          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${preview ? "#a5b4fc" : "#e2e8f0"}`,
              borderRadius: "16px", cursor: "pointer",
              background: preview ? "#eef2ff" : "#f8fafc",
              overflow: "hidden", transition: "all 0.2s",
            }}
          >
            {preview ? (
              <div style={{ position: "relative" }}>
                <img src={preview} alt="preview"
                  style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(""); setImage(null); }}
                  style={{
                    position: "absolute", top: "12px", right: "12px",
                    width: "32px", height: "32px", background: "#fff",
                    borderRadius: "50%", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#374151",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "56px 24px", gap: "12px",
              }}>
                <div style={{
                  width: "60px", height: "60px", background: "#f1f5f9",
                  borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Upload size={26} color="#94a3b8" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 600, margin: 0 }}>Click to upload image</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        </div>

        {/* ── Product Details ── */}
        <div style={{
          background: "#fff", borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
          padding: "28px", marginBottom: "20px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Product Details
          </p>

          {/* Title */}
          <Field label="Title" required>
            <input
              name="name" value={form.name} onChange={handle} required
              placeholder="e.g. Classic White T-Shirt"
              style={inputStyle}
            />
          </Field>

          {/* Price + Stock side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Price (₹)" required>
              <input
                name="price" value={form.price} onChange={handle}
                type="number" min="0" step="0.01" required placeholder="0.00"
                style={inputStyle}
              />
            </Field>
            <Field label="Stock" hint="units available" required>
              <input
                name="stock" value={form.stock} onChange={handle}
                type="number" min="0" required placeholder="0"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* ── Category ── */}
          <Field label="Category" required>
            <select name="category" value={form.category} onChange={handleCategory} style={inputStyle}>
              {TOP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          {/* ── Sub Category (cascading) ── */}
          {hasSections && (
            <Field label="Sub Category" required>
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handle}
                required={hasSections}
                style={inputStyle}
              >
                <option value="">— Select sub category —</option>
                {sectionKeys.map((section) => (
                  <optgroup key={section} label={`── ${section} ──`}>
                    {sections[section].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          )}

          {/* Description */}
          <Field label="Description" required>
            <textarea
              name="description" value={form.description} onChange={handle} required
              rows={5} placeholder="Describe the product…"
              style={{ ...inputStyle, resize: "vertical", marginBottom: 0 }}
            />
          </Field>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
            fontSize: "14px", fontWeight: 500, padding: "14px 18px",
            borderRadius: "14px", marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", paddingBottom: "40px" }}>
          <button
            type="button"
            onClick={() => navigate("/products")}
            style={{
              padding: "14px 24px", border: "1px solid #e2e8f0", color: "#475569",
              borderRadius: "12px", fontSize: "14px", fontWeight: 600,
              background: "#fff", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "15px",
              border: "none", cursor: loading || success ? "not-allowed" : "pointer",
              background: success ? "#22c55e" : "#4f46e5",
              color: "#fff",
              boxShadow: success ? "0 4px 14px rgba(34,197,94,0.35)" : "0 4px 14px rgba(79,70,229,0.35)",
              transition: "all 0.2s",
            }}
          >
            {loading  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
            : success ? <><Check size={16} /> Saved!</>
            : isEdit  ? "Update Product"
            : "Add Product"}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
