const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- CONFIGURATION ---
app.use(cors({ origin: "https://apexstox.netlify.app", credentials: true }));
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- DATABASE SCHEMA ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  virtualBalance: { type: Number, default: 1000000 },
  portfolio: [{
    symbol: String,
    quantity: Number,
    avgPrice: Number,
  }],
});
const User = mongoose.model('User', userSchema);

// --- API ROUTES ---
const authRouter = express.Router();
const stockRouter = express.Router();
const tradeRouter = express.Router();

// AUTHENTICATION ROUTES
authRouter.route('/register').post(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.route('/login').post(async (req, res) => {
   try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ message: 'No account with this email has been registered' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ message: "Login successful", user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STOCK DATA ROUTES
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

stockRouter.route('/price').get(async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ message: 'Symbol query is required' });

  const options = {
    method: 'GET',
    url: 'https://twelve-data1.p.rapidapi.com/price',
    params: { symbol: symbol, format: 'json' },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    // --- START OF THE FIX ---
    // Hum check kar rahe hain ki price aa raha hai ya nahi
    if (response.data && response.data.price) {
        res.json({ price: response.data.price });
    } else {
        // Agar price nahi milta, toh hum ek error bhejenge
        res.status(404).json({ message: 'Price data not available for this symbol.' });
    }
    // --- END OF THE FIX ---
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch live price' });
  }
});

// TRADE EXECUTION ROUTES
tradeRouter.route('/buy').post(async (req, res) => {
  try {
    const { userId, symbol, quantity, price } = req.body;
    const totalCost = quantity * price;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.virtualBalance < totalCost) {
      return res.status(400).json({ message: "Not enough funds." });
    }

    user.virtualBalance -= totalCost;
    const stockIndex = user.portfolio.findIndex(s => s.symbol === symbol);

    if (stockIndex > -1) {
      const existingStock = user.portfolio[stockIndex];
      const newQuantity = existingStock.quantity + quantity;
      const newAvgPrice = ((existingStock.avgPrice * existingStock.quantity) + totalCost) / newQuantity;
      user.portfolio[stockIndex].quantity = newQuantity;
      user.portfolio[stockIndex].avgPrice = newAvgPrice;
    } else {
      user.portfolio.push({ symbol, quantity, avgPrice: price });
    }

    await user.save();
    res.json({ message: "Stock purchased successfully!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

tradeRouter.route('/sell').post(async (req, res) => {
    res.json({ message: "Sell feature is in development." });
});

// Use Routers
app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/trade', tradeRouter);

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
