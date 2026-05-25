import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api, { backendUrl } from "../api";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {

  // ── Auth ──────────────────────────────────────────────────
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user,  setUser]  = useState(() => {
    const name = localStorage.getItem("userName") || "";
    return name ? { name } : null;
  });

  // ── Products ──────────────────────────────────────────────
  const [products, setProducts] = useState([]);

  // ── Cart ──────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState([]);

  // ── Wishlist ───────────────────────────────────────────────
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
    catch { return []; }
  });


  // ── FETCH PRODUCTS FROM BACKEND ──────────────────────────
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to load products:", error.message);
    }
  };


  // ── FETCH USER CART FROM BACKEND ──────────────────────────
  const fetchCart = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const { data } = await api.get("/api/cart/get");
      if (data.success) setCartItems(data.cartData);
    } catch (error) {
      console.error("Failed to load cart:", error.message);
    }
  };


  // ── ADD TO CART ───────────────────────────────────────────
  const addToCart = async (product, { size = "", color = "", qty = 1 } = {}) => {

    // LOCAL UPDATE FIRST (instant UI response)
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === product._id && i.selectedSize === size && i.selectedColor === color
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, {
        productId:     product._id,
        name:          product.name,
        price:         product.price,
        image:         product.image,
        category:      product.category,
        selectedSize:  size,
        selectedColor: color,
        qty,
      }];
    });

    // SYNC WITH BACKEND
    if (token) {
      try {
        await api.post("/api/cart/add", {
          productId: product._id,
          qty,
          selectedSize:  size,
          selectedColor: color,
        });
      } catch (error) {
        console.error("Cart sync failed:", error.message);
      }
    }
  };


  // ── UPDATE QTY ────────────────────────────────────────────
  const updateQty = async (productId, { size = "", color = "", qty }) => {
    if (qty < 1) {
      removeFromCart(productId, { size, color });
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, qty }
          : item
      )
    );

    if (token) {
      try {
        await api.put("/api/cart/update", {
          productId, qty, selectedSize: size, selectedColor: color,
        });
      } catch (error) {
        console.error("Cart update failed:", error.message);
      }
    }
  };


  // ── REMOVE FROM CART ──────────────────────────────────────
  const removeFromCart = async (productId, { size = "", color = "" } = {}) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );

    if (token) {
      try {
        await api.delete("/api/cart/remove", {
          data: { productId, selectedSize: size, selectedColor: color },
        });
      } catch (error) {
        console.error("Cart remove failed:", error.message);
      }
    }
  };


  // ── CLEAR CART ────────────────────────────────────────────
  const clearCart = async () => {
    setCartItems([]);
    if (token) {
      try {
        await api.delete("/api/cart/clear");
      } catch (error) {
        console.error("Cart clear failed:", error.message);
      }
    }
  };


  // ── WISHLIST ──────────────────────────────────────────────
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const id = product._id || product.id;
      const exists = prev.find((p) => (p._id || p.id) === id);
      const updated = exists
        ? prev.filter((p) => (p._id || p.id) !== id)
        : [...prev, product];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      toast(exists ? "Removed from wishlist" : "Added to wishlist ❤️", { autoClose: 1500 });
      return updated;
    });
  };

  const isWishlisted = (productId) =>
    wishlist.some((p) => (p._id || p.id) === productId);

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem("wishlist");
  };


  // ── AUTH: SAVE TOKEN ──────────────────────────────────────
  const saveToken = (newToken, userName = "") => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    if (userName) {
      localStorage.setItem("userName", userName);
      setUser((prev) => ({ ...prev, name: userName }));
    }
  };

  // ── AUTH: LOGOUT ──────────────────────────────────────────
  const logout = () => {
    setToken("");
    setUser(null);
    setCartItems([]);
    setWishlist([]);
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("wishlist");
  };


  // ── TOTALS ────────────────────────────────────────────────
  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getItemCount = () =>
    cartItems.reduce((sum, item) => sum + item.qty, 0);


  // ── IMAGE URL HELPER ──────────────────────────────────────
  const getImageUrl = (filename) => {
    if (!filename) return "";
    if (filename.startsWith("http")) return filename;  // already full URL
    return `${backendUrl}/images/${filename}`;
  };


  // ── LOAD ON MOUNT ─────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);


  return (
    <ShopContext.Provider
      value={{
        // auth
        token,
        user,
        setUser,
        saveToken,
        logout,
        // products
        products,
        fetchProducts,
        backendUrl,
        getImageUrl,
        // cart
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        getTotal,
        getItemCount,
        // wishlist
        wishlist,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside <ShopProvider>");
  return context;
}
