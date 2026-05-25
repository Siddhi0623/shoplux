import express from "express";

import {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

import authUser from "../middleware/auth.js";


const orderRouter = express.Router();


// ROUTES
orderRouter.post(  "/place",           authUser, placeOrder);         // Place new order
orderRouter.get(   "/myorders",        authUser, getUserOrders);       // Logged-in user's orders
orderRouter.get(   "/all",             authUser, getAllOrders);         // All orders (admin)
orderRouter.get(   "/:id",             authUser, getOrderById);         // Single order
orderRouter.put(   "/status/:id",      authUser, updateOrderStatus);   // Update status (admin)
orderRouter.put(   "/cancel/:id",      authUser, cancelOrder);          // Cancel order


export default orderRouter;
