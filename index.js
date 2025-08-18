const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// This code now connects to the database
const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  // This is the success message we are looking for
  console.log("MongoDB database connection established successfully"); 
})

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend! Database connection is active.');
});

// Baaki saare API routes (login, search, etc.) yahan aayenge

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
