import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, PlusSquare, ShoppingBag, LogOut } from "lucide-react";

const NAV = [
  { path: "/",             icon: LayoutDashboard, label: "Dashboard"   },
  { path: "/products",     icon: Package,         label: "Products"    },
  { path: "/products/add", icon: PlusSquare,      label: "Add Product" },
  { path: "/orders",       icon: ShoppingBag,     label: "Orders"      },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <aside style={{
      width: "240px", background: "#0f172a", minHeight: "100vh",
      display: "flex", flexDirection: "column", flexShrink: 0
    }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(100,116,139,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "38px", height: "38px", background: "#4f46e5",
            borderRadius: "10px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "16px" }}>S</span>
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: "15px", margin: 0, lineHeight: 1 }}>ShopLux</p>
            <p style={{ color: "#64748b", fontSize: "11px", marginTop: "3px" }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 14px", borderRadius: "12px",
                fontSize: "14px", fontWeight: 600, textDecoration: "none",
                transition: "all 0.15s",
                background: active ? "#4f46e5" : "transparent",
                color: active ? "#fff" : "#94a3b8",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(100,116,139,0.2)" }}>
        <button
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "12px",
            padding: "11px 14px", borderRadius: "12px",
            fontSize: "14px", fontWeight: 600, color: "#94a3b8",
            background: "transparent", border: "none", cursor: "pointer",
            transition: "all 0.15s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
