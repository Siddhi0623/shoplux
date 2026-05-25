import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package, ChevronDown, ChevronUp, ShoppingBag,
  MapPin, CreditCard, Clock, CheckCircle2, Truck,
  XCircle, RotateCcw,
} from "lucide-react";
import { useShop } from "./context/ShopContext";
import api, { backendUrl } from "./api";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  processing: { label: "Processing",  color: "#a16207",  bg: "#fef9c3", icon: RotateCcw  },
  confirmed:  { label: "Confirmed",   color: "#1d4ed8",  bg: "#dbeafe", icon: CheckCircle2 },
  shipped:    { label: "Shipped",     color: "#4338ca",  bg: "#e0e7ff", icon: Truck       },
  delivered:  { label: "Delivered",   color: "#15803d",  bg: "#dcfce7", icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",   color: "#dc2626",  bg: "#fee2e2", icon: XCircle     },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: "#475569", bg: "#f1f5f9", icon: Clock };
  const Icon = s.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "12px", fontWeight: 700, padding: "4px 12px",
      borderRadius: "999px", textTransform: "capitalize",
      background: s.bg, color: s.color,
    }}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function getImageUrl(img) {
  if (!img) return "https://placehold.co/56x56?text=?";
  return img.startsWith("http") ? img : `${backendUrl}/images/${img}`;
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(order.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const items = order.orderItems || [];

  return (
    <div style={{
      background: "#fff", borderRadius: "20px",
      border: "1px solid #f1f5f9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden", marginBottom: "16px",
    }}>

      {/* ── Card Header ── */}
      <div style={{
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
        borderBottom: expanded ? "1px solid #f1f5f9" : "none",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "44px", height: "44px", background: "#eef2ff",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Package size={20} color="#4f46e5" />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={11} /> {date}
            </p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <StatusBadge status={order.orderStatus} />
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              ₹{Number(order.totalPrice || 0).toFixed(2)}
            </p>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: "32px", height: "32px", borderRadius: "10px",
              border: "1px solid #e2e8f0", background: "#f8fafc",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b", flexShrink: 0,
            }}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div style={{ padding: "20px 24px" }}>

          {/* Items */}
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            Items
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {items.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: "#f8fafc", borderRadius: "14px", padding: "12px 14px",
              }}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", background: "#e2e8f0", flexShrink: 0 }}
                  onError={(e) => { e.target.src = "https://placehold.co/52x52?text=?"; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                    Qty: {item.qty ?? item.quantity ?? 1}
                    {item.selectedSize  && <span style={{ marginLeft: "8px" }}>· Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span style={{ marginLeft: "8px" }}>· Color: {item.selectedColor}</span>}
                  </p>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                  ₹{Number(item.price || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom row: shipping + payment + totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Shipping */}
            {order.shippingAddress && (
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "14px 16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={11} /> Shipping To
                </p>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", margin: 0 }}>
                  {order.shippingAddress.fullName}
                </p>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", lineHeight: 1.6 }}>
                  {order.shippingAddress.street && <>{order.shippingAddress.street}, </>}
                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                  {order.shippingAddress.zip} · {order.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Payment + totals */}
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "14px 16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "5px" }}>
                <CreditCard size={11} /> Summary
              </p>
              {[
                { label: "Subtotal",  value: `₹${Number(order.subtotal || 0).toFixed(2)}` },
                { label: "Shipping",  value: order.shippingPrice > 0 ? `₹${Number(order.shippingPrice).toFixed(2)}` : "Free" },
                { label: "Tax",       value: `₹${Number(order.tax || 0).toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{label}</span>
                  <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Total</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#4f46e5" }}>₹{Number(order.totalPrice || 0).toFixed(2)}</span>
              </div>

              {/* Payment status */}
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Payment</span>
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px",
                  background: order.isPaid ? "#dcfce7" : "#fef9c3",
                  color: order.isPaid ? "#15803d" : "#a16207",
                }}>
                  {order.isPaid ? "✓ Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const { token } = useShop();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get("/api/order/myorders")
      .then(({ data }) => { if (data.success) setOrders(data.orders); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const FILTERS = ["all", ...Object.keys(STATUS)];

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  // ── Not logged in ──
  if (!token) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center", padding: "24px" }}>
        <div style={{ width: "72px", height: "72px", background: "#eef2ff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShoppingBag size={32} color="#4f46e5" />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Sign in to view your orders</h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>You need to be logged in to see your order history.</p>
        <Link to="/login" style={{
          background: "#4f46e5", color: "#fff", padding: "12px 28px", borderRadius: "999px",
          fontWeight: 700, fontSize: "14px", textDecoration: "none",
        }}>
          Login / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px 60px" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", margin: 0 }}>My Orders</h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>
          {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
        </p>
      </div>

      {/* Filter Pills */}
      {orders.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            const s = STATUS[f];
            const count = f === "all" ? orders.length : orders.filter((o) => o.orderStatus === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
                  border: "none", cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                  background: active ? (s ? s.bg : "#0f172a") : "#fff",
                  color: active ? (s ? s.color : "#fff") : "#64748b",
                  boxShadow: active ? "none" : "0 0 0 1px #e2e8f0",
                }}
              >
                {f === "all" ? "All" : s?.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "64px", textAlign: "center", color: "#94a3b8" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          Loading your orders…
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ width: "72px", height: "72px", background: "#f1f5f9", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShoppingBag size={32} color="#cbd5e1" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>No orders yet</h3>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>Looks like you haven't placed any orders. Start shopping!</p>
          <Link to="/collection" style={{
            background: "#4f46e5", color: "#fff", padding: "12px 28px", borderRadius: "999px",
            fontWeight: 700, fontSize: "14px", textDecoration: "none",
          }}>
            Browse Products
          </Link>
        </div>
      )}

      {/* No results for filter */}
      {!loading && orders.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>
          No {filter} orders found.
        </div>
      )}

      {/* Order list */}
      {!loading && filtered.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
