const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const PORT = 4000;
const salt = bcrypt.genSaltSync(10);
const fs = require("fs");
const secret = "asdfe45we45w345wegw345werjktjwertkj";
const Product = require('./models/product')



app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieparser());

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/product", uploadMiddleware.single("image"), async (req, res) => {
  let newPath = "";
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  } else {
    console.log("Please select the file");
  }

  const { token } = req.cookies;
  if (token && newPath !== "") {
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) throw err;
      const { name, description, category, rating, price, discount } = req.body;
      const postDoc = await Product.create({
        name,
        description,
        category,
        cover: newPath,
        rating,
        price,
        discount,
      });
      res.json(postDoc);
    });
  }
});

app.get('/product', async (req,res) => {
  res.json(
    await Product.find()
      // .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});




mongoose
  .connect(
    "mongodb+srv://vishalvirdi039:pntq7ygmeLB86eFi@cluster0.zoy3vct.mongodb.net/ShopHub"
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("conneted");
    });
  })
  .catch((err) => console.log(err));
