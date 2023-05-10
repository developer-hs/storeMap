import express from "express";
import cors from "cors";
import fs from "fs";
import cheerio from "cheerio";
import path from "path";
import expressSanitizer from "express-sanitizer";

import getAdminJs from "./admin.js";
import db from "./app/mongodb/model/index.js";

export const app = express();
const __dirname = path.resolve();

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

const appInit = async () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(expressSanitizer());
  app.use(express.static("public"));
  app.use(cors(corsOptionsDelegate));
  const adminJs = await getAdminJs();
  app.use(adminJs.admin.options.rootPath, adminJs.adminRouter);
};

const connectDB = () => {
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
};

const appRouting = () => {
  app.get("/", (req, res) => {
    fs.readFile(__dirname + "/routes/index.html", "utf8", (err, data) => {
      if (err) throw err;
      const $ = cheerio.load(data);
      const body = $("body").html();
      res.send(body);
    });
  });

  app.get("/test", (req, res) => {
    res.sendFile(__dirname + "/routes/index.html");
  });

  app.get("/oauth", (req, res) => {
    console.log(req);
  });
};

app.listen();

const appStart = () => {
  appInit();
  connectDB();
  appRouting();
};

const init = () => {
  appStart();
};

init();
