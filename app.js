/**
 * Initialize needed node modules.
 */
const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/user.js");

/**
 * Define the express function as a variable.
 */
const app = express();

/**
 * Middleware to help process requests from ./public/form.html.
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

/**
 * Allow the ./public directory to be accessed by our Application server.
 * This will allow the brower to see our form.html file.
 */
app.use(express.static("./public/"));

/**
 * This URL is for testing purposes.
 * Only logs a string to the console.
 */
app.get("/test", function(req, res) {
  console.log("This was the test page");
});

/**
 * Have our application start listening on localhost:3000.
 */
app.listen(3000, function() {
  console.log("Server is up and listening on localhost:3000/");
});
