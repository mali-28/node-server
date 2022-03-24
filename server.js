const express = require('express')
const cors = require("cors");
const app = express()
const port = 5000
const user = require("./routes/user")

app.use(express.json());
app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
    })
  );
app.use((req, res, next) => {
    console.log("method " + req.method + " to " + req.url);
    next();
  });

    
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", `http://localhost:${port}`);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/user", user);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})