const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate");


//==========================================================CREATE ORDER===========================================================================

const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let orderData = req.body;

    if (!validator.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "invalid userId" });

    let findUser = await userModel.findById({ _id: userId });

    if (!findUser) {
      return res.status(404).send({ status: false, message: "User nOT FOUND" });
    }

    let tokenUserId = req.userId;
    if (userId != tokenUserId) {
      return res
        .status(403)
        .send({ status: false, message: "UnAuthorized Access!!" });
    }

    let { cartId, cancellable, status } = orderData;

    if (!validator.isValidRequestBody(orderData)) {
      return res
        .status(400)
        .send({ status: false, message: "please provided the data" });
    }

    orderData["userId"] = userId;

    if (!validator.isValid(cartId)) {
      return res
        .status(400)
        .send({ status: "false", msg: "please enter the cartId" });
    }

    if (!validator.isValidObjectId(cartId)) {
      return res.status(400).send({ status: "false", msg: "invalid cartId" });
    }

    let findCart = await cartModel.findOne({ userId: userId, _id: cartId });

    if (!findCart) {
      return res.status(404).send({ status: false, message: "Cart nOT FOUND" });
    }

    if (!validator.validString.test(cancellable)) {
      return res
        .status(400)
        .send({ status: false, message: "enter true or false" });
    }

    if (cancellable) {
      if (typeof cancellable != "boolean") {
        return res.status(400).send({
          status: false,
          message: "Cancellable should be true or false",
        });
      }
    }

    if (!validator.validString.test(status)) {
      return res
        .status(400)
        .send({ status: false, message: "enter the status " });
    }

    if (status) {
      if (
        status != "pending" &&
        status != "completed" &&
        status != "cancelled"
      ) {
        return res.status(400).send({
          status: false,
          message: `Status must be along pending,completed,cancelled`,
        });
      }
    }

    let findCartDetail = await cartModel.findById(cartId);

    orderData.items = findCartDetail.items;
    orderData.totalPrice = findCartDetail.totalPrice;
    orderData.totalItems = findCartDetail.totalItems;

    let totalQuantity = 0;
    for (let i = 0; i < findCartDetail.items.length; i++) {
      totalQuantity = totalQuantity + findCartDetail.items[i].quantity;
    }
    orderData.totalQuantity = totalQuantity;

    const orderDetails = await orderModel.create(orderData);

    await cartModel.findOneAndUpdate(
      { _id: cartId, userId: userId },
      { $set: { items: [], totalPrice: 0, totalItems: 0 } }
    );

    return res.status(201).send({
      status: true,
      msg: "Order Created Successfully",
      data: orderDetails,
    });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

//===================================================UPDATE ORDER================================================================================

const updateOrder = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!validator.isValidObjectId(userId))
      return res.status(400).send({ status: false, message: "invalid userId" });

    let findUser = await userModel.findById({ _id: userId });

    if (!findUser) {
      return res.status(404).send({ status: false, message: "User nOT FOUND" });
    }

    let tokenUserId = req.userId;
    if (userId != tokenUserId) {
      return res
        .status(403)
        .send({ status: false, message: "UnAuthorized Access!!" });
    }

    let { orderId, status } = req.body;

    if (!validator.isValidObjectId(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid OrderId" });
    }

    let findOrderId = await orderModel.findById({ _id: orderId });
    if (!findOrderId) {
      return res
        .status(404)
        .send({ status: false, message: "Order doesn't exists" });
    }

    if (userId !== findOrderId.userId.toString()) {
      return res.status(404).send({
        status: false,
        message: "Order id not matched with userId",
      });
    }

    if (!validator.validString.test(status)) {
      return res
        .status(400)
        .send({ status: false, message: "enter the status " });
    }

    if (status) {
      if (
        status != "pending" &&
        status != "completed" &&
        status != "cancelled"
      ) {
        return res.status(400).send({
          status: false,
          message: "Status must be along pending,completed,cancelled",
        });
      }
    }

    if (findOrderId.cancellable == true) {
      if (findOrderId.status == "completed") {
        return res.status(200).send({
          status: false,
          message: "Order already Completed",
        });
      }
      if (findOrderId.status == "pending") {
        const updateOrder = await orderModel.findOneAndUpdate(
          { _id: findOrderId._id },
          { $set: { status: status } },
          { new: true }
        );
        return res.status(200).send({
          status: true,
          message: "Order successfully updated.",
          data: updateOrder,
        });
      }
      if (findOrderId.status == "cancelled") {
        return res
          .status(200)
          .send({ status: false, message: "Order already Cancelled." });
      }
    }
    return res.status(400).send({
      status: false,
      message: "your order is not cancelable",
    });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { createOrder, updateOrder };