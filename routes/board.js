const express = require("express");
const router = express.Router();
const verifyToken = require("../auth/verify_token")


let boards = [];

router.post("/create",verifyToken, (req, res) => {
    const date = Date.now()
     console.log({ body: req.body,date })
     const {title, description, userId} = req.body
     const boardId = userId + "_" + date;
     
     boards.push({title,description,boardId})
 res.send(boards)
   })

   outer.post("/create",verifyToken, (req, res) => {
    const date = Date.now()
     console.log({ body: req.body,date })
     const {title, description, userId} = req.body
     const boardId = userId + "_" + date;
     
     boards.push({title,description,boardId})
 res.send(boards)
   })

module.exports = router;