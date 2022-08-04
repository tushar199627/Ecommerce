const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate");

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
      totalQuantity += findCartDetail.items[i].quantity;
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

module.exports = { createOrder };
