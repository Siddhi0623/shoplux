import { Link } from "react-router-dom";

const categories = [
  {
    label: "Men",
    subtitle: "Latest trends",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&auto=format&fit=crop&q=80",
    badge: "New In",
    badgeColor: "bg-indigo-600",
    href: "/collection?category=Men",
  },
  {
    label: "Women",
    subtitle: "Style essentials",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80",
    badge: "Trending",
    badgeColor: "bg-pink-500",
    href: "/collection?category=Women",
  },
  {
    label: "Kids",
    subtitle: "Fun & bright",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&auto=format&fit=crop&q=80",
    badge: "Cute",
    badgeColor: "bg-yellow-500",
    href: "/collection?category=Kids",
  },
  {
    label: "Shoes",
    subtitle: "Step in style",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
    badge: "Hot",
    badgeColor: "bg-orange-500",
    href: "/collection?category=Shoes",
  },
  {
    label: "Electronics",
    subtitle: "Tech deals",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=80",
    badge: "Sale",
    badgeColor: "bg-blue-600",
    href: "/collection?category=Electronics",
  },
  {
    label: "Beauty",
    subtitle: "Glow up picks",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80",
    badge: "Popular",
    badgeColor: "bg-rose-500",
    href: "/collection?category=Beauty",
  },
];

export default function CategoriesSection() {
  return (
    <section className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-600 mb-1 block">
              Browse by Category
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Shop by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Category
              </span>
            </h2>
          </div>
          <Link
            to="/collection"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0 flex items-center gap-1"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Single-row scrollable cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.href}
              className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 aspect-[3/4]"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Badge */}
              <span className={`absolute top-2 left-2 ${cat.badgeColor} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                {cat.badge}
              </span>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-white/60 text-[10px] leading-none mb-0.5">{cat.subtitle}</p>
                <h3 className="text-white text-sm font-extrabold leading-tight">{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
