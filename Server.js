require("dotenv").config();

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

app.use(cors({

  origin: process.env.cors_origine,

  credentials: true 

}))

// Accès aux images uploadées
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api/user", userRouter);

app.use("/api/product", productRouter);

app.use("/api/category", categoryRouter);
app.use("/api/order", orderRouter);

// app.get("/test", (req, res) => {
//   res.status(200).send("Server is working!");
// });

// app.get("/test-email", async (req, res) => {
//   try {
//     await sendEmail(
//       "sarayacoubi96@gmail.com",
//       "Test Tanit",
//       "<h1>Bienvenue sur Tanit !</h1><p>Test d'envoi réussi.</p>",
//     );

//     res.send("Email sent successfully");
//   } catch (error) {
//     console.error("EMAIL ERROR:", error);

//     res.status(500).send({
//       message: "Email sending failed",
//       error: error.message,
//       code: error.code,
//       response: error.response,
//     });
//   }
// });

ConnectDB();

app.listen(
  process.env.port,
  console.log(`Server is running on the port ${process.env.port}`),
);
