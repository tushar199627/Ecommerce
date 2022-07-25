const express = require('express')
const userController = require('../controllers/userController')
const auth = require("../authentication/authentication")
 const router = express.Router()

 router.post("/register", userController.createUser)
 router.put("/user/:userId/profile", auth.authentication, userController.updateUserProfile)

 module.exports = router;