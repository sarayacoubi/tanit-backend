const express = require("express");
const uploadCategory = require("../Config/uploadCategory");
const {
  AddCategory,
  GetAllCategories,
  GetOneCategory,
  EditOneCategory,
  DeleteOneCategory,
} = require("../Controllers/Category");

const {
  verifAddCategory,
  CategoryValidation,
} = require("../Middlewares/CategoryValidation");
const categoryRouter = express.Router();

categoryRouter.post(
  "/AddCategory",
  uploadCategory.single("image"),
  verifAddCategory,
  CategoryValidation,
  AddCategory,
);

categoryRouter.get("/GetAllCategories", GetAllCategories);

categoryRouter.get("/GetOneCategory/:id", GetOneCategory);

categoryRouter.put(
  "/EditOneCategory/:id",
  uploadCategory.single("image"),
  EditOneCategory,
);

categoryRouter.delete("/DeleteOneCategory/:id", DeleteOneCategory);

module.exports = categoryRouter;
