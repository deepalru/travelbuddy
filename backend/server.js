const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(cors());

app.get('/api/places', async (req, res) => {
  const { lat, lng, keyword } = req.query;
  if (!lat || !lng || !keyword) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error_message) {
      console.error('Google Places API error:', data.error_message, data);
      return res.status(500).json({ error: data.error_message, details: data });
    }
    res.json(data);
  } catch (err) {
    console.error('Backend fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch from Google Places API.', details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
}); 