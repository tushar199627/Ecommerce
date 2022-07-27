const productModel = require("../model/productModel")

const getAllProduct = async function(req, res){
    try{
    const data = req.query
    let {name, priceGreaterThan, priceLessThan, size, priceSort} = data
    let filters
    let searchObj = {isDeleted: false}
    priceSort = parseInt(priceSort)

    if(size) searchObj.availableSizes = size
    if(name) searchObj.title = { $regex :name.trim(), $options: 'i'}
    if(priceGreaterThan) searchObj.price = {$gt : priceGreaterThan}
    if(priceLessThan) searchObj.price = {$lt : priceLessThan}
    if(priceGreaterThan && priceLessThan) searchObj.price = {$gt : priceGreaterThan, $lt : priceLessThan}
    if(priceSort) filters ={price : priceSort}
    if(priceSort>1 || priceSort < -1 || priceSort ==0) return res.status(400).send({status : false, message : 'Please enter either 1 or -1 is priceSort'})

    const products = await productModel.find(searchObj).sort(filters)  
    return res.status(200).send({status : false, message: "Success", data : products})
    }
    catch(err){
        return res.status(500).send({status : false, message : err.message})
    }
}

module.exports = {getAllProduct}