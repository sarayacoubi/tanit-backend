const Category = require("../Models/Category");

exports.AddCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      ...req.body,
      image: req.file ? req.file.filename : "",
    });

    await newCategory.save();
    return res
      .status(200)
      .send({ msg: "Category added with success", newCategory });
  } catch (error) {
    //   return res
    //     .status(500)
    //     .send({ errors: [{ msg: "You can not add category" }] });
    // }

    // console.error("AddCategory error:", error);

    return res.status(500).send({
      errors: [{ msg: error.message }],
    });
  }
};

exports.GetAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).send({ msg: "Category list :", categories });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "Cannot get all category" }] });
  }
};

exports.GetOneCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send({ errors: [{ msg: "Category not found" }] });
    }
    return res.status(200).send({ msg: "The category:", category });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "Cannot get the category" }] });
  }
};

exports.EditOneCategory = async (req, res) => {
  try {
   

    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).send({
        errors: [{ msg: "Category not found" }],
      });
    }

    category.name = name;
    category.description = description;
    category.isActive = isActive === "true";

    // Si une nouvelle image a été envoyée
    if (req.file) {
      category.image = req.file.filename;
    }

    await category.save();

    return res.status(200).send({
      msg: "Category updated with success",
      category,
    });
  } catch (error) {
    console.error("EditOneCategory error:", error);

    return res.status(500).send({
      errors: [{ msg: "Cannot edit the category" }],
    });
  }
};

exports.DeleteOneCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).send({ errors: [{ msg: "Category not found" }] });
    }
    return res
      .status(200)
      .send({ msg: " Category deleted with success", deletedCategory });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "Cannot delete the category" }] });
  }
};
