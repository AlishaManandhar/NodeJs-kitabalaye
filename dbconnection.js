const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/kitabalaye",{useNewUrlParser:true,useUnifiedTopology:true, useCreateIndex:true,useFindAndModify:false})
.then(console.log("Database connected successfully"))
.catch((e) => console.log("An error occured in connection with database"))