const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const indexRouter = require("./routes/index");
const { ErrorController } = require("./Errors/createError");
const { DBConnection } = require("./databseconnection/dbConnection");

const app = express();

// View engine setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);

// Error handling
app.use(ErrorController);
DBConnection();
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
