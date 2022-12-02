require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");

// Database Configuration
mongoose.connect(process.env.DB_URI, () =>
  console.log(`db connected successfully.`)
);

const ShortURL = mongoose.model("ShortUrl", {
  original_url: String,
  short_url: Number,
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let id = 1;
ShortURL.find()
  .count()
  .then((numberOfDocs) => (id = numberOfDocs))
  .catch((err) => console.log(err));

// Your first API endpoint
app.get("/api/clear", async (req, res) => {
  await ShortURL.deleteMany({});
  id = 1;
  res.send(`all deleted`);
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (!address) res.json({ error: "Invalid URL" });
    else {
      console.log(`address`, address);
      const { original_url, short_url } = await ShortURL.create({
        original_url: url,
        short_url: id++,
      });
      res.json({ original_url, short_url });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  ShortURL.findOne({ short_url: +req.params.id }, (err, { original_url }) => {
    if (err) {
      res.json({ error: "Invalid URL" });
    } else {
      res.redirect(original_url);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
