const orderModel = require('../model/orderModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const validator = require('../validation/validator')

const orderCreat = async function (req, res) {
    try {
        const data = req.body
        const userId = req.params.userId
        let { cartId } = data

        if(Object.keys(data).length == 0) return res.status(400).send({status : false, message : "Please enter data"})
        
        if(!cartId) return res.status(400).send({status : false, message : 'Please enter cartId'})
        if(typeof cartId != 'string') return res.status(400).send({status : false, message : 'cartId should be string'})
        if(!validator.isValid(cartId)) return res.status(400).send({status : false, message : 'cartId should not be blank'})
        if(!validator.isValidObjectId(cartId)) return res.status(400).send({status : false, message : 'Invalid cartId'})

        let checkCartId = await cartModel.findById(cartId).select({_id : 0, createdAt : 0, updatedAt : 0})
        if(!checkCartId) return res.status(404).send({status : false, message : 'cartId not found'})
        let { items } = checkCartId

        if (checkCartId.userId != userId) return res.status(403).send({ status: false, message: "cartId does not math with user" })

        if (!items || items.length == 0) return res.status(400).send({ status: false, message: "Cart don't have any product" })
        let enterData = checkCartId.toObject()
        enterData.totalQuantity = 0
        items.map(x => enterData.totalQuantity+= x.quantity)

        const orderData = await orderModel.create(enterData)
        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalPrice: 0, totalItems:  0})
        return res.status(201).send({status : true, message : "Order created successfully", data : orderData})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updatedOrders = async (req, res) => {
    try {
        let data = req.body
        let userId = req.params.userId
        let { orderId } = data

        if (!orderId) return res.status(400).send({ status: false, messege: "order Id must be present" })

        if (typeof orderId != "string") return res.status(400).send({ status: false, message: 'orderId should be string' })
        if (!validator.isValid(orderId)) return res.status(400).send({ status: false, message: 'orderId should not be empty' })
        if (!(validator.isValidObjectId(orderId))) return res.status(400).send({ status: false, message: 'please enter valid orderId' })

        let findOrder = await orderModel.findOne({ _id: orderId,isDeleted: false })
        if (!findOrder) return res.status(404).send({ status: false, messege: "order Id does not exist" })

        if(findOrder.userId!=userId)  return res.status(400).send({ status: false, messege: "oredrId does not match with user" })
    
        if (findOrder.cancellable == false) return res.status(400).send({ status: false, messege: "you can not cancelled this order" })

        let updatedata = await orderModel.findOneAndUpdate({ _id: orderId }, { isDeleted: true,deletedAt: Date.now(), status: "cancelled" }, { new: true },)
        return res.status(200).send({ status: true, message: "Order, cancelled successfully", data: updatedata })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { orderCreat,updatedOrders }