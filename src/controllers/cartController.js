const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate.js")

exports.createCart = async function (req, res) {
    // try{
    let userId = req.params.userId
    if (!validator.isValidRequestBody(userId)) {
        return res.status(400).send({ status: false, message: "Please provide the Details" });
    }
    let findUserId = await userModel.findById( userId )
    if (!findUserId) {
        return res.status(404).send({ status: false, message: "user doesnot exist" });
    }


    let data = req.body;
    if (!validator.isValidRequestBody(data)) {
        return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    

    let findProduct = await productModel.findOne({ _id: data.productId, isDeleted: false })
    if (!findProduct) {
        return res.status(404).send({ status: false, message: "Product doesnot exist" });
    }

    // let { items } = data
    // if (items.length > 1) {
    //     return res.status(400).send({ status: false, message: "Only one item can be added at once" });
    // }
    const findCartId = await cartModel.findOne({ userId: userId })
    if(!findCartId){
        const createCart = {}
       const item = {productId:data.productId,quantity:1}

        createCart.userId = userId
        createCart.items = [item]
        createCart.totalPrice = findProduct.price
        createCart.totalItems = 1
        const cartCreated = await cartModel.create(createCart)
        res.status(201).send({status:true, data:cartCreated})
    } 
    else{
        const addToCart = {}
        const item = {productId:data.productId,quantity:1}
        addToCart.$push= {items:item}
        
        addToCart.$inc = {totalPrice:2000}
        addToCart.$inc = {totalItems:1}
        const updatedData = await cartModel.findByIdAndUpdate({_id:findCartId._id},addToCart,{new:true})
        res.status(200).send({status:true, data:updatedData})
    }
    
    // if (items.length !== 0) {
    //     let productId = items[0].productId;
    //     if (!validator.isValidObjectId(productId)) {
    //         return res.status(400).send({ status: false, message: "Product Id is not Valid" });
    //     }

    //     if (!findProduct) {
    //         return res.status(404).send({ status: false, message: "Product doesnot exist" });
    //     }
    // }

}







