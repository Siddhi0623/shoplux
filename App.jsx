import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";
import HeroBanner from "./HeroBanner";
import CategoriesSection from "./CategoriesSection";
import FeaturedProducts from "./FeaturedProducts";
import CollectionPage from "./CollectionPage";
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import AuthPage from "./AuthPage";
import WishlistPage from "./WishlistPage";
import MyOrdersPage from "./MyOrdersPage";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <HeroBanner />
      <CategoriesSection />
      <FeaturedProducts />
    </div>
  );
}

function Collection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CollectionPage />
    </div>
  );
}

function Product() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProductDetails />
    </div>
  );
}

function Cart() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CartPage />
    </div>
  );
}

function Login() {
  return <AuthPage />;
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <ToastContainer position="top-right" autoClose={2500} />
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/collection"  element={<Collection />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/cart"        element={<Cart />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/checkout"    element={<CheckoutPage />} />
      <Route path="/wishlist"    element={<div className="min-h-screen bg-gray-50"><Navbar /><WishlistPage /></div>} />
      <Route path="/orders"     element={<div className="min-h-screen bg-gray-50"><Navbar /><MyOrdersPage /></div>} />
    </Routes>
    </>
  );
}
