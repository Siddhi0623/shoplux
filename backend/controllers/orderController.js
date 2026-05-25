import orderModel from "../models/OrderModel.js";


// PLACE ORDER
const placeOrder = async (req, res) => {
  try {

    const {
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      shippingPrice,
      subtotal,
      tax,
      totalPrice,
    } = req.body;

    // VALIDATE ORDER ITEMS
    if (!orderItems || orderItems.length === 0) {
      return res.json({
        success: false,
        message: "No order items provided",
      });
    }

    // CREATE ORDER
    const newOrder = new orderModel({
      user:            userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod:  shippingMethod  || "standard",
      shippingPrice:   Number(shippingPrice) || 0,
      subtotal:        Number(subtotal),
      tax:             Number(tax),
      totalPrice:      Number(totalPrice),
      orderStatus:     "processing",
      isPaid:          paymentMethod !== "card" ? false : false,
    });

    const order = await newOrder.save();

    res.json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// GET LOGGED-IN USER ORDERS
const getUserOrders = async (req, res) => {
  try {

    const { userId } = req.body;

    const orders = await orderModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// GET ALL ORDERS  (admin)
const getAllOrders = async (req, res) => {
  try {

    const orders = await orderModel
      .find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {

    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email phone");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// UPDATE ORDER STATUS  (admin)
const updateOrderStatus = async (req, res) => {
  try {

    const { orderStatus, isPaid, isDelivered } = req.body;

    const updateData = { orderStatus };

    // MARK AS PAID
    if (isPaid === true) {
      updateData.isPaid   = true;
      updateData.paidAt   = Date.now();
    }

    // MARK AS DELIVERED
    if (isDelivered === true || orderStatus === "delivered") {
      updateData.isDelivered  = true;
      updateData.deliveredAt  = Date.now();
    }

    const order = await orderModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// CANCEL ORDER
const cancelOrder = async (req, res) => {
  try {

    const { userId } = req.body;

    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // ONLY OWNER CAN CANCEL
    if (order.user.toString() !== userId) {
      return res.json({ success: false, message: "Not authorized" });
    }

    // CANNOT CANCEL IF ALREADY SHIPPED OR DELIVERED
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.json({
        success: false,
        message: `Cannot cancel order that is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// EXPORTS
export {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
