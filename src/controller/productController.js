const productModel = require("../model/productModel")
const { default: mongoose } = require('mongoose')
const validator = require("../validation/validator")

const getAllProduct = async function(req, res){
    try{
    const data = req.query
    let {name, priceGreaterThan, priceLessThan, size, priceSort} = data
    let filters
    let searchObj = {isDeleted: false}
    priceSort = parseInt(priceSort)

    if(size) searchObj.availableSizes = size
    if(name) searchObj.title = { $regex :name.trim(), $options: 'i'}
    if(priceGreaterThan) searchObj.price = {$gt : priceGreaterThan}
    if(priceLessThan) searchObj.price = {$lt : priceLessThan}
    if(priceGreaterThan && priceLessThan) searchObj.price = {$gt : priceGreaterThan, $lt : priceLessThan}
    if(priceSort) filters ={price : priceSort}
    if(priceSort>1 || priceSort < -1 || priceSort ==0) return res.status(400).send({status : false, message : 'Please enter either 1 or -1 is priceSort'})

    const products = await productModel.find(searchObj).sort(filters)  
    return res.status(200).send({status : false, message: "Success", data : products})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}

//module.exports = {}


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

const updateProductDetails = async function (req, res) {
    try {
        const productId = req.params.productId
        const image = req.files
        const updateData = req.body

        let { title, description, price, style, availableSizes, installments } = updateData

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "invalid product Id" })

        let findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(404).send({ status: false, msg: "Product not found" })

        if ((Object.keys(updateData).length == 0)) return res.status(400).send({ status: false, msg: "please provide data to update" })

        if (image && image.length > 0) {
            if (!isImageFile(image[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image only" })
            let updateProductImage = await uploadFile(image[0])
            updateData.productImage = updateProductImage
        }

        if (typeof title != "undefined") {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title Should be Valid" })
            if (!isValidString(title)) return res.status(400).send({ status: false, message: "title should not contain number" })
            if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "title Should be Unique" })
        }
        if (description != undefined) {
            if (!isValid(description)) return res.status(400).send({ status: false, message: "description Should be Valid" })
        }
        if (price != undefined) {
            if (!isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be Valid" })
        }

        if (style != undefined) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "style Should be Valid" })
            if (!isValidString(style)) return res.status(400).send({ status: false, message: "style Should Not Contain Numbers" })
        }
        if (availableSizes != undefined) {
            if (!isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes Should be Valid" })
            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())
            if (availableSizes.map(x => isValidSize(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be Among  S,XS,M,X,L,XXL,XL" })
            updateData.availableSizes = availableSizes
        }
        if (installments != undefined) {
            if (isValidString(installments)) return res.status(400).send({ status: false, message: "installments Should be whole Number Only" })
        }

        const updateDetails = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, updateData, { new: true }).select({__v:0})
        return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



module.exports = { getById, deleteProduct, getAllProduct,updateProductDetails}
