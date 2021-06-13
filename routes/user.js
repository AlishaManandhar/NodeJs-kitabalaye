const express = require("express")
const auth = require("../middleware/auth")
const UserController = require("../controllers/UserController")

const router = new express.Router()

router.post('/register', UserController.registerUser)

router.post('/login', UserController.login)
router.put('/changeContact', auth,UserController.changeContact)
router.put('/changeEmail', auth,UserController.changeEmail)
router.put('/changeProfile', auth, UserController.changeProfile)
router.put('/changePassword', auth, UserController.changePassword)
router.get('/logout', auth, UserController.logout)
router.get("/auth-check",auth,UserController.checkAuthenticated)


router.get('/me', auth,UserController.showUser)


module.exports = router

