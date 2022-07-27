const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const authentication = async function (req, res, next) {
    try {
        if(!req.headers.authorization) return res.status(401).send({status : false, message : "Token is not present in header"})
        let token = req.headers.authorization.split(" ")
        let userId = req.params.userId

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'enter valid user id' })

        if (!token) return res.send({ status: false, message: "token must be present" });

        jwt.verify(token[1], "GroupNumber4", function (err, decoded) {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })

            } else {
                if (userId !== decoded.userId) return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
                req.decodedToken = decoded
                next()
            }
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { authentication }