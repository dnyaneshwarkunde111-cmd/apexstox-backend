const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // We need axios for API calls
require('dotenv').config();

// User Schema/Model (Same as before)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = { origin: '*', credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully"); 
});

// --- AUTH ROUTES (Same as before) ---
app.post('/api/auth/register', async (req, res) => {
  // ... (register logic is the same)
});
app.post('/api/auth/login', async (req, res) => {
   // ... (login logic is the same)
});

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
      outputsize: '10', // Get up to 10 results
      country: 'India' // Search specifically in India
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
