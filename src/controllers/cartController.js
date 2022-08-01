const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate.js")

// exports.createCart = async function (req,res){
//     try{
//         let userId= req.params.userId
//         if(!validator.isValidRequestBody(userId)){
//             return res.status(400).send({ status: false, message: "Please provide the Details" });
//         }
//         let findUserId= await userModel.findById({_id:userId})
//         if(!findUserId){
//             return res.status(404).send({ status: false, message: "user doesnot exist" });
//         }


//     let data=req.body;
//     if(!validator.isValidRequestBody(data)){
//         return res.status(400).send({ status: false, message: "Please provide the Details" });
//     }

//     let findCartId= await cartModel.findOne({userId:userId})

//     let {items}=data
//      if(items.length>1){
//         return res.status(400).send({ status: false, message: "Only one item can be added at once" });
//      }
//      let findProduct= await productModel.findOne({_id:productId, isDeleted:false})
//      if(!findProduct){
//         return res.status(404).send({ status: false, message: "Product doesnot exist" });
//      }
//      if(items.length !==0){
//         let productId=items[0].productId;
//         if(!validator.isValidObjectId(productId)){
//             return res.status(400).send({ status: false, message: "Product Id is not Valid" });
//         }

//         if(!findProduct){
//             return res.status(404).send({ status: false, message: "Product doesnot exist" });
//          }
//      }

//         }

const getCartDetails = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not a valid objectId"
            })
        }

        let userDetails = await userModel.findOne({ _id: userId })
        if (!userDetails) {
            return res.status(404).send({
                status: false,
                msg: "user not exist with this userId"
            })
        }

        let cartDetails = await cartModel.findOne({ userId: userId })
        if (!cartDetails) {
            return res.status(404).send({
                status: false,
                msg: "cart not exist for this userId"
            })
        }
        else {
            return res.status(200).send({
                status: true,
                msg: "cart with product details",
                data: cartDetails
            })
        }

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "userId is not a valid objectId"
            })
        }

        let userDetails = await userModel.findOne({ _id: userId })
        if (!userDetails) {
            return res.status(404).send({
                status: false,
                msg: "user not exist with this userId"
            })
        }

        let cartDetails = await cartModel.findOne({ userId: userId })
        if (!cartDetails) {
            return res.status(404).send({
                status: false,
                msg: "cart not exist for this userId"
            })
        }
        else {
            let deleteCartDetails = await cartModel.
                findOneAndUpdate({ userId: userId },
                    {
                        items: [], totalPrice: 0,
                        totalItems: 0
                    }, { new: true })

            return res.status(204).send({
                status: true,
                msg: "cart is deleted",
                data: deleteCartDetails
            })
        }

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}


module.exports = { getCartDetails, deleteCart }

