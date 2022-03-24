// const express = require("express");
// const router = express.Router();
// const md5 = require("md5");
// const jwt = require("jsonwebtoken");
// const uniqid = require("uniqid")
// const verifyToken = require("../auth/verify_token")
// let users = [];

// router.post("/create", (req, res) => {

//   const email = req.body.email;
//   const fname = req.body.fname;
//   const lname = req.body.lname;
//   const password = md5(req.body.password);
//   const isUserFound = users.some((user) => {
//     return user.email === email
//   })

//   if (isUserFound) {
//     res.status(403).json({ status: 403, message: "username or email already exists" })
//   } else {
//     const userId = uniqid();
//     const createUser = {
//       userId,
//       fname,
//       lname,
//       email,
//       password,
//       date : new Date()
//     }

//     const copyUser = { ...createUser }
//     delete copyUser.password

//     jwt.sign(
//       { user: copyUser },
//       `secretkey`,
//       { expiresIn: "24h" },
//       (error, token) => {
//         if (error) {
//           res.status(400).json({ status: 400, message: "Something went wrong" });
//         } else {
//           res.contentType = "application/json"
//           res.header("Authentication", token)
//           users.push(createUser);
//           res.status(200).json({
//             user: copyUser,
//             loggedIn: true,
//             token
//           });
//         }
//       }
//     );
//   }
// })

// router.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = md5(req.body.password);

//   const isUserFound = users.find((user) => {
//     return user.email === email && user.password === password
//   })

//   if (isUserFound) {
//     const copyUser = { ...isUserFound }
//     delete copyUser.password

//     jwt.sign(
//       { user: copyUser },
//       `secretkey`,
//       { expiresIn: "24h" },
//       (error, token) => {
//         if (error) {
//           res.status(400).json({ status: 400, message: "Something went wrong" });
//         } else {
//           res.contentType("application/json");
//           res.status(200).json({ user: copyUser, loggedIn: true, token })
//         }
//       })
//   } else {
//     res.status(404).json({ message: "Invalid email or password" })
//   }
// })


// router.get('/all', verifyToken,function (req, res) {

//   res.status(200).send(users)
// })
// module.exports = router;



const express = require("express");
const router = express.Router();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid")
const MongoClient = require('mongodb').MongoClient;
const uri = require("../constant")


MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('data')
    const collection = db.collection('users')
   
    const getUsers = (req, res, next) => {
      db.collection('users').find().toArray()
        .then(results => {
          req.users = results;
          next()
        })
        .catch(error => res.status(200).json({ message: error }))
    }

    const verifyToken = (req, res, next) => {
      const header = req.headers["authorization"];
      if (header && header.includes("bearer ")) {
        const token = header.split(" ")[1];
        req.token = token;
        jwt.verify(req.token, `secretkey`, (err, verifiedJwt) => {
          if (err) {
            res.status(200).json({ mesage: err.message })
          } else {
            req.tokenUser = verifiedJwt;
            next();
          }
        })
      } else {
        res.status(403);
        res.json({ message: "Authorization token is missing or invalid!" });
      }
    }

    // const urlGenerator = async (req, res, next) => {
    //   const uploader = async (path) => {
    //     return await cloudinary.uploads(path, "images");
    //   };

    //   const path = req.file.path;
    //   const { url } = await uploader(path);
    //   fs.unlinkSync(path);
    //   req.url = url;
    //   next();
    // }

    router.get('/all', getUsers, (req, res) => {
      const users = req?.users?.map((val, index) =>{
        delete val.password
        delete val.token
        return val
      });
      console.log("val", users)
      res.status(200).send(users)
    })

    router.post('/signup', getUsers,(req, res) => {
      const users = req.users;
      const email = req.body.email;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const password = md5(req.body.password);
      const userId = uniqid();
    
      const createUser = {
        _id : userId,
        firstName,
        lastName,
        email,
        password,
        date: new Date(),
        isAdmin: false,
      }

      const isUserFound = users.some((val) => {
        return val.email === email 
      })

      if (isUserFound) {
        res.status(403).json({ status: 403, message: "username or email already exists" })
      } else {

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
              res.contentType("application/json")
              collection.insertOne({
                ...createUser,
                loggedIn: true,
                token
              })
                .then(result => {
                  console.log(result)
                  res.status(200).json({
                    user: copyUser,
                    _id: copyUser.userId,
                    loggedIn: true,
                    token
                  });
                })
                .catch(error => res.status(200).json({ message: error }))
            }
          }
        );
      }
    })



    // router.post("/profileImage", [verifyToken, upload.single("image"), urlGenerator], (req, res) => {

    //   const imageUrl = req.url;
    //   const token = req.token
    //   const { tokenUser } = req
    //   console.log({ imageUrl, token, tokenUser })
    //   const currUser = { ...tokenUser.user }
    //   currUser.imageurl = imageUrl;
    //   db.collection('users').findOneAndUpdate(
    //     { token },
    //     {
    //       $set: {
    //         user : currUser
    //       },
    //     },
    //     {
    //       upsert: true
    //     }
    //   )
    //     .then(result => {
    //       res.status(200).json({updatedUser : currUser , message: "image uploaded  Successfully" })
    //     })
    //     .catch(error => res.status(400).json({ message: error }))
    // })

    router.put("/status", getUsers, (req, res) => {
      const id = req.body.id;
      const users = req.users;
      if (id && users) {
        const copy = JSON.parse(JSON.stringify(users))
        const currIndex = copy.findIndex(val => val._id === id);
        if (currIndex > -1) {

          const currUser = copy[currIndex]
          const status = currUser.user.isAdmin;
          currUser.user.isAdmin = !status;
          db.collection('users').findOneAndUpdate(
            { _id: id },
            {
              $set: {
                user: currUser.user
              }
            },
            {
              upsert: true
            }
          )
            .then(result => {
              delete currUser.user.password
              res.contentType("application/json")
              res.status(200).json({ updatedUser: currUser, message: "App updated Successfully" })
            })
            .catch(error => res.status(400).json({ message: error }))

        } else {
          res.status(400).json({ message: "user not found" })
        }

      } else {
        res.status(400).json({ message: "something went wrong" })
      }
    })

    router.post("/login", getUsers, (req, res) => {
      const users = req.users;
      const email = req.body.email;
      const password = md5(req.body.password);

      const isUserFound = users.find((val) => {
        return val.email === email && val.password === password
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

              db.collection('users').findOneAndUpdate(
                { _id: copyUser._id },
                {
                  $set: {
                    token,
                    loggedIn: true
                  }
                },
                {
                  upsert: true
                }
              )
                .then(result => {
                  res.contentType("application/json")
                  res.status(200).json({ ...copyUser, token, loggedIn: true })
                })
                .catch(error => res.status(400).json({ message: error }))
            }
          })
      } else {
        res.status(404).json({ message: "Invalid username or password" })
      }
    })

    // router.delete('/delete', getUsers, (req, res) => {

    //   collection.deleteOne(
    //     { _id: req.body.id }
    //   )
    //     .then(result => {
    //       if (result.deletedCount === 0) {
    //         res.json('No Application to delete')
    //       } else {
    //         res.status(200).json({ result, message: "Application deleted successfully" })
    //       }
    //     })
    //     .catch(error => res.status(400).json({ message: error }))
    // })


    router.post('/logout', verifyToken, (req, res) => {
   console.log(req.token)

      db.collection('users').findOneAndUpdate(
        { _id: req.body.id
      },
        {
          $unset: {
            token: req.token
          },
          $set: {
            loggedIn: false,
          }
        },
        {
          upsert: true
        }
      )
        .then(result => {
          res.contentType("application/json")
          res.status(200).json({ message: "logout successfully" })
        })
        .catch(error => res.status(400).json({ message: error }))


    })

  })
  .catch(error => console.error(error))




module.exports = router;