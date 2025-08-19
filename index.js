const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- CONFIGURATION ---
app.use(cors({ origin: 'https://apexstox.netlify.app', credentials: true }));
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- DATABASE SCHEMAS ---
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
const tradeRouter = express.Router(); // New router for trades

// AUTHENTICATION ROUTES
authRouter.route('/register').post(async (req, res) => { /* ... register logic ... */ });
authRouter.route('/login').post(async (req, res) => { /* ... login logic ... */ });

// STOCK DATA ROUTES
stockRouter.route('/search').get(async (req, res) => { /* ... search logic ... */ });
// We'll add routes for chart and news data here later

// TRADE EXECUTION ROUTES (New)
tradeRouter.route('/buy').post(async (req, res) => {
  // Logic to process a buy order
  // Deduct from virtualBalance, add to portfolio
  res.json({ message: "Buy order processed successfully!" });
});
tradeRouter.route('/sell').post(async (req, res) => {
  // Logic to process a sell order
  // Add to virtualBalance, remove from portfolio, calculate P&L
  res.json({ message: "Sell order processed successfully!" });
});

// Use Routers
app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/trade', tradeRouter); // Use the new trade router

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
