const mongoose = require("mongoose");
const DBConnection = async () => {
  const dbUrl = process.env.DB_URI; // Replace with your connection string
  await mongoose
    .connect(dbUrl)
    .then(() => console.log("DB is Connected!"))
    .catch((err) => {
      console.log("DB Connection Eror", err);
    });
};
module.exports = { DBConnection };
