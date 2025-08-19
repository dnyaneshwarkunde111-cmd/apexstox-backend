const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Needed for API calls
require('dotenv').config();

// User Model, Auth Routes, etc.
// ... (All the previous login/register code remains here) ...

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


// ... (rest of the server code remains here) ...
