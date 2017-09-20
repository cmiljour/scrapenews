// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var logger = require("morgan");
// Requiring our Comment and Article models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

mongoose.Promise = Promise;

// Initialize Express
var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Make public a static dir
app.use(express.static("public"));

// Setup handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseUri = "mongodb://heroku_ndm9fhtf:u0i7ttnpphb42bpk7rqpgpk00j@ds135534.mlab.com:35534/heroku_ndm9fhtf";

if (process.env.MONGODB_URI) {
  
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri);
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Main route 
app.get("/", function(req, res) {
  res.render("index");
});

// A GET request to scrape the YCombinator website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://news.ycombinator.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
  
    // Now, we grab every title within an article tag, and do the following:
    $(".title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children("a").text();
      result.link = $(element).children("a").attr("href");

      // Using our Article model, create a new entry
      //This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result); 

      // Verify that the individual article doesn't exist 
      Article.count({"title": entry.title}, function (err, count){
        // if it does exist, return
        if (count > 0){
          console.log(`document exists: ${entry.title}`);
          return;
        } else {
            // if the article doesn't exist, save to db
            entry.save(function(err, doc) {
              // Log any errors
              if (err) {
                console.log(err);
              } else {
                // Or log the doc
                console.log(`db updated`);
              }
            });
          } 
      });
    });
  });
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    } else {
        // Or send the doc to the browser as a json object 
        res.json(doc);
      }
  });
});

// Grab an article by it's ObjectId
app.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body)

  newComment.save(function(error,doc){
    if (error){
      console.log(error);
    } else {
        Article.findOneAndUpdate({"_id":req.params.id}, {"comment": doc.id})
        .exec(function(err, doc){
          if(err){
            console.log(err);
          }
          else {
            res.send(doc);
          }
        });
      }
  });
});

app.delete("/delete/:id", function(req, res) {
  var commentID;
  console.log(req.params.id);
  Article.find({_id: req.params.id }, function(err, document){
    commentID = document[0].comment;
    console.log(commentID);
    Comment.remove({ _id: commentID}, function(err) {
      if (!err) {
              console.log("no error");
              res.send("Ok");
      }
      else {
              console.log("there is an error");
      }
    });
  });
});


app.get("/saved", function(req, res) {
  // Grab every doc in the Articles array
  Article.find().where('comment').exists()
    .populate("comment").exec(function(error,doc){
    if (error){
      console.log(error);
    } else {
      res.send(doc);
    }
  });
});

// Listen on port 3000
app.listen(process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});