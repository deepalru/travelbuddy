const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

app.use(cors());

// Category to types/keywords mapping for richer tourist searches
const CATEGORY_MAP = {
  landmarks: {
    types: ['tourist_attraction', 'point_of_interest', 'museum', 'art_gallery'],
    keywords: ['landmark', 'monument', 'iconic', 'famous', 'must-visit', 'historical', 'cultural', 'top attractions', 'famous landmarks', 'historical sites', 'cultural landmarks']
  },
  culture: {
    types: ['museum', 'place_of_worship', 'library'],
    keywords: ['cultural', 'heritage', 'historical', 'ancient', 'ruins', 'traditional', 'cultural sites', 'heritage sites', 'ancient ruins']
  },
  nature: {
    types: ['park', 'natural_feature', 'beach', 'zoo', 'aquarium', 'campground'],
    keywords: ['nature', 'scenic', 'outdoor', 'waterfall', 'mountain', 'lake', 'beach', 'hiking', 'wildlife', 'national park', 'natural wonders', 'scenic spots', 'hiking trails', 'beaches']
  },
  food: {
    types: ['restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway'],
    keywords: ['local food', 'cuisine', 'fine dining', 'street food', 'vegan', 'seafood', 'traditional', 'best restaurants', 'local cuisine', 'food markets', 'michelin star']
  },
  entertainment: {
    types: ['movie_theater', 'night_club', 'amusement_park', 'casino', 'bowling_alley', 'stadium'],
    keywords: ['entertainment', 'nightlife', 'shows', 'concerts', 'adventure', 'family-friendly', 'live music', 'theme parks', 'family activities', 'nightlife spots']
  },
  lodging: {
    types: ['lodging', 'bed_and_breakfast'],
    keywords: ['hotel', 'hostel', 'resort', 'boutique hotel', 'budget', 'luxury', 'cheap hotels', 'luxury resorts', 'boutique stays']
  },
  shopping: {
    types: ['shopping_mall', 'department_store', 'clothing_store'],
    keywords: ['market', 'souvenirs', 'shopping', 'boutique', 'local crafts', 'flea markets', 'local shops', 'souvenir stores']
  },
  events: {
    types: ['point_of_interest', 'establishment', 'stadium', 'theater'],
    keywords: ['festival', 'event', 'concert', 'cultural event', 'seasonal', 'local events', 'festivals this week', 'cultural festivals']
  }
};

app.get('/api/places', async (req, res) => {
  const { lat, lng, keyword, radius, category, type } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }
  const searchRadius = radius || 2000;
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&key=${GOOGLE_PLACES_API_KEY}`;

  // Add type and keyword based on category mapping
  let combinedKeywords = [];
  let typeParam = type;
  if (category && category !== 'all' && CATEGORY_MAP[category]) {
    const cat = CATEGORY_MAP[category];
    if (!typeParam && cat.types.length > 0) {
      typeParam = cat.types[0]; // Google only allows one type per request
    }
    combinedKeywords = [...cat.keywords];
  }
  if (keyword) {
    combinedKeywords.push(keyword);
  }
  if (typeParam) {
    url += `&type=${encodeURIComponent(typeParam)}`;
  }
  if (combinedKeywords.length > 0) {
    url += `&keyword=${encodeURIComponent(combinedKeywords.join(' '))}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Google Places API response:', JSON.stringify(data, null, 2));
    if (data.status === 'ZERO_RESULTS') {
      // No places found, but this is not an error
      return res.json([]);
    }
    if (data.error_message || data.status !== 'OK') {
      console.error('Google Places API error:', data.error_message || data.status, data);
      return res.status(500).json({ error: data.error_message || data.status, details: data });
    }
    // Add photoUrl to each place if photos are available
    const resultsWithPhotos = (data.results || []).map(place => {
      let photoUrl = null;
      if (place.photos && place.photos.length > 0 && place.photos[0].photo_reference) {
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
      }
      return { ...place, photoUrl };
    });
    res.json(resultsWithPhotos);
  } catch (err) {
    console.error('Backend fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch from Google Places API.', details: err.toString() });
  }
});

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to index.html for SPA (after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
}); 