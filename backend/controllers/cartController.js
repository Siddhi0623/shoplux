import userModel from "../models/UserModel.js";


// GET CART
const getCart = async (req, res) => {
  try {

    const { userId } = req.body;

    const user = await userModel
      .findById(userId)
      .populate("cartData.productId", "name price image inStock");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, cartData: user.cartData });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// ADD TO CART / UPDATE QTY
const addToCart = async (req, res) => {
  try {

    const { userId, productId, qty, selectedSize, selectedColor } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // CHECK IF SAME ITEM (same product + size + color) ALREADY IN CART
    const existingIndex = user.cartData.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize  === (selectedSize  || "") &&
        item.selectedColor === (selectedColor || "")
    );

    if (existingIndex >= 0) {
      // UPDATE QTY
      user.cartData[existingIndex].qty += qty || 1;
    } else {
      // ADD NEW ITEM
      user.cartData.push({
        productId,
        qty:           qty           || 1,
        selectedSize:  selectedSize  || "",
        selectedColor: selectedColor || "",
      });
    }

    await user.save();

    res.json({
      success: true,
      message: "Cart updated",
      cartData: user.cartData,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// UPDATE CART ITEM QTY
const updateCartItem = async (req, res) => {
  try {

    const { userId, productId, qty, selectedSize, selectedColor } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const itemIndex = user.cartData.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedSize  === (selectedSize  || "") &&
        item.selectedColor === (selectedColor || "")
    );

    if (itemIndex < 0) {
      return res.json({ success: false, message: "Item not found in cart" });
    }

    if (qty <= 0) {
      // REMOVE IF QTY IS 0
      user.cartData.splice(itemIndex, 1);
    } else {
      user.cartData[itemIndex].qty = qty;
    }

    await user.save();

    res.json({
      success: true,
      message: "Cart item updated",
      cartData: user.cartData,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
  try {

    const { userId, productId, selectedSize, selectedColor } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.cartData = user.cartData.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.selectedSize  === (selectedSize  || "") &&
          item.selectedColor === (selectedColor || "")
        )
    );

    await user.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      cartData: user.cartData,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// CLEAR ENTIRE CART
const clearCart = async (req, res) => {
  try {

    const { userId } = req.body;

    await userModel.findByIdAndUpdate(userId, { cartData: [] });

    res.json({ success: true, message: "Cart cleared" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// EXPORTS
export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
