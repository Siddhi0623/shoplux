import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Tag, Truck } from "lucide-react";
import { useShop } from "./context/ShopContext";

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Delivery", duration: "5–7 business days", price: 0 },
  { id: "express",  label: "Express Delivery",  duration: "2–3 business days", price: 9.99 },
  { id: "overnight",label: "Overnight Delivery", duration: "Next business day",  price: 19.99 },
];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, getTotal, clearCart, getImageUrl } = useShop();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState(SHIPPING_OPTIONS[0]);

  const subtotal      = getTotal();
  const shippingCost  = shipping.price;
  const tax           = subtotal * 0.08;
  const orderTotal    = subtotal + shippingCost + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
        </div>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Browse Collections
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-400 mt-1">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex gap-4 sm:gap-5 items-start"
              >
                {/* Product image */}
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl bg-gray-100 hover:opacity-90 transition-opacity"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <Link to={`/product/${item.productId}`}>
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, { size: item.selectedSize, color: item.selectedColor })}
                      className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Variants */}
                  <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400">
                    {item.selectedSize && (
                      <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium text-gray-600">
                        Size: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full font-medium text-gray-600">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                        Color
                      </span>
                    )}
                  </div>

                  {/* Price + Qty */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    {/* Qty stepper */}
                    <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() =>
                          updateQty(item.productId, {
                            size: item.selectedSize,
                            color: item.selectedColor,
                            qty: item.qty - 1,
                          })
                        }
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center font-bold text-sm text-gray-900 border-x border-gray-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.productId, {
                            size: item.selectedSize,
                            color: item.selectedColor,
                            qty: item.qty + 1,
                          })
                        }
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-base font-extrabold text-gray-900">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                      {item.qty > 1 && (
                        <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              to="/collection"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-2"
            >
              <ChevronRight size={15} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ─────────────────────────────── */}
          <div className="space-y-4">

            {/* Coupon */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Tag size={15} className="text-indigo-500" />
                Promo Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 transition-colors"
                />
                <button className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Truck size={15} className="text-indigo-500" />
                Shipping Method
              </h3>
              <div className="space-y-2">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                      shipping.id === option.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        shipping.id === option.id ? "border-indigo-500" : "border-gray-300"
                      }`}>
                        {shipping.id === option.id && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                        <p className="text-xs text-gray-400">{option.duration}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 shrink-0">
                      {option.price === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${option.price.toFixed(2)}`
                      )}
                    </span>
                    <input
                      type="radio"
                      name="shipping"
                      className="sr-only"
                      checked={shipping.id === option.id}
                      onChange={() => setShipping(option)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shippingCost === 0 ? <span className="text-green-600">Free</span> : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Order Total</span>
                  <span className="text-indigo-600">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200 text-sm"
              >
                Proceed to Checkout →
              </button>

              <div className="mt-4 flex items-center justify-center gap-4">
                {["visa", "mastercard", "paypal", "apple"].map((brand) => (
                  <span key={brand} className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
