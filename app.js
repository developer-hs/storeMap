const express = require("express");
const cors = require("cors");
const app = express();

const allowlist = ["http://localhost:8080", "https://rlagudtjq2016.cafe24.com"];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(express.static("public"));
app.use(cors(corsOptionsDelegate));

// app.use((req, res, next) => {
//   let allowOriginsStr;
//   for (let i = 0; i < allowlist.length; i++) {
//     if (i < allowlist.length - 1) {
//       allowOriginsStr += `${allowlist[i]} `;
//     } else {
//       allowOriginsStr += allowlist[i];
//     }
//   }
//   res.setHeader(
//     "Content-Security-Policy",
//     `frame-ancestors 'self' ${allowOriginsStr}`
//   );
//   next();
// });

const db = require("./app/mongodb/model/index.js");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("db.url", db.url);
    // console.log("db.mongoose", db.mongoose);
    // console.log("db.tutorial.db", db.tutorial.db);
    console.log("Database Connection Success.");
  })
  .catch((err) => {
    console.log("Database Connection Failure.", err);
    process.exit();
  });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/routes/index.html");
});

module.exports = app;
