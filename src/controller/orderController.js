const orderModel = require('../model/orderModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const cartModel = require('../model/cartModel')
const validator = require('../validation/validator')

const orderCreat = async function(req,res){
    try{
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

        if(checkCartId.userId != userId) return res.status(403).send({status : false, message : "UnAuthorized Access!!"})

        if(!items || items.length==0) return res.status(400).send({status : false, message : "Cart don't have any product"})
        let enterData = checkCartId.toObject()
        enterData.totalQuantity = 0
        items.map(x => enterData.totalQuantity+= x.quantity)

        const orderData = await orderModel.create(enterData)
        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalPrice: 0, totalItems:  0})
        return res.status(201).send({status : true, message : "Order created successfully", data : orderData})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}

module.exports = {orderCreat}