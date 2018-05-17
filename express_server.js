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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = {
    users: users[req.cookies["user_ID"]]
    // username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

//CREATE post Route
app.post("/urls", (req, res) => {
  var random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  console.log(req.body.longURL);
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
      res.send("400 error! Email already in use");
      // res.status(400);
    }
  }
  if (!newUserEmail || !newUserPassword) {
    res.send("400 error! Must fill out email and password");
    // res.status(400);
  }
  else {
    users["id"] = newUserID;
    users["email"] = newUserEmail;
    users["password"] = newUserPassword;
    res.cookie("user_ID", `${newUserID}`);
    console.log(users);
    res.redirect("/urls");
  }
});


// (users["email"]==newUserEmail) {
// res.status(400);
//   res.send("400 error!");
// } else {
// users["id"] = newUserID;
// users["email"] = newUserEmail;
// users["password"] = newUserPassword;
// res.cookie("user_ID", `${newUserID}`);
// console.log(users);
// res.redirect("/urls");
// }
// });

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
 console.log(ourURLtoChange);
  urlDatabase[ourTinyURL] = req.body.longURL;
  // console.log(ourURLtoChange);
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
// console.log(emailInput);
// console.log(passwordInput);
for (userIDs in users) {
  // console.log(userIDs);
  // console.log(users[userIDs]);
  // console.log(users[userIDs]["email"]);
  // console.log(users[userIDs.email);
  // console.log(users.userIDs.password);
    // console.log("bcrypt compare: ",bcrypt.compareSync(password, user.password))
    if (users[userIDs]["email"] == emailInput && users[userIDs]["password"] == passwordInput) {
      // res.cookie("user_ID", `${UserID}`);
     // console.log(userIDs);
     res.cookie("user_ID", `${userIDs}`);
     res.redirect("/urls");
    } else {
      res.send("Invalid email or password")

    }
  }


  // var userProfile = _.select(users, function(node){
  //   return node.email === emailInput
  // });
  // console.log(req.body.email);
  // console.log(userProfile);
//get key by value?
  // console.log(Object.keys(users)[1]);
//   if(Object.keys(users)[1] == req.body.email) {
// console.log(Object.keys(users)[1]);
//   }
// var userID= req.body.username;

// res.cookie("user_ID", `${userInput}`);

});

//LOGOUT route
app.post("/logout", (req, res) => {
res.clearCookie("user_ID");
res.redirect("/urls");
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});