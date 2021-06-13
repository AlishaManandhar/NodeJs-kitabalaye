
const {Book,validate} = require("../models/Book")
const _ = require("lodash")
const multer  = require('multer')
const fs = require("fs")
const bcrypt = require("bcryptjs")

const storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './public/images');    
    }, 
    filename: function (req, file, cb) { 
       cb(null , Date.now() + file.originalname );   
    },
   
 });

 const upload = multer({ storage,
    fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
 
    }
} }).single("image");




module.exports.registerBook  = async (req,res) => {

   upload(req, res, async (err) => {
      if (err) return res.status(422).send({"image": "Image must be of type image"})
      else
      {
         const reqKeys = Object.keys(req.body) 
         const allowedUpdates = ["bookName", "author", "publication", "isbn", "year", "edition", "negotiable", "stock", "price"]
         const isValidOperator = reqKeys.every(key=> allowedUpdates.includes(key))
         
         if (!isValidOperator) 
         {
            return res.status(404).send({ error: "Invalid credentials" })
         }
         req.body.negotiable = req.body.negotiable === "true" ? true :false
         let error = validate(req.body) 

         if (error) 
         {
            fs.unlinkSync("public/images/" + req.file.filename)
            return res.status(422).send(error)
         }
         else
         {
            req.body.createdAt = Date.now()
            req.body.seller_id = req.user._id
            req.body.image = req.file.filename
            req.body.status = true
            book = new Book(req.body)

            try{
               await book.save()
               return res.status(200).send({message: "Book created"})
            }
            catch(e)
            {
               return res.status(400).send(e)
            }
         }
      }
   })


}




module.exports.getBooks = async (req,res) => {

   try{
      const books = await Book.find({stock: {$gt: 0},status:true,seller_id: { $ne: req.user._id }}).populate({
      path: 'seller_id',
      model: 'Users'
      }).sort({
         createdAt: 'desc'
      })

      res.status(200).send({data: books})
  
   }
   catch(e)
   {
      res.send(422).send("No book found")
   }
   
}


module.exports.getBook = async (req,res) => {

   const id = req.params.id
   try{
      const book = await Book.findById(id).populate({
         path: 'seller_id', 
         model: 'Users'
     })
      res.status(200).send({data:book})
   }
   catch(e)
   {
      res.status(422).send({"error": "Book not found"})
   }
   
   
}

module.exports.delete = async (req,res) => {
   const id = req.params.id
   try{
      const book = await Book.findOneAndUpdate({_id:id},{$set: {status:false}})
      res.status(200).send({"message": 'Book deleted'})
   }
   catch(e)
   {
      res.status(422).send({"error": "Book not found"})
   }
   
}


module.exports.addedBooks = async (req,res) => {
   try{
      const books = await Book.find({seller_id: req.user._id}).sort({
         updatedAt: 'desc'
      })
      res.status(200).send({data: books})
   }
   catch(e)
   {
      res.status(422).send({"error": "Book not found"})
   }
}
   
module.exports.update = async (req,res) => {
   const id = req.params.id
   const reqKeys = Object.keys(req.body) 
   const allowedUpdates = ["bookName", "author", "publication", "isbn", "year", "edition", "negotiable", "stock", "price"]
   const isValidOperator = reqKeys.every(key=> allowedUpdates.includes(key))
   
   if (!isValidOperator) 
         {
            return res.status(404).send({ error: "Invalid credentials" })
         }
   let error = validate(req.body)     
   if (error)  return res.status(422).send(error)
         
   try{
      const book = await Book.findById(id)
      
      for(let item in req.body)
      {
         book[item] =  req.body[item]
         
      }
   
      await book.save()
      res.status(200).send({"message": "Updated Book"})
      
   }
   catch(e)
   {
      res.status(422).send({"error": "Book not found"})
   }

   
}


module.exports.updateImage = async (req,res) => {
   const id = req.params.id

   try{
         const book = await Book.findById(id)
         upload(req,res,async err=> {
            if (err) return res.status(422).send({"image": "Image must be of type image"})
            else{
               filepath = book.image
               book.image = req.file.filename
               await book.save()
               fs.unlinkSync("public/images/" + filepath)

               res.status(201).send(book)

            }
         })

   }
   catch(e)
   {
      res.status(422).send({"error": "Book not found"})
   }
   
   
   
  

         
  
   
}