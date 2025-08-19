const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- THE FINAL CORS FIX ---
// This code now explicitly trusts your Netlify website URL.
const corsOptions = {
  origin: "https://apexstox.netlify.app",
  credentials: true,
};
app.use(cors(corsOptions));
// --- END OF FIX ---

const port = process.env.PORT || 5000;
app.use(express.json());

// Database Connection
const uri = process.env.DATABASE_URL;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// User Schema/Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// --- START OF ROUTES ---
const authRouter = express.Router();
const stockRouter = express.Router();

// REGISTER A NEW USER
authRouter.route('/register').post(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });
    const existingUser = await User.findOne({ email: email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN A USER
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
// --- END OF ROUTES ---

app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter);

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
