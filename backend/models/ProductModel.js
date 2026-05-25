import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:   { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment:{ type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Men", "Women", "Kids", "Shoes", "Electronics", "Beauty"],
    },
    image: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    sizes:  [{ type: String }],
    colors: [{ type: String }],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      default: "",
    },
    badgeColor: {
      type: String,
      default: "",
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
