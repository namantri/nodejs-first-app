// First task is to create a server
// to use import go to package.json and change the type to module
// const http = require("http");
// import http from "http";
// // const name = require("./features");//Third party module or custom module
// // import name, { name2 } from "./features.js";
// import * as myObj from "./features.js";
// import fs from "fs";
// import path from 'path';
// console.log(path.extname("/home/name/index.html"));
// console.log(path.dirname("/home/name/index.html"));

// // console.log(myObj);
// console.log(myObj.percent());
// // console.log(http)
// // This is a asynchronous function js will skip the part of waiting so directly doing console.log(home)
// // will  print undefined
// // This callback will always work after the file is readed
// // const home = fs.readFile("./index.html",()=>{
// //      console.log("File Read")
// // })
// const home = fs.readFileSync("./index.html"); // Now it will work

// const server = http.createServer((request, response) => {

//     console.log(request.method);// It will print GET after we hit the server
//   // Without response server is working in finitely
//   // When we do /about in localhost we get output /about with url method
//   if (request.url === "/about") {
//     response.end(`<h1>Love is ${myObj.percent()}</h1>`);
//   } else if (request.url === "/") {
//     // This is a soln to above problem
//     // fs.readFile("./index.html", (err, home) => {
//     //   response.end(home);
//     // });
//      // console.log(home)
//     response.end("home");

//   } else if (request.url === "/contact") {
//     response.end("<h1>Contact Page</h1>");
//   } else {
//     response.end("<h1>Page not Found</h1>");
//   }
// });
// server.listen(5000, () => {
//   console.log("Server is Working");
// });
// Above code is very messy so to solve that we will use Express.js

import exp from "constants";
import express from "express";
// import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
// For hiding our id
import jwt from "jsonwebtoken";
import { name } from "ejs";
// to hide the password from the database
import bcrypt from "bcrypt";
// for now this will act as our database
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));
const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);
const users = [];
const app = express();
// Setting up view engine for ejs render in app.render
app.set("view engine", "ejs");
// For rendering the static file while ejs is for dynamic file
// express.static is a middleware and we can not use middleware without app.use
app.use(express.static(path.join(path.resolve(), "public")));
//To get the form Component we need to use the middleware
app.use(express.urlencoded({ extended: true }));
// To access the cookies
app.use(cookieParser());
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    const decodedData = jwt.verify(token, "khfioeurhof");
    req.user = await User.findById(decodedData._id);
    console.log(decodedData);
    next();
  } else {
    res.redirect("/login");
  }
};
app.get("/", (req, res) => {
  //This will throw error that path is not absolute
  // const file = fs.readFileSync("./index.html")
  //  res.send("Hello");
  //  res.status(404).send("Hello");
  //  res.sendStatus(404);
  // res.json({
  //   success : true,
  //   product : []
  // })

  // const pathLoc = path.resolve();
  // console.log(path.join(pathLoc, "./index.html"));
  // res.sendFile(path.join(pathLoc, "./index.html"));
  // It will directly render the index file without file but file should be in views folder
  // res.render("index.ejs", { name: "Naman" });
  // res.sendFile("index.html")
  // const token = req.cookies.token;
  // if (token) {
  //   res.render("logout");
  // } else {
  //   res.render("login");
  // }
  console.log(req.user);
  res.render("logout", { name: "Naman" });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email: email });

  if (!user) {
    return res.redirect("/register");
  }
  // const isMatch = user.password == password;
  const isMatch = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ _id: user._id }, "khfioeurhof");
  if (!isMatch)
    return res.render("login", { email: email, message: "Incorrect Password" });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/register", (req, res) => {
  res.render("register");
});
//Api for post method
app.get("/success", (req, res) => {
  res.render("success");
});
// app.get("/add", async (req, res) => {
//   await message.create({ name: "Naman", email: "sample32@gmail.com" });
//   res.send("Add");
// });
// app.post("/contact", async (req, res) => {
//   // users.push({ username: req.body.name, email: req.body.email });
//   // res.render("success");
//   const { name, email } = req.body;
//   await message.create({ name: name, email: email });
//   res.redirect("./success");
//   console.log(users);
// });
// api for users data
// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
  });

  return res.redirect("/login");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/login");
});
app.listen(5000, () => {
  console.log("Server is Working");
});
