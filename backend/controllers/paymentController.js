import Razorpay from "razorpay";
import crypto   from "crypto";

// Lazy initializer — called inside handlers so env vars are already loaded
const getRazorpay = () =>
  new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


// ── POST /api/payment/create-order ──────────────────────────────────────────
// Body: { amount }   (in INR rupees, e.g. 649.50)
// Creates a Razorpay order and returns { order } with id, amount, currency
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount:   Math.round(amount * 100),   // paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);

    res.json({ success: true, order });

  } catch (error) {
    console.error("Razorpay createOrder error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


// ── POST /api/payment/verify ─────────────────────────────────────────────────
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Verifies the HMAC-SHA256 signature from Razorpay
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({ success: false, message: "Missing payment details" });
    }

    const body              = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Payment verification failed — invalid signature" });
    }

    res.json({ success: true, message: "Payment verified", paymentId: razorpay_payment_id });

  } catch (error) {
    console.error("Razorpay verify error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


export { createOrder, verifyPayment };
