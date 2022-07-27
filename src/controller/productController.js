const { default: mongoose } = require('mongoose')
const productModel = require('../model/productModel')
const validator = require("../validation/validator")

const getById = async(req,res)=>{
    const productId = req.params.productId

    if(!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" })

    const checkProduct = await productModel.findOne({_id: productId, isDeleted: false})
    if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" })

    res.status(200).send({status: true, message:'Success', data:checkProduct})
}

const deleteProduct = async(req, res)=>{
    const productId = req.params.productId;

    if(!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" });

    const checkProduct = await productModel.findOne({_id: productId, isDeleted: false});
    if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" });

    await productModel.findByIdAndUpdate({_id: productId}, {isDeleted: true, deletedAt: Date.now()});

    res.status(200).send({status: true, message:'deleted sucessfully'})
}


module.exports = { getById, deleteProduct }