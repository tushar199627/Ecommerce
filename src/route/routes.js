const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const middle = require("../middleware/auth")

//===============================================USER API====================================================================

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile', middle.authentication, userController.userProfile)

router.put('/user/:userId/profile', middle.authentication, middle.authorization, userController.updateProfile)

//===============================================PRODUCT API==================================================================

router.post('/products', productController.createProduct)

router.get('/products', productController.getAllProduct)

router.get('/products/:productId', productController.getById)

router.put('/products/:productId', productController.updateProductDetails)

router.delete('/products/:productId', productController.deleteProduct)

//===========================================CART API==================================================================

router.post('/users/:userId/cart', middle.authentication, middle.authorization, cartController.createCart)

router.get('/users/:userId/cart', middle.authentication, middle.authorization, cartController.getCart)

router.put('/users/:userId/cart', middle.authentication, middle.authorization, cartController.updatedCart)

router.delete('/users/:userId/cart', middle.authentication, middle.authorization, cartController.deleteCart)

//============================================ORDER API===================================================

router.post('/users/:userId/orders', middle.authentication, middle.authorization, orderController.orderCreate)

router.put('/users/:userId/orders', middle.authentication, middle.authorization, orderController.updatedOrders)

//===================================GLOBAL ROUTE=================================================

router.all("*", function (req, res) {
    res.status(400).send({
        status: false,
        msg: "please enter valid api"
    })
})

module.exports = router