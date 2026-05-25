import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/mongodb.js";

import userRouter    from "./routes/userRoute.js";
import cartRouter    from "./routes/cartRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter   from "./routes/orderRoute.js";
import paymentRouter from "./routes/paymentRoute.js";


dotenv.config();

const app = express();


// DATABASE
connectDB();


// MIDDLEWARE
app.use(cors());

app.use(express.json());


// SERVE UPLOADED IMAGES
app.use("/images", express.static("uploads"));

// API ROUTES
app.use("/api/user",    userRouter);
app.use("/api/cart",    cartRouter);
app.use("/api/product", productRouter);
app.use("/api/order",   orderRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});




// SERVER
app.listen(process.env.PORT, () => {
  console.log(
    `Server running on PORT ${process.env.PORT}`
  );
});