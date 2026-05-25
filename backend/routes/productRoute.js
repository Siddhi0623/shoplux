import express from "express";

import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authUser from "../middleware/auth.js";
import upload   from "../middleware/upload.js";


const productRouter = express.Router();


// ROUTES
productRouter.post(   "/add",        upload.single("image"), authUser, addProduct);
productRouter.get(    "/list",                                          getProducts);
productRouter.get(    "/:id",                                           getProductById);
productRouter.put(    "/update/:id", upload.single("image"), authUser, updateProduct);
productRouter.delete( "/delete/:id",                         authUser, deleteProduct);


export default productRouter;
