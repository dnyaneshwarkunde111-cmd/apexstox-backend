const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Jab hum database connect karenge toh yahan code aayega
// const uri = process.env.DATABASE_URL;
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;
// connection.once('open', () => {
//   console.log("MongoDB database connection established successfully");
// })

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

// Baaki saare API routes (login, search, etc.) yahan aayenge

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
