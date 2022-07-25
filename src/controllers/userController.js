const userModel  =require('../models/userModel')


const createUser = async (req, res) =>{

    const data = req.body


   const {fname,lname,email,profileImage,phone,password,address} = data

   const userCreated = await userModel.create(data)

   res.status(201).send(data)


}

module.exports.createUser = createUser;
