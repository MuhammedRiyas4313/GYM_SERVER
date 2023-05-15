const mongoose = require('mongoose') ;

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/GYM", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`db connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;