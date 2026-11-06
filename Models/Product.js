const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    //Information générales
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    //Catégory du produit
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      default: "",
      index: true,
    },

    // Artisan propriétaire du produit

    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userEcommerce",
      required: true,
      default: "",
      index: true,
    },

    // Images du produits
    images: [
      {
        type: String,
        trim: true,
      },
    ],

    // Photo principale du produit
    mainImage: {
      type: String,
      trim: true,
      default: "",
    },
    // Catactéristiques artisanales

    materials: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    colors: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    dimensions: {
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
      unit: {
        type: String,
        enum: ["mm", "cm", "m"],
        default: "cm",
      },
    },

    weight: {
      type: Number,
      min: 0,
      default: 0,
    },
    weightUnit: {
      type: String,
      enum: ["g", "kg"],
      default: "g",
    },

    origin: {
      type: String,
      trim: true,
    },

    // Stock et disponibilité

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Promotion
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    //Validation par l'administrateur

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
