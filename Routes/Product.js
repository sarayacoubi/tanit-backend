const uploadProducts = require("../Config/uploadProducts");

const express = require("express");

const {
  AddProduct,
  GetAllProducts,
  GetOneProduct,
  EditOneProduct,
  DeleteOneProduct,
} = require("../Controllers/Product");
const {
  verifAddProduct,
  ProductValidation,
} = require("../Middlewares/ProductValidation");

const productRouter = express.Router();

productRouter.post(
  "/AddProduct",
  uploadProducts.array("images", 5),
  verifAddProduct,

  ProductValidation,
  AddProduct,
);

productRouter.get("/GetAllProducts", GetAllProducts);

productRouter.get("/GetOneProduct/:id", GetOneProduct);

productRouter.put(
  "/EditOneProduct/:id",
  uploadProducts.array("images", 5),
  EditOneProduct,
);

productRouter.delete("/DeleteOneProduct/:id", DeleteOneProduct);
module.exports = productRouter;
