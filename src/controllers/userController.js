const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../aws/aws");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const {isValidObjectId,isValid,isValidRequestBody,validPassword,validCity,validPincode,validName,validPhone,validEmail,
} = require("../validator/validate");

//-----------------------------------------POST/REGISTER-------------------------------------------

exports.createUser = async (req, res) => {

  try {
    let data = req.body;

    let { fname, lname, email, profileImage, phone, password } = data;

    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    if (!isValid(fname)) {
      return res.status(400).send({status: false, message: "Please provide a FirstName or a Valid FirstName",
      });
      
    }
    if (!validName.test(fname)) {
      return res.status(400).send({ status: false, message: "FirstName cannot be a number" });
    }

    if (!isValid(lname)) {
      return res.status(400).send({
        status: false, message: "Please provide a LastName or a Valid LastName",
      });
    }
    if (!validName.test(lname)) {
      return res.status(400).send({ status: false, message: "LastName cannot be a number" });
    }
    if (!isValid(email)) {
      return res.status(400).send({
        status: false, message: "Please provide a Email d or a Valid Email Id",
      });
    }

    if (!validEmail.test(email)) {
      return res.status(400).send({ status: false, message: `${email} is not valid email Id` });
    }

    //checking is there same Email Id present inside database or not
    let isAllreadyExistEmail = await userModel.findOne({ email: email });
    if (isAllreadyExistEmail) {
      return res.status(400).send({
        status: false, message: `this email id -${email} already exist`,
      });
    }

    if (!isValid(phone)) {
      return res.status(400).send({
        status: false, message: "Please provide a Phone Number or a Valid Phone Number",
      });
    }

    if (!validPhone.test(phone)) {
      return res.status(400).send({
        status: false, message: `this phone number-${phone} is not valid, try an Indian Number`,
      });
    }

    //checking is there same phone number present inside database or not
    let isAllreadyExistPhone = await userModel.findOne({ phone: phone });
    if (isAllreadyExistPhone) {
      return res.status(400).send({
        status: false, message: ` this phone number- ${phone} already exist`,
      });
    }
    if (!isValid(password)) {
      return res.status(400).send({
        status: false, message: "Please provide a Password or a Valid Password",
      });
    }

    if (!validPassword(password)) {
      return res.status(400).send({
        status: false, message: "Password Should be Minimum 8 Character and Maximum 15 Character Long",
      });
    }

    // hashing password
    data.password = await bcrypt.hash(password, saltRounds);

    let userAddress = JSON.parse(data.address);
    data.address = userAddress;

    if (!isValid(userAddress.shipping && userAddress.billing)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Please provide Address shipping And Billing Address",
        });
    }

    if (!isValid(userAddress.shipping.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(userAddress.shipping.city)) {
      return res.status(400).send({
        status: false,
        message: "City should be Present or City should be Valid",
      });
    }

    if (!validCity.test(userAddress.shipping.city)) {
      return res
        .status(400)
        .send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(userAddress.shipping.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(userAddress.shipping.pincode)) {
      return res.status(400).send({
        status: false,
        message:
          "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long",
      });
    }

    if (!isValid(userAddress.billing.street)) {
      return res
        .status(400)
        .send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(userAddress.billing.city)) {
      return res.status(400).send({
        status: false,
        message: "City should be Present or City should be Valid",
      });
    }

    if (!validCity.test(userAddress.billing.city)) {
      return res
        .status(400)
        .send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(userAddress.billing.pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(userAddress.billing.pincode)) {
      return res.status(400).send({
        status: false,
        message:
          "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long",
      });
    }


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

    const userCreated = await userModel.create(data);

    return res.status(201).send({
      status: true,
      msg: "User Created Successfully",
      data: userCreated,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//-------------------------------LOGIN/API--------------------------------------------------------

exports.loginUser = async function (req, res) {
  try {
    let data = req.body
    let { email, password } = data

    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide login details" });
    }

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email Id is required" });
    }

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }

    let details = await userModel.findOne({ email });
    console.log(details);
    if (!details) {
      return res
        .status(400)
        .send({ status: false, message: "Email Not found" });
    }

    const decrypt = await bcrypt.compare(password, details.password);

    if (!decrypt)
      return res
        .status(401)
        .send({
          status: false,
          message: `Login failed!! password is incorrect.`,
        });

    //create the jwt token

    let token = jwt.sign(
      {
        userId: details._id.toString(),
        iat: Math.floor(Date.now() / 1000),
      },
      "project5Group46",
      { expiresIn: "1d" }
    );


    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { token },
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//--------------------------------------------------GET/USERBYID-----------------------------------------------------------------------

exports.getUserById = async function (req, res) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(404).send({
          status: false,
          msg: "please enter the valid userId"
      })
    if (!validator.isValidObjectId(userId)) {
      return res.status(400).send({
        status: false,
        msg: "userId is not a valid objectId"
      })
    }
  }
    const userData = await userModel.findOne({ _id: userId })

    if (!userData)
      return res.status(404).send({ status: false, message: "User not found" });
    return res
      .status(200)
      .send({ status: true, message: "user profile details", data: userData });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }

//----------------------------UPDATE/API-------------------------------------------------------------------

exports.updateUserProfile = async (req, res) => {
  const userIdInParams = req.params.userId;
  const userIdInToken = req.userId;

  if (!isValidObjectId(userIdInParams))
    return res
      .status(400)
      .send({ status: false, message: "User id is not valid" });
  if (userIdInParams !== userIdInToken)
    return res.status(403).send({
      status: false,
      message: "You are not authorize to update details",
    });
  const data = req.body;

  const updatedData = userModel.findOneAndUpdate(
    { _id: userIdInParams },
    { ...data },
    { new: true }
  );

  res
    .status(200)
    .send({ status: true, message: "User profile updated", data: updatedData });
  };

}