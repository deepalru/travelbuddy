// Enhanced Gemini service with Google Maps integration

import { GoogleGenAI } from "@google/genai";
import { Place, TripPlanSuggestion, ItinerarySuggestion, UserInterest, QuickTourPlan } from '@/types';
import { GEMINI_MODEL_TEXT } from '@/constants';
import { searchPlaces, getNearbyPlaces, getPlaceDetails } from '@/services/placesService';

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Enhanced place discovery using Google Places + AI insights
export const fetchEnhancedNearbyPlaces = async (
  latitude?: number, 
  longitude?: number, 
  userInterests?: UserInterest[]
): Promise<Place[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  
  try {
    // Try to get real places from Google Places API, but fallback to Gemini if CORS fails
    let realPlaces: Place[] = [];
    
    if (latitude && longitude) {
      try {
        // Get nearby places based on user interests
        const interestQueries = userInterests?.map(interest => {
          switch (interest) {
            case UserInterest.Foodie: return 'restaurant';
            case UserInterest.History: return 'museum';
            case UserInterest.Adventure: return 'tourist_attraction';
            case UserInterest.ArtCulture: return 'art_gallery';
            case UserInterest.NatureOutdoors: return 'park';
            case UserInterest.Shopping: return 'shopping_mall';
            case UserInterest.Nightlife: return 'night_club';
            case UserInterest.RelaxationWellness: return 'spa';
            default: return 'point_of_interest';
          }
        }) || ['tourist_attraction', 'restaurant', 'park'];

        // Fetch places for each interest type
        for (const query of interestQueries.slice(0, 3)) {
          try {
            const places = await getNearbyPlaces({ lat: latitude, lng: longitude }, 5000, query);
            realPlaces.push(...places);
          } catch (placeError) {
            console.warn(`Failed to fetch ${query} places:`, placeError);
          }
        }
      } catch (placesError) {
        console.warn('Google Places API failed, falling back to Gemini only:', placesError);
      }
    }

    // If we got real places, enhance them with AI
    if (realPlaces.length > 0) {
      // Remove duplicates and limit to 6 places
      const uniquePlaces = realPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      ).slice(0, 6);

      // Enhance each place with AI-generated insights
      const enhancedPlaces = await Promise.all(
        uniquePlaces.map(async (place) => {
          try {
            const aiInsights = await generatePlaceInsights(place, userInterests);
            return {
              ...place,
              description: aiInsights.description || place.description,
              localTip: aiInsights.localTip || place.localTip,
              insiderTips: aiInsights.insiderTips || place.insiderTips,
              handyPhrase: aiInsights.handyPhrase || place.handyPhrase
            };
          } catch (error) {
            console.warn(`Failed to enhance place ${place.name}:`, error);
            return place;
          }
        })
      );

      return enhancedPlaces;
    } else {
      // Fallback to original Gemini-only approach
      console.log('Using Gemini-only place generation as fallback');
      const { fetchNearbyPlaces: originalFetchNearbyPlaces } = await import('@/services/geminiService');
      return await originalFetchNearbyPlaces(latitude, longitude, userInterests);
    }
  } catch (error) {
    console.error('Error in fetchEnhancedNearbyPlaces:', error);
    // Final fallback to original service
    const { fetchNearbyPlaces: originalFetchNearbyPlaces } = await import('@/services/geminiService');
    return await originalFetchNearbyPlaces(latitude, longitude, userInterests);
  }
};

