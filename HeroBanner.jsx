import { Link } from "react-router-dom";

export default function HeroBanner() {
  return (
    <section className="w-full bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-96px)] py-6 lg:py-0 gap-6 lg:gap-0">

          {/* Left — Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full mb-3 tracking-widest uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              Limited Time Offer
            </span>

            {/* Sale Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2">
              Summer
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Sale is Here
              </span>
            </h1>

            {/* Discount Pill */}
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-yellow-400 text-gray-900 text-lg font-black px-4 py-1 rounded-full shadow-lg shadow-yellow-400/30">
                UP TO 70% OFF
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-indigo-200 text-sm max-w-sm mb-5 leading-relaxed">
              Thousands of deals across fashion, electronics, and lifestyle.
              Limited stock — shop before it's gone.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                to="/collection?category=Sale"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-6 py-2.5 rounded-full shadow-xl shadow-yellow-400/30 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Shop the Sale
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/collection"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold text-sm px-6 py-2.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
              >
                View All Deals
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/10 w-full justify-center lg:justify-start">
              {[
                { value: "12K+", label: "Products" },
                { value: "500+", label: "Brands" },
                { value: "70%",  label: "Max Discount" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-[11px] text-indigo-300 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Responsive Image */}
          <div className="flex-1 flex items-center justify-center lg:justify-end relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-purple-500/20 rounded-full blur-3xl scale-110" />

            {/* Floating discount tag */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-0 z-20 bg-white rounded-xl shadow-xl px-3 py-2 flex flex-col items-center">
              <span className="text-[10px] text-gray-400 line-through">$199</span>
              <span className="text-lg font-black text-indigo-600">$59</span>
              <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full mt-0.5">SAVE 70%</span>
            </div>

            {/* Floating badge bottom-left */}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:-left-2 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-800">Free Shipping</p>
                <p className="text-[9px] text-gray-400">On orders over $50</p>
              </div>
            </div>

            {/* Main product image */}
            <div className="relative z-10 w-full aspect-square max-w-[220px] sm:max-w-[280px] lg:max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&auto=format&fit=crop&q=80"
                alt="Summer Sale — fashion collection"
                className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 fill-gray-50" preserveAspectRatio="none">
          <path d="M0,0 C360,50 1080,0 1440,0 L1440,50 L0,50 Z" />
        </svg>
      </div>
    </section>
  );
}
