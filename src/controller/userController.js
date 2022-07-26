const userModel = require('../model/userModel')
const validator = require("../validation/validator")
const uploadFile = require('../aws/uploadFile')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//=======================[User Register API]=======================


const userRegister = async function(req, res){
    try{
    let data = req.body
    let files= req.files
    let {fname, lname, email, profileImage, phone, password, address} = data

    //-----------------[Require field validation]

    if(Object.keys(data).length==0) return res.status(400).send({status : false, message : "Please Enter data"})

    //---------[first Name validation]
    if(!fname) return res.status(400).send({status : false , message : 'Please enter first name'})
    if(!validator.isValid(fname)) return res.status(400).send({status : false, message : 'Please enter first name in right formate'})
    if(!validator.isValidName(fname)) return res.status(400).send({status : false, message : "Please enter first name in right formate"})

    //----------[Last Name validation]
    if(!lname) return res.status(400).send({status : false , message : 'Please enter lname'})
    if(!validator.isValid(lname)) return res.status(400).send({status : false, message : 'Please enter last name in right formate'})
    if(!validator.isValidName(lname)) return res.status(400).send({status : false, message : "Please enter last name in right formate"})

    //----------[Email validation]
    if(!email) return res.status(400).send({status : false , message : 'Please enter email'})
    if(!validator.isValidEmail(email)) return res.status(400).send({status : false , message : 'Please enter valid email'})

    //----------[File validation]
    if(files.length==0) return res.status(400).send({status : false, message: "Please give profile photo"})
    if(!validator.isValidFile(files[0].originalname)) return res.status(400).send({status : false , message : 'File type should be png|gif|webp|jpeg|jpg'})

    //----------[Phone Number validation]
    if(!phone) return res.status(400).send({status : false , message : 'Please enter phone'})
    if(!validator.isValidPhone(phone)) return res.status(400).send({status : false , message : 'Please enter a valid phone number'})

    //----------[Password Validation]
    if(!password) return res.status(400).send({status : false , message : 'Please enter password'})
    if(!validator.isValidPassword(password)) return res.status(400).send({status : false , message : 'Password should be between 8 to 15 character[At least One Upper letter, one small letter, one number and one special charater]'})

    //----------[Address Validation]
    let Fulladdress = JSON.parse(address)
    data.address = Fulladdress
    if(!Fulladdress.shipping.street) return res.status(400).send({status : false, message: "Please enter shipping street"})
    if(!Fulladdress.shipping.city) return res.status(400).send({status : false, message: "Please enter shipping city"})
    if(!validator.isValidName(Fulladdress.shipping.city)) return res.status(400).send({status : false, message: "Enter a valid city name in shipping"})
    if(!(/^[1-9]{1}[0-9]{5}$/).test(Fulladdress.shipping.pincode)) return res.status(400).send({status : false, message: "invalid Pincode in billing"})
    if(!Fulladdress.billing.street) return res.status(400).send({status : false, message: "Please enter billing street"})
    if(!Fulladdress.billing.city) return res.status(400).send({status : false, message: "Please enter billing city"})
    if(!validator.isValidName(Fulladdress.billing.city)) return res.status(400).send({status : false, message: "Enter a valid city name in shipping"})
    if(!(/^[1-9]{1}[0-9]{5}$/).test(Fulladdress.billing.pincode)) return res.status(400).send({status : false, message: "invalid Pincode in billing"})

    //-----------[Password encryption]
    const bcryptPassword = await bcrypt.hash(password, 10)
    data.password = bcryptPassword

    //-----------[File upload on AWS]
    data.profileImage= await uploadFile.uploadFile( files[0] )

    //------------------[Unique field check DB calls]

    const emailUnique = await userModel.findOne({email})
    if(emailUnique) return res.status(400).send({status : false, message : 'Already register Email'})

    const phoneUnique = await userModel.findOne({phone})
    if(phoneUnique) return res.status(400).send({status : false, message: "Already register Phone Number"})

    //------------[Document create]
    const user = await userModel.create(data)
    return res.status(201).send({status : true, message: 'User Craeted Successfully', data : user})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}


//===========================[User Login API]==========================


const userLogin = async function(req,res){
    let data = req.body
    let {email, password} = data

    if(Object.keys(data).length==0) return res.status(400).send({status : false, message : "Please Enter data"})
    if(!email) return res.status(400).send({status : false , message : 'Please enter email'})
    if(!validator.isValidEmail(email)) return res.status(400).send({status : false , message : 'Please enter valid email'})
    if(!password) return res.status(400).send({status : false , message : 'Please enter password'})

    const Login = await userModel.findOne({email})
    if(!Login) return res.status(401).send({status: false, message : 'Not a register email Id'})

    //----------[Password Verification]
    let PassDecode = await bcrypt.compare(password,Login.password)
    if(!PassDecode) return res.status(401).send({status :false, message : 'Password not match'})

    //----------[JWT token generate]
    let token = jwt.sign({
        userId:Login._id.toString()
     }, "GroupNumber4",{ expiresIn: '50d'})

    res.setHeader("x-api-key", token)

    return res.status(200).send({status: true, message:'User Login Successful', data : {userId : Login._id, token : token} })
}


//===========================[User get profile API]==========================


const userProfile = async function(req,res){
    try{
        const userId = req.params.userId

        if(!userId) return res.status(400).send({status : false, message : "Please enter uesrId in params path"})
        if(!validator.isValidObjectId(userId)) return res.status(400).send({status : false, message : 'Not a valid userId'})

        const checkUser = await userModel.findById(userId)
        if(!checkUser) return res.status(400).send({status : false, message : "UserId invalid"})
        
        return res.status(200).send({status : true, message: "User profile details", data : checkUser})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}
module.exports = {userRegister, userLogin, userProfile}