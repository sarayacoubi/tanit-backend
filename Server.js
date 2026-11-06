

const express = require("express");
const path = require("path");

const ConnectDB = require("./Config/ConnectDB");
const userRouter = require("./Routes/User");
const productRouter = require("./Routes/Product");
const categoryRouter = require("./Routes/Category");
const orderRouter = require("./Routes/Orders");
const sendEmail = require("./Config/mailer");
const cors = require('cors');
const app = express();
require("dotenv").config();

app.use(cors({

  origin: process.env.cors_origine,

  credentials: true 

}))

ConnectDB();

// Accès aux images uploadées
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api/user", userRouter);

app.use("/api/product", productRouter);

app.use("/api/category", categoryRouter);
app.use("/api/order", orderRouter);





app.listen(
  process.env.port,
  console.log(`Server is running on the port ${process.env.port}`),
);
