const orderModel = require('../model/orderModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const validator = require('../validation/validator')

const orderCreat = async function (req, res) {
    try {
        const data = req.body
        const userId = req.params.userId
        let { cartId, cancellable, status } = data
        // data.totalPrice = 0;
        // data.totalItems = 0;
        // data.totalQuantity = 0;

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter data" })
        //if(!items || items.length==0) return res.status(400).send({status : false, message : 'Please enter items'})

        // if(!totalPrice) return res.status(400).send({status : false, message : 'Please enter total price'})
        // if(!totalItems) return res.status(400).send({status : false, message : 'Please enter totalItems'})
        // if(!totalQuantity) return res.status(400).send({status : false, message : 'Please enter total Quantity'})
        if (!cartId) return res.status(400).send({ status: false, message: 'Please enter cartId' })
        if (typeof cartId != 'string') return res.status(400).send({ status: false, message: 'cartId should be string' })
        if (!validator.isValid(cartId)) return res.status(400).send({ status: false, message: 'cartId should not be blank' })
        if (!validator.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'Invalid cartId' })
        if (cancellable) {
            if (typeof cancellable != 'boolean') return res.status(400).send({ status: false, message: 'Cancellable value should be boolean' })
        }
        if (status) {
            if (typeof status != 'string') return res.status(400).send({ status: false, message: 'Status value should be string' })
            data.status = status.toLowerCase()
            if (!["pending", "completed", "cancelled"].includes(data.status)) return res.status(400).send({ status: false, message: "Status should be only pending, completed, cancled" })
        }

        // let checkUserId = await userModel.findById(userId)
        // if(!checkUserId) return res.status(404).send({status : false, message : `${userId} Invalid userId`})

        let checkCartId = await cartModel.findById(cartId).select({ _id: 0, createdAt: 0, updatedAt: 0 })
        if (!checkCartId) return res.status(404).send({ status: false, message: 'cartId not found' })
        let { items, totalPrice, totalItems } = checkCartId

        if (checkCartId.userId != userId) return res.status(403).send({ status: false, message: "cartId does not math with user" })

        if (!items || items.length == 0) return res.status(400).send({ status: false, message: "Cart don't have any product" })
        let enterData = checkCartId.toObject()
        enterData.totalQuantity = 0
        items.map(x => enterData.totalQuantity += x.quantity)
        enterData.cancellable = cancellable
        enterData.status = data.status
        //enterData.userId = userId
        //console.log(enterData.totalQuantity,enterData)
        // for(let i = 0 ;i<items.length;i++){
        //     if(typeof items[i]['productId'] != 'string') return res.status(400).send({status : false, message : `You shoulde enter ${items[i].productId} productId in string`})
        //     if(typeof items[i]['quantity'] != 'number' ) return res.status(400).send({status : false, message : `You shoulde enter ${items[i].productId} quantity in number`})
        //     if(!validator.isValidObjectId(items[i].productId)) return res.status(400).send({status : false, message :  `${items[i].productId} Invalid userId`})
        //     let checkProduct = await productModel.findOne({_id : items[i].productId, isDeleted : false})
        //     if(!checkProduct) return res.status(404).send({status : false, message : `${items[i].productId} is not a valid product Id or deleted product`})
        //     if(items[i]['quantity']<=0) return res.status(400).send({status : false, message :`${items[i].productId} quantity should be more than zero`})
        //     data.totalPrice += checkProduct.price*items[i]['quantity']
        //     data.totalQuantity += items[i]['quantity']
        // }
        // data.totalItems = items.length

        const orderData = await orderModel.create(enterData)
        return res.status(201).send({ status: true, message: "Order created successfully", data: orderData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updatedOrders = async (req, res) => {
    try {
        let data = req.body
        let userId = req.params.userId
        let { orderId, status } = data

        if (!orderId) return res.status(400).send({ status: false, messege: "order Id must be present" })

        if (typeof orderId != "string") return res.status(400).send({ status: false, message: 'orderId should be string' })
        if (!validator.isValid(orderId)) return res.status(400).send({ status: false, message: 'orderId should not be empty' })
        if (!(validator.isValidObjectId(orderId))) return res.status(400).send({ status: false, message: 'please enter valid orderId' })

        let findOrder = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!findOrder) return res.status(404).send({ status: false, messege: "order Id does not exist" })

        if (findOrder.userId != userId) return res.status(400).send({ status: false, messege: "oredrId does not match with user" })

        if (findOrder.cancellable == false) return res.status(400).send({ status: false, messege: "you can not cancel this order" })

        if (status == "completed") return res.status(400).send({ status: false, messege: "the order is completed so cannot be cancelled" })
        if (status == "cancelled") return res.status(400).send({ status: false, messege: "the order is already cancelled" })

        let updatedata = await orderModel.findOneAndUpdate({ _id: orderId }, { isDeleted: true, deletedAt: Date.now(), status: "cancelled" }, { new: true },)

        await cartModel.findOneAndUpdate({ userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        res.status(200).send({ status: true, message: "Order, cancelled successfully", data: updatedata })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { orderCreat, updatedOrders }