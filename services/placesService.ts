// Enhanced Places service using Google Places API

import { Place } from '@/types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Function to get place details using Google Places API
export const getPlaceDetails = async (placeId: string): Promise<Partial<Place> | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not available');
    return null;
  }

  try {
    const response = await fetch(
      `/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,rating,reviews,opening_hours,formatted_phone_number,website,types,price_level&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.result) {
      console.warn('Places API returned no results or error:', data.status);
      return null;
    }

    const place = data.result;
    
    return {
      name: place.name,
      formatted_address: place.formatted_address,
      geometry: place.geometry,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      opening_hours: place.opening_hours,
      formatted_phone_number: place.formatted_phone_number,
      website: place.website,
      types: place.types,
      price_level: place.price_level,
      reviewsArray: place.reviews?.slice(0, 3).map((review: any) => ({
        author_name: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relative_time_description: review.relative_time_description
      })),
      photoUrl: place.photos?.[0] 
        ? `/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

// Function to search for places using Google Places API
export const searchPlaces = async (
  query: string, 
  location?: { lat: number; lng: number },
  radius: number = 5000
): Promise<Place[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not available, falling back to mock data');
    return [];
  }

  try {
    let url = `/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      console.warn('Places search returned no results:', data.status);
      return [];
    }

    return data.results.slice(0, 6).map((place: any, index: number) => ({
      id: place.place_id || `place-${Date.now()}-${index}`,
      name: place.name,
      type: place.types?.[0]?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Place',
      rating: place.rating || 4.0,
      address: place.formatted_address || 'Address not available',
      photoUrl: place.photos?.[0] 
        ? `/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : `https://picsum.photos/400/300?random=${index + 100}`,
      description: `Discover ${place.name}, a popular ${place.types?.[0]?.replace(/_/g, ' ') || 'destination'} in the area.`,
      localTip: 'Check opening hours before visiting.',
      handyPhrase: 'Excuse me, where is this located?',
      place_id: place.place_id,
      formatted_address: place.formatted_address,
      geometry: place.geometry,
      types: place.types,
      price_level: place.price_level,
      user_ratings_total: place.user_ratings_total,
      business_status: place.business_status
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

// Function to get nearby places using Google Places API
export const getNearbyPlaces = async (
  location: { lat: number; lng: number },
  radius: number = 5000,
  type?: string
): Promise<Place[]> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not available');
    return [];
  }

  try {
    let url = `/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      console.warn('Nearby search returned no results:', data.status);
      return [];
    }

    return data.results.slice(0, 6).map((place: any, index: number) => ({
      id: place.place_id || `place-${Date.now()}-${index}`,
      name: place.name,
      type: place.types?.[0]?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Place',
      rating: place.rating || 4.0,
      address: place.vicinity || place.formatted_address || 'Address not available',
      photoUrl: place.photos?.[0] 
        ? `/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : `https://picsum.photos/400/300?random=${index + 200}`,
      description: `Experience ${place.name}, a highly-rated ${place.types?.[0]?.replace(/_/g, ' ') || 'location'}.`,
      localTip: place.opening_hours?.open_now ? 'Currently open!' : 'Check opening hours.',
      handyPhrase: 'How do I get there?',
      place_id: place.place_id,
      formatted_address: place.formatted_address,
      geometry: place.geometry,
      types: place.types,
      price_level: place.price_level,
      user_ratings_total: place.user_ratings_total,
      business_status: place.business_status,
      opening_hours: place.opening_hours
    }));
  } catch (error) {
    console.error('Error getting nearby places:', error);
    return [];
  }
};