const express = require('express')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const auth = require("../authentication/authentication")
const router = express.Router()

//*********************USER API***********************************************

 router.post("/register", userController.createUser)
 router.post("/login", userController.loginUser)
 router.get("/user/:userId/profile",auth.authentication, userController.getUserById)
 router.put("/user/:userId/profile",auth.authentication, userController.updateUserProfile)

 //**********************************PRODUCT API**************************

 router.post("/products", productController.createProduct)
 router.get("/products", productController.getProductByFilter )
 router.get("/products/:productId", productController.getProductById)
 router.put("/products/:productId", productController.updateProductDetails)
 router.delete("/products/:productId", productController.deleteProduct)



 

 //**********************************CART API**************************
 
 router.post("/users/:userId/cart", cartController.createCart)
 router.put("/users/:userId/cart", cartController.updatedCart)
 router.get("/users/:userId/cart", cartController.getCartDetails)
 router.delete("/users/:userId/cart", cartController.deleteCart)

 
 
 module.exports = router;
