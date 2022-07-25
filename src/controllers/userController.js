const userModel  =require('../models/userModel')
const jwt=require('jsonwebtoken')



//--------------------------------------POST/REGISTER------------------------------------------------------------------------

const createUser = async (req, res) =>{

    try{

    const data = req.body
    const {fname,lname,email,profileImage,phone,password,address} = data

   const userCreated = await userModel.create(data)

   return res.status(201).send({satus:true,msg:"User created successfully",data:savedData})
    }
    catch(err){
        return res.status(500).send({status:false,message:err.message});
    }
}

//-------------------------------------------LOGIN/USER---------------------------------------------------

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




module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
