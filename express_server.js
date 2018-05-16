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

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//READ display all urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//CREATE get Route (displaying form)
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
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

//READ specifc pages
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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

//LOGIN route
app.post("/login", (req, res) => {
var userInput = req.body.username;
res.cookie("username", `${userInput}`);
res.redirect("/urls");
});

//LOGOUT route
app.post("/logout", (req, res) => {
res.clearCookie("username");
res.redirect("/urls");
});

//Registration form
app.get("/register", (req, res) => {
  res.render("urls_register")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});