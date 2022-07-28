
const productModel = require('../model/productModel')
const validator = require("../validation/validator")
const uploadFile = require('../aws/uploadFile')
const { default: mongoose } = require('mongoose')


const isValidBool = function (value) {
    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
        let files = req.files

        if (!title) return res.status(400).send({ status: false, message: 'Please enter title name' })
        if (!validator.isValid(title)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate' })
        let uniqueTitle = await productModel.findOne({title});
        if(uniqueTitle) return res.status(400).send({status: true, message: 'the title is already taken'})

        if (!description) return res.status(400).send({ status: false, message: 'Please enter description' })
        if (!validator.isValid(description)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate' })

        if (!price) return res.status(400).send({ status: false, message: 'Please enter price' })
        if (!validator.isValidNumber(price)) return res.status(400).send({ status: false, message: 'Please enter price in only Number' })

        if (!currencyId) return res.status(400).send({ status: false, message: 'Please enter currencyId' })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: 'Please enter currencyId as INR' })

        if (!currencyFormat) return res.status(400).send({ status: false, message: 'Please enter currencyFormat' })
        if (currencyFormat != "₹") return res.status(400).send({ status: false, message: 'Please enter currencyFormat as ₹' })

        if (style) {
            if (!validator.isValid(style)) return res.status(400).send({ status: false, message: 'Please enter style name in right formate' })
            if (!validator.isValidTitle(style)) return res.status(400).send({ status: false, message: 'Please enter style name in alpha' })
        }

        if (availableSizes) {
            let availableSize = availableSizes.replace(/\s+/g, "")
            availableSize = availableSize.toUpperCase() //Creating an array
            availableSize = availableSize.split(",")
            if (availableSize.length === 0) {
                return res.status(400).send({ status: false, message: "Please provide product sizes" })
            }
            for (let i = 0; i < availableSize.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                    return res.status(400).send({ status: false, message: 'Sizes should be [S,XS,M,X,L,XXL,XL]' })
                }
            }
            data.availableSizes = availableSize
        }else{
            return res.status(400).send({status: false, message: 'availableSizes  is required'})
        }

        if (installments) {
            if (!validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: 'Please enter installments in only Number' })
        }

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

        if (!validator.isValid(style)) return res.status(400).send({ status: false, message: 'Please enter style name in right format' })

        let productdata = await productModel.create(data)
        res.status(201).send({ status: true, message: "product created successfully", data: productdata })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const getAllProduct = async function (req, res) {
    try {
        const data = req.query
        let { name, priceGreaterThan, priceLessThan, size, priceSort } = data
        let filters
        let searchObj = { isDeleted: false }
        priceSort = parseInt(priceSort)

        if (size) {
            size = size.toUpperCase().split(",")
            searchObj.availableSizes = { $in: size }
        }

        if (name) searchObj.title = { $regex: name.trim(), $options: 'i' }

        if (priceGreaterThan) searchObj.price = { $gt: priceGreaterThan }

        if (priceLessThan) searchObj.price = { $lt: priceLessThan }

        if (priceGreaterThan && priceLessThan) searchObj.price = { $gt: priceGreaterThan, $lt: priceLessThan }

        if (priceSort > 1 || priceSort < -1 || priceSort == 0) return res.status(400).send({ status: false, message: 'Please enter either 1 or -1 is priceSort' })
        if (priceSort) filters = { price: priceSort }

        const products = await productModel.find(searchObj).sort(filters)
        if(products.length==0) return res.status(404).send({status : false, message : 'No such product'})

        return res.status(200).send({ status: true, message: "Success", data: products })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const getById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" })

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" })

        res.status(200).send({ status: true, message: 'Success', data: checkProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please enter valid productId in params path" });

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!checkProduct) return res.status(404).send({ status: false, message: "productId invalid or the product is deleted" });

        await productModel.findByIdAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() });

        res.status(200).send({ status: true, message: 'deleted sucessfully' })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const updateProductDetails = async function (req, res) {
    try {
        const productId = req.params.productId
        const image = req.files
        const updateData = req.body

        let { title, description, price, style, availableSizes, installments } = updateData

        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "invalid product Id" })

        let findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(404).send({ status: false, msg: "Product not found" })

        if ((Object.keys(updateData).length == 0)) return res.status(400).send({ status: false, msg: "please provide data to update" })

        if (image && image.length > 0) {
            if (!validator.isValidFile(image[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image only" })
            let updateProductImage = await uploadFile.uploadFile(image[0])
            updateData.productImage = updateProductImage
        }

        if (title) {
            if (!validator.isValid(title)) return res.status(400).send({ status: false, message: "title Should be Valid" })
            if (!validator.isValidTitle(title)) return res.status(400).send({ status: false, message: "title should not contain number" })
            if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "title Should be Unique" })
        }

        if (description) {
            if (!validator.isValid(description)) return res.status(400).send({ status: false, message: "description Should be Valid" })
        }

        if (price) {
            if (!validator.isValidNumber(price)) return res.status(400).send({ status: false, message: "price Should be Valid" })
        }

        if (style) {
            if (!validator.isValid(style)) return res.status(400).send({ status: false, message: "style Should be Valid" })
            if (!validator.isValidTitle(style)) return res.status(400).send({ status: false, message: "style Should Not Contain Numbers" })
        }

        if (availableSizes) {
            let availableSize = availableSizes.replace(/\s+/g, "")
            availableSize = availableSize.toUpperCase() //Creating an array
            availableSize = availableSize.split(",")
            if (availableSize.length === 0) {
                return res.status(400).send({ status: false, message: "Please provide product sizes" })
            }
            for (let i = 0; i < availableSize.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                    return res.status(400).send({ status: false, message: 'Sizes should be [S,XS,M,X,L,XXL,XL]' })
                }
            }
            updateData.availableSizes = availableSize
        }

        if (installments) {
            if (validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: "installments Should be whole Number Only" })
        }
        updateData._id = productId
        updateData.currencyId = 'INR'
        updateData.currencyFormat = '₹'

        const updateDetails = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, updateData, { new: true }).select({__v:0})
        if(!updateDetails) return res.status(404).send({status : false, message: 'No such product available'})
        return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}



module.exports = {createProduct, getById, deleteProduct, getAllProduct,updateProductDetails}
