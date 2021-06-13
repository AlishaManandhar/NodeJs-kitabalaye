const mongoose = require("mongoose")
const Joi = require("joi")



const orderSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required: true
    },
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required: true
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Books",
        required: true
    },
    quantity: {
        type: Number,
        min:0,
        required: true
    },
    status: {
        type: String,
        enum: ['accepted','rejected','cancelled','sold','requested'],
        required: true,
    },
    createdAt: {
        type: Date
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
    
})





orderSchema.pre(['updateOne', 'findOneAndUpdate','save'], function(next) {
    this.updatedAt = new Date
    next()
  });




module.exports.Order = mongoose.model("Orders", orderSchema)
