import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Heart, ShoppingCart, ChevronDown,
  X, Menu, User, LogIn, LogOut, Package,
} from "lucide-react";
import { useShop } from "./context/ShopContext";

const megaMenuData = [
  {
    label: "Men",
    categories: [
      { title: "Clothing",     items: ["T-Shirts", "Shirts", "Jackets", "Jeans", "Shorts", "Suits"] },
      { title: "Shoes",        items: ["Sneakers", "Boots", "Loafers", "Sandals", "Formal", "Running"] },
      { title: "Accessories",  items: ["Watches", "Belts", "Sunglasses", "Wallets", "Hats", "Bags"] },
    ],
    featured: { label: "New Arrivals", badge: "NEW" },
  },
  {
    label: "Women",
    categories: [
      { title: "Clothing",     items: ["Dresses", "Tops", "Blazers", "Jeans", "Skirts", "Coats"] },
      { title: "Shoes",        items: ["Heels", "Flats", "Sneakers", "Boots", "Sandals", "Mules"] },
      { title: "Accessories",  items: ["Handbags", "Jewelry", "Scarves", "Sunglasses", "Hats", "Belts"] },
    ],
    featured: { label: "Sale Up to 50%", badge: "SALE" },
  },
  {
    label: "Kids",
    categories: [
      { title: "Boys",  items: ["T-Shirts", "Shorts", "Sneakers", "Jackets", "Jeans", "Hoodies"] },
      { title: "Girls", items: ["Dresses", "Tops", "Shoes", "Skirts", "Leggings", "Coats"] },
      { title: "Baby",  items: ["Onesies", "Rompers", "Shoes", "Bibs", "Sleepwear", "Sets"] },
    ],
    featured: { label: "Back to School", badge: "HOT" },
  },
  {
    label: "Electronics",
    categories: [
      { title: "Phones",   items: ["Smartphones", "Cases", "Chargers", "Screen Guards", "Earphones", "Power Banks"] },
      { title: "Laptops",  items: ["Gaming", "Business", "Ultrabooks", "Accessories", "Monitors", "Keyboards"] },
      { title: "Audio",    items: ["Headphones", "Earbuds", "Speakers", "Soundbars", "Microphones", "DACs"] },
    ],
    featured: { label: "Tech Deals", badge: "DEALS" },
  },
  { label: "Sale", categories: [], featured: null },
];