// Generate AI insights for a specific place
const generatePlaceInsights = async (place: Place, userInterests?: UserInterest[]) => {
  const prompt = `
You are a local travel expert. Provide enhanced information for this place:

Place: ${place.name}
Type: ${place.type}
Address: ${place.address}
Rating: ${place.rating}
${userInterests ? `User Interests: ${userInterests.join(', ')}` : ''}

Generate a JSON response with:
{
  "description": "An engaging 2-3 sentence description highlighting what makes this place special",
  "localTip": "A practical local tip for visitors",
  "insiderTips": ["Tip 1", "Tip 2", "Tip 3"],
  "handyPhrase": "A useful phrase tourists might need here"
}

Make the content relevant to the user's interests if provided.
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  return JSON.parse(response.text);
};

// Enhanced trip planning with real place integration
export const generateEnhancedTripPlan = async (
  destination: string,
  duration: string,
  interests?: string,
  userLocation?: { lat: number; lng: number }
): Promise<TripPlanSuggestion> => {
  if (!apiKey) throw new Error("API key is missing.");

  try {
    // Try to search for real places, but continue even if it fails
    let placeContext = '';
    try {
      const realPlaces = await searchPlaces(`${destination} attractions restaurants`, userLocation);
      if (realPlaces.length > 0) {
        placeContext = `\nReal places available in ${destination}:\n${realPlaces.map(p => `- ${p.name} (${p.type}): ${p.address}`).join('\n')}`;
      }
    } catch (placesError) {
      console.warn('Could not fetch real places for trip planning, using AI-only approach:', placesError);
    }

    const prompt = `
You are an expert travel planner. Create a comprehensive trip plan for:

Destination: ${destination}
Duration: ${duration}
Interests: ${interests || 'General sightseeing'}
${placeContext}

Structure as JSON:
{
  "tripTitle": "Engaging trip title",
  "destination": "${destination}",
  "duration": "${duration}",
  "introduction": "Captivating introduction",
  "dailyPlans": [
    {
      "day": 1,
      "title": "Day title",
      "theme": "Day theme",
      "activities": [
        {
          "timeOfDay": "Morning/Afternoon/Evening",
          "activityTitle": "Activity name",
          "description": "Detailed description",
          "location": "Specific location name${placeContext ? ' (use real places from the list when possible)' : ''}",
          "estimatedDuration": "Duration",
          "notes": "Helpful notes"
        }
      ],
      "mealSuggestions": {
        "breakfast": "Suggestion",
        "lunch": "Suggestion", 
        "dinner": "Suggestion"
      }
    }
  ],
  "accommodationSuggestions": ["Hotel suggestions"],
  "transportationTips": ["Transport tips"],
  "budgetConsiderations": "Budget info",
  "packingTips": ["Packing suggestions"],
  "conclusion": "Trip conclusion"
}

${placeContext ? 'Prioritize using the real places provided in the activities when relevant.' : 'Use your knowledge of popular attractions and places in the destination.'}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const plan = JSON.parse(response.text);
    return { ...plan, id: `trip-${Date.now()}` };
  } catch (error) {
    console.error('Error generating enhanced trip plan:', error);
    // Fallback to original service
    const { generateComprehensiveTripPlan } = await import('@/services/geminiService');
    return await generateComprehensiveTripPlan(destination, duration, interests);
  }
};

// Smart itinerary generation with route optimization
export const generateSmartItinerary = async (
  selectedPlaces: Place[],
  userLocation?: { lat: number; lng: number }
): Promise<ItinerarySuggestion> => {
  if (!apiKey) throw new Error("API key is missing.");

  try {
    // Calculate optimal route if we have coordinates
    let optimizedOrder = selectedPlaces;
    if (userLocation && selectedPlaces.every(p => p.geometry?.location)) {
      optimizedOrder = await optimizePlaceOrder(selectedPlaces, userLocation);
    }

    const placeDetails = optimizedOrder.map(p => 
      `- ${p.name} (${p.type}) at ${p.address} - Rating: ${p.rating}/5`
    ).join('\n');

    const prompt = `
Create an optimized 1-day itinerary for these places (already ordered for efficient travel):

${placeDetails}

${userLocation ? `Starting from: ${userLocation.lat}, ${userLocation.lng}` : ''}

Generate JSON:
{
  "title": "Engaging itinerary title",
  "introduction": "Brief introduction",
  "dailyPlan": [{
    "day": 1,
    "theme": "Day theme",
    "activities": [
      {
        "placeId": "place_id_from_input",
        "placeName": "place_name",
        "activityDescription": "What to do here",
        "estimatedTime": "Time slot (e.g., 9:00 AM - 11:00 AM)",
        "notes": "Practical tips"
      }
    ]
  }],
  "conclusion": "Wrap-up",
  "travelTips": ["Practical travel tips including estimated travel times"]
}

Include realistic time estimates and consider travel time between locations.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const itinerary = JSON.parse(response.text);
    return { ...itinerary, id: `itinerary-${Date.now()}` };
  } catch (error) {
    console.error('Error generating smart itinerary:', error);
    throw error;
  }
};

// Optimize place order for efficient travel
const optimizePlaceOrder = async (places: Place[], startLocation: { lat: number; lng: number }): Promise<Place[]> => {
  // Simple nearest-neighbor algorithm for route optimization
  const unvisited = [...places];
  const optimized: Place[] = [];
  let currentLocation = startLocation;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((place, index) => {
      if (place.geometry?.location) {
        const distance = calculateDistance(
          currentLocation.lat, currentLocation.lng,
          place.geometry.location.lat, place.geometry.location.lng
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      }
    });

    const nearestPlace = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearestPlace);
    
    if (nearestPlace.geometry?.location) {
      currentLocation = {
        lat: nearestPlace.geometry.location.lat,
        lng: nearestPlace.geometry.location.lng
      };
    }
  }

  return optimized;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Enhanced quick tour with real places
export const generateEnhancedQuickTour = async (
  latitude?: number,
  longitude?: number,
  userInterests?: UserInterest[]
): Promise<QuickTourPlan> => {
  if (!apiKey) throw new Error("API key is missing.");

  try {
    // Try to get real nearby places first, but continue even if it fails
    let placeContext = '';
    if (latitude && longitude) {
      try {
        const realPlaces = await getNearbyPlaces({ lat: latitude, lng: longitude }, 2000);
        if (realPlaces.length > 0) {
          placeContext = `\nReal places nearby:\n${realPlaces.slice(0, 8).map(p => `- ${p.name} (${p.type}) at ${p.address}`).join('\n')}`;
        }
      } catch (placesError) {
        console.warn('Could not fetch real places for quick tour, using AI-only approach:', placesError);
      }
    }

    const interestContext = userInterests?.length 
      ? `User interests: ${userInterests.join(', ')}`
      : 'General sightseeing';

    const prompt = `
Create a 2-3 hour walking tour for someone at coordinates ${latitude}, ${longitude}.
${interestContext}
${placeContext}

Generate JSON:
{
  "title": "Catchy tour title",
  "estimatedCost": "Cost estimate (e.g., 'Free', '$10-20 USD')",
  "estimatedDuration": "Duration (e.g., '2.5 hours')",
  "stops": [
    {
      "placeName": "${placeContext ? 'Real place name (use from the list when possible)' : 'Place name'}",
      "description": "What to do/see here"
    }
  ],
  "placeNamesForMap": ["Place 1", "Place 2", "Place 3"]
}

${placeContext ? 'Prioritize real places from the provided list.' : 'Use your knowledge of popular places in the area.'} Include 3-4 stops that create a logical walking route.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error generating enhanced quick tour:', error);
    // Fallback to original service
    const { generateQuickTour } = await import('@/services/geminiService');
    return await generateQuickTour(latitude, longitude, userInterests);
  }
};

