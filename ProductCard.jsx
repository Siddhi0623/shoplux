import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useShop } from "./context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart, getImageUrl, toggleWishlist, isWishlisted } = useShop();

  const [added,         setAdded]         = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");

  const productId  = product._id || product.id;
  const wishlisted = isWishlisted(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, { color: selectedColor, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const imageUrl = getImageUrl ? getImageUrl(product.image) : product.image;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">

      {/* ── Image Area ─────────────────────────────────────── */}
      <Link to={`/product/${productId}`} className="relative overflow-hidden bg-gray-100 aspect-square block">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10`}>
            {product.badge}
          </span>
        )}

        {/* New tag */}
        {product.newArrival && !product.badge && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            New
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-x-10 group-hover:translate-x-0 transition-transform duration-300 z-10">
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              wishlisted ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:bg-red-50 hover:text-red-500"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={12} fill={wishlisted ? "currentColor" : "none"} />
          </button>

          <Link
            to={`/product/${productId}`}
            className="w-7 h-7 bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
            aria-label="Quick view"
          >
            <Eye size={12} />
          </Link>
        </div>

        {/* Add to cart — slides up on hover */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2 z-10">
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-white hover:bg-indigo-600 hover:text-white text-gray-800 shadow-lg"
              }`}
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={12} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* ── Info Area ──────────────────────────────────────── */}
      <div className="p-2 flex flex-col gap-0.5">

        <Link to={`/product/${productId}`}>
          <h3 className="text-[11px] font-semibold text-gray-800 leading-snug line-clamp-1 hover:text-indigo-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs font-extrabold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice > 0 && (
              <span className="text-[9px] text-gray-400 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={9}
                className={star <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-200"}
                fill="currentColor"
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-400">({product.numReviews ?? product.reviews ?? 0})</span>
        </div>
      </div>
    </div>
  );
}
