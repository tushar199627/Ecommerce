const mongoose = require('mongoose')

const isValidEmail=(mail)=>{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    return true
}
const isValidName=(name)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name))
    return true
}
const isValid=(value)=>{
    if(typeof value==="undefined" || value=== null ) return false
    if(typeof value==="string" && value.trim().length===0) return false
    return true
}
const isValidPassword=(pw)=>{
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/.test(pw))
    return true
}
const isValidTitle=(title)=>{
    if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(title))
    return true
}

const isValidObjectId=function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidISBN =(isbn) => {
    if(/^[0-9]{13}$/.test(isbn))
    return true
}
// const isValidBody=(body)=>{
//     if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9]*)*$/.test(body))
//     return true
// }

// const isValidBody = function (body) {
//     return Object.keys(body).length > 0
// }



module.exports={isValidEmail,isValidName,isValid,isValidPassword,isValidTitle, isValidObjectId, isValidISBN}
