const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const middle = require("../middleware/auth")
const productController = require("../controller/productController")

router.post('/register', userController.userRegister)

router.post('/login', userController.userLogin)

router.get('/user/:userId/profile', middle.authentication, userController.userProfile)

router.put('/user/:userId/profile', middle.authentication, userController.updateProfile)

router.get('/products', productController.getAllProduct)

module.exports = router