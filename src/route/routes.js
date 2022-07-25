const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')

router.post('/register', userController.userRegister)

module.exports = router