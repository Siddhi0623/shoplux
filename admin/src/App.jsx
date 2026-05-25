import { Routes, Route, Navigate } from "react-router-dom";
import Layout     from "./components/Layout";
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import Products   from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Orders     from "./pages/Orders";

function Protected({ children }) {
  return localStorage.getItem("adminToken")
    ? children
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index                    element={<Dashboard />} />
        <Route path="products"          element={<Products />} />
        <Route path="products/add"      element={<AddProduct />} />
        <Route path="products/edit/:id" element={<AddProduct />} />
        <Route path="orders"            element={<Orders />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
