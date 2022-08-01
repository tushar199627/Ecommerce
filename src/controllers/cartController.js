const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const validator = require("../validator/validate.js")

exports.createCart = async function (req,res){
    try{
        let userId= req.params.userId
        if(!validator.isValidRequestBody(userId)){
            return res.status(400).send({ status: false, message: "Please provide the Details" });
        }
        let findUserId= await userModel.findById({_id:userId})
        if(!findUserId){
            return res.status(404).send({ status: false, message: "user doesnot exist" });
        }


    let data=req.body;
    if(!validator.isValidRequestBody(data)){
        return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    let findCartId= await cartModel.findOne({userId:userId})

    let {items}=data
     if(items.length>1){
        return res.status(400).send({ status: false, message: "Only one item can be added at once" });
     }
     let findProduct= await productModel.findOne({_id:productId, isDeleted:false})
     if(!findProduct){
        return res.status(404).send({ status: false, message: "Product doesnot exist" });
     }
     if(items.length !==0){
        let productId=items[0].productId;
        if(!validator.isValidObjectId(productId)){
            return res.status(400).send({ status: false, message: "Product Id is not Valid" });
        }

        if(!findProduct){
            return res.status(404).send({ status: false, message: "Product doesnot exist" });
         }
     }

        }
     
        
    }

    


}