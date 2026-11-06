const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Client qui passe la commande
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userEcommerce",
      required: true,
    },

    // Produits commandés
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        image: {
          type: String,
          default: "",
        },
      },
    ],

    // Prix total de la commande
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Informations de livraison
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
        default: "",
      },
    },

    phone: {
      type: String,
      required: true,
    },

    // Moyen de paiement
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery"],
      default: "cash_on_delivery",
    },

    // État du paiement
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // État de la commande
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Index utilisateur + date de création
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Orders", orderSchema);
