const Product = require("../Models/Product");



// ajouter produits avec images

exports.AddProduct = async (req, res) => {
  try {
    // 1. Récupérer les images envoyées par Multer
    const images = req.files
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    // 2. Convertir les données envoyées par FormData
    const newProduct = new Product({
      ...req.body,

      // Les tableaux et l'objet arrivent comme des chaînes JSON
      materials: JSON.parse(req.body.materials || "[]"),
      colors: JSON.parse(req.body.colors || "[]"),
      dimensions: JSON.parse(
        req.body.dimensions || '{"length":0,"width":0,"height":0,"unit":"cm"}',
      ),

      // Convertir les nombres
      price: Number(req.body.price),
      weight: Number(req.body.weight),
      stock: Number(req.body.stock),
      discount: Number(req.body.discount || 0),

      // Convertir la disponibilité en booléen
      isAvailable: req.body.isAvailable === "true",

      // Enregistrer les chemins des images
      images,
    });

    // 3. Enregistrer dans MongoDB
    await newProduct.save();

    // 4. Envoyer la réponse au frontend
    return res.status(201).send({
      msg: "Product added",
      newProduct,
    });
  } catch (error) {
    // console.error("Erreur AddProduct :", error);

    return res.status(500).send({
      errors: [{ msg: "Could not add product" }],
    });
  }
};



exports.GetAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("artisan");

    return res.status(200).send({
      msg: "Products list:",
      products,
    });
  } catch (error) {
    console.error("Erreur GetAllProducts :", error);

    res.status(500).send({
      errors: [{ msg: "Cannot get all products" }],
    });
  }
};

exports.GetOneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Product.findById(id)
      .populate("category")
      .populate("artisan");

    if (!found) {
      return res.status(400).send({ errors: [{ msg: "Product not found" }] });
    }
    return res.status(200).send({ msg: "The product", found });
  } catch (error) {
    // console.error("Erreur GetOneProduct :", error);
    return res
      .status(500)
      .send({ errors: [{ msg: "Could have the product" }] });
  }
};



exports.EditOneProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Chercher le produit existant
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({
        errors: [{ msg: "Product not found" }],
      });
    }

    // 2. Récupérer les données envoyées par FormData
    const updateData = { ...req.body };

    // 3. Convertir les chaînes JSON en tableaux et objet
    updateData.materials = JSON.parse(req.body.materials || "[]");
    updateData.colors = JSON.parse(req.body.colors || "[]");

    updateData.dimensions = JSON.parse(
      req.body.dimensions || '{"length":0,"width":0,"height":0,"unit":"cm"}',
    );

    // 4. Convertir les valeurs numériques
    updateData.price = Number(req.body.price);
    updateData.weight = Number(req.body.weight);
    updateData.stock = Number(req.body.stock);
    updateData.discount = Number(req.body.discount || 0);

    // 5. Convertir la disponibilité en booléen
    updateData.isAvailable = req.body.isAvailable === "true";

    // 6. Conserver les anciennes images et ajouter les nouvelles
    let allImages = [...(product.images || [])];

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );

      allImages = [...allImages, ...newImages];
    }

    // Mettre à jour images seulement si de nouvelles images existent
    if (req.files && req.files.length > 0) {
      updateData.images = allImages;
    }

    // 7. Définir la photo principale
    if (req.body.mainImage) {
      updateData.mainImage = req.body.mainImage;
    } else {
      // Conserver la photo principale existante
      // ou utiliser la première image si aucune n'est définie
      updateData.mainImage = product.mainImage || product.images?.[0] || "";
    }

    // 7. Enregistrer les modifications
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    // 8. Retourner le produit modifié
    return res.status(200).send({
      msg: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Erreur réelle EditOneProduct :", error);

    return res.status(500).send({
      errors: [
        {
          msg: "Could not edit the product",
        },
      ],
    });
  }
};

exports.DeleteOneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).send({ errors: [{ msg: "Product not found" }] });
    }
    res
      .status(200)
      .send({ msg: "Product deleted successfully", deletedProduct });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "Cannot delete the product" }] });
  }
};
