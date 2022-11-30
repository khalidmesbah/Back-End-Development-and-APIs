// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// dotenv
require("dotenv").config();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// {"unix":1451001600000,"utc":"Fri, 25 Dec 2015 00:00:00 GMT"}
// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api", (req, res) => {
  res.json({ unix: Date.now(), utc: new Date(Date.now()).toUTCString() });
});

app.get("/api/:timestamp", (req, res) => {
  const timestamp = req.params.timestamp;
  let unix, utc;

  if (isNaN(+timestamp)) unix = +new Date(timestamp).getTime();
  else unix = +timestamp;

  utc = new Date(unix).toUTCString();

  if (utc === "Invalid Date") {
    res.json({ error: "Invalid Date" });
  }

  res.json({ unix, utc });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
