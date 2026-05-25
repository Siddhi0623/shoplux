import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, IndianRupee, Clock, TrendingUp, ArrowRight } from "lucide-react";
import api from "../api";

const STATUS_STYLE = {
  processing: { background: "#fef9c3", color: "#a16207" },
  confirmed:  { background: "#dbeafe", color: "#1d4ed8" },
  shipped:    { background: "#e0e7ff", color: "#4338ca" },
  delivered:  { background: "#dcfce7", color: "#15803d" },
  cancelled:  { background: "#fee2e2", color: "#dc2626" },
};

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/product/list"),
      api.get("/api/order/all"),
    ]).then(([pRes, oRes]) => {
      if (pRes.data.success) setProducts(pRes.data.products);
      if (oRes.data.success) setOrders(oRes.data.orders);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const pending = orders.filter((o) => o.orderStatus === "processing").length;

  const stats = [
    { label: "Total Products",  value: products.length,       icon: Package,     iconBg: "#eef2ff", iconColor: "#4f46e5", trend: "+12%" },
    { label: "Total Orders",    value: orders.length,         icon: ShoppingBag, iconBg: "#f0fdf4", iconColor: "#16a34a", trend: "+8%"  },
    { label: "Revenue",         value: `₹${revenue.toFixed(0)}`, icon: IndianRupee, iconBg: "#fefce8", iconColor: "#ca8a04", trend: "+23%" },
    { label: "Pending Orders",  value: pending,               icon: Clock,       iconBg: "#fff7ed", iconColor: "#ea580c", trend: null   },
  ];

  return (
    <div style={{ padding: "36px 40px", maxWidth: "1200px" }}>

      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: "15px", color: "#94a3b8", marginTop: "6px" }}>Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "36px" }}>
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor, trend }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: "20px", padding: "28px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{
                width: "52px", height: "52px", background: iconBg,
                borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={22} color={iconColor} />
              </div>
              {trend && (
                <span style={{
                  fontSize: "12px", fontWeight: 700, color: "#16a34a",
                  background: "#f0fdf4", padding: "4px 10px", borderRadius: "999px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}>
                  <TrendingUp size={11} /> {trend}
                </span>
              )}
            </div>
            <p style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {loading ? "—" : value}
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "6px" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{
        background: "#fff", borderRadius: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #f1f5f9", overflow: "hidden"
      }}>
        {/* Table Header */}
        <div style={{
          padding: "24px 28px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent Orders</h2>
          <Link to="/orders" style={{
            fontSize: "13px", color: "#4f46e5", fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: "4px"
          }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No orders yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "14px 28px",
                      fontSize: "11px", fontWeight: 700, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap"
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((order, i) => (
                  <tr key={order._id} style={{
                    borderBottom: i < Math.min(orders.length, 6) - 1 ? "1px solid #f8fafc" : "none",
                  }}>
                    <td style={{ padding: "18px 28px", fontFamily: "monospace", fontSize: "13px", color: "#94a3b8" }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: "18px 28px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                        {order.user?.name || order.shippingAddress?.fullName || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 28px", fontSize: "14px", color: "#64748b" }}>
                      {order.orderItems?.length ?? 0}
                    </td>
                    <td style={{ padding: "18px 28px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      ₹{order.totalPrice?.toFixed(2)}
                    </td>
                    <td style={{ padding: "18px 28px" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 700, padding: "5px 12px",
                        borderRadius: "999px", textTransform: "capitalize",
                        ...(STATUS_STYLE[order.orderStatus] || { background: "#f1f5f9", color: "#475569" })
                      }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: "18px 28px", fontSize: "13px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
