const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const header = req.headers["authorization"];
    if (header && header.includes("bearer ")) {
      const token = header.split(" ")[1];

      req.token = token;

      jwt.verify(req.token, `secretkey`, (err, verifiedJwt) => {
        if (err) {
          res.status(401).json({ mesage: err.message })
        } else {
          req.tokenUser = verifiedJwt;
          next();
        }
      })
    } else {
      res.status(401);
      res.json({ message: "Authorization token is invalid!" });
    }
  }

module.exports = verifyToken