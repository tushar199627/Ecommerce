const jwt = require("jsonwebtoken");
const userModel = require('../model/userModel')


        const authentication= async function(req,res,next){
            try{
             let token= req.headers.authorization.split(" ")
             let userId = req.params.userId
             if (!token) return res.send({ status: false, message: "token must be present" }); 
             jwt.verify(token[1], "GroupNumber4",function (err, decoded) {
                if (err) {
                     return res.status(401).send({ status: false, message: err.message })
                } else {
                    if(userId!==decoded.userId) return res.status(400).send({status : false, message : "UnAuthorized Access!!"})
                    console.log(decoded)
                    req.decodedToken=decoded
                    next()
                }
            })
        }
        catch(err){
            return res.status(500).send({status:false,message:err.message})
        }
        }
    
const authorise = async function (req, res, next) {
    try {

        let tokenUserId = req.decodedToken.userId
        let userId = req.params.userId

        if (userId) {
            if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "The userId is Invalid" })
            let checkUser = await userModel.findById(userId)
            if (!checkUser) return res.status(400).send({ status: false, message: "UserId Not Found" })
            if (userId != tokenUserId) {
                return res.status(403).send
                    ({ status: false, message: "UnAuthorized Access!!" })
            }
        }

        // if (booksId) {
        //     if (!isValidObjectId(booksId)) return res.status(400).send({ status: false, message: "The BookId is Invalid." })
        //     let checkBookData = await bookModel.findOne({ _id: booksId, isDeleted: false })
        //     if (!checkBookData) return res.status(400).send({ status: false, message: "BookId Not Found" })
        //     let checkBook = await bookModel.findOne({ _id: booksId, userId: usersId })
        //     if (!checkBook) {
        //         return res.status(403).send
        //             ({ status: false, message: "UnAuthorized Access!!" })
        //     }
        // }

        next()

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { authentication, authorise }