const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate.js")


//************POST /users/:userId/cart*****************

let createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let { cartId, productId } = req.body

        if(Object.keys(req.body).length==0) return res.status(400).send({status : false, message : 'Please enter data [ Product Id ]'})
        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'invalid userId' })
        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: 'no such user found' })

        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'invalid productId' })
        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: 'no such product found or maybe deleted' })

        let productPrice = findProduct.price

        let productDetails = {
            productId,
            quantity: 1
        }

        let findCart

        if ("cartId" in req.body) {
            if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'invalid cartId' })
            findCart = await cartModel.findOne({ _id: cartId, userId })
            
            if(!findCart) return res.status(404).send({ status: false, message: 'cart id does not exists' })

        } else {
            findCart = await cartModel.findOne({ userId: userId })
        }

        //Authorisation
        let tokenUserId = req.userId
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }


        if (findCart) {
            let alreadyProductsId = findCart.items.map(x => x.productId.toString())

            if (alreadyProductsId.includes(productId)) {
                let updatedCart = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": 1, totalPrice: productPrice } }, { new: true })
               

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
//**************PUT /users/:userId/cart **************** */

const updatedCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { productId, cartId, removeProduct } = data;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: 'please enter data to update' })

        if (!(validator.isValidObjectId(userId))) return res.status(400).send({ status: false, message: 'please enter valid user id' })
        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: 'no such user found' })

         //Authorisation
         let tokenUserId = req.userId
         if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
         }

        if (!(validator.isValidObjectId(productId))) return res.status(400).send({ status: false, message: 'please enter valid product id' })
        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, message: 'product not found' })

        if (!(validator.isValidObjectId(cartId))) return res.status(400).send({ status: false, message: 'please enter valid cart Id' })
        let findCart = await cartModel.findOne({ _id: cartId, userId })
        if (!findCart) return res.status(404).send({ status: false, message: 'cart not found' })

        if (!(removeProduct == 0 || removeProduct == 1)) return res.status(400).send({ status: true, message: 'removeProduct value should be either 1 or 0' })

        let itemsOfCart = findCart.items
        if (itemsOfCart.length == 0) return res.status(400).send({ status: false, message: "cart is already empty" })

        for (let i = 0; i < itemsOfCart.length; i++) {
            if (itemsOfCart[i].productId == productId) {
                let priceChange = itemsOfCart[i].quantity * findProduct.price;

                if (removeProduct == 0) {
                    const update = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: findCart.totalPrice - priceChange, totalItems: findCart.totalItems - 1 }, { new: true })
                    return res.status(200).send({ status: true, message: 'Remove product Successfully', data: update })
                }

                if (removeProduct == 1) {
                    if (itemsOfCart[i].quantity == 1) {
                        const update = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: findCart.totalPrice - priceChange, totalItems: findCart.totalItems - 1 }, { new: true })
                        return res.status(200).send({ status: true, message: 'Remove product Successfully & price updated', data: update })
                    }

                    itemsOfCart[i].quantity = itemsOfCart[i].quantity - 1;
                    const update = await cartModel.findOneAndUpdate({ _id: cartId }, { items: itemsOfCart, totalPrice: findCart.totalPrice - findProduct.price }, { new: true })
                    return res.status(200).send({ status: true, message: 'One item removed successfully', data: update })
                }
            }
            else {
                return res.status(404).send({ status: false, message: 'please add the item in the cart first and then update' })
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//***************GET /users/:userId/cart*****************

const getCartDetails = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'invalid userId' })
        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: 'no such user found' })

        //Authorisation
        let tokenUserId = req.userId
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }

        let findCart = await cartModel.findOne({ userId })
        if (!findCart) return res.status(404).send({ status: false, message: 'no such cart found for this user' })

        res.status(200).send({ status: true, message: 'Success', data: findCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//****************DELETE /users/:userId/cart********************

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'invalid userId' })
        let user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: 'no such user found' })

        //Authorisation
        let tokenUserId = req.userId
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }
    
        let findCart = await cartModel.findOne({ userId })
        if (!findCart) return res.status(404).send({ status: false, message: 'no such cart found for this user' })

        const deleteCart = await cartModel.findOneAndUpdate({ _id: findCart._id }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        res.status(200).send({ status: true, message: 'successfully deleted', data: deleteCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createCart,updatedCart,getCartDetails,deleteCart }
