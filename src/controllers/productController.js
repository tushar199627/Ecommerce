const productModel = require("../models/productModel");
const validator = require("../validator/validate")

//***********************************POST /products******************************************************

  const createProduct = async function (req, res) {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
        let files = req.files

        if (!title) return res.status(400).send({ status: false, message: 'Please enter title name' })
        if (!validator.isValid(title)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate' })


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

        let availableSize = availableSizes.toUpperCase() //Creating an array
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

        if (installments) {
            if (!validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: 'Please enter installments in only Number' })
        }

        if ("isFreeShipping" in data) {
            if (!validator.isValidBool(isFreeShipping)) {
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
        res.status(201).send({ status: true, message: "product create successfully", data: productdata })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//*********************************GET /products/:productId***************************************************************

const getProductDetails = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false, msg: "productId is not a valid objectId"
            });

        }
        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({
                status: false, msg: "product not exist with this productId"
            });
        }
        else {
            return res.status(200).send({
                status: true, msg: "details fetched successfully", data: productDetails
            })
        }

    }
    catch (error) {
        res.status(500).send({ status: false, message: err.message });
    }
}


//*************************************PUT /products/:productId****************************************************

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
            if (!isImageFile(image[0].originalname)) return res.status(400).send({ status: false, message: "Please provide image only" })
            let updateProductImage = await uploadFile(image[0])
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
            if (!validator.isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes Should be Valid" })
            availableSizes = availableSizes.split(",").map(x => x.trim().toUpperCase())
            if (availableSizes.map(x => isValidSize(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be Among  S,XS,M,X,L,XXL,XL" })
            updateData.availableSizes = availableSizes
        }

        if (installments) {
            if (validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: "installments Should be whole Number Only" })
        }

        const updateDetails = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, updateData, { new: true }).select({ __v: 0 })

        return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

//***********************************DELETE /products/:productId********************************************

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                msg: "productId is not a valid objectId"
            })
        }


        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({
                status: false,
                msg: "product with this id not exist or already deleted"
            })
        }


        let deleteProductDetails = await productModel.findOneAndUpdate({
            _id: productId,
            isDeleted: false
        },
            { $set: { isDeleted: true, deletedAt: Date.now() } })

        return res.status(200).send({
            status: true,
            msg: "product is deleted successfully"
        })


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
 }


module.exports = { createProduct,getProductDetails,updateProductDetails, deleteProduct }