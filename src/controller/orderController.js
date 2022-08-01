const orderModel = require('../model/orderModel')
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const validator = require('../validation/validator')

const orderCreat = async function(req,res){
    try{
        const data = req.body
        const userId = req.params.userId
        let { items, cancellable, status} = data
        data.totalPrice = 0;
        data.totalItems = 0;
        data.totalQuantity = 0;

        if(Object.keys(data).length == 0) return res.status(400).send({status : false, message : "Please enter data"})
        if(!items || items.length==0) return res.status(400).send({status : false, message : 'Please enter items'})
        
        // if(!totalPrice) return res.status(400).send({status : false, message : 'Please enter total price'})
        // if(!totalItems) return res.status(400).send({status : false, message : 'Please enter totalItems'})
        // if(!totalQuantity) return res.status(400).send({status : false, message : 'Please enter total Quantity'})
        if(cancellable){
            if(typeof cancellable != 'boolean') return res.status(400).send({status : false, message : 'Cancellable value should be boolean'})
        }
        if(status){
            if(typeof status != 'string') return res.status(400).send({status : false, message : 'Status value should be string'})
            data.status = status.toLowerCase()
            if(!["pending", "completed", "cancelled"].includes(data.status)) return res.status(400).send({status : false, message : "Status should be only pending, completed, cancled"})
        }

        let checkUserId = await userModel.findById(userId)
        if(!checkUserId) return res.status(400).send({status : false, message : `${userId} Invalid userId`})

        for(let i = 0 ;i<items.length;i++){
            if(typeof items[i]['productId'] != 'string') return res.status(400).send({status : false, message : `You shoulde enter ${items[i].productId} productId in string`})
            if(typeof items[i]['quantity'] != 'number' ) return res.status(400).send({status : false, message : `You shoulde enter ${items[i].productId} quantity in number`})
            if(!validator.isValidObjectId(items[i].productId)) return res.status(400).send({status : false, message :  `${items[i].productId} Invalid userId`})
            let checkProduct = await productModel.findOne({_id : items[i].productId, isDeleted : false})
            if(!checkProduct) return res.status(400).send({status : false, message : `${items[i].productId} is not a valid product Id or deleted product`})
            if(items[i]['quantity']<=0) return res.status(400).send({status : false, message :`${items[i].productId} quantity should be more than zero`})
            data.totalPrice += checkProduct.price*items[i]['quantity']
            data.totalQuantity += items[i]['quantity']
        }
        data.totalItems = items.length

        const orderData = await orderModel.create(data)
        return res.status(400).send({status : true, message : "Order created successfully", data : orderData})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}

module.exports = {orderCreat}