require("./dbconnection")

const express = require("express")
const userRouter = require("./routes/user")
const bookRouter = require("./routes/books")
const orderRouter = require("./routes/orders")

const cors = require("cors")
const path = require("path")

const app = express()

port = 8000

app.use(cors())

app.use(express.json())
app.use(express.static('public'))

app.use("/api/user",userRouter)
app.use("/api/book",bookRouter)
app.use("/api/order",orderRouter)





app.listen(port, ()=> console.log("Server is up on port",port))

