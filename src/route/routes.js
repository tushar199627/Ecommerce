const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const middle = require("../middleware/auth")

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile', middle.authentication, userController.userProfile)

router.put('/user/:userId/profile', middle.authentication, userController.updateProfile)

router.post('/products', productController.createProduct)

router.get('/products', productController.getAllProduct)

router.get('/products/:productId', productController.getById)

router.put('/products/:productId', productController.updateProductDetails)

router.delete('/products/:productId', productController.deleteProduct)

router.post('/users/:userId/cart ', middle.authentication, cartController.createCart)

module.exports = router