const { ObjectID } = require("bson");
const express = require("express");
const { connectToDb, getDb } = require("./db");
// init app and middleware
const app = express();

app.use(express.json());

// db connection
let db;
connectToDb((err) => {
  if (err) {
    console.log(`ops, an error have just happened`);
    return;
  }
  console.log(`every thing is ok`);
  app.listen(3000, () => {
    console.log(`the app is listening on http://localhost:3000/`);
  });
  db = getDb();
});

// routes
app.get("/", (req, res) => {
  res.send("khalid is rocking");
});

app
  .route("/books")
  .get((req, res) => {
    // current page
    const page = req.query.p || 0;
    const booksPerPage = 10;

    let books = [];

    db.collection("books")
      .find()
      .skip(page * booksPerPage)
      .limit(booksPerPage)
      .forEach((book) => {
        books.push(book);
      })
      .then((a) => {
        console.log(a, books);
        res.status(200).json(books);
      })
      .catch(() => {
        res.status(500).json({ error: "couldn't fetch the documents" });
      });
  })
  .post((req, res) => {
    const book = req.body;

    db.collection("books")
      .insertOne(book)
      .then((result) => {
        res.status(201).json(result);
      })
      .catch(() => {
        res.status(500).json({ err: "couldn't add the book" });
      });
  });

app
  .route("/books/:id")
  .get((req, res) => {
    if (!ObjectID.isValid(req.params.id))
      res.status(500).json({ err: "not a valid document id" });

    db.collection("books")
      .findOne({ _id: ObjectID(req.params.id) })
      .then((book) => {
        res.status(200).json(book);
      })
      .catch(() => {
        res.status(500).json({ error: "couldn't fetch the documents" });
      });
  })
  .delete((req, res) => {
    if (!ObjectID.isValid(req.params.id))
      res.status(500).json({ err: "not a valid document id" });

    db.collection("books")
      .deleteOne({ _id: ObjectID(req.params.id) })
      .then((result) => {
        res.status(201).json(result);
      })
      .catch(() => {
        res.status(500).json({ err: "couldn't delete the book" });
      });
  })
  .patch((req, res) => {
    if (!ObjectID.isValid(req.params.id))
      res.status(500).json({ err: "not a valid document id" });

    const bookUpdates = req.body;

    db.collection("books")
      .updateOne({ _id: ObjectID(req.params.id) }, { $set: bookUpdates })
      .then((result) => {
        res.status(201).json(result);
      })
      .catch(() => {
        res.status(500).json({ err: "couldn't update the book" });
      });
  });

  