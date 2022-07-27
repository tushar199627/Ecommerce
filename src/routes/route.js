const express = require('express')
const userController = require('../controllers/userController')
const auth = require("../controllers/authentication/authentication")
 const router = express.Router()

 router.post("/register", userController.createUser)
 router.post("/login", userController.loginUser)
 router.get("/user/:userId/profile", userController.getUserById)
 router.put("/user/:userId/profile", userController.updateUserProfile)

 module.exports = router;
 