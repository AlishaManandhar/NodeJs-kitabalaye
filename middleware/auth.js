const jwt = require("jsonwebtoken")
const {User} = require("../models/User")

const auth = async (req, res, next) => {
    try{
         
         const token = req.header('Authorization')
         const decoded = jwt.verify(token,'jwt')
         const user = await User.findOne({_id: decoded._id, 'tokens.token': token })
         
         if(!user)
         {
             res.status(401).send({error:"Please Authentiate"})
         }
         req.user = user
         req.token = token
         
         next()

    } catch (e) { res.status(401).send({error:"Please Authentiate"})
         
    }
    
}
 
module.exports = auth