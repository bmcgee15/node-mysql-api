/**
* Initialize needed node modules.
*/
const express = require('express');
const sql = require('mysql');
const path = require('path');

/**
* Define the express function as a variable.
*/
const app = express();

/**
* Define router variable as express Router function.
*/
const router = express.Router();

/**
* Create a connection pool -- This will ensure the server doesn't overload with requests.
*/
const pool = sql.createPool({
    connectionLimit: 10, // Create connection limit of 10 clients.
    server: "localhost", // This is our SQL server name.
    database: "nodejsandsql", // Database to connect to.
    user: "root", // SQL server username.
    password: "" // SQL server password.
});

/**
* Create a GET connection method.
*/
function getConnection() {
    return pool;
};

/**
*  Get all users from SQL database and render them in JSON format.
*/
router.get("/users", function(req, res){

    /*
    *  Fetch all users from database `users` then check for any errors.
    */
    const queryString = "SELECT * FROM users";
    getConnection().query(queryString, function(err, rows, fields){
      if (!err) {
        console.log("Fetched Users Successfully!");
        const users = rows.map(row => {
          return {
            firstName: row.first_name,
            lastName: row.last_name,
            id: row.id
          };
        });
        res.json(users);
        //res.json(rows);
      } 
      else {
        console.log(err);
        res.sendStatus(500);
        return;
      }
    });
});
  
/**
*  Get select users from SQL database based on their ID,
*  then render them in JSON format. This will use a GET request.
*/
router.get("/users/:id", function(req, res){
    console.log("Fetching user with id: " + req.params.id);
    const id = req.params.id;
    const queryString = "SELECT * FROM users WHERE id = ?";
    getConnection().query(queryString, [id], function(err, rows, fields){
      if (!err) {
        console.log("Fetched User Successfully");
        const users = rows.map(row => {

        /**
        *  Render the user in JSON format--this step is no necessary.
        */
          return {
            firstName: row.first_name,
            lastName: row.last_name,
            id: row.id
          };
        });
        res.json(users);
      } 
      else {
        console.log(err);

        /**
        *  Display an error--This error code would be different based on scenario.
        */
        res.sendStatus(500);
        return;
      }
    });
});
  
/**
*  Push a new user to the SQL database. Only takes a first and last name
*  parameter. This will use a POST request.
*/
router.post("/createUser", function(req, res){
    const firstName = req.body.createFirstName;
    const lastName = req.body.createLastName;
    console.log(
      `Creating user with the first name of ${firstName} and the last name of ${lastName}.`
    );
    const queryString = "INSERT INTO users (first_name, last_name) VALUES (?, ?)";
    getConnection().query(
      queryString,
      [firstName, lastName],
      function(err, results, fields){
        if (!err) {
          console.log("Created User Successfully");
          console.log("Inserted a new user with id: ", results.insertId);
          const queryString =
            "SELECT * FROM users WHERE first_name = ? AND last_name = ?";
          getConnection().query(
            queryString,
            [firstName, lastName],
            function(err, rows, fields){
              if (!err) {
                console.log("Fetched User Successfully");
                const users = rows.map(row => {
                  return {
                    firstName: row.first_name,
                    lastName: row.last_name,
                    id: row.id
                  };
                });
                res.json(users);
                res.end();
              } 
              else {
                console.log(err);
                res.sendStatus(500);
                return;
              }
            }
          );
        } 
        else {
          console.log(err);
          res.sendStatus(500);
          return;
        }
      }
    );
  });
  
  /**
  *  Delete a user by a specified ID. This will use both a POST,
  *  and an DELETE request. 
  */
  router.post("/deleteUser", (req, res) => {
    const userId = req.body.userId;
    router.delete('/deleteUser/${userId}');
    console.log(
      `Deleting user with the ID of ${userId}.`
    );
    const queryString =
      "DELETE FROM users WHERE id = ?";
    getConnection().query(
      queryString,
      [userId],
      (err, rows, fields) => {
        if (!err) {
          console.log("Deleted User Successfully");
          const queryString = "SELECT * FROM users";
          getConnection().query(queryString, (err, rows, fields) => {
            if (!err) {
              console.log("Fetched Users Successfully");
              const users = rows.map(row => {
                return {
                  firstName: row.first_name,
                  lastName: row.last_name,
                  id: row.id
                };
              });
              res.json(users);
            } 
            else {
              console.log(err);
              res.sendStatus(500);
              return;
            }
          });
        } 
        else {
          console.log(err);
          res.sendStatus(500);
          return;
        }
      }
    );
  });
  
/**
*  Update a User based on their ID. This will use a POST request.
*  In the future, we look to use a PUT request.
*/
router.post("/updateUser", (req, res) => {
    const id = req.body.id;
    const newFirst = req.body.newFirstName;
    const newLast = req.body.newLastName;
    console.log(
      `Update user with the ID of ${id} to ${newFirst} ${newLast}.`
    );
    const queryString =
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?";
    getConnection().query(
      queryString,
      [newFirst, newLast, id],
      (err, rows, fields) => {
        if (!err) {
          console.log("Updated User Successfully");
          const queryString = "SELECT * FROM users";
          getConnection().query(queryString, (err, rows, fields) => {
            if (!err) {
              console.log("Fetched Users Successfully");
              const users = rows.map(row => {
                return {
                  firstName: row.first_name,
                  lastName: row.last_name,
                  id: row.id
                };
              });
              res.json(users);
              //res.json(rows);
            } else {
              console.log(err);
              res.sendStatus(500);
              return;
            }
          });
        } 
        else {
          console.log(err);
          res.sendStatus(500);
          return;
        }
      }
    );
});

/**
*  Display the form.html file when in the root of the server. 
*/
router.get('/', function(req, res){
    res.status(200);
    res.sendFile('form.html', {root: path.join(__dirname, '../public')});
});

/**
*  Defines a default route. If the client requests a page that
*  doesn't exist, the server will return a 404 error and render
*  a 404 html page. 
*/
router.get('*', function(req, res){
  res.status(404); 
  res.sendFile('404.html', {root: path.join(__dirname, '../public/')});
});

/**
* Export router constant for use in app.js
*/
module.exports = router;
