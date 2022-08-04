const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel");

const mongoose = require("mongoose")

//****************************************AUTHENTICATION*************************************************** 

// exports.authentication = (req, res, next) => {

//     try {
//         const token = req.headers["authorization"].split(" ").pop()

//         if (!token) {
//             return res.status(401).send("You are not authenticated")
//         }

//         const decodeTok = jwt.verify(token, "project5Group46")
//         req.userid = decodeTok.userId;
        
//         next();

//     }
//     catch (err) {
//         return res.status(500).send({ message: "Error", error: err.message });
//     }

// }

exports.authentication = async function (req, res, next) {
    try {
        let token = req.headers.authorization

        if (!token) return res.status(400).send({ status: false, message: "token must be present" });

        token = token.split(" ")[1];

        jwt.verify(token, "project5Group46", function (err, decoded) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })

            } else {
                req.decodedToken = decoded
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//******************************************AUTHORIZATION********************************************************** */

exports.authorization  = async function(req,res,next){
    try{
        const userId = req.params.userId
        let tokenUserId = req.decodedToken.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'enter valid user id' });
        let checkUserId = await userModel.findById(userId)
        if(!checkUserId) return res.status(404).send({status : false, message : 'No such user'})
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }
        next()
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}