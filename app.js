// Import the necessary libraries and modules
const express = require("express");
const bodyParser = require("body-parser");
const dogecoin = require("dogecoin-lib");
const MongoClient = require("mongodb").MongoClient;

// Set up the express app and configure the body parser
const app = express();
app.use(bodyParser.json());

// Connect to the dogecoin node and the MongoDB database
const dogecoinNode = dogecoin.connect("localhost", 8332);
const mongoClient = new MongoClient("mongodb://localhost:27017");

// Set up the routes for the web application
app.post("/search", (req, res) => {
    // Search for transactions, addresses, or blocks using the provided query
    dogecoinNode
        .search(req.body.query)
        .then((results) => {
            // Save the search results to the database and return them to the client
            mongoClient
                .db("dogecoin-explorer")
                .collection("search-results")
                .insertOne({ query: req.body.query, results: results });
            res.json(results);
        })
        .catch((error) => {
            // Return an error if the search failed
            res.status(500).send(error);
        });
});

app.get("/blockchain-stats", (req, res) => {
    // Retrieve the blockchain statistics from the dogecoin node
    dogecoinNode
        .getBlockchainInfo()
        .then((stats) => {
            // Save the blockchain stats to the database and return them to the client
            mongoClient
                .db("dogecoin-explorer")
                .collection("blockchain-stats")
                .insertOne({ stats: stats });
            res.json(stats);
        })
        .catch((error) => {
            // Return an error if the blockchain stats could not be retrieved
            res.status(500).send(error);
        });
});

app.post("/generate-address", (req, res) => {
    // Generate a new dogecoin address using the dogecoin node
    dogecoinNode
        .getNewAddress()
        .then((address) => {
            // Save the generated address to the database and return it to the client
            mongoClient
                .db("dogecoin-explorer")
                .collection("generated-addresses")
                .insertOne({ address: address });
            res.json({ address: address });
        })
        .catch((error) => {
            // Return an error if the address could not be generated
            res.status(500).send(error);
        });
});

// Start the express app and listen for incoming requests
app.listen(3000, () => {
    console.log("Dogecoin blockchain explorer listening on port 3000!");
});
