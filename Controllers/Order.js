const Orders = require("../Models/Orders");
const Product = require("../Models/Product");
const mongoose = require("mongoose");

exports.AddOrder = async (req, res) => {
  const updatedStocks = [];

  try {
    const { items, shippingAddress, phone } = req.body;

    // 1. Vérifier l'authentification
    if (!req.user?._id) {
      return res.status(401).send({
        errors: [{ msg: "Vous devez être connecté pour commander" }],
      });
    }

    // 2. Vérifier le panier
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        errors: [{ msg: "Votre panier est vide" }],
      });
    }

    // 3. Vérifier les informations de livraison
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !phone
    ) {
      return res.status(400).send({
        errors: [{ msg: "Informations de livraison incomplètes" }],
      });
    }

    // 4. Regrouper les produits identiques et vérifier les quantités
    const groupedItems = new Map();

    for (const item of items) {
      const productId = item.product;
      const quantity = Number(item.quantity);

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).send({
          errors: [{ msg: "Produit ou quantité invalide" }],
        });
      }

      const id = productId.toString();

      groupedItems.set(id, (groupedItems.get(id) || 0) + quantity);
    }

    // 5. Préparer les articles de la commande
    const orderItems = [];
    let totalPrice = 0;

    for (const [productId, quantity] of groupedItems) {
      // Vérifier le produit et diminuer le stock
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
          isAvailable: true,
          status: "approved",
        },
        {
          $inc: { stock: -quantity },
        },
        { new: true },
      );

      // Produit indisponible ou stock insuffisant
      if (!product) {
        // Restaurer les stocks déjà diminués
        for (const updated of updatedStocks) {
          await Product.updateOne(
            { _id: updated.productId },
            { $inc: { stock: updated.quantity } },
          );
        }

        updatedStocks.length = 0;

        return res.status(400).send({
          errors: [
            {
              msg: `Le produit ${productId} est indisponible ou son stock est insuffisant`,
            },
          ],
        });
      }

      updatedStocks.push({ productId, quantity });

      // Calculer le prix après réduction éventuelle
      const unitPrice = Number(
        (product.price * (1 - product.discount / 100)).toFixed(3),
      );

      orderItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        quantity,
        image: product.mainImage || product.images?.[0] || "",
      });

      totalPrice += unitPrice * quantity;
    }

    // 6. Créer la commande
    const newOrder = new Orders({
      user: req.user._id,
      items: orderItems,
      totalPrice: Number(totalPrice.toFixed(3)),
      shippingAddress,
      phone,
      paymentMethod: "cash_on_delivery",
    });

    await newOrder.save();

    return res.status(201).send({
      msg: "Commande créée avec succès",
      newOrder,
    });
  } catch (error) {
    // Restaurer les stocks si la création échoue
    for (const updated of updatedStocks) {
      try {
        await Product.updateOne(
          { _id: updated.productId },
          { $inc: { stock: updated.quantity } },
        );
      } catch (rollbackError) {
        console.error("Erreur de restauration du stock :", rollbackError);
      }
    }

    console.error("Erreur AddOrder :", error);

    return res.status(500).send({
      errors: [{ msg: "Impossible de créer la commande" }],
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find();
    return res.status(200).send({ msg: "The orders list : ", orders });
  } catch (error) {
    return res.status(500).send({ msg: "Could not get the orders" });
  }
};

exports.getOneOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // console.log("ID de la commande :", id);
    const found = await Orders.findById(id)
      .populate("items.product")
      .populate("user");

    if (!found) {
      return res.status(400).send({ errors: [{ msg: "order not found" }] });
    }
    return res.status(200).send({ msg: "The order:", found });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "could not have the order", error }] });

   
  }
};

exports.editOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const updatedOrder = await Orders.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      return res.status(404).send({
        errors: [{ msg: "Commande introuvable" }],
      });
    }

    return res.status(200).send({
      msg: "Statut de la commande modifié avec succès",
      updatedOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ msg: "could not have the order", error }] });
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est connecté
    if (!req.user?._id) {
      return res.status(401).send({
        errors: [{ msg: "Vous devez être connecté" }],
      });
    }

    // Récupérer uniquement les commandes du client connecté
    const orders = await Orders.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).send({
      msg: "Vos commandes récupérées avec succès",
      orders,
    });

  } catch (error) {
    console.error("Erreur getMyOrders :", error);

    return res.status(500).send({
      errors: [{ msg: "Impossible de récupérer vos commandes" }],
    });
  }
};
