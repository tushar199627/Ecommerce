
const productModel = require('../model/productModel')
const validator = require("../validation/validator")
const uploadFile = require('../aws/uploadFile')
const { default: mongoose } = require('mongoose')


const isValidBool = function (value) {

    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}



const createproduct = async function (req, res) {

    let data = req.body
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
    let files = req.files

    // data.availableSizes = data.availableSizes.split(' ')

    if (!title) return res.status(400).send({ status: false, message: 'Please enter title name' })
    if (!validator.isValid(title)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate...........' })


    if (!description) return res.status(400).send({ status: false, message: 'Please enter description' })
    if (!validator.isValid(description)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate...........' })

    if (!price) return res.status(400).send({ status: false, message: 'Please enter price' })
    if (!validator.isValidNumber(price)) return res.status(400).send({ status: false, message: 'Please enter price in only Number' })

    if (!currencyId) return res.status(400).send({ status: false, message: 'Please enter currencyId' })
    if (currencyId != "INR") return res.status(400).send({ status: false, message: 'Please enter currencyId as INR' })

    if (!currencyFormat) return res.status(400).send({ status: false, message: 'Please enter currencyFormat' })
    if (currencyFormat != "₹") return res.status(400).send({ status: false, message: 'Please enter currencyFormat as ₹' })

    if (style) {
        if (!validator.isValid(style)) return res.status(400).send({ status: false, message: 'Please enter style name in right formate...........' })
        if (!validator.isValidTitle(style)) return res.status(400).send({ status: false, message: 'Please enter style name in alpha' })
    }

    var availableSize = availableSizes.toUpperCase().split(",") //Creating an array 
    if (availableSize.length === 0) {
        return res.status(400).send({ status: false, message: "Please provide product sizes" })
    }
    for (let i = 0; i < availableSize.length; i++) {
        if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
            return res.status(400).send({ status: false, message: 'Sizes should be [S,XS,M,X,L,XXL,XL]' })
        }
    }
    data.availableSizes=availableSize

    if (installments) {
        if (!validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: 'Please enter installments in only Number' })
    }

    console.log(isFreeShipping)

    if ("isFreeShipping" in data) {
        if (!isValidBool(isFreeShipping)) {
            return res.status(400).send({ status: false, message: 'Please enter only true & false' })

        }
        if (!['true', 'false'].includes(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "isFreeshipping must be a Boolean Value" });
        }
    }
    // validation for Product image
    if (files.length == 0) return res.status(400).send({ status: false, message: "Please Provide Product Image" })
    if (!validator.isValidFile(files[0].originalname)) return res.status(400).send({ status: false, message: 'Image type should be png|gif|webp|jpeg|jpg' })
    data.productImage = await uploadFile.uploadFile(files[0])

    if (!validator.isValid(style)) return res.status(400).send({ status: false, message: 'Please enter style name in right formate...........' })

    let productdata = await productModel.create(data)
    res.send({ status: true, message: "product create successfully", data: productdata })

}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const getById = async (req, res) => {
    const productId = req.params.productId

    if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" })

    const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" })

    res.status(200).send({ status: true, message: 'Success', data: checkProduct })
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const deleteProduct = async (req, res) => {
    const productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" });

    const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false });
    if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" });

    await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });

    res.status(200).send({ status: true, message: 'deleted sucessfully' })
}


module.exports = { createproduct, getById, deleteProduct }