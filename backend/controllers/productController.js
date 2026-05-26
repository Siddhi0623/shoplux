import productModel from "../models/ProductModel.js";


// ADD PRODUCT
const addProduct = async (req, res) => {
  try {

    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      badge,
      badgeColor,
      isNew,
      isFeatured,
    } = req.body;

    // IMAGE
    const image = req.file ? req.file.filename : "";

    // CREATE PRODUCT
    const newProduct = new productModel({
      name,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      discount: Number(discount) || 0,
      category,
      subCategory: subCategory || "",
      image,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      stock: Number(stock) || 0,
      inStock: Number(stock) > 0,
      badge: badge || "",
      badgeColor: badgeColor || "",
      newArrival: isNew === "true",
      isFeatured: isFeatured === "true",
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {

    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy,
    } = req.query;

    // BUILD FILTER
    const filter = {};

    if (category) filter.category = category;
    if (inStock === "true") filter.inStock = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category:    { $regex: search, $options: "i" } },
      ];
    }

    // BUILD SORT
    let sort = {};
    if (sortBy === "price_asc")  sort.price     =  1;
    if (sortBy === "price_desc") sort.price     = -1;
    if (sortBy === "newest")     sort.createdAt = -1;
    if (sortBy === "rating")     sort.rating    = -1;

    const products = await productModel.find(filter).sort(sort);

    res.json({ success: true, products });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {

    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {

    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      subCategory,
      sizes,
      colors,
      stock,
      badge,
      badgeColor,
      isNew,
      isFeatured,
    } = req.body;

    // BUILD UPDATE OBJECT
    const updateData = {
      name,
      description,
      price:         Number(price),
      originalPrice: Number(originalPrice) || 0,
      discount:      Number(discount) || 0,
      category,
      subCategory:   subCategory || "",
      sizes:         sizes ? JSON.parse(sizes) : [],
      colors:        colors ? JSON.parse(colors) : [],
      stock:         Number(stock) || 0,
      inStock:       Number(stock) > 0,
      badge:         badge || "",
      badgeColor:    badgeColor || "",
      newArrival:    isNew === "true",
      isFeatured:    isFeatured === "true",
    };

    // UPDATE IMAGE IF NEW ONE UPLOADED
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {

    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// EXPORTS
export {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
