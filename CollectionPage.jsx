import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, X, LayoutGrid, List } from "lucide-react";
import ProductCard from "./ProductCard";
import { useShop } from "./context/ShopContext";

const SORT_OPTIONS = [
  { label: "Featured",       value: "featured" },
  { label: "Newest",         value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Best Rated",     value: "rating" },
  { label: "Most Reviews",   value: "reviews" },
];

const ALL_SIZES   = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "One Size", "30ml", "50ml", "100ml"];
const PRICE_RANGES = [
  { label: "Under $50",      min: 0,   max: 50  },
  { label: "$50 – $100",     min: 50,  max: 100 },
  { label: "$100 – $150",    min: 100, max: 150 },
  { label: "Over $150",      min: 150, max: Infinity },
];

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
      >
        {title}
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children}
    </div>
  );
}

const FIXED_CATEGORIES = ["All", "Men", "Women", "Kids", "Electronics", "Sale"];

export default function CollectionPage() {
  const { products } = useShop();
  const [searchParams] = useSearchParams();

  // Filter state — initialised from URL query params
  const [search,             setSearch]             = useState("");
  const [activeCategory,     setActiveCategory]     = useState(searchParams.get("category") || "All");
  const [activeSubCategory,  setActiveSubCategory]  = useState(searchParams.get("sub") || "");
  const [selectedSizes,      setSelectedSizes]      = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [inStockOnly,        setInStockOnly]        = useState(false);
  const [onSaleOnly,         setOnSaleOnly]         = useState(false);
  const [sortBy,             setSortBy]             = useState("featured");

  // Re-apply filters when URL params change (e.g. clicking navbar links)
  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "All");
    setActiveSubCategory(searchParams.get("sub") || "");
  }, [searchParams]);

  // UI state
  const [showFilters,  setShowFilters]  = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [gridCols,     setGridCols]     = useState(3);

  // Filter section open state
  const [openSections, setOpenSections] = useState({
    category: true, price: true, size: true, availability: true,
  });
  const toggleSection = (key) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const toggleSize = (size) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const activeFilterCount = [
    activeCategory !== "All",
    activeSubCategory !== "",
    selectedSizes.length > 0,
    selectedPriceRange !== null,
    inStockOnly,
    onSaleOnly,
    search !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setActiveSubCategory("");
    setSelectedSizes([]);
    setSelectedPriceRange(null);
    setInStockOnly(false);
    setOnSaleOnly(false);
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim())
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.category.toLowerCase().includes(search.trim().toLowerCase()) ||
        (p.subCategory || "").toLowerCase().includes(search.trim().toLowerCase())
      );

    if (activeCategory !== "All")
      result = result.filter((p) => p.category === activeCategory);

    if (activeSubCategory)
      result = result.filter((p) => p.subCategory === activeSubCategory);

    if (selectedSizes.length > 0)
      result = result.filter((p) =>
        selectedSizes.some((s) => p.sizes.includes(s))
      );

    if (selectedPriceRange)
      result = result.filter(
        (p) => p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );

    if (inStockOnly)  result = result.filter((p) => p.inStock);
    if (onSaleOnly)   result = result.filter((p) => p.discount > 0);

    switch (sortBy) {
      case "price_asc":  result.sort((a, b) => a.price - b.price);             break;
      case "price_desc": result.sort((a, b) => b.price - a.price);             break;
      case "rating":     result.sort((a, b) => b.rating - a.rating);           break;
      case "reviews":    result.sort((a, b) => b.reviews - a.reviews);         break;
      case "newest":     result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)); break;
      default: break;
    }

    return result;
  }, [search, activeCategory, selectedSizes, selectedPriceRange, inStockOnly, onSaleOnly, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Category */}
      <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection("category")}>
        <ul className="space-y-1">
          {FIXED_CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => { setActiveCategory(cat); setActiveSubCategory(""); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeCategory === cat
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
                <span className="float-right text-xs text-gray-400">
                  {cat === "All" ? products.length : products.filter((p) => p.category === cat).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" open={openSections.price} onToggle={() => toggleSection("price")}>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <li key={range.label}>
              <button
                onClick={() =>
                  setSelectedPriceRange(
                    selectedPriceRange?.label === range.label ? null : range
                  )
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  selectedPriceRange?.label === range.label
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size" open={openSections.size} onToggle={() => toggleSection("size")}>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                selectedSizes.includes(size)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" open={openSections.availability} onToggle={() => toggleSection("availability")}>
        <div className="space-y-2">
          {[
            { label: "In Stock Only", value: inStockOnly, setter: setInStockOnly },
            { label: "On Sale",       value: onSaleOnly,  setter: setOnSaleOnly  },
          ].map(({ label, value, setter }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setter(!value)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0 ${
                  value ? "bg-indigo-600 border-indigo-600" : "border-gray-300 group-hover:border-indigo-400"
                }`}
              >
                {value && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-900 select-none">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900">All Collections</h1>
          <p className="text-sm text-gray-400 mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Toolbar ─────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">

          {/* Search */}
          <div className="flex items-center border border-gray-200 rounded-full px-4 py-2 gap-2 bg-white shadow-sm flex-1 min-w-0 max-w-sm">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle sidebar (desktop) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filters {activeFilterCount > 0 && <span className="bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
          </button>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilters(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort */}
          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Grid toggle */}
          <div className="hidden sm:flex items-center border border-gray-200 rounded-full overflow-hidden bg-white shadow-sm">
            {[2, 3, 4].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                className={`px-3 py-2 text-sm transition-colors ${
                  gridCols === cols ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-indigo-600"
                }`}
                aria-label={`${cols} columns`}
              >
                <LayoutGrid size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-gray-400 font-medium">Active:</span>

            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                {activeCategory}
                <button onClick={() => { setActiveCategory("All"); setActiveSubCategory(""); }}><X size={11} /></button>
              </span>
            )}
            {activeSubCategory && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                {activeSubCategory}
                <button onClick={() => setActiveSubCategory("")}><X size={11} /></button>
              </span>
            )}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                {selectedPriceRange.label}
                <button onClick={() => setSelectedPriceRange(null)}><X size={11} /></button>
              </span>
            )}
            {selectedSizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                Size: {s}
                <button onClick={() => toggleSize(s)}><X size={11} /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                In Stock <button onClick={() => setInStockOnly(false)}><X size={11} /></button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                On Sale <button onClick={() => setOnSaleOnly(false)}><X size={11} /></button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                "{search}" <button onClick={() => setSearch("")}><X size={11} /></button>
              </span>
            )}

            <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold ml-1 hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* ── Body: Sidebar + Grid ─────────────────────── */}
        <div className="flex gap-8">

          {/* Sidebar — desktop */}
          {showFilters && (
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800 text-sm">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs text-red-500 hover:underline font-medium">
                      Clear all
                    </button>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length > 0 ? (
              <div
                className={`grid gap-5 ${
                  gridCols === 2
                    ? "grid-cols-2"
                    : gridCols === 3
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filtered.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <Search size={48} className="mb-4 text-gray-200" />
                <p className="text-lg font-semibold text-gray-500">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────── */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="relative ml-auto w-80 max-w-full bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileFilters(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel />
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={clearAllFilters} className="flex-1 py-2.5 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                Clear all
              </button>
              <button onClick={() => setMobileFilters(false)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors">
                View {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
