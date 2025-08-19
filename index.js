const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Needed for API calls
require('dotenv').config();

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Database Connection
const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- AUTH ROUTES ---
// ... (Your existing /api/auth/register and /api/auth/login routes are here) ...

// --- NEW STOCK SEARCH ROUTE ---
app.get('/api/stocks/search', async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol query is required' });
  }

  const options = {
    method: 'GET',
    url: 'https://twelve-data1.p.rapidapi.com/symbol_search',
    params: {
      symbol: symbol,
      outputsize: '10',
      country: 'India'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch stock data' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
