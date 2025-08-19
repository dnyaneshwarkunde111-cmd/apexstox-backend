const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- START OF THE FIX ---
// We are telling our server to accept requests from our Netlify frontend
const corsOptions = {
  origin: '*', // For now, we allow all origins. Later we can restrict it to our Netlify URL.
  credentials: true,
};
app.use(cors(corsOptions));
// --- END OF THE FIX ---

app.use(express.json());

const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully"); 
});

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend! Database connection is active.');
});

// We will add the real API routes here soon
// app.use('/api/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
