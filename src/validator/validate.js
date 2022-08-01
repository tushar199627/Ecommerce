const mongoose = require("mongoose")

// ObjectId validation
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId); // returns a boolean
};

let isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "number" && value.toString().trim().length === 0)
    return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidTitle=(title)=>{
  if(/^[a-zA-Z]+(([',. -][a-zA-Z0-9 ])?[a-zA-Z0-9])$/.test(title))
  return true
}

let isValidRequestBody = function (data) {
  return Object.keys(data).length > 0;
};

let validPassword = function (value) {
  if (value.length >= 8 && value.length <= 15) return true;
};




let validCity = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/;
let validPincode = /^[1-9][0-9]{5}$/;
let validName = /[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/;
let validPhone = /^[6-9]\d{9}$/;
let validString = /^[ a-z ]+$/i;
let validEmail = /^([a-zA-Z0-9\._]+)@([a-zA-Z0-9])+.([a-z]+)(.[a-z]+)?$/;

const isValidBool = function (value) {
  if (!value || typeof value != "string" || value.trim().length == 0) return false;
  return true;
}

const isValidSize = (Size) => {
  let correctSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  return (correctSize.includes(Size))
}

const isValidNumber=(price)=>{
  if(/^[0-9]+([.][0-9]+)?$/.test(price))
  return true
}


module.exports = { isValidObjectId,isValid,isValidTitle, isValidBool,isValidRequestBody, isValidSize,validCity, validPincode, validName, validPhone, isValidNumber,validString, validEmail,validPassword};
