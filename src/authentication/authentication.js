const jwt = require('jsonwebtoken')

exports.authentication = (req, res, next) => {

    try {
        const token = req.headers["authorization"].split(" ").pop()

        if (!token) {
            return res.status(401).send("You are not authenticated")
        }

        const decodeTok = jwt.verify(token, "project5Group46")
        req.userid = decodeTok.userId;
        
        next();

    }
    catch (err) {
        return res.status(500).send({ message: "Error", error: err.message });
    }

}