const badgeColors = {
  NEW: "bg-green-500", SALE: "bg-red-500", HOT: "bg-orange-500", DEALS: "bg-blue-500",
};

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, logout, getItemCount } = useShop();

  const [activeMenu,          setActiveMenu]          = useState(null);
  const [mobileOpen,          setMobileOpen]          = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [searchFocused,       setSearchFocused]       = useState(false);
  const [userDropdown,        setUserDropdown]        = useState(false);

  const menuLeaveTimer = useRef(null);
  const dropdownTimer  = useRef(null);

  const openMenu  = (label) => { clearTimeout(menuLeaveTimer.current); setActiveMenu(label); };
  const closeMenu = ()      => { menuLeaveTimer.current = setTimeout(() => setActiveMenu(null), 150); };

  const cartCount = getItemCount();

  // Get user's first letter for avatar
  const userName  = user?.name || localStorage.getItem("userName") || "";
  const userLetter = userName.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate("/");
  };

  return (
    <div className="w-full font-sans sticky top-0 z-50">

      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="bg-gray-900 text-white text-xs py-1 px-4 flex items-center justify-between">
          <span className="hidden sm:block w-24" />
          <p className="text-center flex-1">
            Free shipping on orders over $50 &nbsp;|&nbsp;
            <span className="underline cursor-pointer hover:text-yellow-300 transition-colors">Shop Now</span>
          </p>
          <button onClick={() => setAnnouncementVisible(false)} className="text-white/70 hover:text-white transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
          <div className="flex items-center h-12 gap-3">

            {/* Mobile hamburger */}
            <button className="lg:hidden shrink-0 text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm leading-none">S</span>
              </div>
              <span className="text-base font-bold text-gray-900 hidden sm:block whitespace-nowrap">ShopLux</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 min-w-0 hidden md:block">
              <div className={`flex items-center border rounded-full px-3 py-1.5 gap-2 transition-all duration-200 ${searchFocused ? "border-indigo-500 shadow-md shadow-indigo-100" : "border-gray-300 bg-gray-50"}`}>
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  className="w-full min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="shrink-0 flex items-center gap-1 sm:gap-2 ml-auto">

              {/* Search icon on mobile */}
              <button className="md:hidden p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors">
                <Search size={20} />
              </button>

              {/* ── Auth: logged out → Login + Sign Up | logged in → avatar ── */}
              {!token ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap">
                    <LogIn size={13} className="shrink-0" />
                    Login
                  </Link>
                  <Link to="/login?tab=register" className="flex items-center gap-1.5 px-3 py-1 text-sm bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap">
                    <User size={13} className="shrink-0" />
                    Sign Up
                  </Link>
                </div>
              ) : (
                /* User Avatar + Dropdown */
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => { clearTimeout(dropdownTimer.current); setUserDropdown(true); }}
                  onMouseLeave={() => { dropdownTimer.current = setTimeout(() => setUserDropdown(false), 150); }}
                >
                  <button className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center hover:bg-indigo-700 transition-colors">
                    {userLetter}
                  </button>

                  {/* Dropdown */}
                  <div className={`absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 transition-all duration-150 ${userDropdown ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"}`}>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{userName || "My Account"}</p>
                    </div>
                    <Link to="/orders" onClick={() => setUserDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <Package size={14} /> My Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-1.5 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shrink-0">
                <Heart size={17} />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-1.5 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shrink-0">
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mega Menu Nav */}
        <nav className="hidden lg:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-1">
              {megaMenuData.map((menu) => (
                <li key={menu.label} className="relative" onMouseEnter={() => menu.categories.length && openMenu(menu.label)} onMouseLeave={closeMenu}>
                  <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${activeMenu === menu.label ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"} ${menu.label === "Sale" ? "text-red-500 hover:text-red-600" : ""}`}>
                    {menu.label}
                    {menu.categories.length > 0 && (
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === menu.label ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {menu.categories.length > 0 && (
                    <div
                      onMouseEnter={() => openMenu(menu.label)}
                      onMouseLeave={closeMenu}
                      className={`absolute top-full left-0 w-[700px] bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/60 p-6 z-50 transition-all duration-200 ${activeMenu === menu.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"}`}
                    >
                      <div className="grid grid-cols-3 gap-6">
                        {menu.categories.map((cat) => (
                          <div key={cat.title}>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{cat.title}</h4>
                            <ul className="space-y-2">
                              {cat.items.map((item) => (
                                <li key={item}>
                                  <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 hover:translate-x-1 inline-flex transition-all duration-150">{item}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      {menu.featured && (
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between bg-indigo-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                          <span className="text-sm font-semibold text-indigo-700">{menu.featured.label}</span>
                          <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${badgeColors[menu.featured.badge]}`}>{menu.featured.badge}</span>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X size={20} className="text-gray-500" /></button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b">
              <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 gap-2 bg-gray-50">
                <Search size={15} className="text-gray-400" />
                <input type="text" placeholder="Search..." className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {megaMenuData.map((menu) => (
                  <li key={menu.label}>
                    <a href="#" className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${menu.label === "Sale" ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                      {menu.label}
                      {menu.categories.length > 0 && <ChevronDown size={14} />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Auth */}
            <div className="p-4 border-t flex flex-col gap-2">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-2 border border-indigo-600 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-50 transition-colors">
                    <LogIn size={15} /> Login
                  </Link>
                  <Link to="/login?tab=register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <User size={15} /> Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2 py-1 mb-1">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">{userLetter}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{userName}</p>
                      <p className="text-xs text-gray-400">My Account</p>
                    </div>
                  </div>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 w-full py-2 px-3 text-sm text-gray-700 hover:bg-indigo-50 rounded-full transition-colors">
                    <Package size={15} /> My Orders
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center justify-center gap-2 w-full py-2 border border-red-300 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-colors">
                    <LogOut size={15} /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
