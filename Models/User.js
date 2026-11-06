const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["client", "admin", "artisan","livreur"],
      default: "client",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
  type: Boolean,
  default: false,
},
activationToken: {
  type: String,
  default: null,
},

activationTokenExpires: {
  type: Date,
  default: null,
},
    profilePicture: {
      type: String,
      default: "",
    },

  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("userEcommerce", userSchema);
