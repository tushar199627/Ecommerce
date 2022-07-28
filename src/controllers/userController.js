const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { uploadFile } = require("../aws/aws");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const { isValidObjectId, isValid, isValidRequestBody, validPassword, validCity, validPincode, validName, validPhone, validEmail } = require("../validator/validate");

//***************************************POST/REGISTER*******************************************************

exports.createUser = async (req, res) => {

  try {
    let data = req.body;

    let { fname, lname, email, profileImage, phone, password } = data;

    if (!isValidRequestBody(data)) {
      //validating is there any data inside request body
      return res.status(400).send({ status: false, message: "Please provide the Details" });
    }

    if (!isValid(fname)) {
      return res.status(400).send({ status: false, message: "Please provide a FirstName or a Valid FirstName" });
    }
    if (!validName.test(fname)) {
      return res.status(400).send({ status: false, message: "FirstName cannot be a number" });
    }

    if (!isValid(lname)) {
      return res.status(400).send({ status: false, message: "Please provide a LastName or a Valid LastName" });
    }
    if (!validName.test(lname)) {
      return res.status(400).send({ status: false, message: "LastName cannot be a number" });
    }

    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "Please provide a Email d or a Valid Email Id" });
    }

    if (!validEmail.test(email)) {
      return res.status(400).send({ status: false, message: `${email} is not valid email Id` });
    }

    //checking is there same Email Id present inside database or not

    let isAllreadyExistEmail = await userModel.findOne({ email: email });
    if (isAllreadyExistEmail) {
      return res.status(400).send({ status: false, message: `this email id -${email} already exist` });
    }

    if (!isValid(phone)) {
      return res.status(400).send({ status: false, message: "Please provide a Phone Number or a Valid Phone Number" });
    }

    if (!validPhone.test(phone)) {
      return res.status(400).send({ status: false, message: `this phone number-${phone} is not valid, try an Indian Number` });
    }

    //checking is there same phone number present inside database or not

    let isAllreadyExistPhone = await userModel.findOne({ phone: phone });
    if (isAllreadyExistPhone) {
      return res.status(400).send({ status: false, message: ` this phone number- ${phone} already exist` });
    }
    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Please provide a Password or a Valid Password", });


    }
    if (!validPassword(password)) {
      return res.status(400).send({ status: false, message: "Password Should be Minimum 8 Character and Maximum 15 Character Long" });
    }

    // hashing password
    data.password = await bcrypt.hash(password, saltRounds);

    let add = JSON.parse(data.address);
    data.address = add;

    if (!isValid(add.shipping && add.billing)) {
      return res.status(400).send({ status: false, message: "Please provide Address shipping And Billing Address" });
    }

    if (!isValid(add.shipping.street)) {
      return res.status(400).send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(add.shipping.city)) {
      return res.status(400).send({ status: false, message: "City should be Present or City should be Valid" });
    }

    if (!validCity.test(add.shipping.city)) {
      return res.status(400).send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(add.shipping.pincode)) {
      return res.status(400).send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(add.shipping.pincode)) {
      return res.status(400).send({ status: false, message: "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long" });
    }

    if (!isValid(add.billing.street)) {
      return res.status(400).send({ status: false, message: "Street should be Present" });
    }

    if (!isValid(add.billing.city)) {
      return res.status(400).send({ status: false, message: "City should be Present or City should be Valid" });
    }

    if (!validCity.test(add.billing.city)) {
      return res.status(400).send({ status: false, message: "City cannot be Number" });
    }

    if (!isValid(add.billing.pincode)) {
      return res.status(400).send({ status: false, message: "Pincode should be Present" });
    }

    if (!validPincode.test(add.billing.pincode)) {
      return res.status(400).send({ status: false, message: "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long" });
    }


    let files = req.files;

    if (!isValidRequestBody(files)) {
      return res.status(400).send({ status: false, message: "Upload a image." });
    }

    if (files && files.length > 0) {
      profileImage = await uploadFile(files[0]);
    }

    // Add profileImage

    data.profileImage = profileImage;

    const userCreated = await userModel.create(data);

    return res.status(201).send({ status: true, msg: "User Created Successfully", data: userCreated });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//***************************************POST/LOGIN************************************************************

exports.loginUser = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body))
    const { email, password } = data
    console.log(email)
    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide login details" });
    }

    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "Email Id is required" });
    }

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" });
    }

    let details = await userModel.findOne({ email: email });
    console.log(details)
    if (!details) {
      return res.status(400).send({ status: false, message: "Invalid credentials" });
    }


    //create the jwt token 
    console.log(details._id.toString())
    let token = jwt.sign({
      userId: details._id.toString(),
    }, "project5Group46", { expiresIn: "1d" });

    res.setHeader("Authorization", token)


    return res.status(200).send({ status: true, message: "User login successfull", data: { token } })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
}

//+++++++++++++++++++++++++++++ GET /user/:userId/profile +++++++++++++++++++++++++++++++++++++++++++++

exports.getUserById = async function (req, res) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).send({ status: false, msg: "please enter userId" })
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "userId is not a valid objectId" })
    }

    const userData = await userModel.findOne({ _id: userId })

    if (!userData)
      return res.status(404).send({ status: false, message: "User not found" })

    return res.status(200).send({ status: true, message: "user profile details", data: userData });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}


//**********************************PUT /user/:userId/profile*****************************************************

