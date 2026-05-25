import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ShopProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ShopProvider>
  </React.StrictMode>
);
