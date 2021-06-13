const mongoose = require("mongoose")
const Joi = require("joi")



const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        minlength: 3,
        maxlength: 80,
        required: true
    },
    author: {
        type: String,
        minlength: 5,
        maxlength: 80,
        required: true
    },
    stock: {
        type: Number,
        min:0,
        max: 15,
        required: true
    },
    isbn: {
        type: String,
        minlength: 13,
        maxlength: 13,
        required: true,
    },
    price:{
        type:Number,
        min:20,
        required:true,
    },
    createdAt: {
        type: Date
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    image:{
        type: String,
        default:false
    },
    negotiable:{
        type: Boolean,
        required:true
    },
    publication:{
        type: String,
        minlength: 3,
        maxlength: 150,
        required: true,
    },
    status:{
        type: Boolean,
    },
    seller_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    edition: {
        type: Number,
        min:1,
        max: 10,
        required: true
    },
    year:{
        type: Number,
        min:1980,
        max: 2021,
        required: true
    }
    
})





bookSchema.pre(['updateOne', 'findOneAndUpdate','save'], function(next) {
    this.updatedAt = new Date
    next()
  });


function validateBook(book) {
 
    const obj =  {
        bookName: Joi.string().max(150).required(),
        author: Joi.string().max(150).required(),
        publication: Joi.string().max(150).required(),
        isbn: Joi.string().min(13).max(13).required(),
        price: Joi.number().min(20).required(),
        stock: Joi.number().min(1).max(15).required(),
        edition: Joi.number().min(1).max(15).required(),
        year: Joi.number().integer().min(1980).max(2021).required(),
        negotiable: Joi.boolean().required()
        
    };
    
    const  objKeys =  Object.keys(book)  //Array 
    
    const validator= {}
    objKeys.forEach(key => validator[key] = obj[key])
    const schema = Joi.object(validator)
    
    let { error } = schema.validate(book,{abortEarly: false});
    if (error)
    {
        const errors = {}
        const details = error.details
        details.forEach(element => {
            errors[element.path] = element.message
            
        })
        return errors
    }
    else
    {
        return null
    }

}



module.exports.Book = mongoose.model("Books", bookSchema)
module.exports.validate = validateBook
