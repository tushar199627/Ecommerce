const express = require('express')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const auth = require("../authentication/authentication")
const router = express.Router()

 router.post("/register", userController.createUser)
 router.post("/login", userController.loginUser)
 router.get("/user/:userId/profile",auth.authentication, userController.getUserById)
 router.put("/user/:userId/profile", userController.updateUserProfile)
 router.get("/products/:productId", productController.getProductDetails )
 router.delete("/products/:productId", productController.deleteProduct)
 
 module.exports = router;
