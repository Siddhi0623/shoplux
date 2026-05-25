import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res  = await fetch(`${backendUrl}/api/user/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Invalid credentials");
      localStorage.setItem("adminToken", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            width: "88px", height: "88px", background: "#4f46e5",
            borderRadius: "24px", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 24px",
            boxShadow: "0 20px 60px rgba(79,70,229,0.4)"
          }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "36px" }}>S</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "30px", fontWeight: 800, margin: 0 }}>ShopLux Admin</h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>Sign in to manage your store</p>
        </div>

        {/* Card */}
        <form
          onSubmit={submit}
          style={{
            background: "#1e293b",
            border: "1px solid rgba(100,116,139,0.3)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email Address
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(51,65,85,0.6)", border: "1px solid #334155",
              borderRadius: "12px", padding: "0 16px"
            }}>
              <Mail size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shoplux.com"
                required
                style={{
                  flex: 1, padding: "16px 0", fontSize: "14px",
                  color: "#fff", background: "transparent", border: "none",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(51,65,85,0.6)", border: "1px solid #334155",
              borderRadius: "12px", padding: "0 16px"
            }}>
              <Lock size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  flex: 1, padding: "16px 0", fontSize: "14px",
                  color: "#fff", background: "transparent", border: "none",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: "13px", fontWeight: 500,
              padding: "12px 16px", borderRadius: "12px", marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", background: loading ? "#4338ca" : "#4f46e5",
              color: "#fff", fontWeight: 700, fontSize: "15px",
              padding: "16px", borderRadius: "12px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 8px 24px rgba(79,70,229,0.4)",
              marginTop: "8px"
            }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</>
              : "Sign In to Admin"}
          </button>
        </form>

        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "#475569", marginTop: "24px" }}>
          <ShieldCheck size={13} /> Secure admin access only
        </p>
      </div>
    </div>
  );
}
