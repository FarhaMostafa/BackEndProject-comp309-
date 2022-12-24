const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema=mongoose.Schema({
    name: {
   type: String,
   required: true,
   trim: true,
   lowercase: true
 },
    email:{
        type:String,
        required:[true,"please provide an email"],
        unique:[true,"Email Exits"],
        validate( value ) {
            if( !validator.isEmail( value )) {
                 throw new Error( "Please enter a valid email" )
                  }
             }
    },
    password:{
        type: String,
        required:[true,"please provide a strong password"],
        unique:false,
    },
    tokens: [{
        token: {
        type: String,
        required: true
          }
        }]
      }, {
      timestamps: true
})

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},
    process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}


//async:because we’ll be writing to our database.

const User = mongoose.model("User", userSchema);
module.exports = User