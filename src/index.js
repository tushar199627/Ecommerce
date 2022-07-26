const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");
const  mongoose = require("mongoose");
const app = express();
const multer= require("multer");
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use( multer().any())

mongoose.connect("mongodb+srv://Sumit:Shakya123@cluster0.of12ajb.mongodb.net/Group_46_Database", {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use("/", route);
app.all('/**',route ,(req, res) => {
  res.status(404).send({ status: false, message: "Either Page Not Found Or Missing Some Of The Parameters " })
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
