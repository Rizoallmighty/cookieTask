const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
var data = require("./data.json")

const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

let activeSessions = [];
var userName = data.username
var passWord = data.password;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "This is a secret",
    cookie: { maxAge: 60000 },
  })
);

function sessionLookup(current_session) {
  for (let i = activeSessions.length - 1; i >= 0; i--) {
    if (activeSessions[i] == current_session) {
      return true;
    } else {
      return false;
    }
  }
}

const checkSession = function (req, res, next) {
  const hasValidSession = sessionLookup(req.session.id);
  if (
    req.path == "/" ||
    req.path == "/auth_user" ||
    req.path == "/login" ||
    hasValidSession
  ) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.use(checkSession);

app.get("/", (req, res) => {
  if (req.cookies.username == undefined) {
    res.write(
      "<h1>Hello </h1><h2>unknown user</h2>" +
        "<a href=/login.html><button>Login!</button></a>"
    );
  } else {
    res.write("<h1>Welcome</h1> " + "<h2>" + req.cookies.username + "</h2>");
  }
  res.end();
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/auth_user", (req, res) => {
  console.log(req.body.username);
  if (req.body.username == userName && req.body.password == passWord) {
    res.cookie("username", req.body.username + " password:" + req.body.password,{
      maxAge: 300000,
      httpOnly: true,
    });
    if (!sessionLookup(req.session.id)) {
      activeSessions.push(req.session.id);
    }
    res.redirect("/main");
  } else {
    res.redirect("/login");
  }
  res.end();
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/main.html"));
});

app.post("/new_username", (req, res) => {
  if (req.body.username == "one") {
    res.write("tf, this is the same username")
  }
  else {
  console.log(req.body.username)
  res.cookie("username", req.body.username + " password:" + req.body.password, {
    maxAge: 300000,
    httpOnly: true,
  });
  res.redirect("/main")
  }
  res.end();
});

app.post("/new_password", (req, res) => {
  if (req.body.password == "1") {
    res.write("tf, this is the same password");
  } else {
    console.log(req.body.password);
    res.cookie(
      "username",
      req.body.username + " password:" + req.body.password,
      {
        maxAge: 300000,
        httpOnly: true,
      }
    );
    res.redirect("/main");
  }
  res.end();
});

app.get("/account", (req, res) => {
  res.write("<h1>ACCOUNT</h1><p>id:" + req.session.id + "</p>");
  res.end();
});

app.listen(port, () => {
  console.log("Server started on port", port);
  console.log(data);
});
