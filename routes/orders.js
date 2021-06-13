const express = require("express")
const auth = require("../middleware/auth")
const OrderController = require("../controllers/OrderController")
const { Order } = require("../models/Orders")


const router = new express.Router()

router.get('/my-orders',auth,OrderController.requests)

router.get('/responds',auth,OrderController.responds)
router.get('/confirm-list',auth,OrderController.confirmList)
router.get('/mybooks',auth,OrderController.mybooks)




router.post('/', auth,OrderController.store)
router.put('/cancel/:id', auth,OrderController.cancel)
router.put('/respondOrder/:id', auth,OrderController.respondOrder)

router.put('/confirm/:id', auth,OrderController.confirm)




//router.put('/:id', auth,BookController.update)
// router.put('/updateImage/:id', auth,BookController.updateImage)


// router.get('/', auth,BookController.getBooks)
// router.get('/:id', auth,BookController.getBook)

// router.get('/delete/:id', auth,BookController.delete)










module.exports = router

