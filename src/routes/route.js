const express = require('express')
const userController = require('../controllers/userController')
 const router = express.Router()

 router.post("/register", userController.createUser)
 router.post("/login", userController.loginUser)
 router.post("/user/:userId/profile", userController.getUserById)

 module.exports = router;