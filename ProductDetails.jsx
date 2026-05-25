import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart, ShoppingCart, Star, ChevronLeft,
  Truck, RotateCcw, ShieldCheck, Minus, Plus, Check,
} from "lucide-react";
import { useShop } from "./context/ShopContext";

const perks = [
  { icon: Truck,       label: "Free Delivery", sub: "Over $50"    },
  { icon: RotateCcw,   label: "30-Day Return", sub: "Easy policy" },
  { icon: ShieldCheck, label: "2-Yr Warranty", sub: "Guaranteed"  },
];

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, getImageUrl, toggleWishlist, isWishlisted } = useShop();

  const product = products.find((p) => (p._id || p.id) === id || String(p.id) === id);

  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] ?? null);
  const [qty,           setQty]           = useState(1);
  const [added,         setAdded]         = useState(false);
  const [sizeError,     setSizeError]     = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p className="font-semibold">Product not found.</p>
        <button onClick={() => navigate("/")} className="text-indigo-600 hover:underline text-sm">← Home</button>
      </div>
    );
  }

  const productId  = product._id || product.id;
  const wishlisted = isWishlisted(productId);
  const gallery    = [getImageUrl(product.image)];

  const handleAddToCart = () => {
    if (product.sizes?.length > 1 && product.sizes[0] !== "One Size" && !selectedSize) {
      setSizeError(true);
      return;
    }
    addToCart(product, { size: selectedSize, color: selectedColor, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <nav className="flex items-center gap-1 text-[11px] text-gray-400">
          <button onClick={() => navigate("/")} className="hover:text-indigo-600">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/collection")} className="hover:text-indigo-600 capitalize">{product.category}</button>
          <span>/</span>
          <span className="text-gray-600 truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-indigo-600 mb-3 font-medium"
        >
          <ChevronLeft size={13} /> Back
        </button>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">

          {/* LEFT — Image */}
          <div className="flex gap-2">

            {/* Thumbnails */}
            <div className="flex flex-col gap-1.5 w-12 shrink-0">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-indigo-500" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100 h-[260px] sm:h-[300px]">
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="bg-gray-900 text-white text-xs font-bold px-4 py-1.5 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-3">

            {/* Name */}
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-500">{product.category}</span>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight mt-0.5">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={11} fill={s <= Math.round(product.rating) ? "#facc15" : "#e5e7eb"} stroke="none" />
              ))}
              <span className="text-[11px] text-gray-500 ml-0.5">{product.rating} ({product.numReviews ?? 0})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice > 0 && (
                <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount > 0 && (
                <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Description */}
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Premium quality <strong className="text-gray-700">{product.name}</strong> — crafted for
              all-day comfort and lasting style.
            </p>

            {/* Color */}
            {product.colors?.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-gray-700 shrink-0">Color:</span>
                <div className="flex gap-1.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border-4 transition-all ${
                        selectedColor === color
                          ? "border-indigo-500 scale-110 shadow"
                          : "border-white shadow ring-1 ring-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes?.length > 0 && product.sizes[0] !== "One Size" && (
              <div>
                <p className={`text-[11px] font-semibold mb-1.5 ${sizeError ? "text-red-500" : "text-gray-700"}`}>
                  Size {sizeError && <span className="font-normal">— please select</span>}
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        selectedSize === size
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + CTA */}
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-indigo-600">
                  <Minus size={12} />
                </button>
                <span className="w-8 h-8 flex items-center justify-center font-bold text-gray-900 border-x border-gray-200 text-xs">
                  {qty}
                </span>
                <button onClick={() => setQty((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-indigo-600">
                  <Plus size={12} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs transition-all ${
                  !product.inStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : added
                    ? "bg-green-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                }`}
              >
                {added
                  ? <><Check size={13} /> Added!</>
                  : <><ShoppingCart size={13} /> {product.inStock ? "Add to Cart" : "Out of Stock"}</>
                }
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border-2 transition-all shrink-0 ${
                  wishlisted ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300"
                }`}
              >
                <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
              {perks.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-2 rounded-lg bg-white border border-gray-100">
                  <Icon size={14} className="text-indigo-500" />
                  <p className="text-[10px] font-semibold text-gray-700">{label}</p>
                  <p className="text-[9px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
