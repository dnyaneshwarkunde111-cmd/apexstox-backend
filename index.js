const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- START OF THE FIX ---
// We are explicitly telling the server to trust your Netlify site
const corsOptions = {
  origin: "https://apexstox.netlify.app", // Replace with your actual Netlify URL if different
  credentials: true,
};
app.use(cors(corsOptions));
// --- END OF THE FIX ---

// ... (rest of the code is the same as before) ...

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

// Auth Routes
const authRouter = express.Router();
authRouter.route('/register').post(async (req, res) => { /* ... register logic ... */ });
authRouter.route('/login').post(async (req, res) => { /* ... login logic ... */ });
app.use('/api/auth', authRouter);

// Stock Routes
const stockRouter = express.Router();
stockRouter.route('/search').get(async (req, res) => { /* ... search logic ... */ });
app.use('/api/stocks', stockRouter);

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
