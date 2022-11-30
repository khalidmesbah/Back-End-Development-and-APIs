const { MongoClient } = require("mongodb");
const atlasDatabase = `mongodb+srv://khalidmesbah:eANSX-6tKHR6dgE@cluster0.4umzxeu.mongodb.net/?retryWrites=true&w=majority`;
const localDatabase = `mongodb://localhost:27017/bookstore`;
let dbConnection;
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(atlasDatabase)
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.error(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
