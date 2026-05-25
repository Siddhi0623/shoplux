import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import { useShop } from "./context/ShopContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, getImageUrl } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <Heart size={40} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm">Save items you love by clicking the ❤️ on any product.</p>
        </div>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Browse Products
          <ChevronRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-400 mt-1">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button
            onClick={() => wishlist.forEach((p) => toggleWishlist(p))}
            className="text-sm text-red-400 hover:text-red-600 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((product) => {
            const productId = product._id || product.id;
            const imageUrl  = getImageUrl(product.image);

            return (
              <div key={productId} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group">

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Link to={`/product/${productId}`}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Remove from wishlist */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={15} fill="currentColor" />
                  </button>

                  {/* Badge */}
                  {product.badge && (
                    <span className={`absolute top-3 left-3 ${product.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <span className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">
                    {product.category}
                  </span>

                  <Link to={`/product/${productId}`}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-base font-extrabold text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ${Number(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-auto">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product, { qty: 1 })}
                    disabled={!product.inStock}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      product.inStock
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={15} />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
