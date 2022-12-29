const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const cors = require("cors");//allow us to make requests from our browser.
const fs = require("fs");//to save the image in our server
dotenv.config();
const index = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const itemRouter =require('./routers/item')
const cartRouter = require('./routers/cart')
const orderRoutes = require('./routers/order');
const uploadRoutes = require('./routers/upload');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
index.use(cors());
index.use(bodyParser.json());
index.use(express.json());
index.use(itemRouter);
index.use(cartRouter);
index.use(uploadRoutes);
index.use('/api',orderRoutes);
index.use(
  fileUpload({
    useTempFiles: true,
  })
);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//our port
index.listen(port, () =>
  console.log(`Server is listening at http://localhost:${port}`)
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const User = require("./models/user");
//connect our file dbconnect with indexjs
const dbConnect = require("./db/dbConnect");

dbConnect();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Curb Cores Error by adding a header here
index.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//login and register function modyfying 
// login endpoint
index.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        error,
      });
    });
})
// index.post('/login', (req, res) => {
//     const { email, password } = req.body;
  
//     if (!email || !password) {
//       error = { error: "no email or password" };
//       console.log(`error`, error);
//       return res.status(401).send(error);
//     }
  
//     login({ email, password })
//       .then(async user => {
//         console.log('user', user);
//         const token = await user.generateAuthToken();
//         return res.status(200).send({user,token});
//       })
//       .catch(err => {
//         console.log(`err`, err.message);
//         return res.status(401).send({ error: err.message });
//       });
//   });
  
  index.get('/list', (req, res) => {
    const { limit = 10 } = req.query;
  
    getAllUsers(limit)
      .then(users => {
        console.log(`users`, users);
        return res.status(200).send(users);
      })
      .catch(err => {
        console.log(`err`, err);
        return res.status(404).send({ error: err.message });
      });
  });

  index.post("/register", (request, response) => {
   
          
    // hash the password
    bcrypt
      .hash(request.body.password, 10)
      .then((hashedPassword) => {
        // create a new user instance and collect the data
        const user = new User({
          name:request.body.name,
          email: request.body.email,
          password: hashedPassword,
         
          
  
        });
  
        // save the new user
        user
          .save()
          // return success if the new user is added to the database successfully
          .then((result) => {
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch error if the new user wasn't added successfully to the database
          .catch((error) => {
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });
  
  // index.post('/register',  (req, res) => {
  //   const { name, email, password } = req.body;
  //   if (!name || !email || !password) {
  //     return res.status(401).send({ error: "missing user data" });
  //   }
  //   addUsertoDB({ name, email, password })
  //     .then(async user => {
  //       console.log(`Added user`, user);
  //       const token = await user.generateAuthToken();
  //       return res.status(200).send({user,token});
  //     })
  //     .catch(err => {
  //       console.log(`err`, err);
  //       return res.status(401).send({ error: err.message });
  //     });
  // });
  
  const getAllUsers = async (n) => {
    return await (User.find().limit(n).select('-password'));
  }
  
  const addUsertoDB = async (user) => {
    //check if user exists before adding him
    const user_exists = await User.findOne({ email: user.email });
    // console.log(user_exists);
    if (!user_exists) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      const new_user = new User(user);
      await new_user.save();
      new_user.password = undefined;
      return new_user;
    }
  
    throw new Error("email already exists");
  }
  
  const login = async (user) => {
    //check if user exists
    const existing_user = await User.findOne({ email: user.email });
    // console.log(existing_user);
    if (!existing_user) {
      throw new Error("User doesn't exist!");
    }
    if (!bcrypt.compareSync(user.password, existing_user.password)) {
      throw new Error("Login failed");
    }
    existing_user.password = undefined;
    return existing_user;
  }
  
  index.get('/', (req, res) => {
    return res.status(200).send("OK");
  });
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //upload an image component
  index.post("/",
  bodyParser.raw({type: ["image/jpeg", "image/png"], limit: "5mb"}),
  (req, res) => {
    try {
      console.log(req.body);
      //save the image in our server
      fs.writeFile("image.jpeg", req.body, (error) => {
        if (error) {
          throw error;
        }
      });

      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  });
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  

module.exports=index;