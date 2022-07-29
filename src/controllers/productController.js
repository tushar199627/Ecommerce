const productModel = require("../models/productModel");
const validator = require("../validator/validate.js")
const { uploadFile } = require("../aws/aws");

//***********************************POST /products******************************************************

const createProduct = async function (req, res) {
    try {
    let data = req.body
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
    let files = req.files
  
    if (!title) return res.status(400).send({ status: false, message: 'Please enter title name' })
    if (!validator.isValid(title)) return res.status(400).send({ status: false, message: 'Please enter title name in right formate' })
    const uniqueTitle = await productModel.findOne({title :title})
    if(uniqueTitle){
        return res.status(400).send({ status: false, message: 'This product is already available' })
    }


    if (!description) return res.status(400).send({ status: false, message: 'Please enter description' })
    if (!validator.isValid(description)) return res.status(400).send({ status: false, message: 'Please enter description in right formate' })

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
  


    if (!validator.isValidRequestBody(files)) {
        return res.status(400).send({ status: false, message: "Upload a image." });
    }

    if (files && files.length > 0) {
        productImage = await uploadFile(files[0]);
    }

    // Add profileImage

    data.productImage = productImage;



    if (!validator.isValid(style)) return res.status(400).send({ status: false, message: 'Please enter style name in right format' })

    let productdata = await productModel.create(data)
    res.status(201).send({ status: true, message: "product create successfully", data: productdata })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//**********************************Get product by filter ************************************************ */

const getProductByFilter = async (req, res) => {
    const reqBody = req.body
    const { size, name, priceGreaterThan, priceLessThan, priceSort } = reqBody
    const priceSorts = (priceSort || 1)
    if(priceSorts > 1 || priceSorts < -1 || priceSorts == 0){
        return res.status(400).send({status:false,message:"shortPrice value should be '1' or '-1', '1' for accending order and '-1' for decending order, By default it is shownig in accending order "})
    }
    const filter = { isDeleted: false }
    if (name) {
       
        filter.title = {$regex : name}
    }
    if (size) {
        filter.availableSizes = size
    }
    if (priceGreaterThan || priceLessThan) {
        const price = {}
        if (priceLessThan) {
            price.$lt = 2000
        }
        if (priceGreaterThan) {
            price.$gt = 500
        }

        filter.price = price
    } 


    const productData = await productModel.find(filter)
    if(!productData){
        return res.status(404).send({status:false,message:"No product found with these details"})
    }
    let sortProduct = ''
    if (priceSorts == 1) {
     sortProduct = productData.sort((a, b) =>
            a.price - b.price
        )
    }
    if (priceSorts == -1) {
        sortProduct = productData.sort((a, b) =>
            b.price - a.price
        )
    }


    return res.status(200).send(sortProduct)
}

//*********************************GET /products/:productId***************************************************************

const getProductDetails = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false, msg: "productId is not a valid objectId"
            });

        }
        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
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
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}



//**************************************DELETE /products/:productId**********************************************

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false, msg: "productId is not a valid objectId"
            })
        }

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({
                status: false, msg: "product with this id not exist or already deleted"
            })
        }

        await productModel.findOneAndUpdate({
            _id: productId,
            isDeleted: false
        },
            { $set: { isDeleted: true, deletedAt: Date.now() } })

        return res.status(200).send({
            status: true, msg: "product is deleted successfully"
        })

    }
    catch (error) {
        res.status(500).send({ status: false, message: err.message });
    }
}

module.exports = { createProduct, getProductByFilter, getProductDetails, deleteProduct }