const productModel = require("../models/productModel");




//*********************************GET /products/:productId***************************************************************

const getProductDetails = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: false,msg: "productId is not a valid objectId"
            });

        }
        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({status: false,msg: "product not exist with this productId"
            });
        }
        else {
            return res.status(200).send({status: true,msg: "details fetched successfully",data: productDetails
            })
        }

    }
    catch (error) {
        res.status(500).send({status:false, message:err.message });
    }
}



//**************************************DELETE /products/:productId**********************************************

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: false,msg: "productId is not a valid objectId"
            })
        }

        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails) {
            return res.status(404).send({status: false,msg: "product with this id not exist or already deleted"
            })
        }

        let deleteProductDetails = await productModel.findOneAndUpdate({
            _id: productId,
            isDeleted: false
        },
            { $set: { isDeleted: true, deletedAt: Date.now() } })

        return res.status(200).send({status: true,msg: "product is deleted successfully"
        })

    }
    catch (error) {
        res.status(500).send({status:false, message:err.message });
    }
}

module.exports = { getProductDetails, deleteProduct }