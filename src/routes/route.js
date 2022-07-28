const express = require('express')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const auth = require("../authentication/authentication")
const router = express.Router()

//*********************USER API***********************************************

 router.post("/register", userController.createUser)
 router.post("/login", userController.loginUser)
 router.get("/user/:userId/profile",auth.authentication, userController.getUserById)
 router.put("/user/:userId/profile",auth.authentication, userController.updateUserProfile)
 router.put("/user/:userId/profile", userController.updateUserProfile)

 //**********************************PRODUCT API****************************************

 router.post("/products", productController.createProduct)
 router.get("/products", productController.getProductByFilter)
 router.get("/products/:productId", productController.getProductDetails )
 router.delete("/products/:productId", productController.deleteProduct)
 
 module.exports = router;
