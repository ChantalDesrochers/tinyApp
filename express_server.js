var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('./bcrypt');


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieSession({
  name: 'session',
  secret: 'deliver the package json'
}));

// below are test users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandolmID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

var urlDatabase = {
  "b2xVn2": {
    orgURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    orgURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

function generateRandomString() {
  var randomString = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return randomString;
}


function urlsForUser(id) {
  var newObject = {};
  for (var u in urlDatabase) {
    if (urlDatabase[u]["userID"] == id) {
      newObject[u] = urlDatabase[u];
    }
  }
  return newObject;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GET - redirecting to relevant page based on user status
app.get("/", (req, res) => {
  if (users[req.session.user_ID]) {
    res.redirect("/urls"); // redirecting logged in users to url display page
  } else {
    res.redirect("/login"); // redirecting users to login page so they can login and see urls
  }

});


//GET - read - display all urls
app.get("/urls", (req, res) => {
  var templateVars = {
    urls: urlsForUser(req.session.user_ID),
    users: users[req.session.user_ID]
  };
  if (!req.session.user_ID) {
    return res.send('<p>Please <a href="/login">login</a> to see the urls. Or <a href="/register">register</a> for an account.<p>'); //users who are not logged in cannot see the urls
  } else {
    res.render("urls_index", templateVars);
  }

});

//GET - form for url creation
app.get("/urls/new", (req, res) => {
  var userID = req.session.user_ID;
  var newURL = req.body.longURL;
  var templateVars = {
    users: users[req.session.user_ID]
  };
  if (!users[req.session.user_ID]) { //redirect users to login page if not logged in so they can create new urls
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//POST - create - adding new urls
app.post("/urls", (req, res) => {
  var random = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[random] = {
    "orgURL": longURL,
    "userID": req.session.user_ID
  };
  res.redirect(`/urls/${random}`); // redirecting users so they can see the newly added url page
});

//GET - registration form
app.get("/register", (req, res) => {
  if (users[req.session.user_ID]) { //if a user is logged in they are redirected to the url display page
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});

//POST registration form
app.post("/register", (req, res) => {
  var newUserEmail = req.body.email;
  var newUserPassword = "";
  if (req.body.password) {
    newUserPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newUserPassword = "";
  }
  var newUserID = generateRandomString();
  for (user in users) {
    if (users[user]["email"] == newUserEmail) {
      res.statusCode = 400;
      res.send('<p>400 error! Email already in use. <a href="/register">Try again</a></p>');
    }
  }
  if (!newUserEmail || !newUserPassword) {
    res.statusCode = 400;
    res.send('<p>400 error! Must fill out email and password. <a href="/register">Register</a></p>');
  } else {
    users[newUserID] = {
      "id": newUserID,
      "email": newUserEmail,
      "password": newUserPassword
    };
    req.session.user_ID = newUserID;
    res.redirect("/urls");
  }
});

//GET - read specifc pages
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send('This url does not exist'); //providing relevant error message if user types in wrong url
    return;
  }
  var shortURL = req.params.id;
  var templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]["orgURL"],
    users: users[req.session.user_ID]
  }
  if (!users[req.session.user_ID]) {
    res.send('<p>You must <a href="/login">log in</a> to see this page</p>');
    return;
  } else if (urlDatabase[shortURL]["userID"] !== req.session.user_ID) {
    res.send("You can only see your own urls");
    return;
  } else {
    res.render("urls_show", templateVars);
  }
});

//GET - functional redirect route
app.get("/u/:shortURL", (req, res) => {
  var longURL = urlDatabase[req.params.shortURL]["orgURL"];
  res.redirect(`https://${longURL}`);
});

//POST - UPDATE route
app.post("/urls/:id/", (req, res) => {
  var ourTinyURL = req.params.id;
  var ourNewURL = req.body.longURL;
  if (urlDatabase[req.params.id]["userID"] === req.session.user_ID) {
    urlDatabase[ourTinyURL]["orgURL"] = ourNewURL;
  }
  res.redirect("/urls");
});

//POST - DELETE route
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id]["userID"] === req.session.user_ID) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

//GET - login display form page
app.get("/login", (req, res) => {
  if (users[req.session.user_ID]) {
    res.redirect("/urls")
  } else {
    res.render("urls_login");
  }
});

//POST - login route
app.post("/login", (req, res) => {
  var emailInput = req.body.email;
  for (userIDs in users) {
    if (users[userIDs]["email"] == emailInput && bcrypt.compareSync(req.body.password, users[userIDs]["password"])) {
      req.session.user_ID = userIDs;
      return res.redirect("/urls");
    }
  }
  return res.send('<p>Invalid email or password. <a href="/login">Try again</a></p>');
});


//POST - logout route
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});