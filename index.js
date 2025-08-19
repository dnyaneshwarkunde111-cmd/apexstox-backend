const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// --- TEMPORARY LOGIN ROUTE FOR TESTING ---
// This version does NOT connect to the database.
// It just checks if the server is receiving the request.
app.post('/api/auth/login', (req, res) => {
  console.log("Login request received successfully!");
  res.json({
    message: "Login successful (Test Response)",
    user: { id: "test-user", email: req.body.email }
  });
});

app.get('/', (req, res) => {
  res.send('Hello from ApexStox Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
