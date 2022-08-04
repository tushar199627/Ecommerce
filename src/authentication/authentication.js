const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel");

const mongoose = require("mongoose")



exports.authentication = (req, res, next) => {

    try {
        const token = req.headers["authorization"].split(" ").pop()

        if (!token) {
            return res.status(401).send("You are not authenticated")
        }

        jwt.verify(token, "project5Group46", (err, user) => {
            if (err) return res.status(403).json({ status: false, msg: "Token is not valid!" });
            req.userId = user.userId;
            next();
          })
      
    }
    catch (err) {
        return res.status(500).send({ message: "Error", error: err.message });
    }

}