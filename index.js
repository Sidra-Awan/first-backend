const routes = require('./routes/routes');
const user = require('./routes/user');
const recipe = require('./routes/recipes');
const contactus= require('./routes/contact')
const purchasedProd = require('./routes/purchaseproduct')
const products= require('./routes/addproduct')
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
// const multer =require ('multer')
const app= express();
// const filestorage= multer.diskStorage({
//   destination: (req,file,cb)=>{
//     cb(null,'./images')
//   },
//   filename: (req,file,cb)=>{
//     cb(null, file.originalname) 
//   }
// })

// const upload = multer({storage: filestorage})

 
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use('/api', routes)
app.use('/api', user)
app.use('/api', products)
app.use('/api', contactus)
app.use('/api', purchasedProd)
app.use('/api', recipe)
mongoose.connect(

    `mongodb+srv://abcd:abcd@cluster0.jiti0m9.mongodb.net/test?retryWrites=true&w=majority`,  {
      useNewUrlParser: true,
    //   useFindAndModify: false,
      useUnifiedTopology: true
    }
  );
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.listen(5000,()=>{
    console.log("server started to ");
})
