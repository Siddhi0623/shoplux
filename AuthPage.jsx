import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useShop } from "./context/ShopContext";
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
} from "lucide-react";

// ── Real API calls to backend ─────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function apiLogin(email, password) {
  const res  = await fetch(`${BASE_URL}/api/user/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Login failed.");
  // backend returns token + user { name, email }
  return { token: data.token, user: { name: data.user?.name || "", email } };
}

async function apiRegister(name, email, password) {
  const res  = await fetch(`${BASE_URL}/api/user/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Registration failed.");
  return { token: data.token, user: { name, email } };
}

// ── Validation rules ──────────────────────────────────────────────────────
const rules = {
  name:     (v) => (!v.trim() ? "Name is required." : v.trim().length < 2 ? "At least 2 characters." : ""),
  email:    (v) => (!v.trim() ? "Email is required." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email." : ""),
  phone:    (v) => (v && !/^\+?[\d\s\-()]{7,15}$/.test(v) ? "Enter a valid phone number." : ""),
  password: (v) =>
    !v ? "Password is required."
    : v.length < 8 ? "At least 8 characters."
    : !/[A-Z]/.test(v) ? "Include at least one uppercase letter."
    : !/[0-9]/.test(v) ? "Include at least one number."
    : !/[^A-Za-z0-9]/.test(v) ? "Include at least one special character."
    : "",
  confirm: (v, pw) => (!v ? "Please confirm your password." : v !== pw ? "Passwords do not match." : ""),
};

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters",        pass: password.length >= 8 },
    { label: "Uppercase letter",      pass: /[A-Z]/.test(password) },
    { label: "Number",                pass: /[0-9]/.test(password) },
    { label: "Special character",     pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const bar   = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][score - 1] ?? "bg-gray-200";
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? bar : "bg-gray-200"}`} />
        ))}
        <span className={`text-[11px] font-bold ml-1 ${bar.replace("bg-", "text-")}`}>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1 text-[11px] ${c.pass ? "text-green-600" : "text-gray-400"}`}>
            <CheckCircle2 size={11} className={c.pass ? "text-green-500" : "text-gray-300"} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, name, type = "text", placeholder, value, onChange, error, hint, rightSlot }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
      </label>
      <div className={`flex items-center border rounded-xl px-3.5 gap-2.5 transition-all duration-200 ${
        error ? "border-red-400 bg-red-50" : value ? "border-indigo-400 bg-white" : "border-gray-200 bg-gray-50 focus-within:border-indigo-400 focus-within:bg-white"
      }`}>
        <Icon size={15} className={error ? "text-red-400" : "text-gray-400 shrink-0"} />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name}
          className="flex-1 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
        {rightSlot}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onSuccess }) {
  const [form,   setForm]   = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [show,   setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: rules[name]?.(value) ?? "" }));
    setApiErr("");
  };

  const validate = () => {
    const e = {
      email:    rules.email(form.email),
      password: rules.password(form.password),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiErr("");
    try {
      const { token, user } = await apiLogin(form.email, form.password);
      onSuccess(user, token);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field icon={Mail} label="Email Address" name="email" type="email"
        placeholder="you@example.com" value={form.email} onChange={handle} error={errors.email} />

      <div>
        <Field icon={Lock} label="Password" name="password"
          type={show ? "text" : "password"} placeholder="Enter your password"
          value={form.password} onChange={handle} error={errors.password}
          rightSlot={
            <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-600 shrink-0">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-gray-500">
          <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-600" />
          Remember me
        </label>
        <button type="button" className="text-indigo-600 hover:underline font-medium">
          Forgot password?
        </button>
      </div>

      {apiErr && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-3.5 py-3 rounded-xl">
          <AlertCircle size={14} className="shrink-0" /> {apiErr}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-200 text-sm"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <>Sign In <ArrowRight size={15} /></>}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-indigo-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </form>
  );
}

// ── Register Form ─────────────────────────────────────────────────────────
function RegisterForm({ onSwitch, onSuccess }) {
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [agreed,  setAgreed]  = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      const err = name === "confirm" ? rules.confirm(value, form.password) : rules[name]?.(value) ?? "";
      setErrors((p) => ({ ...p, [name]: err }));
    }
    setApiErr("");
  };

  const validate = () => {
    const e = {
      name:     rules.name(form.name),
      email:    rules.email(form.email),
      phone:    rules.phone(form.phone),
      password: rules.password(form.password),
      confirm:  rules.confirm(form.confirm, form.password),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!agreed) { setApiErr("Please accept the Terms & Privacy Policy."); return; }
    setLoading(true);
    setApiErr("");
    try {
      const { token, user } = await apiRegister(form.name, form.email, form.password);
      onSuccess(user, token);
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Field icon={User} label="Full Name" name="name" placeholder="John Doe"
            value={form.name} onChange={handle} error={errors.name} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Field icon={Phone} label="Phone (optional)" name="phone" type="tel"
            placeholder="+1 555 000 0000" value={form.phone} onChange={handle} error={errors.phone} />
        </div>
      </div>

      <Field icon={Mail} label="Email Address" name="email" type="email"
        placeholder="you@example.com" value={form.email} onChange={handle} error={errors.email} />

      <div>
        <Field icon={Lock} label="Password" name="password"
          type={showPw ? "text" : "password"} placeholder="Create a strong password"
          value={form.password} onChange={handle} error={errors.password}
          rightSlot={
            <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 shrink-0">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <PasswordStrength password={form.password} />
      </div>

      <Field icon={Lock} label="Confirm Password" name="confirm"
        type={showCf ? "text" : "password"} placeholder="Re-enter your password"
        value={form.confirm} onChange={handle} error={errors.confirm}
        rightSlot={
          <button type="button" onClick={() => setShowCf(!showCf)} className="text-gray-400 hover:text-gray-600 shrink-0">
            {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <div
          onClick={() => setAgreed(!agreed)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
            agreed ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
          }`}
        >
          {agreed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className="text-xs text-gray-500 leading-relaxed">
          I agree to the{" "}
          <button type="button" className="text-indigo-600 hover:underline font-medium">Terms of Service</button>
          {" "}and{" "}
          <button type="button" className="text-indigo-600 hover:underline font-medium">Privacy Policy</button>
        </span>
      </label>

      {apiErr && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-3.5 py-3 rounded-xl">
          <AlertCircle size={14} className="shrink-0" /> {apiErr}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-200 text-sm"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account…</> : <>Create Account <ArrowRight size={15} /></>}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────
function SuccessScreen({ user, isNew }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 size={36} className="text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-gray-900">
          {isNew ? "Account created!" : "Welcome back!"}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Signed in as <span className="font-semibold text-gray-600">{user.email}</span>
        </p>
      </div>
      <div className="w-full space-y-2 pt-2">
        <button
          onClick={() => navigate("/")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-200"
        >
          Go to Home
        </button>
        <button
          onClick={() => navigate("/collection")}
          className="w-full border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 font-semibold py-3 rounded-xl text-sm transition-all"
        >
          Browse Collection
        </button>
      </div>
    </div>
  );
}

// ── Main Auth Page ────────────────────────────────────────────────────────
export default function AuthPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { saveToken } = useShop();

  const initialMode = new URLSearchParams(location.search).get("tab") === "register" ? "register" : "login";
  const [mode,    setMode]    = useState(initialMode);
  const [success, setSuccess] = useState(null);

  // Called after successful login/register
  const handleSuccess = (user, token) => {
    saveToken(token, user.name);   // updates ShopContext + localStorage key "token"
    setSuccess({ user, isNew: mode === "register" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <Link to="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <span className="text-2xl font-extrabold text-white">ShopLux</span>
        </Link>
        <div className="relative z-10 max-w-xs text-center space-y-5">
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            {mode === "login" ? "Welcome back 👋" : "Join ShopLux today 🛍️"}
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            {mode === "login"
              ? "Sign in to access your orders, wishlist, and exclusive member deals."
              : "Create an account and unlock exclusive deals, faster checkout, and order tracking."}
          </p>
          <div className="flex flex-col gap-3 pt-2">
            {["12K+ Products", "Free returns", "Secure checkout", "24/7 Support"].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-indigo-200">
                <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-extrabold text-gray-900 text-lg">ShopLux</span>
          </Link>

          {success ? (
            <SuccessScreen user={success.user} isNew={success.isNew} />
          ) : (
            <>
              {/* Tab toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                {["login", "register"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 capitalize ${
                      mode === m
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
                  {mode === "login" ? "Sign in to your account" : "Create an account"}
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  {mode === "login"
                    ? "Enter your credentials to continue."
                    : "Fill in the details below to get started."}
                </p>

                {mode === "login" ? (
                  <LoginForm
                    onSwitch={() => setMode("register")}
                    onSuccess={handleSuccess}
                  />
                ) : (
                  <RegisterForm
                    onSwitch={() => setMode("login")}
                    onSuccess={handleSuccess}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