exports.updateUserProfile = async (req, res) => {


  // try {
    const userIdInParams = req.params.userId
    const userIdInToken = req.userid

    if (!isValidObjectId(userIdInParams)) return res.status(400).send({ status: false, message: "User id is not valid" })
    if (userIdInParams != userIdInToken) return res.status(403).send({ status: false, message: "You are not authorize to update details" })
    let files = req.files;
    const dataFromBody = req.body
    let { fname, lname, email, profileImage, phone, password, address } = req.body
    let a = JSON.stringify(dataFromBody)
    const data = JSON.parse(a)
    let dataToUpdate = {}

      if(! isValidRequestBody(dataFromBody) && !files ){
        return res.status(400).send({ status: false, message: "Please provide detail which you want to update" });
      }

  
    if (data.hasOwnProperty("fname")) {
      if (!isValid(fname)) {
        return res.status(400).send({ status: false, message: "Please provide a FirstName or a Valid FirstName" });
      }
      if (!validName.test(fname)) {
        return res.status(400).send({ status: false, message: "FirstName cannot be a number" });
      }
      dataToUpdate.fname = fname
    }
    if (data.hasOwnProperty("lname")) {
      if (!isValid(lname)) {
        return res.status(400).send({ status: false, message: "Please provide a Last Name or a Valid Last Name" });
      }
      if (!validName.test(lname)) {
        return res.status(400).send({ status: false, message: "Last Name cannot be a number" });
      }
      dataToUpdate.lname = lname
    }
    if (data.hasOwnProperty("email")) {
      if (!isValid(email)) {
        return res.status(400).send({ status: false, message: "Please provide a Email d or a Valid Email Id" });
      }

      if (!validEmail.test(email)) {
        return res.status(400).send({ status: false, message: `${email} is not valid email Id` });
      }
      dataToUpdate.email = email
    }
    if (files.length !==0) {
      
      if (!isValidRequestBody(files)) {
        return res.status(400).send({ status: false, message: "Upload a image." });
      }

      if (files && files.length > 0) {
        profileImage = await uploadFile(files[0]);
      }

      // Add profileImage

      dataToUpdate.profileImage = profileImage;
    }
    if (data.hasOwnProperty("phone")) {
      if (!isValid(phone)) {
        return res.status(400).send({ status: false, message: "Please provide a Phone Number or a Valid Phone Number" });
      }

      if (!validPhone.test(phone)) {
        return res.status(400).send({ status: false, message: `this phone number-${phone} is not valid, try an Indian Number` });
      }
      dataToUpdate.phone = phone
    }
    if (data.hasOwnProperty("password")) {
      if (!isValid(password)) {
        return res.status(400).send({ status: false, message: "Please provide a Password or a Valid Password", });
      }

      if (!validPassword(password)) {
        return res.status(400).send({ status: false, message: "Password Should be Minimum 8 Character and Maximum 15 Character Long" });
      }
      dataToUpdate.password = await bcrypt.hash(password, saltRounds);
    }


   
    if (data.hasOwnProperty("address")) {
      const add = JSON.parse(data.address)

      const address = {}

      if (add.hasOwnProperty("shipping")) {
        const shipping = {}
        if (!isValid(add.shipping)) {
          return res.status(400).send({ status: false, message: "Please provide Address shipping" });
        }
        if (add.shipping.hasOwnProperty("street")) {
          if (!isValid(add.shipping.street)) {
            return res.status(400).send({ status: false, message: "Street should be Present" });
          }
          shipping["street"] = add.shipping.street

        }
        if (add.shipping.hasOwnProperty("city")) {
          if (!isValid(add.shipping.city)) {
            return res.status(400).send({ status: false, message: "City should be Present or City should be Valid" });
          }

          if (!validCity.test(add.shipping.city)) {
            return res.status(400).send({ status: false, message: "City cannot be Number" });
          }
          shipping["city"] = add.shipping.city
        }

        if (add.shipping.hasOwnProperty("pincode")) {
          if (!isValid(add.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Pincode should be Present" });
          }

          if (!validPincode.test(add.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long" });
          }
          shipping["pincode"] = add.shipping.pincode
        }
        address.shipping = shipping
      }

      if (add.hasOwnProperty("billing")) {
        const billing = {}
        if (!isValid(add.billing)) {
          return res.status(400).send({ status: false, message: "Please provide Address billing" });
        }
        if (add.billing.hasOwnProperty("street")) {
          if (!isValid(add.billing.street)) {
            return res.status(400).send({ status: false, message: "Street should be Present" });
          }
          billing["street"] = add.billing.street
        }
        if (add.billing.hasOwnProperty("city")) {
          if (!isValid(add.billing.city)) {
            return res.status(400).send({ status: false, message: "City should be Present or City should be Valid" });
          }

          if (!validCity.test(add.billing.city)) {
            return res.status(400).send({ status: false, message: "City cannot be Number" });
          }
          billing["city"] = add.billing.city
        }
        if (add.billing.hasOwnProperty("pincode")) {

          if (!isValid(add.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Pincode should be Present" });
          }

          if (!validPincode.test(add.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please enter a valid Pincode, it should not be alpabetic and should be 6 digit long" });
          }
          billing["pincode"] = add.billing.pincode
        }
        address.billing = billing
      }
      dataToUpdate.address = address
    }


    const updatedData = await userModel.findOneAndUpdate({ _id: userIdInParams }, dataToUpdate, { new: true })
   
    res.status(200).send({ status: true, message: "User profile updated", data: updatedData })
  // } catch (err) {
  //   return res.status(500).send({ status: false, message: err.message });
  // }
}
