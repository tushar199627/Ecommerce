const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currencyId: { type: String, required: true },
    currencyFormat: { type: String, required: true },
    isFreeShipping: { type: Boolean, default: false },
    productImage: { type: String, required: true },  // s3 link
    style: { type: string },
    availableSizes: { type: [String], required: true, enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] },
    installments: { Type: Number },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('product', productSchema)