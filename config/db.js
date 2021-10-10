const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MONGO DB CONNECTED");
  } catch (err) {
    console.error(err.message);
    // EXIT PROCESS with FAILURE
    process.exit(1);
  }
};

module.exports = connectDB;
