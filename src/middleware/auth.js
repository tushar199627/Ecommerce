const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const authentication = async function (req, res, next) {
    try {
        let token = req.headers.authorization

        if (!token) return res.status(400).send({ status: false, message: "token must be present" });

        token = token.split(" ")[1];

        let userId = req.params.userId;

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'enter valid user id' });

        jwt.verify(token, "GroupNumber4", function (err, decoded) {
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

module.exports = { authentication }