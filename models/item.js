const mongoose = require("mongoose");
const ObjectID = mongoose.Schema.Types.ObjectId; //ObjectID is a unique identifier for every document created in mongoDB
//We’ll need this to link every item created with the user that created it.

const itemSchema=new mongoose.Schema({
    owner:{
        type:ObjectID,
        required:true,
        ref:'User'
    },
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
      },
      img:
    {
        data: Buffer,
        contentType: String
    },
      price: {
        type: Number,
        required: true
     }

     }, {
     timestamps: true
     })

     const Item = mongoose.model('Item', itemSchema)
module.exports = Item;