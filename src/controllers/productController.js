const productModel = require("../models/productModel");
const validator = require("../validator/validate.js")
const { uploadFile } = require("../aws/aws");

//*****************************************POST/products*****************************************************************

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
    res.status(201).send({ status: true, message: "Success", data: productdata })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//*************************************Get product by filter*********************************************************

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
        filter.availableSizes = size.toUpperCase()
    }
    if (priceGreaterThan || priceLessThan) {
        const price = {}
        if (priceLessThan) {
            price.$lt = priceLessThan
        }
        if (priceGreaterThan) {
            price.$gt = priceGreaterThan
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

const getProductById = async function (req, res) {
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
                status: true, message: "Success", data: productDetails
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

        if ((Object.keys(updateData).length == 0)) return res.status(400).send({ status: false, msg: "please provide data to update" })

        let { title, description, price, style, availableSizes, installments, ...rest } = updateData

        if(Object.keys(rest).length>0) return res.status(400).send({status : false, message : `you can't update on ${Object.keys(rest)} key`})

        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "invalid product Id" })
        let findProductId = await productModel.findById({ _id: productId, isDeleted: false })
        if (!findProductId) return res.status(404).send({ status: false, msg: "Product not found" })

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
            availableSize = availableSize.toUpperCase() 
            availableSize = availableSize.split(",")  //Creating an array
            if (availableSize.length === 0) {
                return res.status(400).send({ status: false, message: "Please provide product sizes if available sizes key is provided" })
            }
            for (let i = 0; i < availableSize.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"]).includes(availableSize[i])) {
                    return res.status(400).send({ status: false, message: 'Sizes should be [S,XS,M,X,L,XXL,XL]' })
                }
            }
            updateData.availableSizes = availableSize
        }

        if (installments) {
            if (!validator.isValidNumber(installments)) return res.status(400).send({ status: false, message: "installments Should be whole Number Only" })
        }

        updateData._id = productId

        const updateDetails = await productModel.findOneAndUpdate({ id: productId, isDeleted: false }, updateData, { new: true }).select({_v:0})

        if(!updateDetails) return res.status(404).send({status : false, message: 'No such product available'})

        return res.status(200).send({ status: true, message: "Product updated successfully", data: updateDetails })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
        return res.status(500).send({ status: false, error: err.message })
    }
}
//***********************************DELETE /products/:productId********************************************

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                msg: "productId is not a valid objectId"
            })
        }

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({
                status: false,
                msg: "product with this id not exist or already deleted"
            })
        }

        await productModel.findOneAndUpdate({
            _id: productId,
            isDeleted: false
        },
            { $set: { isDeleted: true, deletedAt: Date.now() } })

        return res.status(200).send({
            status: true,
            msg: "Product deletion is successful"
        })


    }
    catch (error) {
        //console.log(error)
        res.status(500).send({ msg: error.message })
    }
 }

module.exports = {createProduct, getProductByFilter, getProductById ,updateProductDetails,deleteProduct}
