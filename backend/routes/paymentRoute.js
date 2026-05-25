import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import authUser from "../middleware/auth.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", authUser, createOrder);   // Create Razorpay order
paymentRouter.post("/verify",       authUser, verifyPayment); // Verify payment signature

export default paymentRouter;
