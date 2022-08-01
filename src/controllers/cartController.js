const cartModel = require("../Models/cartModel")

//*********************************************GET /users/:userId/cart*************************************************************************

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

//*******************************************DELETE /users/:userId/cart*************************************************************************

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

module.exports = {getCartDetails, deleteCart}

