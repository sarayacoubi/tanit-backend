const {
  AddOrder,
  getAllOrders,
  getOneOrder,
  editOrderStatus,
  getMyOrders,
} = require("../Controllers/Order");

const express = require("express");
const { IsAuth } = require("../Middlewares/IsAuth");

const orderRouter = express.Router();

orderRouter.post("/AddOrder", IsAuth, AddOrder);

orderRouter.get("/GetAllOrders", getAllOrders);

orderRouter.get("/GetOneOrder/:id", getOneOrder);

orderRouter.put("/EditOrderStatus/:id", editOrderStatus);

orderRouter.get("/GetMyOrders", IsAuth, getMyOrders);

module.exports = orderRouter;
