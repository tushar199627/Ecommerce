const userModel = require('../model/userModel')
const validator = require("../validation/validator")
const uploadFile = require('../aws/uploadFile')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')

const userRegister = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let { fname, lname, email, profileImage, phone, password, address } = data
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Enter data" })
        if (!fname) return res.status(400).send({ status: false, message: 'Please enter first name' })
        if (!validator.isValid(fname)) return res.status(400).send({ status: false, message: 'Please enter first name in right formate' })
        if (!validator.isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter first name in right formate" })
        if (!lname) return res.status(400).send({ status: false, message: 'Please enter lname' })
        if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: 'Please enter last name in right formate' })
        if (!validator.isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter last name in right formate" })
        if (!email) return res.status(400).send({ status: false, message: 'Please enter email' })
        if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: 'Please enter valid email' })
        //if(!profileImage) return res.status(400).send({status : false , message : 'Please enter profileImage'})
        if (!phone) return res.status(400).send({ status: false, message: 'Please enter phone' })
        if (!validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: 'Please enter a valid phone number' })
        if (!password) return res.status(400).send({ status: false, message: 'Please enter password' })
        if (!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: 'Password should be between 8 to 15 character' })
        let Fulladdress = JSON.parse(address)
        data.address = Fulladdress
        if (!Fulladdress.shipping.street) return res.status(400).send({ status: false, message: "Please enter shipping street" })
        if (!Fulladdress.shipping.city) return res.status(400).send({ status: false, message: "Please enter shipping city" })
        if (!Fulladdress.shipping.pincode) return res.status(400).send({ status: false, message: "Please enter shipping pincode" })
        if (!Fulladdress.billing.street) return res.status(400).send({ status: false, message: "Please enter billing street" })
        if (!Fulladdress.billing.city) return res.status(400).send({ status: false, message: "Please enter billing city" })
        if (!Fulladdress.billing.pincode) return res.status(400).send({ status: false, message: "Please enter billing pincode" })

        const bcryptPassword = await bcrypt.hash(password, 10)
        data.password = bcryptPassword

        //console.log(password)

        //if(!address) return res.status(400).send({status : false , message : 'Please enter address'})
        // if(!shipping) return res.status(400).send({status : false , message : 'Please enter shipping'})
        // if(!billing) return res.status(400).send({status : false , message : 'Please enter billing'})
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            data.profileImage = await uploadFile.uploadFile(files[0])
        }
        else {
            return res.status(400).send({ msg: "No file found" })
        }
        const emailUnique = await userModel.findOne({ email })
        if (emailUnique) return res.status(400).send({ status: false, message: 'Already register Email' })
        const phoneUnique = await userModel.findOne({ phone })
        if (phoneUnique) return res.status(400).send({ status: false, message: "Already register Phone Number" })
        const user = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'User Created Successfully', data: user })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const userLogin = async function (req, res) {
    let data = req.body
    let { email, password } = data
    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Enter data" })
    if (!email) return res.status(400).send({ status: false, message: 'Please enter email' })
    if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: 'Please enter valid email' })
    if (!password) return res.status(400).send({ status: false, message: 'Please enter password' })

    const Login = await userModel.findOne({ email })
    if (!Login) return res.status(401).send({ status: false, message: 'Not a register email Id' })

    let PassDecode = await bcrypt.compare(password, Login.password)
    if (!PassDecode) return res.status(401).send({ status: false, message: 'Password not match' })


    let token = jwt.sign({
        userId: Login._id.toString()
    }, "GroupNumber4", { expiresIn: '50d' })
    console.log(token)
    res.setHeader("x-api-key", token)
    return res.status(200).send({ status: true, message: 'User Login Successful', data: { userId: Login._id, token: token } })
}


const userProfile = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "Please enter uesrId in params path" })
        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Not a valid userId' })
        // console.log(req.headers.authorization.split(" "))
        const checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(400).send({ status: false, message: "UserId invalid" })
        return res.status(200).send({ status: true, message: "User profile details", data: checkUser })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


let updateProfile = async (req, res) => {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { fname, lname, email, phone, password, address } = data;
        let files = req.files;

        if (Object.keys(data).length == 0 && !files) return res.status(400).send({ status: false, message: 'enter data to update' });

        let finduser = await userModel.findOne({ _id: userId });
        if (!finduser) return res.status(404).send({ status: false, message: 'user id does not exist' });

        if (fname) {          //Update first name
            if (!validator.isValid(fname)) return res.status(400).send({ status: false, message: 'Please enter first name in right formate' })
            if (!validator.isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter first name in right formate" })
            finduser.fname = fname;
        }

        if (lname) {        //Update last name
            if (!validator.isValid(lname)) return res.status(400).send({ status: false, message: 'Please enter last name in right formate' })
            if (!validator.isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter last name in right formate" })
            finduser.lname = lname;
        }

        if (email) {        //Update email
            if (!validator.isValidEmail(email)) return res.status(400).send({ status: false, message: 'Please enter valid email' })
            const emailUnique = await userModel.findOne({ email })
            if (emailUnique) return res.status(400).send({ status: false, message: 'Already register Email' })
            finduser.email = email
        }

        if (phone) {      //Update phone 
            if (!validator.isValidPhone(phone)) return res.status(400).send({ status: false, message: 'Please enter a valid phone number' })
            const phoneUnique = await userModel.findOne({ phone })
            if (phoneUnique) return res.status(400).send({ status: false, message: "Already register Phone Number" })
            finduser.phone = phone
        }

        if (password) {     //Update password
            if (!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: 'Password should be between 8 to 15 character' })
            const bcryptPassword = await bcrypt.hash(password, 10)
            finduser.password = bcryptPassword
        }

        if (files) {  //Update profile image
            if (files && files.length > 0) {
                //upload to s3 and get the uploaded link
                // res.send the link back to frontend/postman
                finduser.profileImage = await uploadFile.uploadFile(files[0])
            }
            else {
                return res.status(400).send({ msg: "No file found" })
            }
        }

        if (address) {

            if (address.shipping) {                   //Update shipping address  
                let { street, city, pincode } = address.shipping;
                if (street) {
                    finduser.address.shipping.street = street;
                }
                if (city) {
                    finduser.address.shipping.city = city;
                }
                if (pincode) {
                    finduser.address.shipping.pincode = pincode;
                }
            }

            if (address.billing) {                //Update billing address
                let { street, city, pincode } = address.billing;
                if (street) {
                    finduser.address.billing.street = street;
                }
                if (city) {
                    finduser.address.billing.city = city;
                }
                if (pincode) {
                    finduser.address.billing.pincode = pincode;
                }
            }
        }

        //Authorisation
        let tokenUserId = req.decodedToken.userId
        if (userId != tokenUserId) {
            return res.status(403).send({ status: false, message: "UnAuthorized Access!!" })
        }

        //Update Profile
        let updateProfile = await userModel.findByIdAndUpdate({ _id: userId }, finduser, { new: true });

        //Send Response
        res.status(200).send({ status: true, message: "User profile updated", data: updateProfile });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { userRegister, userLogin, updateProfile, userProfile }

