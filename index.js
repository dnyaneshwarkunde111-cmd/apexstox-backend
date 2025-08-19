const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema/Model
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

// --- NEW SIGNUP/LOGIN LOGIC ---

// REGISTER A NEW USER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN A USER
app.post('/api/auth/login', async (req, res) => {
   try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: 'No account with this email has been registered' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // For now, we just send a success message.
    // Later, we will add JWT tokens for security.
    res.json({
      message: "Login successful",
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
