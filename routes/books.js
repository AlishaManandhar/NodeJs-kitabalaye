const express = require("express")
const auth = require("../middleware/auth")
const BookController = require("../controllers/BookController")


const router = new express.Router()

router.get('/addedBooks',auth,BookController.addedBooks)

router.post('/', auth,BookController.registerBook)
router.put('/:id', auth,BookController.update)
router.put('/updateImage/:id', auth,BookController.updateImage)


router.get('/', auth,BookController.getBooks)
router.get('/:id', auth,BookController.getBook)

router.get('/delete/:id', auth,BookController.delete)










module.exports = router

