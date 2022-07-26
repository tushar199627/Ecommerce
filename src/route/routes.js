const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const middle = require("../middlewar/auth")

router.post('/register', userController.userRegister)
router.post('/login', userController.userLogin)
router.get('/user/:userId/profile', middle.authentication, userController.userProfile)

module.exports = router