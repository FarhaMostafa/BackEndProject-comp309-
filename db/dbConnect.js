const mongoose = require("mongoose");
        mongoose.set('strictQuery',true);
        require('dotenv').config();

        dbConnect()
  .then(() => console.log("mongodb is connected"))

  .catch((err) => console.log(err));

async function dbConnect() {
  await mongoose.connect(process.env.BD_URL);
  
}


module.exports=dbConnect;