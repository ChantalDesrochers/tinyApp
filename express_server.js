var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs"); //set view engine to ejs
app.use(bodyParser.urlencoded({
  extended: false
}))//added body parser
app.use(cookieParser())

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "http://www.lighthouselabs.ca": {
    tinyURL: "b2xVn2",
    userID: "userRandomID"
  },
  "http://www.google.com": {
    tinyURL: "9sm5xK",
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
} //added function for random string generation

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//READ display all urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users[req.cookies["user_ID"]]
    // username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//CREATE get Route (displaying form)
app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_ID"];
  let newURL = req.body.longURL;
  let templateVars = {
    users: users[req.cookies["user_ID"]]
    // username: req.cookies["username"]
  }
  if (!users[req.cookies["user_ID"]]) {
    res.redirect("/login");
  } else {
    // urlDatabase[newURL] = {"userID": req.cookies["user_ID"]};
    // console.log(urlDatabase);
    res.render("urls_new", templateVars);
  // console.log(users[req.cookies["user_ID"]]);
  //   res.redirect("/login");
  // } else {
}

});

//CREATE post Route
app.post("/urls", (req, res) => {
  var random = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[longURL] = {
    "tinyURL": random,
    "userID": req.cookies["user_ID"]
  }
  console.log(urlDatabase);
  res.redirect(`/urls/${random}`); // Respond with 'Ok' (we will replace this)
});


//Registration form
app.get("/register", (req, res) => {
  res.render("urls_register")
});

//POST registration form ///double check error handling (if user exists)
app.post("/register", (req, res) => {
  var newUserEmail = req.body.email;
  var newUserPassword = req.body.password;
  var newUserID = generateRandomString();
for (user in users) {
      if (users[user]["email"] == newUserEmail) {
      res.statusCode = 400;
      res.send("400 error! Email already in use");

    }
  }
  if (!newUserEmail || !newUserPassword) {
    res.statusCode = 400;
    res.send("400 error! Must fill out email and password");

  }
  else {
    users[newUserID] = {
    "id": newUserID,
    "email": newUserEmail,
    "password":  newUserPassword
  };
    res.cookie("user_ID", newUserID);
    console.log(users);
    res.redirect("/urls");
    }

  });



//READ specifc pages
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    users: users[req.cookies["user_ID"]]
    // username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//Redirect route
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(`https://${longURL}`);
});

//UPDATE route
app.post("/urls/:id/", (req, res) => {
 var ourTinyURL = req.params.id;
 var ourURLtoChange = urlDatabase[ourTinyURL];
  urlDatabase[ourTinyURL] = req.body.longURL;
  console.log(urlDatabase[ourTinyURL]);
  res.redirect("/urls");

});

//DELETE route
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]; //deleting the url in the database
  res.redirect("/urls");
});

//LOGIN display page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//LOGIN route
app.post("/login", (req, res) => {
var emailInput = req.body.email;
var passwordInput = req.body.password;

for (userIDs in users) {

    if (users[userIDs]["email"] == emailInput && users[userIDs]["password"] == passwordInput) {

     res.cookie("user_ID", `${userIDs}`);
     return res.redirect("/urls");
    }

}

return res.send("Invalid email or password")

});




//LOGOUT route
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});