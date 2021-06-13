
const { User, validate, encrypt } = require("../models/User")
const multer = require('multer')
const fs = require("fs")
const bcrypt = require("bcryptjs");
const { errorMonitor } = require("events");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },

});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
}).single("avatar");




module.exports.registerUser = async (req, res) => {

    const reqKeys = Object.keys(req.body)
    const allowedUpdates = ['firstname', 'email', 'password', 'contact', 'rePassword', 'lastname']
    const isValidOperator = reqKeys.every(key => allowedUpdates.includes(key))

    if (!isValidOperator) {
        return res.status(404).send({ error: "Invalid credentials" })
    }

    let error = validate(req.body)
    if (error) res.status(422).send(error)

    else {
        error = {}
        let user = await User.findOne({ email: req.body.email })

        if (user) error.email = "Email already in use"

        user = await User.findOne({ contact: req.body.contact })
        if (user) error.contact = "Contact already in use"

        if (Object.keys(error).length !== 0)
            return res.status(422).send({ error })
        req.body.createdAt = Date.now()
        user = new User(req.body)
        delete user["rePassword"]
        user.password = await encrypt(user.password)
        try {
            await user.save()
            return res.status(200).send({ "message": "User created" })
        }
        catch (e) {
            return res.send(e)
        }






    }

}

module.exports.login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findByCredentials(email, password)
        if (!user) return res.status(422).send({ password: "Incorrect email or password" })
        const token = await user.generateAuthToken()
        res.status(200).send({ data: user, token })
    }
    catch (e) {
        res.status(400).send(e)
    }
}

module.exports.changeContact = async (req, res) => {

    const { contact } = req.body
    let error = validate({ contact })
    if (error) res.status(422).send(error)

    try {
        let user = await User.findOne({ contact: req.body.contact })
        if (user) return res.status(422).send({ contact: "Contact already in use" })
        user = req.user
        user.contact = contact
        await user.save()
        res.status(200).send({ "message": "Contact Updated" })
    }
    catch (e) {
        res.status(400).send(e)
    }
}

module.exports.changeEmail = async (req, res) => {

    const { email } = req.body
    let error = validate({ email })
    if (error) res.status(422).send({ error })

    try {
        let user = await User.findOne({ email  : req.body.email })
        if (user) return res.status(422).send({ email: "Email already in use" })
        user = req.user
        user.email = email
        await user.save()
        res.status(200).send({ "message": "Email Updated" })
    }
    catch (e) {
        res.status(400).send(e)
    }
}

module.exports.showUser = async (req, res) => {

    const user = req.user
    res.status(200).send({ data: user })
}

module.exports.changeProfile = async (req, res) => {


    upload(req, res, async (err) => {
        if (err) return res.status(422).send({ "avatar": "Image must be of type image" })
        else {
            const filepath = req.user.avatar
            req.user.avatar = req.file.filename
            await req.user.save()

            if (filepath !== "false") {
               
                fs.unlinkSync("public/images/" + filepath)

            }
            res.status(200).send({data: req.user.avatar})
        }


    });






}
module.exports.changePassword = async (req, res) => {
    const { oldPassword, password, rePassword } = req.body
    let error = validate({ oldPassword, password, rePassword })
    if (error) res.status(422).send(error)

    try {
        const user = req.user
        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (isMatch) {
            user.password = await bcrypt.hash(password, 10)
            await user.save()
            res.status(200).send({ "message": "Password Updated" })

        }
        else {
            res.status(422).send({ "oldPassword": "Incorrect Old Password " })
        }

    }
    catch (e) {
        res.status(400).send(e)
    }
}

module.exports.logout = async (req, res) => {
    const token = req.token
    try {
        const user = await User.find({ token, _id: req.user._id })
        if (!user) return res.status(404).send({ error: "Please Login" })
        req.user.tokens = req.user.tokens.filter(element => element.token !== token)
        await req.user.save()
        res.status(200).send({})
    }
    catch (e) {
        res.status(400).send(e)
    }
}


module.exports.checkAuthenticated = async(req,res) => {
    if (req.user)
    res.status(200).send({data: true})
    
}