const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");

const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

let activeSessions = [];

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

function sayHello() {
  console.log("redirects to login")
  res.send(sayHello)  
}



app.get("/", (req, res) => {
    res.write(
      "<h1>Welcome</h1> " +
        "craig" +
        "<button onClick={sayHello}>Default</button>" 
    );
    res.end();
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/auth_user", (req, res) => {

  console.log(req.body.username);
  if (req.body.username == "craig" && req.body.password == "test") {
    res.cookie("username", req.body.username, {
      maxAge: 3000,
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
  res.write("<h1>MAIN</h1><p>id:" + req.session.id + "</p>");
  res.end();
});

app.get("/account", (req, res) => {
  res.write("<h1>ACCOUNT</h1><p>id:" + req.session.id + "</p>");
  res.end();
});

app.listen(port, () => {
  console.log("Server started on port", port);
});
