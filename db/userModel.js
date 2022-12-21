const mongoose = require("mongoose");
const UserSchema=mongoose.Schema({
    email:{
        type:String,
        required:[true,"please provide an email"],
        unique:[true,"Email Exits"],
    },
    password:{
        type: String,
        required:[true,"please provide a strong password"],
        unique:false,
    },
})

module.exports=mongoose.model.Users||mongoose.model("Users",UserSchema);