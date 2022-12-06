require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// db configurations
mongoose.connect(process.env.DB_URI);
mongoose.connection
  .on("error", console.log.bind(console, "connection error: "))
  .once("open", () => {
    console.log("database connection has been established successfully.");
  });

const ExerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, min: 1, required: true },
  date: { type: Date, default: Date.now() },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
});

const User = mongoose.model("User", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

// --------------- routes --------------- \\

// main html
app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// create a new user
app.post("/api/users", async (req, res) => {
  const username = req.body.username.trim();
  if (username === ``) return res.json({ error: "username is required" });

  const user = await User.findOne({ username });
  if (user) return res.json({ error: "username already exists", user });

  const { _id } = await User.create({ username });
  res.json({ _id, username });
});

// get all users
app.get("/api/users", async (_req, res) => {
  res.json(await User.find({}));
});

// get a specific user
app.get("/api/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.json("user doesn't exist");
  const { _id, username } = user;
  res.json({ _id, username });
});

// clear users
app.get("/api/clearUsers", async (req, res) => {
  await User.deleteMany({});
  res.json("all users have been deleted");
});

// create new exercise
app.post("/api/users/:_id/exercises", async function (req, res) {
  const userId = req.params._id;
  const { description, duration } = req.body;

  if (userId.trim() === "") return res.json({ error: "_id is required" });

  if (description.trim() === "")
    return res.json({ error: "description is required" });

  if (duration.trim() === "")
    return res.json({ error: "duration is required" });

  if (isNaN(duration)) {
    return res.json({ error: "duration is not a number" });
  }

  const date = req.body.date ? new Date(req.body.date) : new Date();

  if (date === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  const user = await User.findById(userId);
  if (!user) return res.json("user doesn't exist");
  const { username, _id } = user;

  await Exercise.create({
    userId,
    description,
    duration,
    date,
  });

  res.json({
    _id,
    username,
    description,
    duration: +duration,
    date: date.toDateString(),
  });
});

// get user's exercises
app.get("/api/users/:_id/exercises", (req, res) => {
  res.redirect("/api/users/" + req.params._id + "/logs");
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const user = await User.findById(userId);
  if (!user) return res.json("user doesn't exist");

  const filter = { userId };
  const { from: fromDate, to: toDate, limit } = req.query;

  if (
    (fromDate !== undefined && fromDate !== "") ||
    (toDate !== undefined && toDate !== "")
  ) {
    filter.date = {};

    if (fromDate !== undefined && fromDate !== "") {
      filter.date.$gte = new Date(fromDate);
    }

    if (filter.date.$gte === "Invalid Date") {
      return res.json({ error: "from date is not valid" });
    }

    if (toDate !== undefined && toDate !== "") {
      filter.date.$lte = new Date(toDate);
    }

    if (filter.date.$lte === "Invalid Date") {
      return res.json({ error: "to date is not valid" });
    }
  }

  const { username } = user;

  const exercises = limit
    ? await Exercise.find(filter).limit(+limit)
    : await Exercise.find(filter);

  const log = exercises.map(({ description, duration, date }) => ({
    description,
    duration,
    date: new Date(date).toDateString(),
  }));

  res.json({
    username,
    count: log.length,
    _id: userId,
    log,
  });
});

// clear exercises
app.get("/api/clearExercises", async (req, res) => {
  await Exercise.deleteMany({});
  res.json("all exercises have been deleted");
});

// invalid route
app.use((req, res) => {
  res.json({ status: 404, message: "not found" });
});

// listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
