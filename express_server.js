var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}))

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
}


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
 // console.log(req.body.longURL);
 // console.log(urlDatabase);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});