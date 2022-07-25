const userModel = require('../model/userModel')
const validator = require("../validation/validator")
const jwt = require('jsonwebtoken')

const userRegister = async function(req, res){
    try{
    let data = req.body
    let {fname, lname, email, profileImage, phone, password, address, shipping, billing} = data
    if(Object.keys(data).length==0) return res.status(400).send({status : false, message : "Please Enter data"})
    if(!fname) return res.status(400).send({status : false , message : 'Please enter first name'})
    if(!validator.isValid(fname)) return res.status(400).send({status : false, message : 'Please enter first name in right formate'})
    if(!lname) return res.status(400).send({status : false , message : 'Please enter lname'})
    if(!validator.isValid(lname)) return res.status(400).send({status : false, message : 'Please enter last name in right formate'})
    if(!email) return res.status(400).send({status : false , message : 'Please enter email'})
    if(!validator.isValidEmail(email)) return res.status(400).send({status : false , message : 'Please enter valid email'})
    if(!profileImage) return res.status(400).send({status : false , message : 'Please enter profileImage'})
    if(!phone) return res.status(400).send({status : false , message : 'Please enter phone'})
    if(!password) return res.status(400).send({status : false , message : 'Please enter password'})
    if(!validator.isValidPassword(password)) return res.status(400).send({status : false , message : 'Password should be between 8 to 15 character'})
    if(!address) return res.status(400).send({status : false , message : 'Please enter address'})
    if(!shipping) return res.status(400).send({status : false , message : 'Please enter shipping'})
    if(!billing) return res.status(400).send({status : false , message : 'Please enter billing'})
    const user = await userModel.create({data})
    res.status.sent({status : true, message: 'User Craeted Successfully', data : user})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}

module.exports = {userRegister}