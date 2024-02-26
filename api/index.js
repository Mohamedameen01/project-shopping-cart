const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const app = express();
const db = require("./config/connection");
const session = require("express-session");
const Handlebars = require("handlebars");
const dotenv = require("dotenv");
const cors = require('cors');
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

dotenv.config();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials",
  })
);

const corsConfig = { origin: "*", credential: true, methods : ['GET','POST','PUT','DELETE']};

app.use(cors(corsConfig));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    resave: false,
    saveUninitialized: true,
  })
);

db.connect((err) => {
  if (err) console.log("Connection Error: " + err);
  else console.log("Database Connected");
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

module.exports = app;
