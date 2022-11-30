const atlasDatabase = `mongodb+srv://khalidmesbah:eANSX-6tKHR6dgE@cluster0.4umzxeu.mongodb.net/?retryWrites=true&w=majority`;
const localDatabase = `mongodb://localhost:27017/bookstore`;
const mongoose = require("mongoose");
const Book = require("./book");
(async () => {
  try {
    const book = await Book.create({
      title: "title 3",
      author: "author 3",
      pages: 2,
      rating: 2,
      genres: ["genre 1", "genre 2", "genre 3"],
    });
    book.author = "khalid mesbah";
    await book.save();
    console.log(`book saved`);
  } catch (error) {
    console.log(`error`, error);
  }
})();
mongoose.connect(atlasDatabase, () => console.log(`db connected`));
