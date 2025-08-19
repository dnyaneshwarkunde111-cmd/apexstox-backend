const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

// --- START OF ROUTE SETUP ---
const authRouter = express.Router();
const stockRouter = express.Router();

// User Schema/Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// REGISTER A NEW USER
authRouter.route('/register').post(async (req, res) => {
  // ... (register logic is the same)
});

// LOGIN A USER
authRouter.route('/login').post(async (req, res) => {
   // ... (login logic is the same)
});

// STOCK SEARCH ROUTE
stockRouter.route('/search').get(async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ message: 'Symbol query is required' });
  
  const options = {
    method: 'GET',
    url: 'https://twelve-data1.p.rapidapi.com/symbol_search',
    params: { symbol: symbol, outputsize: '10', country: 'India' },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock data' });
  }
});
// --- END OF ROUTE SETUP ---


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

// --- TELLING THE SERVER TO USE THE ROUTES ---
app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter); // Add this line for stocks

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
