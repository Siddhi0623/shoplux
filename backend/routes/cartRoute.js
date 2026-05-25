import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import authUser from "../middleware/auth.js";


const cartRouter = express.Router();


// ROUTES
cartRouter.get(   "/get",     authUser, getCart);          // Get user cart
cartRouter.post(  "/add",     authUser, addToCart);        // Add / increment item
cartRouter.put(   "/update",  authUser, updateCartItem);   // Set exact qty
cartRouter.delete("/remove",  authUser, removeFromCart);   // Remove one item
cartRouter.delete("/clear",   authUser, clearCart);        // Empty entire cart


export default cartRouter;
