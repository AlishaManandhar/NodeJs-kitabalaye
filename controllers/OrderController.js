
const { Order } = require("../models/Orders")

const { Book } = require("../models/Book")

module.exports.store = async (req, res) => {

   req.body.createdAt = Date.now()
   req.body.buyer_id = req.user._id
   req.body.status = "requested"
   order = new Order(req.body)
   try {
      await order.save()
      return res.status(200).send({  message: "Order created" })
   }
   catch (e) {
      return res.status(400).send(e)
   }
}





module.exports.requests = async (req, res) => {

   try {
      const orders = await Order.find({ buyer_id: req.user._id }).populate({
         path: 'seller_id',
         model: 'Users'
      }).populate({
         path: "book_id",
         model: "Books"
      }).sort({
         createdAt: 'desc'
      })
      res.status(200).send({data:orders})
   }
   catch(e)
   {
      res.status(422).send("No order founds")
   }
  
  
   
}

module.exports.responds = async (req, res) => {

   try {
      const orders = await Order.find({ seller_id: req.user._id, status: "requested" }).populate({
         path: 'buyer_id',
         model: 'Users'
      }).populate({
         path: "book_id",
         model: "Books"
      }).sort({
         createdAt: 'asc'
      })
      res.status(200).send({data:orders})
   }
   catch(e)
   {
      res.status(422).send({error:"No order founds"})
   }
  
  
   
}

module.exports.cancel = async (req, res) => {
   const  id = req.params.id
   try {
      const order = await Order.findOne({ buyer_id: req.user._id, _id: id})

      if (order.status === "sold") return res.status(422).send("Already sold by seller")
      else
      {
         order.status = "cancelled"
         await order.save()
         res.status(200).send({"message": "Order Cancelled"})
      }
      
   }
   catch(e)
   {
      res.status(422).send("No order founds")
   }
  
  
   
}

module.exports.confirm = async (req, res) => {
   const  id = req.params.id
   try {
      const order = await Order.findOne({ seller_id: req.user._id, _id: id, status: "accepted" })
      
      order.status = req.body.status
    
         if (order.status == "sold")
         {
            const book = await Book.findById(order.book_id)
            
            book.stock = book.stock - order.quantity
            if (book.stock === 0)
            {
               book.status = false
            }
            await book.save()
         }
         await order.save()
         res.status(200).send({"message": "Order confirmed"})
      
       
   }
   catch(e)
   {
      res.status(422).send(e)
   }
  
  
   
}

module.exports.confirmList = async (req, res) => {

   try {
      const orders = await Order.find({ seller_id: req.user._id, status: "accepted" }).populate({
         path:"buyer_id",
         model:"Users"
      }).populate({
         path:"book_id",
         model:"Books"
      }).sort({
         updatedAt: 'asc'
      }) 

      res.status(200).send({data:orders})
      
   }
   catch(e)
   {
      res.status(422).send(e)
   }
  
  
   
}

module.exports.respondOrder = async (req, res) => {
   const  id = req.params.id
   try {
      const order = await Order.findOne({ seller_id: req.user._id, _id: id, status: "requested"})

      order.status = req.body.status
   
      await order.save()
         res.status(200).send({"message": "Order responded"})
      }
      
   
   catch(e)
   {
      res.status(422).send("No order founds")
   }
  
  
   
}


module.exports.mybooks = async (req, res) => {
 
   try {
      const orders = await Order.find({ buyer_id: req.user._id, status: "sold"}).populate({
         path:"seller_id",
         model:"Users"
      }).populate({
         path:"book_id",
         model:"Books"
      }).sort({
         updatedAt: 'desc'
      }) 
      res.status(200).send({data:orders})
      }
      
   
   catch(e)
   {
      res.status(422).send({error:"No booksfounds"})
   }
  
  
   
}





