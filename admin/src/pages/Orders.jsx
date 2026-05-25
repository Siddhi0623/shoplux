import { useState, useEffect } from "react";
import { ShoppingBag, Search, X, MapPin, CreditCard, Package, ChevronDown, ChevronRight } from "lucide-react";
import api, { backendUrl } from "../api";

const STATUSES = ["processing", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLE = {
  processing: { background: "#fef9c3", color: "#a16207",  dot: "#ca8a04" },
  confirmed:  { background: "#dbeafe", color: "#1d4ed8",  dot: "#3b82f6" },
  shipped:    { background: "#e0e7ff", color: "#4338ca",  dot: "#6366f1" },
  delivered:  { background: "#dcfce7", color: "#15803d",  dot: "#22c55e" },
  cancelled:  { background: "#fee2e2", color: "#dc2626",  dot: "#ef4444" },
};

const PAYMENT_LABELS = {
  card:   "💳 Card",
  upi:    "📱 UPI",
  paypal: "🅿️ PayPal",
  bank:   "🏦 Bank",
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { background: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      fontSize: "12px", fontWeight: 700, padding: "5px 12px",
      borderRadius: "999px", textTransform: "capitalize",
      background: s.background, color: s.color,
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function OrderDetail({ order, onClose, onStatusChange, updating }) {
  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `${backendUrl}/images/${img}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "relative", width: "480px", height: "100vh",
        background: "#fff", overflowY: "auto",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
      }}>

        {/* Panel Header */}
        <div style={{
          padding: "24px 28px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          position: "sticky", top: 0, background: "#fff", zIndex: 10,
        }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Order</p>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "4px 0 8px" }}>
              #{order._id.slice(-8).toUpperCase()}
            </h2>
            <StatusBadge status={order.orderStatus} />
          </div>
          <button
            onClick={onClose}
            style={{
              width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0",
              background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#64748b", flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "24px 28px", flex: 1 }}>

          {/* Update Status */}
          <div style={{
            background: "#f8fafc", borderRadius: "16px", padding: "18px 20px", marginBottom: "24px",
            border: "1px solid #f1f5f9",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
              Update Status
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {STATUSES.map((s) => {
                const active = order.orderStatus === s;
                const st = STATUS_STYLE[s];
                return (
                  <button
                    key={s}
                    disabled={updating || active}
                    onClick={() => onStatusChange(order._id, s)}
                    style={{
                      padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700,
                      border: active ? "none" : "1px solid #e2e8f0",
                      cursor: active || updating ? "default" : "pointer",
                      textTransform: "capitalize", transition: "all 0.15s",
                      background: active ? st.background : "#fff",
                      color: active ? st.color : "#64748b",
                      opacity: updating && !active ? 0.5 : 1,
                      outline: active ? `2px solid ${st.color}40` : "none",
                      outlineOffset: "1px",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
              Items ({order.orderItems?.length ?? 0})
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(order.orderItems || []).map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "#f8fafc", borderRadius: "14px", padding: "14px",
                  border: "1px solid #f1f5f9",
                }}>
                  <img
                    src={item.image ? getImageUrl(item.image) : "https://placehold.co/52x52?text=?"}
                    alt={item.name}
                    style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", background: "#e2e8f0", flexShrink: 0 }}
                    onError={(e) => { e.target.src = "https://placehold.co/52x52?text=?"; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name || "Product"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                      Qty: {item.qty ?? item.quantity ?? 1}
                      {item.size  && <span style={{ marginLeft: "8px" }}>· Size: {item.size}</span>}
                    </p>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                    ₹{Number(item.price || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div style={{
            background: "#f8fafc", borderRadius: "16px", padding: "18px 20px",
            marginBottom: "24px", border: "1px solid #f1f5f9",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
              Price Summary
            </p>
            {[
              { label: "Subtotal",  value: `₹${((order.totalPrice || 0) - (order.shippingPrice || 0)).toFixed(2)}` },
              { label: "Shipping",  value: order.shippingPrice > 0 ? `₹${Number(order.shippingPrice).toFixed(2)}` : "Free" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "10px", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Total</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>₹{Number(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <MapPin size={14} color="#94a3b8" />
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Shipping Address
                </p>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px 18px", border: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: "0 0 6px" }}>
                  {order.shippingAddress.fullName}
                </p>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.7 }}>
                  {order.shippingAddress.street && <>{order.shippingAddress.street}<br /></>}
                  {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}<br />
                  {order.shippingAddress.postalCode && <>{order.shippingAddress.postalCode}, </>}
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "8px" }}>
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CreditCard size={14} color="#94a3b8" />
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                Payment
              </p>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px 18px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>
                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
              </span>
              <span style={{
                fontSize: "12px", fontWeight: 700, padding: "4px 10px", borderRadius: "999px",
                background: order.isPaid ? "#dcfce7" : "#fef9c3",
                color: order.isPaid ? "#15803d" : "#a16207",
              }}>
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, textAlign: "center" }}>
            Placed on {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [updating,    setUpdating]    = useState(null);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    api.get("/api/order/all")
      .then(({ data }) => { if (data.success) setOrders(data.orders); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, orderStatus) => {
    setUpdating(id);
    try {
      const { data } = await api.put(`/api/order/status/${id}`, { orderStatus });
      if (data.success) {
        setOrders((prev) => prev.map((o) => o._id === id ? { ...o, orderStatus } : o));
        if (selectedOrder?._id === id) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || o.shippingAddress?.fullName || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.orderStatus === filter;
    return matchSearch && matchFilter;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.orderStatus === s).length;
    return acc;
  }, {});

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
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Orders</h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>{orders.length} total orders</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {STATUSES.map((s) => {
          const st = STATUS_STYLE[s];
          return (
            <div
              key={s}
              onClick={() => setFilter(filter === s ? "all" : s)}
              style={{
                background: "#fff", borderRadius: "16px", padding: "16px 18px",
                border: `1px solid ${filter === s ? st.color + "40" : "#f1f5f9"}`,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: filter === s ? `0 0 0 2px ${st.color}20` : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{counts[s]}</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: st.color, textTransform: "capitalize", margin: 0 }}>{s}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Pills + Search row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
            background: filter === "all" ? "#0f172a" : "#fff",
            color: filter === "all" ? "#fff" : "#64748b",
            boxShadow: filter === "all" ? "none" : "0 0 0 1px #e2e8f0",
          }}
        >
          All ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const active = filter === s;
          const st = STATUS_STYLE[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(active ? "all" : s)}
              style={{
                padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer", textTransform: "capitalize",
                background: active ? st.background : "#fff",
                color: active ? st.color : "#64748b",
                boxShadow: active ? `0 0 0 2px ${st.color}40` : "0 0 0 1px #e2e8f0",
              }}
            >
              {s} ({counts[s]})
            </button>
          );
        })}

        {/* Search inline */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px", background: "#fff", borderRadius: "12px", padding: "9px 16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", minWidth: "260px" }}>
          <Search size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders or customers…"
            style={{ flex: 1, fontSize: "13px", color: "#374151", border: "none", outline: "none", background: "transparent" }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0, display: "flex" }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: "64px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <ShoppingBag size={44} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}>No orders found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((h) => (
                    <th key={h} style={{ ...thStyle, textAlign: h === "" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr
                    key={order._id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none",
                      background: selectedOrder?._id === order._id ? "#fafbff" : "transparent",
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                    onClick={() => setSelectedOrder(order)}
                    onMouseEnter={(e) => { if (selectedOrder?._id !== order._id) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (selectedOrder?._id !== order._id) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Order ID */}
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "18px 24px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", margin: 0 }}>
                        {order.user?.name || order.shippingAddress?.fullName || "—"}
                      </p>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                        {order.shippingAddress?.city
                          ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                          : order.user?.email || ""}
                      </p>
                    </td>

                    {/* Items */}
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Package size={14} color="#94a3b8" />
                        <span style={{ fontSize: "14px", color: "#64748b" }}>
                          {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td style={{ padding: "18px 24px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      ₹{Number(order.totalPrice ?? 0).toFixed(2)}
                    </td>

                    {/* Payment */}
                    <td style={{ padding: "18px 24px", fontSize: "13px", color: "#64748b" }}>
                      {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "18px 24px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                        <select
                          value={order.orderStatus}
                          disabled={updating === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          style={{
                            appearance: "none", WebkitAppearance: "none",
                            paddingLeft: "10px", paddingRight: "26px", paddingTop: "6px", paddingBottom: "6px",
                            borderRadius: "10px", fontSize: "12px", fontWeight: 700,
                            border: "none", outline: "none", cursor: "pointer",
                            textTransform: "capitalize",
                            opacity: updating === order._id ? 0.5 : 1,
                            ...(STATUS_STYLE[order.orderStatus] || { background: "#f1f5f9", color: "#475569" }),
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} style={{ position: "absolute", right: "8px", pointerEvents: "none", opacity: 0.6 }} />
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "18px 24px", fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      })}
                    </td>

                    {/* Arrow */}
                    <td style={{ padding: "18px 16px 18px 0", textAlign: "right" }}>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "14px", textAlign: "center" }}>
        💡 Click any row to view full order details · Use the dropdown to update status
      </p>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateStatus}
          updating={updating === selectedOrder._id}
        />
      )}
    </div>
  );
}
