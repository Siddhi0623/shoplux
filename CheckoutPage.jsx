import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, ChevronDown, CreditCard, Smartphone,
  Landmark, ShieldCheck, Lock, CheckCircle2, MapPin, Loader2,
  Wallet,
} from "lucide-react";
import { useShop } from "./context/ShopContext";
import api from "./api";

// ── Dynamically load Razorpay checkout script ────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STEPS = ["Shipping", "Payment", "Review"];

const SHIPPING_OPTIONS = [
  { id: "standard",  label: "Standard",  duration: "5–7 days", price: 0     },
  { id: "express",   label: "Express",   duration: "2–3 days", price: 9.99  },
  { id: "overnight", label: "Overnight", duration: "Next day", price: 19.99 },
];

// Razorpay supports all of these natively in its popup
const SUPPORTED_METHODS = [
  { icon: CreditCard, label: "Cards",       sub: "Visa, Mastercard, Amex, RuPay" },
  { icon: Smartphone, label: "UPI",         sub: "GPay, PhonePe, Paytm, BHIM"   },
  { icon: Landmark,   label: "Netbanking",  sub: "All major Indian banks"        },
  { icon: Wallet,     label: "Wallets",     sub: "Paytm, Amazon Pay & more"      },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              i < current     ? "bg-indigo-600 text-white"
              : i === current ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
              : "bg-gray-100 text-gray-400"
            }`}>
              {i < current ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-semibold ${i <= current ? "text-indigo-600" : "text-gray-400"}`}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-20 h-0.5 mx-1 mb-5 transition-colors duration-300 ${i < current ? "bg-indigo-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, name, type = "text", placeholder, value, onChange, required, half }) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cartItems, getTotal, clearCart, getImageUrl, token } = useShop();
  const navigate = useNavigate();

  const [step,        setStep]       = useState(0);
  const [shipping,    setShipping]   = useState(SHIPPING_OPTIONS[0]);
  const [placed,      setPlaced]     = useState(false);
  const [placing,     setPlacing]    = useState(false);
  const [placeError,  setPlaceError] = useState("");
  const [openSummary, setOpenSummary] = useState(false);
  const [paidWith,    setPaidWith]   = useState("");   // stores payment method label after success

  const [address, setAddress] = useState({
    firstName: "", lastName: "",  email:   "",
    phone:     "", address:  "",  apt:     "",
    city:      "", state:    "",  zip:     "",
    country:   "India",
  });

  const handleAddress = (e) =>
    setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));

  const subtotal = getTotal();
  const shipCost = shipping.price;
  const tax      = subtotal * 0.08;
  const total    = subtotal + shipCost + tax;

  // ── Build order payload (shared between paid / COD flows) ─────────────────
  const buildPayload = (extra = {}) => ({
    orderItems: cartItems.map((item) => ({
      product:       item.productId,
      name:          item.name,
      price:         item.price,
      qty:           item.qty,
      selectedSize:  item.selectedSize  || "",
      selectedColor: item.selectedColor || "",
      image:         item.image         || "",
    })),
    shippingAddress: {
      fullName: `${address.firstName} ${address.lastName}`.trim(),
      email:    address.email,
      phone:    address.phone   || "",
      street:   address.address + (address.apt ? `, ${address.apt}` : ""),
      city:     address.city,
      state:    address.state,
      zip:      address.zip,
      country:  address.country,
    },
    shippingMethod: shipping.id,
    paymentMethod:  "card",       // Razorpay covers all methods
    subtotal,
    shippingPrice:  shipCost,
    tax,
    totalPrice:     total,
    ...extra,
  });

  // ── Razorpay checkout ─────────────────────────────────────────────────────
  const handlePayNow = async () => {
    setPlacing(true);
    setPlaceError("");

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Could not load Razorpay. Check your internet connection.");

      // 2. Create Razorpay order on backend
      const { data: orderData } = await api.post("/api/payment/create-order", { amount: total });
      if (!orderData.success) throw new Error(orderData.message || "Failed to create payment order");

      const rzpOrder = orderData.order;

      // 3. Open Razorpay checkout popup
      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      rzpOrder.amount,          // already in paise from backend
        currency:    rzpOrder.currency,
        name:        "ShopLux",
        description: `${cartItems.length} item(s) — Order`,
        image:       "",                       // optional logo URL
        order_id:    rzpOrder.id,
        prefill: {
          name:    `${address.firstName} ${address.lastName}`.trim(),
          email:   address.email,
          contact: address.phone,
        },
        notes: {
          address: address.address,
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            // User closed popup without paying
            setPlacing(false);
          },
        },

        // 4. Called by Razorpay after successful payment
        handler: async (response) => {
          try {
            // 5. Verify signature on backend
            const { data: verifyData } = await api.post("/api/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            if (!verifyData.success) throw new Error("Payment verification failed. Contact support.");

            // 6. Place order in our backend (marked paid)
            if (token) {
              const payload = buildPayload({
                isPaid:        true,
                paymentResult: {
                  id:          response.razorpay_payment_id,
                  status:      "paid",
                  update_time: new Date().toISOString(),
                },
              });
              const { data: placed } = await api.post("/api/order/place", payload);
              if (!placed.success) throw new Error(placed.message || "Order placement failed");
            }

            clearCart();
            setPaidWith(response.razorpay_payment_id);
            setPlaced(true);

          } catch (err) {
            setPlaceError(err.message);
            setPlacing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        setPlaceError(
          response.error?.description || "Payment failed. Please try a different method."
        );
        setPlacing(false);
      });

      rzp.open();

    } catch (err) {
      setPlaceError(err.message);
      setPlacing(false);
    }
  };

  // ── Order Placed screen ───────────────────────────────────────────────────
  if (placed) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Thank you! A confirmation will be sent to{" "}
            <span className="text-indigo-600 font-medium">{address.email || "your email"}</span>.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 text-sm text-gray-600 space-y-2">
          <p>Order total: <strong className="text-gray-900">₹{total.toFixed(2)}</strong></p>
          <p>Shipping: <strong className="text-gray-900">{shipping.label}</strong> ({shipping.duration})</p>
          <p className="flex items-center justify-center gap-1.5 text-green-600 font-semibold">
            <CheckCircle2 size={14} /> Payment confirmed via Razorpay
          </p>
          {paidWith && (
            <p className="text-[11px] text-gray-400 font-mono">Payment ID: {paidWith}</p>
          )}
        </div>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors shadow-lg shadow-indigo-200">
          Back to Home
        </Link>
      </div>
    );
  }

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-lg font-semibold">Nothing to checkout.</p>
        <Link to="/collection" className="text-indigo-600 hover:underline text-sm font-medium">
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">S</span>
            </div>
            <span className="font-extrabold text-gray-900 text-lg">ShopLux</span>
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Lock size={13} className="text-green-500" /> Secure Checkout
          </span>
        </div>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 0 — Shipping */}
            {step === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-500" /> Shipping Address
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First Name"     name="firstName" value={address.firstName} onChange={handleAddress} placeholder="Aarav"           half required />
                  <InputField label="Last Name"      name="lastName"  value={address.lastName}  onChange={handleAddress} placeholder="Sharma"          half required />
                  <InputField label="Email Address"  name="email"     value={address.email}     onChange={handleAddress} placeholder="aarav@email.com" type="email" required />
                  <InputField label="Phone Number"   name="phone"     value={address.phone}     onChange={handleAddress} placeholder="+91 98765 43210" type="tel" half />
                  <InputField label="Street Address" name="address"   value={address.address}   onChange={handleAddress} placeholder="123 MG Road"     required />
                  <InputField label="Apt / Flat"     name="apt"       value={address.apt}       onChange={handleAddress} placeholder="Flat 4B (optional)" half />
                  <InputField label="City"           name="city"      value={address.city}      onChange={handleAddress} placeholder="Mumbai"          half required />
                  <InputField label="State"          name="state"     value={address.state}     onChange={handleAddress} placeholder="Maharashtra"     half required />
                  <InputField label="PIN Code"       name="zip"       value={address.zip}       onChange={handleAddress} placeholder="400001"          half required />
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
                    <div className="relative">
                      <select
                        name="country" value={address.country} onChange={handleAddress}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-400 appearance-none"
                      >
                        {["India","United States","United Kingdom","Canada","Australia","Germany","France"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Shipping method */}
                <h3 className="text-sm font-bold text-gray-800 mt-8 mb-3">Shipping Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <label key={opt.id} className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      shipping.id === opt.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                    }`}>
                      <input type="radio" name="shipping" className="sr-only" checked={shipping.id === opt.id} onChange={() => setShipping(opt)} />
                      <span className="text-sm font-bold text-gray-800">{opt.label}</span>
                      <span className="text-xs text-gray-400">{opt.duration}</span>
                      <span className={`text-sm font-extrabold mt-1 ${opt.price === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {opt.price === 0 ? "Free" : `₹${opt.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1 — Payment */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-500" /> Payment
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  All payments are securely processed by <strong className="text-gray-600">Razorpay</strong>.
                </p>

                {/* Razorpay logo / badge */}
                <div className="flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6 border border-indigo-100">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                    <span className="text-white font-black text-xl">R</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-base">Razorpay Checkout</p>
                    <p className="text-xs text-gray-400 mt-0.5">India's most trusted payment gateway</p>
                  </div>
                </div>

                {/* Supported methods grid */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Accepted Payment Methods</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {SUPPORTED_METHODS.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-[11px] text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 mb-6">
                  <ShieldCheck size={15} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">
                    256-bit SSL encrypted · PCI DSS compliant · RBI regulated
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-gray-300 transition-colors">
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Review + Pay */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-indigo-500" /> Review Your Order
                </h2>

                {/* Shipping summary */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Shipping To</span>
                    <button onClick={() => setStep(0)} className="text-xs text-indigo-500 hover:underline font-medium">Edit</button>
                  </div>
                  <p className="text-gray-800 font-semibold">{address.firstName} {address.lastName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {address.address}{address.apt ? `, ${address.apt}` : ""}, {address.city}, {address.state} {address.zip}, {address.country}
                  </p>
                  <p className="text-gray-500 text-xs">{address.email} · {address.phone}</p>
                </div>

                {/* Payment summary */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700 text-xs uppercase tracking-wider">Payment</span>
                    <button onClick={() => setStep(1)} className="text-xs text-indigo-500 hover:underline font-medium">Edit</button>
                  </div>
                  <p className="text-gray-800 font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 bg-indigo-600 rounded text-white text-[10px] font-black flex items-center justify-center">R</span>
                    Razorpay — UPI / Card / Netbanking / Wallet
                  </p>
                </div>

                {/* Items */}
                <div>
                  <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3">
                    Items ({cartItems.length})
                  </p>
                  <div className="space-y-3">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img src={getImageUrl(item.image)} alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {[item.selectedSize && `Size: ${item.selectedSize}`, `Qty: ${item.qty}`].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 shrink-0">
                          ₹{(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700">
                  <Lock size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Clicking <strong>Pay Now</strong> opens the Razorpay popup.
                    Choose UPI, Card, Netbanking or Wallet to complete your payment of <strong>₹{total.toFixed(2)}</strong>.
                  </span>
                </div>

                {/* Error */}
                {placeError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                    <Lock size={13} className="shrink-0 mt-0.5" /> {placeError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:border-gray-300 transition-colors">
                    ← Back
                  </button>
                  <button
                    onClick={handlePayNow}
                    disabled={placing}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <><Loader2 size={16} className="animate-spin" /> Opening Razorpay…</>
                    ) : (
                      <><Lock size={15} /> Pay Now · ₹{total.toFixed(2)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ─────────────────────── */}
          <div className="space-y-4">
            <button
              onClick={() => setOpenSummary(!openSummary)}
              className="lg:hidden w-full flex items-center justify-between bg-white rounded-2xl shadow-sm px-5 py-4 text-sm font-bold text-gray-800"
            >
              <span>Order Summary ({cartItems.length} items)</span>
              <span className="flex items-center gap-1 text-indigo-600">
                ₹{total.toFixed(2)}
                <ChevronDown size={15} className={`transition-transform ${openSummary ? "rotate-180" : ""}`} />
              </span>
            </button>

            <div className={`bg-white rounded-2xl shadow-sm p-5 space-y-4 ${openSummary ? "block" : "hidden lg:block"}`}>
              <h3 className="font-bold text-gray-900 hidden lg:block">Order Summary</h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                      {item.selectedSize && <p className="text-[11px] text-gray-400">Size: {item.selectedSize}</p>}
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({shipping.label})</span>
                  <span className="font-semibold text-gray-900">
                    {shipCost === 0 ? <span className="text-green-600">Free</span> : `₹${shipCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
                <ShieldCheck size={14} className="text-green-500 shrink-0" />
                <p className="text-[11px] text-gray-400">Secured by Razorpay · RBI regulated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
