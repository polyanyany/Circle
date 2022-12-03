"use strict";

//const compression = require('compression');

var express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  favicon = require("serve-favicon"),
  indexRoute = require("./routes/index"),
  ejs = require("ejs"),
  //faviconURL = __dirname + '/public/img/logo.png',
  publicDir = express.static(__dirname + "/public"),
  viewDir = __dirname + "/views",
  cors = require("cors"),
  app = express();

var port = process.env.PORT ? process.env.PORT : 80;

app
  .set("views", viewDir)
  .set("port", port)
  .set("view engine", "ejs")
  //.use(favicon(faviconURL))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(publicDir)
  .use(cors())
  //.use(compression())
  .use("/", indexRoute);

app.locals.baseURL = "https://anycircle.app";

module.exports = app;
