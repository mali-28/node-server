const express = require("express");
const router = express.Router();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid")
const verifyToken = require("../auth/verify_token")
let users = [];

router.post("/create", (req, res) => {

  const email = req.body.email;
  const fname = req.body.fname;
  const lname = req.body.lname;
  const password = md5(req.body.password);
  const isUserFound = users.some((user) => {
    return user.email === email
  })

  if (isUserFound) {
    res.status(403).json({ status: 403, message: "username or email already exists" })
  } else {
    const userId = uniqid();
    const createUser = {
      userId,
      fname,
      lname,
      email,
      password,
      date : new Date()
    }

    const copyUser = { ...createUser }
    delete copyUser.password

    jwt.sign(
      { user: copyUser },
      `secretkey`,
      { expiresIn: "24h" },
      (error, token) => {
        if (error) {
          res.status(400).json({ status: 400, message: "Something went wrong" });
        } else {
          res.contentType = "application/json"
          res.header("Authentication", token)
          users.push(createUser);
          res.status(200).json({
            user: copyUser,
            loggedIn: true,
            token
          });
        }
      }
    );
  }
})

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);

  const isUserFound = users.find((user) => {
    return user.email === email && user.password === password
  })

  if (isUserFound) {
    const copyUser = { ...isUserFound }
    delete copyUser.password

    jwt.sign(
      { user: copyUser },
      `secretkey`,
      { expiresIn: "24h" },
      (error, token) => {
        if (error) {
          res.status(400).json({ status: 400, message: "Something went wrong" });
        } else {
          res.contentType("application/json");
          res.status(200).json({ user: copyUser, loggedIn: true, token })
        }
      })
  } else {
    res.status(404).json({ message: "Invalid email or password" })
  }
})


router.get('/all', verifyToken,function (req, res) {

  res.status(200).send(users)
})
module.exports = router;