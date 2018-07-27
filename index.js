"use strict";

const express = require('express');
const app = express();
var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


var cred = process.env.user + ":" + process.env.pass;

var uri = "mongodb+srv://" + cred + "@" + process.env.cluster + "." + process.env.host + "/" + process.env.db + "?retryWrites=true";

console.log(uri);


app.get('/', function(req, res) {

    MongoClient.connect(uri, function(err, client) {
       if (err) {
          console.error(err);
          res.send('There was an error connecting to the database');
          return;
        }

       const collection = client.db("test").collection("devices");

       // perform actions on the collection object
       client.close();

       res.send('We just connected to '.concat(collection.dbName));
    });
});

app.listen(3000, function() {
    console.log('Karma app is listening on port 3000');
});
