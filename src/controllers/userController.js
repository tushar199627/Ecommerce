const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../aws/aws");
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");


const saltRounds = 10;
const {
  isValidObjectId,
  isValid,
  isValidRequestBody,
  validPassword,
  validCity,
  validPincode,
  validName,
  validPhone,
  validEmail,
} = require("../validator/validate");


//------------------------------------------POST/REGISTER----------------------------------------------------------------------------
const createUser = async (req, res) => {
  try {
    let data = req.body;
    //console.log(data)

    let { fname, lname, email, profileImage, phone, password, address } =data;

    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    if (!isValid(fname)) {
      return res.status(400).send({status: false,message: "Please provide a FirstName or a Valid FirstName",
      });
    }
    if (!validName.test(fname)) {
      return res.status(400).send({ status: false, message: "FirstName cannot be a number" });
    }

    if (!isValid(lname)) {
      return res.status(400).send({status: false,message: "Please provide a LastName or a Valid LastName",
      });
    }
    if (!validName.test(lname)) {
      return res.status(400).send({ status: false, message: "LastName cannot be a number" });
    }
    if (!isValid(email)) {
      return res.status(400).send({status: false,message: "Please provide a Email d or a Valid Email Id",
      });
    }

    if (!validEmail.test(email)) {
      return res.status(400).send({ status: false, message: `${email} is not valid email Id` });
    }

    //checking is there same Email Id present inside database or not
    let isAllreadyExistEmail = await userModel.findOne({ email: email });
    if (isAllreadyExistEmail) {
      return res.status(400).send({status: false,message: `this email id -${email} already exist`,
      });
    }

    if (!isValid(phone)) {
      return res.status(400).send({status: false,message: "Please provide a Phone Number or a Valid Phone Number",
      });
    }

    if (!validPhone.test(phone)) {
      return res.status(400).send({status: false,message: `this phone number-${phone} is not valid, try an Indian Number`,
      });
    }

    //checking is there same phone number present inside database or not
    let isAllreadyExistPhone = await userModel.findOne({ phone: phone });
    if (isAllreadyExistPhone) {
      return res.status(400).send({status: false,message: ` this phone number- ${phone} already exist`,
      });
    }
    if (!isValid(password)) {
      return res.status(400).send({status: false,message: "Please provide a Password or a Valid Password",
      });
    }

    if (!validPassword(password)) {
      return res.status(400).send({status: false,message:"Password Should be Minimum 8 Character and Maximum 15 Character Long",
      });
    }

    // hashing password
    data.password = await bcrypt.hash(password, saltRounds);


    if (!isValid(address.shipping.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(address.shipping.city)) {
      return res.status(400).send({
        status: false,
        message: "City should be Present or City should be Valid",
      });
    }

    if (!validCity.test(address.shipping.city)) {
      return res
        .status(400)
        .send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(address.shipping.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(address.shipping.pincode)) {
      return res.status(400).send({
        status: false,
        message:
          "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long",
      });
    }

    if (!isValid(address.billing.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(address.billing.city)) {
      return res.status(400).send({
        status: false,
        message: "City should be Present or City should be Valid",
      });
    }

    if (!validCity.test(address.billing.city)) {
      return res
        .status(400)
        .send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(address.billing.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(address.billing.pincode)) {
      return res.status(400).send({
        status: false,
        message:
          "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long",
      });
    }
    //validation ended here

    let files = req.files;

    if (!isValidRequestBody(files)) {
      return res
        .status(400)
        .send({ status: false, message: "Upload a image." });
    }

    if (files && files.length > 0) {
      profileImage = await uploadFile(files[0]);
    }

    // Add profileImage
    data.profileImage = profileImage;

    let hash = bcrypt.hashSync(password, saltRounds);

    let userData = {
      fname,
      lname,
      email,
      profileImage,
      phone,
      password: hash,
      address,
    };

    const userCreated = await userModel.create(userData);

    return res
      .status(201)
      .send({
        status: true,
        msg: "User Created Successfully",
        data: userCreated,
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


const loginUser=async function(req,res){
    try{
        let data = req.body
        const{email,password}=data

        let details = await userModel.findOne({email:email,password:password});
        if(!details){
            return res.status(400).send({ status: false, message: "Invalid credentials"});
        }
       

        //create the jwt token 

        let token = jwt.sign({
            userId: details._id.toString(),
        }, "project5Group46", { expiresIn: "1d" });
           
        res.setHeader("x-api-key", token);

        return res.status(200).send({ status: true, message: "User login successfull",data:{ token }})
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//--------------------------GET/USERBYID------------------------------------------------

const getUserById = async function(req,res){
  try{

    const userId = req.params.userId

    const userData = await userModel.findOne({_id:userId}).select({address:1,_id:1,fname:1,lname:1,email:1,profileImage:1,phone:1,password:1})

    if(!userData)return res.status(404).send({status:false,message:"User not found"})
    return res.status(200).send({status:true,message:"user profile details", data:userData})
  }
  catch(err){
    res.status(500).send({status:false,message:err.message})
  }

}






module.exports = {createUser,loginUser,getUserById}