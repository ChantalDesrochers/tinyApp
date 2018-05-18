var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const bcrypt = require('./bcrypt');


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
    id: "user2RandolmID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

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
} //added function for random string generation


function urlsForUser(id){
  var newObject = {};
for (var u in urlDatabase) {
  if(urlDatabase[u]["userID"] == id) {
 newObject[u] = urlDatabase[u];
  }
}
return newObject;
}




app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//READ display all urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies["user_ID"]),
    users: users[req.cookies["user_ID"]]
    // username: req.cookies["username"]
  };
  if(!req.cookies["user_ID"]){
    return res.send("Please login to see the urls");
  } else {
   // let templateVars = urlsForUser(req.cookies["user_ID"]);
    res.render("urls_index", templateVars);
  }

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
    res.render("urls_new", templateVars);
  }
    // urlDatabase[newURL] = {"userID": req.cookies["user_ID"]};
    // console.log(urlDatabase);

  // console.log(users[req.cookies["user_ID"]]);
  //   res.redirect("/login");
  // } else {
});

//CREATE post Route
app.post("/urls", (req, res) => {
  var random = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[random] = {
    "orgURL": longURL,
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
  // var newUserPassword = req.body.password;
  var newUserPassword = bcrypt.hashSync(req.body.password, 10);
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
  let shortURL = req.params.id
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]["orgURL"],
    users: users[req.cookies["user_ID"]]
  };
 if (!users[req.cookies["user_ID"]]) {
  res.send("you must log in to see this page");
 } else if (urlDatabase[shortURL]["userID"] !== req.cookies["user_ID"]) {
  res.send("you can only see your own urls");
 }

  res.render("urls_show", templateVars);
});

//Redirect route
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL]["orgURL"];
  console.log(longURL);
  res.redirect(`https://${longURL}`);
});

//UPDATE route
app.post("/urls/:id/", (req, res) => {
 var ourTinyURL = req.params.id;
 var ourNewURL = req.body.longURL;
 if(urlDatabase[req.params.id]["userID"] === req.cookies["user_ID"]) {
  urlDatabase[ourTinyURL]["orgURL"] = ourNewURL;
 }
  res.redirect("/urls");

});

//DELETE route
app.post("/urls/:id/delete", (req, res) => {
  if(urlDatabase[req.params.id]["userID"] === req.cookies["user_ID"]) {
    delete urlDatabase[req.params.id]; //deleting the url in the database
  }
  res.redirect("/urls");
});

//LOGIN display page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//LOGIN route
app.post("/login", (req, res) => {
var emailInput = req.body.email;

// var passwordInput = bcrypt.compareSync(req.body.password, newUserPassword);
for (userIDs in users) {

    if (users[userIDs]["email"] == emailInput && bcrypt.compareSync(req.body.password, users[userIDs]["password"])) {

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






