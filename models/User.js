const mongoose = require("mongoose")
const Joi = require("joi")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        minlength: 2,
        maxlength: 80,
        required: true
    },
    lastname: {
        type: String,
        minlength: 2,
        maxlength: 80,
        required: true
    },
    password: {
        type: String,
        maxlength: 255,
        required: true
    },
    email: {
        type: String,
        minlength: 8,
        maxlength: 100,
        required: true,
        unique: true
    },
    contact:{
        type:String,
        minlength:10,
        maxlength:10,
        require:true,
        unique:true
    },
    createdAt: {
        type: Date
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type: String,
        default: false
    }
    
})


userSchema.methods.generateAuthToken = async function () 
{
     const user = this

     const token = jwt.sign({_id :  user._id.toString() },'jwt')

     user.tokens = user.tokens.concat({token})

     await user.save()

     return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject

} 


userSchema.pre(['updateOne', 'findOneAndUpdate','save'], function(next) {
    this.updatedAt = new Date
    next()
  });



userSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({email: email})

    if (!user)  return null
    
    const isMatch = await bcrypt.compare(password,user.password)
 
    if(!isMatch) return null
    
    return user
    
  };

function validateUser(user) {

    const obj = {
        firstname: Joi.string().max(80).required(),
        lastname: Joi.string().max(80).required(),
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
        password: Joi.string().min(8).max(100).required(),
        rePassword:Joi.string().min(8).max(100).required(),
        oldPassword:Joi.string().min(8).max(100).required(),
        contact: Joi.string()
            .regex(/^[0-9]{10}$/)
            .messages({ "string.pattern.base": `Phone number must have 10 digits.` })
            .required(),
    };
    
    const  objKeys =  Object.keys(user)  //Array 
    
    const validator= {}
    objKeys.forEach(key => validator[key] = obj[key])
    const schema = Joi.object(validator)
    
    let { error } = schema.validate(user,{abortEarly: false});
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

async function  encryptPassword(password)
{
    const  salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password,salt)
    return hash
}

module.exports.User = mongoose.model("Users", userSchema)
module.exports.validate = validateUser
module.exports.encrypt = encryptPassword