// AI-powered place recommendations based on user behavior
export const getPersonalizedRecommendations = async (
  userInterests: UserInterest[],
  favoritePlaces: Place[],
  userLocation?: { lat: number; lng: number }
): Promise<Place[]> => {
  if (!apiKey) throw new Error("API key is missing.");

  try {
    // Analyze user preferences
    const favoriteTypes = favoritePlaces.map(p => p.type);
    const favoriteNames = favoritePlaces.map(p => p.name);

    // Search for similar places
    let searchQueries: string[] = [];
    
    // Generate search queries based on interests and favorites
    userInterests.forEach(interest => {
      switch (interest) {
        case UserInterest.Foodie:
          searchQueries.push('restaurant', 'cafe', 'food market');
          break;
        case UserInterest.History:
          searchQueries.push('museum', 'historical site', 'monument');
          break;
        case UserInterest.Adventure:
          searchQueries.push('adventure park', 'outdoor activities', 'hiking');
          break;
        case UserInterest.ArtCulture:
          searchQueries.push('art gallery', 'cultural center', 'theater');
          break;
        case UserInterest.NatureOutdoors:
          searchQueries.push('park', 'garden', 'nature reserve');
          break;
        case UserInterest.Shopping:
          searchQueries.push('shopping center', 'market', 'boutique');
          break;
        case UserInterest.Nightlife:
          searchQueries.push('bar', 'club', 'entertainment');
          break;
        case UserInterest.RelaxationWellness:
          searchQueries.push('spa', 'wellness center', 'peaceful place');
          break;
      }
    });

    // Get real places for each query
    const allRecommendations: Place[] = [];
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const places = userLocation 
          ? await getNearbyPlaces(userLocation, 5000, query)
          : await searchPlaces(query, userLocation);
        allRecommendations.push(...places);
      } catch (error) {
        console.warn(`Failed to search for ${query}:`, error);
      }
    }

    // Remove duplicates and filter out already favorited places
    const uniqueRecommendations = allRecommendations
      .filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      )
      .filter(place => !favoriteNames.includes(place.name))
      .slice(0, 6);

    // Enhance with AI scoring
    const prompt = `
Analyze these places for a user with interests: ${userInterests.join(', ')}
User's favorite places: ${favoriteNames.join(', ')}

Places to score:
${uniqueRecommendations.map(p => `- ${p.name} (${p.type}): ${p.description}`).join('\n')}

Return JSON array of place names ordered by relevance score (highest first):
["Place Name 1", "Place Name 2", "Place Name 3"]

Consider user interests and similarity to their favorites.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const rankedNames = JSON.parse(response.text);
    
    // Reorder recommendations based on AI ranking
    const rankedRecommendations = rankedNames
      .map((name: string) => uniqueRecommendations.find(p => p.name === name))
      .filter(Boolean)
      .slice(0, 4);

    return rankedRecommendations;
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};