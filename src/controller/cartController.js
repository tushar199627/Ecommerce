let cartModel = require('../model/cartModel')
let userModel = require('../model/userModel')
let mongoose = require('mongoose')
const productModel = require('../model/productModel')

let createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let { cartId, productId } = req.body

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'invalid userId' })
        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: 'no such user found' })

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: 'no such product found or maybe deleted' })
        let productPrice = findProduct.price
        let productDetails = {
            productId,
            quantity: 1
        }

        //Authorisation
        let tokenUserId = req.decodedToken.userId
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }

        let findCart = await cartModel.findOne({ _id: cartId })
        if (findCart) {
            let alreadyProductsId = findCart.items.map(x => x.productId.toString())

            if (alreadyProductsId.includes(productId)) {
                let updatedCart = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.quantity": 1, totalPrice: productPrice } }, { new: true })

                return res.status(201).send({ status: true, message: "Success", data: updatedCart })

            } else {
                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, { $push: { items: productDetails }, $inc: { totalItems: 1, totalPrice: productPrice } }, { new: true })

                return res.status(201).send({ status: true, message: "Success", data: updatedCart })
            }
        }
        const cartCreate = {
            userId: userId,
            items: [productDetails],
            totalItems: 1,
            totalPrice: productPrice
        }
        const cartCreated = await cartModel.create(cartCreate)
        res.status(201).send({ status: true, message: "cart created successfully", data: cartCreated })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createCart }