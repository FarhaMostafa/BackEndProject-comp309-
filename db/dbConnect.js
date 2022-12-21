const mongoose = require("mongoose");
require('dotenv').config();
async function dbConnect(){
    mongoose.connect(process.env.BD_URL,
        {
            // to sure that the connection to data base is done succesfully
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,

        }).then(()=>
        {
            console.log("connect to database on atlas server");
        }).catch((error)=>{
            console.log("unable to connect to the database on atlas");
            console.log(error);
        });
}

module.exports=dbConnect;