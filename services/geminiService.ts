

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Place, Deal, TripPlanSuggestion, PlaceSummary, SurpriseSuggestion, TripPace, TravelStyle, BudgetLevel, HospitalInfo, UserInterest, SuggestedEmergencyNumbers, EmbassyInfo, CommunityPhoto, CommunityPhotoUploadData, ItinerarySuggestion, QuickTourPlan, SupportPoint, LocalInfo } from '@/types';
import { GEMINI_MODEL_TEXT, LOCAL_STORAGE_COMMUNITY_PHOTOS_KEY } from '@/constants';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("Gemini API key is not configured. Please set the API_KEY environment variable.");
}

// Initialize GoogleGenAI directly with the apiKey from environment variable (it can be undefined if not set)
const ai = new GoogleGenAI({ apiKey });

const generatePlacesPrompt = (latitude?: number, longitude?: number, userInterests?: UserInterest[]): string => {
  let locationContext = "a diverse and vibrant area of San Francisco, California, USA, suitable for tourists.";
  if (latitude && longitude) {
    locationContext = `the area around latitude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)}.
    Focus on places within an approximate 10-kilometer (or 6-mile) radius of these coordinates.
    If possible, briefly and generally characterize this area (e.g., "a bustling city center", "a quiet residential neighborhood", "a coastal area with beaches", "a mountainous region with hiking trails") before listing the places.
    The places generated MUST be real places from this specific geographic area.`;
  }

  let interestContext = "";
  if (userInterests && userInterests.length > 0) {
    interestContext = `
    The user has expressed interest in the following areas: ${userInterests.join(', ')}.
    Please try to include places that align with these interests if relevant and available in the specified location.
    However, still provide a diverse set of 6 places even if not all perfectly match every interest.
    `;
  }

  return `
You are a helpful travel assistant. Your task is to generate a list of REAL nearby places for a travel application.
The places should be located in ${locationContext}
${interestContext}
Please provide a JSON array of EXACTLY 6 REAL places. Each place object in the array should conform to the following structure and include realistic, factual data wherever possible, especially for name, address, coordinates, and types. Use plausible data for descriptive fields if exact data is not known.

The JSON array should look like this:
[
  {
    "id": "place-random-uuid-1",
    "name": "REAL Name of Place 1 (e.g., Golden Gate Bridge)",
    "type": "REAL Primary Type (e.g., Landmark, Cafe, Museum, Park, Restaurant, Shop, Attraction, Accommodation)",
    "rating": 4.7,
    "address": "REAL Full Street Address, City, State/Region, Postal Code, Country (e.g., Golden Gate Bridge, San Francisco, CA 94129, USA)",
    "photoUrl": "https://picsum.photos/300/200?random=1",
    "description": "A concise, engaging, and REALISTIC description of the place, highlighting key features or what makes it interesting (2-3 sentences). (e.g., An iconic suspension bridge spanning the Golden Gate strait, known for its orange color and stunning views.)",
    "localTip": "A REALISTIC and useful local tip for visitors (e.g., Visit early morning to avoid crowds and catch the fog lifting.)",
    "handyPhrase": "A REALISTIC and simple common English phrase a tourist might find handy or hear locally (e.g., 'Where is the nearest restroom?', 'How's it going?'). This should be a single JSON string.",
    "insiderTips": [
      "REALISTIC Tip 1: Best photo spot is from Battery Spencer.",
      "REALISTIC Tip 2: Check the weather; it can change quickly."
    ],
    "deal": { // Can be null if no deal
      "id": "deal-random-uuid-1",
      "title": "20% Off Morning Coffee",
      "description": "Get 20% off any coffee before 10 AM on weekdays.",
      "discount": "20% Off",
      "placeName": "REAL Name of Place 1 (must match parent place name)",
      "price": { "amount": 2.00, "currencyCode": "USD" }
    },
    "examplePrice": { // Can be null
      "description": "Adult Ticket",
      "amount": 15.00,
      "currencyCode": "USD"
    },
    "place_id": "ChIJAAAAAAAAAAARg4kMD2FQUqI", // Real Google Place ID if available, otherwise a plausible unique string
    "formatted_address": "Golden Gate Bridge, San Francisco, CA 94129, USA",
    "address_components": [ // Array of objects, each object is an address component. Ensure correct JSON array of objects syntax.
      { "long_name": "Golden Gate Bridge", "short_name": "Golden Gate Bridge", "types": ["point_of_interest", "establishment"] },
      { "long_name": "San Francisco", "short_name": "SF", "types": ["locality", "political"] },
      { "long_name": "California", "short_name": "CA", "types": ["administrative_area_level_1", "political"] },
      { "long_name": "United States", "short_name": "US", "types": ["country", "political"] },
      { "long_name": "94129", "short_name": "94129", "types": ["postal_code"] }
    ],
    "types": ["landmark", "tourist_attraction", "bridge"], // Array of strings
    "geometry": {
      "location": { "lat": 37.8199, "lng": -122.4783 },
      "viewport": { "northeast": { "lat": 37.822, "lng": -122.476 }, "southwest": { "lat": 37.818, "lng": -122.480 } }
    },
    "utc_offset_minutes": -420,
    "url": "https://www.google.com/maps/place/Golden+Gate+Bridge/@37.8199286,-122.4782551,17z", // Real Google Maps URL if possible
    "formatted_phone_number": "(415) 921-5858", // Can be null
    "international_phone_number": "+1 415-921-5858", // Can be null
    "website": "https://www.goldengate.org/", // Can be null
    "opening_hours": { // Can be null
      "open_now": true,
      "periods": [ // Array of objects. Can be empty if hours unknown.
        {
          "open": { "day": 1, "time": "0900" },
          "close": { "day": 1, "time": "1700" }
        },
        {
          "open": { "day": 2, "time": "1000" },
          "close": { "day": 2, "time": "1800" }
        }
        // If always open, periods could be: [{ "open": { "day": 0, "time": "0000" } }]
      ],
      "weekday_text": [ // Array of strings
        "Monday: 9:00 AM – 5:00 PM",
        "Tuesday: 10:00 AM – 6:00 PM",
        "Wednesday: 9:00 AM – 5:00 PM",
        "Thursday: 9:00 AM – 5:00 PM",
        "Friday: 9:00 AM – 5:00 PM",
        "Saturday: 10:00 AM – 6:00 PM",
        "Sunday: Closed"
      ]
    },
    "business_status": "OPERATIONAL", // Or "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"
    "price_level": 2, // 0-4, can be null
    "user_ratings_total": 15000, // Can be null
    "reviewsArray": [ // Can be null or empty array
      {
        "author_name": "Jane Doe",
        "profile_photo_url": "https://picsum.photos/40/40?random=a",
        "rating": 5, // 1-5
        "relative_time_description": "a month ago",
        "text": "Absolutely breathtaking! A must-see in San Francisco. The views are incredible, and walking or biking across is an unforgettable experience.",
        "language": "en", // Can be null
        "time": 1672531200 // Unix timestamp, can be null
      }
    ],
    "additional_photos": [ // Can be null or empty array
      { "photo_reference": "photo_ref_1", "height": 800, "width": 1200, "url": "https://picsum.photos/300/200?random=11" },
      { "photo_reference": "photo_ref_2", "height": 900, "width": 600, "url": "https://picsum.photos/200/300?random=12" }
    ],
    "attributes": { // Can be an empty object {} or null
      "serves_lunch": false,
      "wheelchair_accessible_entrance": true,
      "outdoor_seating": false
    },
    "editorial_summary": "The Golden Gate Bridge is an iconic suspension bridge known for its distinctive orange color and Art Deco styling. It connects the city of San Francisco to Marin County." // Can be null
  }
  // ... (5 more similar objects, for a total of 6) ...
]

Ensure all fields from the example above are present for each of the 6 places,
with unique and REALISTIC data. Pay special attention to "name", "address",
"geometry.location.lat", "geometry.location.lng", "types", and "place_id".
The "id" should be a unique random string for each place (e.g., "place-xxxx-yyyy-zzzz").
For "photoUrl", you can use "https://picsum.photos/300/200?random=N" where N is a unique number for each photo.
The fields 'deal', 'examplePrice', 'opening_hours', 'reviewsArray', 'additional_photos', 'attributes', and 'editorial_summary' should be set to null or an empty value (e.g., [], {}) if no data is available.
The "rating" should be between 1.0 and 5.0.
Provide diverse types of places (e.g., not all restaurants, include parks, cafes, attractions, shops etc.).

IMPORTANT: The entire response MUST be a single, valid JSON array. Do not include any text, explanations, or conversational text before or after the JSON array.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas. Ensure all brackets and braces are correctly paired.
ONLY include the fields specified in the example structure. Do NOT add any extra fields.
`;
};


const generateItineraryPrompt = (places: Place[]): string => {
  const placeDetails = places.map(p => `- ${p.name} (Type: ${p.type}, Address: ${p.address}, Rating: ${p.rating}, Description: ${p.description}, Local Tip: ${p.localTip}) - Place ID: ${p.id}`).join('\n');
  return `
You are an expert travel planner. Create a compelling and realistic 1-day itinerary based on the following selected places:
${placeDetails}

The itinerary should be for a single day.
Structure the response as a JSON object with the following fields: "title", "introduction", "dailyPlan", and "conclusion".
"dailyPlan" should be an array containing a single object (for Day 1).
This Day 1 object should have:
  - "day": 1 (This should always be 1 for a 1-day itinerary).
  - "theme": A short, catchy theme for the day (e.g., "Historic Charm & Culinary Delights").
  - "activities": An array of activity objects. Each activity object must include:
    - "placeName": The name of the place. (Optional, can use placeId if name is redundant with activityTitle)
    - "placeId": The Place ID of the place from the input list. THIS IS CRUCIAL.
    - "activityDescription": A brief description of what to do at this place.
    - "estimatedTime": Suggested time (e.g., "9:00 AM - 11:00 AM", "2 hours").
    - "notes": Optional brief notes or tips for this activity (e.g., "Book tickets online", "Try the croissants").

The "title" should be engaging.
The "introduction" should set the stage for the day.
The "conclusion" should wrap up the day's plan.
Ensure the activities are logically sequenced.
Consider travel time implicitly by suggesting reasonable time slots.
Example of the "dailyPlan" array structure:
"dailyPlan": [
  {
    "day": 1,
    "theme": "Exploration Day in the City",
    "activities": [
      {
        "placeName": "Museum of Modern Art",
        "placeId": "place-museum-id",
        "activityDescription": "Explore contemporary art exhibits.",
        "estimatedTime": "10:00 AM - 1:00 PM",
        "notes": "Check for special exhibitions."
      },
      {
        "placeName": "Central Park Cafe",
        "placeId": "place-cafe-id",
        "activityDescription": "Enjoy a relaxing lunch by the park.",
        "estimatedTime": "1:30 PM - 2:30 PM"
      }
    ]
  }
]
Focus on creating a practical and enjoyable 1-day plan using ONLY the provided places. The placeId for each activity MUST correspond to one of the Place IDs provided in the input.
Make the itinerary sound exciting and well-thought-out.
Only include a single day in "dailyPlan" as this is for a 1-day itinerary.
The "id" for the itinerary itself will be added later, do not include "id" in the JSON you generate for the root object.

IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas. Ensure all brackets and braces are correctly paired.
`;
};

const generateComprehensiveTripPlanPrompt = (
  destination: string,
  duration: string,
  interests?: string,
  pace?: TripPace,
  travelStyles?: TravelStyle[],
  budget?: BudgetLevel
): string => {
  let prompt = `
You are an expert travel planner. Create a comprehensive and engaging multi-day trip plan.
Destination: ${destination}
Duration: ${duration}
`;
  if (interests) prompt += `\nInterests: ${interests}`;
  if (pace) prompt += `\nPace: ${pace}`;
  if (travelStyles && travelStyles.length > 0) prompt += `\nTravel Styles: ${travelStyles.join(', ')}`;
  if (budget) prompt += `\nBudget Level: ${budget}`;

  prompt += `
Please structure the response as a JSON object. The root object should have the following fields:
- "tripTitle": An exciting title for the trip (e.g., "An Adventurous Week in ${destination}").
- "destination": The destination city/region.
- "duration": The duration of the trip.
- "introduction": A captivating introduction to the trip (2-3 sentences).
- "dailyPlans": An array of objects, where each object represents a day's plan. Each daily plan object must include:
  - "day": The day number (e.g., 1, 2, 3).
  - "title": A short, descriptive title for the day (e.g., "Arrival and City Exploration", "Mountain Hike & Local Cuisine").
  - "theme": (Optional) A theme for the day (e.g., "Cultural Immersion", "Relaxation Day").
  - "activities": An array of activity objects. Each activity object must include:
    - "timeOfDay": Suggested time of day (e.g., "Morning", "Afternoon", "Evening", "Full Day", "Flexible").
    - "activityTitle": A concise title for the activity (e.g., "Visit the Grand Palace", "Street Food Tour").
    - "description": A detailed description of the activity (2-4 sentences).
    - "estimatedDuration": (Optional) Estimated time for the activity (e.g., "2-3 hours", "Half-day").
    - "location": (Optional, but highly recommended) Specific location or address if applicable.
    - "bookingLink": (Optional) A placeholder or example booking link if relevant (e.g., "https://example.com/tour-booking"). For mock purposes, use "https://example.com/mock-booking-link".
    - "notes": (Optional) Any important notes or tips for the activity.
  - "mealSuggestions": (Optional) An object with suggestions for "breakfast", "lunch", and "dinner" (e.g., "Try local pancakes at 'Pancake House'", "Street food market for lunch").
- "accommodationSuggestions": (Optional) An array of strings with general suggestions for accommodation types or areas (e.g., "Boutique hotel in the old town", "Hostel near the train station").
- "transportationTips": (Optional) An array of strings with tips for getting around (e.g., "Utilize the metro system for efficient travel", "Consider renting a scooter for coastal exploration").
- "budgetConsiderations": (Optional) A brief paragraph on general budget considerations for the trip, fitting the specified budget level.
- "packingTips": (Optional) An array of strings with relevant packing tips.
- "conclusion": A concluding paragraph to wrap up the trip plan.
- "pace": The pace of the trip (echo the input or default to Moderate).
- "travelStyles": An array of travel styles (echo the input or provide sensible defaults).
- "budgetLevel": The budget level of the trip (echo the input or default to Mid-Range).

Important Guidelines:
- Generate a plan for the number of days specified in "duration". For example, if "5 days", there should be 5 objects in "dailyPlans".
- Ensure activities within each day are logically sequenced.
- Provide REALISTIC and practical suggestions. For example, if suggesting a museum, mention its actual name.
- If specific names for restaurants or shops are not known, suggest types of places (e.g., "a traditional local restaurant", "a souvenir shop in the market").
- Make the descriptions engaging and helpful.
- For "bookingLink", if you don't have a real one, use "https://example.com/mock-booking-link" or omit.
- The "id" for the trip plan itself will be added later, do not include it in the JSON you generate.

Example for one "activity" object:
{
  "timeOfDay": "Morning",
  "activityTitle": "Explore the Old Town",
  "description": "Wander through the historic cobblestone streets of the Old Town. Discover charming medieval architecture, hidden courtyards, and local artisan shops. Don't miss the Town Square and its astronomical clock.",
  "estimatedDuration": "3-4 hours",
  "location": "Old Town, Prague",
  "notes": "Wear comfortable shoes as there's a lot of walking. Many cafes offer great coffee breaks."
}

IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas. Ensure all brackets and braces are correctly paired.
`;
  return prompt;
};

const generateSurpriseSuggestionPrompt = (): string => {
  return `
You are a creative travel assistant. Generate a single, unique, and exciting "surprise" travel suggestion.
This could be a lesser-known destination, a unique activity, a quirky festival, or a themed travel idea.
Please provide the response as a JSON object with the following fields:
- "title": An intriguing title for the surprise suggestion (e.g., "Discover the Bioluminescent Beaches of Vaadhoo Island", "Attend the Monkey Buffet Festival in Thailand").
- "description": A compelling description of the surprise (3-5 sentences), explaining what it is and why it's special.
- "photoUrl": A URL to a high-quality, relevant image. Use "https://picsum.photos/600/400?random=SURPRISE" as a placeholder if a specific image isn't available.
- "funFact": (Optional) A fun or interesting fact related to the suggestion.
- "category": A category for the suggestion (e.g., "Unique Destination", "Cultural Experience", "Adventure Travel", "Quirky Festival", "Nature Escape").

Make the suggestion sound genuinely surprising and appealing.
Example:
{
  "title": "Sleep in a Salt Hotel in Bolivia",
  "description": "Imagine a hotel where everything – walls, furniture, even beds – is made entirely of salt! Spend a night at Palacio de Sal on the edge of the Salar de Uyuni salt flats. It's a surreal experience under starlit skies.",
  "photoUrl": "https://picsum.photos/600/400?random=SURPRISE",
  "funFact": "The Salar de Uyuni is the world's largest salt flat and transforms into a giant mirror during the rainy season.",
  "category": "Unique Accommodation"
}
Provide only one such JSON object.
IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas.
`;
};

const askQuestionAboutPlacePrompt = (place: Place, question: string): string => {
  // Basic context from the place object
  const placeContext = `
    Name: ${place.name}
    Type: ${place.type}
    Address: ${place.formatted_address || place.address}
    Description: ${place.description}
    Rating: ${place.rating}
    ${place.localTip ? `Local Tip: ${place.localTip}` : ''}
    ${place.opening_hours?.weekday_text ? `Opening Hours: ${place.opening_hours.weekday_text.join(', ')}` : ''}
    ${place.website ? `Website: ${place.website}` : ''}
  `;

  return `
You are a helpful assistant for the Travel Buddy app.
A user is looking at details for a place and has a question.
Place Information:
${placeContext}

User's Question: "${question}"

Please provide a concise and helpful answer to the user's question based *only* on the provided Place Information and your general knowledge related to such places.
If the information isn't available in the provided context and isn't general knowledge you can infer, state that you don't have that specific detail.
Do not make up information. Keep the answer friendly and brief (1-3 sentences).
Do not refer to yourself as an AI or Large Language Model. Respond as if you are the Travel Buddy app's assistant.
`;
};

const fetchPlaceRecommendationsPrompt = (place: Place): string => {
  return `
You are a travel recommendation engine for the Travel Buddy app.
A user is currently viewing details for the following place:
  - Name: ${place.name}
  - Type: ${place.types ? place.types.join(', ') : place.type}
  - Location: ${place.formatted_address || place.address}
  - Description: ${place.description}

Based on this place, suggest 3 other REAL places that a user interested in "${place.name}" might also like. These recommendations should ideally be somewhat nearby or thematically similar.
Provide the response as a JSON array of 3 place summary objects. Each object must have ONLY the following fields:
- "id": A unique ID for the recommended place (e.g., "rec-place-xxxx"). It MUST be different from the input place's ID ("${place.id}"). Use real Google Place IDs if known and appropriate, otherwise generate a unique string.
- "name": The REAL name of the recommended place.
- "type": The primary REAL type of the recommended place (e.g., "Museum", "Restaurant", "Park").
- "photoUrl": A URL for a representative photo of the recommended place. Use "https://picsum.photos/300/200?random=REC_N" (where N is a unique number like 1, 2, or 3) if a specific image isn't available.
- "short_description": A very brief (1-2 sentences) REALISTIC summary explaining why this place is recommended or what it offers.

ABSOLUTELY DO NOT include any fields or data not explicitly defined above. Only include 'id', 'name', 'type', 'photoUrl', and 'short_description' for each of the 3 place summary objects. No other information, text, statistics, or any other data should be added to the objects or the array.

Example of one recommendation object:
{
  "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Sydney Opera House",
  "type": "Performing Arts Theatre",
  "photoUrl": "https://picsum.photos/300/200?random=REC_X",
  "short_description": "Iconic venue for world-class performances with stunning harbor views. A must-see architectural marvel."
}

Ensure the recommendations are distinct from the original place ("${place.name}").
Focus on providing relevant and appealing suggestions. The "id" for each recommendation MUST be unique and different from the input place's id.

IMPORTANT: The entire response MUST be a single, valid JSON array. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas. Ensure all brackets and braces are correctly paired.
`;
};

const fetchNearbyHospitalsPrompt = (latitude: number, longitude: number): string => {
  return `
You are a helpful assistant providing emergency-related information.
A user needs to find nearby hospitals (or medical clinics if hospitals are not prevalent) around latitude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)}.
Please provide a JSON array of up to 3 REAL hospitals or medical facilities in that vicinity.
Focus on facilities within an approximate 10-kilometer (or 6-mile) radius of these coordinates.
Each object in the array should have the following fields:
- "name": The REAL name of the hospital or medical facility.
- "address": The REAL full street address of the facility.
- "lat": (Optional) The REAL latitude of the facility.
- "lng": (Optional) The REAL longitude of the facility.

Example:
[
  {
    "name": "General City Hospital",
    "address": "123 Health St, Anytown, CA 90210, USA",
    "lat": 34.0522,
    "lng": -118.2437
  },
  {
    "name": "Community Medical Clinic",
    "address": "45 Main Ave, Anytown, CA 90210, USA"
  }
]
If no facilities are found, return an empty array [].
Prioritize actual hospitals. If none, clinics are acceptable. Ensure data is as REALISTIC and ACCURATE as possible.

IMPORTANT: The entire response MUST be a single, valid JSON array. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas.
`;
};

const suggestLocalEmergencyNumbersPrompt = (latitude: number, longitude: number): string => {
  return `
You are an AI assistant providing helpful, but NOT OFFICIALLY VERIFIED, information for travelers.
A user is requesting common emergency numbers for the region around latitude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)}.
Based on general knowledge of this region, suggest common emergency numbers.
Structure the response as a JSON object with the following fields:
- "police": (Optional) String for the police emergency number (e.g., "110", "911").
- "ambulance": (Optional) String for the ambulance/medical emergency number (e.g., "119", "911").
- "fire": (Optional) String for the fire department emergency number (e.g., "119", "911").
- "general": (Optional) String for a general emergency number if one covers multiple services (e.g., "112" in Europe, "999" in UK).
- "notes": (Optional) Brief notes about the numbers, e.g., "112 is a general emergency number in many European countries."
- "disclaimer": A MANDATORY disclaimer string. It MUST be: "DISCLAIMER: These numbers are AI-generated suggestions based on the general region and MUST be verified from official local sources before use in an actual emergency. Relying solely on these numbers without verification could be dangerous."

Example:
{
  "police": "110",
  "ambulance": "119",
  "fire": "119",
  "general": "112 (for many European countries in this region)",
  "notes": "Confirm specific local variations if outside a major city.",
  "disclaimer": "DISCLAIMER: These numbers are AI-generated suggestions based on the general region and MUST be verified from official local sources before use in an actual emergency. Relying solely on these numbers without verification could be dangerous."
}

If you cannot confidently determine specific numbers for police/ambulance/fire, you may omit them or provide a general number if known. The disclaimer is ALWAYS required.
The primary goal is to provide a helpful starting point, emphasizing user verification.

IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas.
`;
};

const fetchNearbyEmbassiesPrompt = (latitude: number, longitude: number, nationality?: string): string => {
  const userNationality = nationality || "US Citizen"; // Default for mock purposes
  return `
You are an AI assistant providing helpful, but NOT OFFICIALLY VERIFIED, information for travelers.
A user identifying as a '${userNationality}' is requesting a list of their nearby embassies or consulates, based on their current location around latitude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)}.
Provide a JSON array of up to 2 REALISTIC embassy or consulate locations for the specified nationality.
Each object in the array should have the following fields:
- "id": A unique string ID for the embassy suggestion (e.g., "embassy-uuid-1").
- "name": The REAL name of the embassy or consulate (e.g., "Embassy of [Country of Nationality] in [City, Host Country]").
- "address": The REAL full street address of the embassy/consulate.
- "phone": (Optional) A mock or placeholder phone number (e.g., "+123 456 7890 (Mock)").
- "website": (Optional) A mock or placeholder website URL (e.g., "https://mockembassy.example.com").
- "notes": (Optional) Brief notes, e.g., "Consular services available by appointment."

Example for a US Citizen in Paris:
[
  {
    "id": "embassy-uuid-1",
    "name": "Embassy of the United States in Paris, France",
    "address": "2 Avenue Gabriel, 75008 Paris, France",
    "phone": "+33 1 43 12 22 22 (Mock)",
    "website": "https://fr.usembassy.gov (Mock)",
    "notes": "Nearest major US diplomatic mission."
  }
]

If no specific embassy for the nationality can be realistically placed in the vicinity, or if the nationality is very generic, you can return an empty array [].
CRITICAL: Include a disclaimer as the 'notes' field in AT LEAST ONE of the embassy objects (or as a general note if the array is empty) stating: "This information is AI-generated and MUST be verified with official government sources."
Focus on providing plausible information for demonstration.

IMPORTANT: The entire response MUST be a single, valid JSON array. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules, like using double quotes for keys and strings, and avoiding trailing commas.
`;
};

const generateQuickTourPrompt = (latitude?: number, longitude?: number, userInterests?: UserInterest[]): string => {
    let locationContext = "a diverse and vibrant area of San Francisco, California, USA.";
    if (latitude && longitude) {
        locationContext = `the area around latitude ${latitude.toFixed(4)} and longitude ${longitude.toFixed(4)}.`;
    }

    const timeOfDay = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let interestContext = "The user is open to any suggestions.";
    if (userInterests && userInterests.length > 0) {
        interestContext = `The user has expressed interest in the following: ${userInterests.join(', ')}. Please try to include places that align with these interests.`;
    }

    return `
You are an expert local guide. A traveler has just arrived in ${locationContext} It is currently ${timeOfDay}. ${interestContext}
Your task is to create a short, efficient walking tour for them that lasts about 2-3 hours. The tour should include 3-4 interesting and authentic stops that are open and suitable for the current time of day.

Please provide a response as a single, valid JSON object with the following structure:
{
  "title": "A short, catchy title for the tour (e.g., 'An Afternoon Stroll in the Mission District')",
  "estimatedCost": "A realistic estimated cost for one person (e.g., 'Free', '$10-20 USD for coffee', 'Approx. $50 USD for entry fees')",
  "estimatedDuration": "A realistic total duration (e.g., 'Approx. 2 hours', '2.5 - 3 hours')",
  "stops": [
    {
      "placeName": "REAL Name of Stop 1 (e.g., 'Dolores Park')",
      "description": "A brief, engaging description of what to do or see here (e.g., 'Start here to soak in the local vibe and enjoy city views.')"
    },
    {
      "placeName": "REAL Name of Stop 2 (e.g., 'Tartine Bakery')",
      "description": "A brief, engaging description (e.g., 'Walk a few blocks to grab a famous pastry and coffee.')"
    },
    {
      "placeName": "REAL Name of Stop 3 (e.g., 'Clarion Alley Mural Project')",
      "description": "A brief, engaging description (e.g., 'Discover vibrant street art in this iconic alley.')"
    }
  ],
  "placeNamesForMap": [
    "REAL Name of Stop 1 (e.g., 'Dolores Park')",
    "REAL Name of Stop 2 (e.g., 'Tartine Bakery')",
    "REAL Name of Stop 3 (e.g., 'Clarion Alley Mural Project')"
  ]
}

IMPORTANT RULES:
1. The places must be REAL and located near the specified coordinates.
2. The "placeNamesForMap" array MUST contain the exact, queryable names of the places for use in a mapping API. It should be an array of strings.
3. The number of stops should be between 3 and 4.

IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON.
Strictly adhere to JSON formatting rules (e.g., no trailing commas, double quotes for keys and strings).
`;
};

// --- NEW PROMPTS FOR LOCATION-BASED HOMEPAGE ---

const reverseGeocodePrompt = (latitude: number, longitude: number): string => `
  You are a geocoding service. Based on the coordinates latitude=${latitude} and longitude=${longitude},
  provide the simple city name and country.
  Respond with ONLY a valid JSON object in the format:
  {
    "city": "City Name",
    "country": "Country Name"
  }
  Do not add any explanations or other text.
`;

const fetchSupportLocationsPrompt = (latitude: number, longitude: number): string => `
  You are a travel support database. For the location around latitude ${latitude}, longitude ${longitude},
  find up to 2 real public locations for each of the following support types: 'hospital', 'police' station.
  Also, find 1 'embassy' for a United States citizen.
  Provide the response as a JSON array of support points. Each object must conform to the following structure:
  {
    "id": "A unique string ID, e.g., 'support-xxxx'",
    "name": "The REAL name of the location",
    "type": "The type, which MUST be one of: 'hospital', 'police', 'embassy'",
    "address": "The REAL full street address",
    "geometry": {
      "location": {
        "lat": REAL_LATITUDE,
        "lng": REAL_LONGITUDE
      }
    }
  }
  If you cannot find a location for a type, do not include it. Aim for a total of 3-5 locations.
  IMPORTANT: The entire response MUST be a single, valid JSON array. Do not include any text, explanations, or conversational text before or after the JSON. Strictly adhere to JSON formatting rules.
`;

const fetchLocalInfoPrompt = (latitude: number, longitude: number): string => `
  You are a local travel advisor AI. For the location around latitude ${latitude}, longitude ${longitude}, provide a JSON object with local information.
  The response must be a single JSON object with this exact structure:
  {
    "weather": "A string describing current weather, e.g., '24°C, Sunny'",
    "localTime": "A string for the local time with timezone, e.g., '14:30 (GMT+2)'",
    "currencyInfo": "A string with local currency info, e.g., 'Local Currency: Thai Baht (THB)'",
    "alerts": [
      {
        "title": "A short alert title",
        "description": "A brief description of the alert or tip.",
        "severity": "A severity level, which MUST be one of 'low', 'medium', or 'high'"
      }
    ]
  }
  The 'alerts' array should contain 2-3 current, relevant travel advisories (e.g., transport strikes, common scams, weather warnings).
  If there are no major alerts, provide 2-3 low-severity tips (e.g., 'Tipping is not customary', 'Stay hydrated').
  IMPORTANT: The entire response MUST be a single, valid JSON object. Do not include any text, explanations, or conversational text before or after the JSON. Strictly adhere to JSON formatting rules.
`;

// Helper function to process Gemini response
const processResponse = <T>(response: GenerateContentResponse, promptType: string): T => {
  const rawText = response.text;
  if (!rawText) {
    console.error(`Gemini API Error for ${promptType}: No text in response. Full response:`, response);
    throw new Error(`Failed to get a valid response from AI for ${promptType}. The response was empty.`);
  }

  let jsonStr = rawText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error(`Error parsing JSON for ${promptType}:`, e);
    console.error(`Original AI response text for ${promptType} (after fence removal attempt):`, jsonStr);
    console.error(`Full AI response object for ${promptType}:`, response);
    
    let errorMessage = `Failed to parse AI's response for ${promptType}.`;
    if (e instanceof SyntaxError) {
      errorMessage += ` Details: ${e.message}.`;
      // Try to find the problematic part if possible (very basic)
      const positionMatch = e.message.match(/position (\d+)/);
      if (positionMatch && positionMatch[1]) {
        const errorPos = parseInt(positionMatch[1], 10);
        const contextChars = 20;
        const start = Math.max(0, errorPos - contextChars);
        const end = Math.min(jsonStr.length, errorPos + contextChars);
        const errorContext = jsonStr.substring(start, end);
        errorMessage += ` Near: "...${errorContext}..."`;
      }
    }
    throw new Error(errorMessage);
  }
};

// Generic error handler for API calls
const handleApiError = (error: any, functionName: string): Error => {
  console.error(`Error in ${functionName} from Gemini API:`, error);
  let UIMessage = `Error in ${functionName}: Unknown error.`;

  if (typeof error === 'object' && error !== null) {
    const nestedError = (error as any).error;
    if (typeof nestedError === 'object' && nestedError !== null && 'code' in nestedError && 'message' in nestedError) {
      const code = nestedError.code;
      const message = nestedError.message;
      
      if (code === 429 || String(message).toLowerCase().includes("quota") || String(message).toLowerCase().includes("resource_exhausted")) {
        UIMessage = "The AI service is currently experiencing high demand or the quota has been exceeded. Please try again in a few minutes.";
      } else if (String(message).toLowerCase().includes("api key not valid")) {
        UIMessage = `Failed to call ${functionName}: Invalid API Key. Please check your configuration.`;
      } else {
        UIMessage = `API Error in ${functionName} (${code}): ${message}`;
      }
    } else if ('message' in (error as any)) { // Simpler error object with just a message
      UIMessage = (error as any).message;
       if (UIMessage.toLowerCase().includes("api key not valid")) {
           UIMessage = `Failed to call ${functionName}: Invalid API Key. Please check your configuration.`;
       } else if (UIMessage.includes("429") || UIMessage.toLowerCase().includes("quota") || UIMessage.toLowerCase().includes("resource_exhausted")) {
           UIMessage = "The AI service is currently experiencing high demand or the quota has been exceeded. Please try again in a few minutes.";
       }
    }
  } else if (typeof error === 'string') {
    UIMessage = error;
  }
  
  return new Error(UIMessage);
};

// --- Exported API-calling Functions ---

export const fetchNearbyPlaces = async (latitude?: number, longitude?: number, userInterests?: UserInterest[]): Promise<Place[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = generatePlacesPrompt(latitude, longitude, userInterests);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<Place[]>(response, 'fetchNearbyPlaces');
  } catch (error) {
    throw handleApiError(error, 'fetchNearbyPlaces');
  }
};

export const generateItinerary = async (places: Place[]): Promise<ItinerarySuggestion> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = generateItineraryPrompt(places);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const itinerary = processResponse<Omit<ItinerarySuggestion, 'id'>>(response, 'generateItinerary');
    return { ...itinerary, id: `itinerary-${Date.now()}` }; // Add a unique ID
  } catch (error) {
    throw handleApiError(error, 'generateItinerary');
  }
};

export const generateComprehensiveTripPlan = async (
  destination: string,
  duration: string,
  interests?: string,
  pace?: TripPace,
  travelStyles?: TravelStyle[],
  budget?: BudgetLevel
): Promise<TripPlanSuggestion> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = generateComprehensiveTripPlanPrompt(destination, duration, interests, pace, travelStyles, budget);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const plan = processResponse<Omit<TripPlanSuggestion, 'id'>>(response, 'generateComprehensiveTripPlan');
    return { ...plan, id: `trip-${Date.now()}` }; // Add a unique ID
  } catch (error) {
    throw handleApiError(error, 'generateComprehensiveTripPlan');
  }
};

export const generateSurpriseSuggestion = async (): Promise<SurpriseSuggestion> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = generateSurpriseSuggestionPrompt();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<SurpriseSuggestion>(response, 'generateSurpriseSuggestion');
  } catch (error) {
    throw handleApiError(error, 'generateSurpriseSuggestion');
  }
};

export const askQuestionAboutPlace = async (place: Place, question: string): Promise<string> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = askQuestionAboutPlacePrompt(place, question);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text; // Returns plain text
  } catch (error) {
    throw handleApiError(error, 'askQuestionAboutPlace');
  }
};

export const fetchPlaceRecommendations = async (place: Place): Promise<PlaceSummary[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = fetchPlaceRecommendationsPrompt(place);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<PlaceSummary[]>(response, 'fetchPlaceRecommendations');
  } catch (error) {
    throw handleApiError(error, 'fetchPlaceRecommendations');
  }
};

export const fetchNearbyHospitals = async (latitude: number, longitude: number): Promise<HospitalInfo[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = fetchNearbyHospitalsPrompt(latitude, longitude);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<HospitalInfo[]>(response, 'fetchNearbyHospitals');
  } catch (error) {
    throw handleApiError(error, 'fetchNearbyHospitals');
  }
};

export const suggestLocalEmergencyNumbers = async (latitude: number, longitude: number): Promise<SuggestedEmergencyNumbers> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = suggestLocalEmergencyNumbersPrompt(latitude, longitude);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<SuggestedEmergencyNumbers>(response, 'suggestLocalEmergencyNumbers');
  } catch (error) {
    throw handleApiError(error, 'suggestLocalEmergencyNumbers');
  }
};

export const fetchNearbyEmbassies = async (latitude: number, longitude: number, nationality: string): Promise<EmbassyInfo[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = fetchNearbyEmbassiesPrompt(latitude, longitude, nationality);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<EmbassyInfo[]>(response, 'fetchNearbyEmbassies');
  } catch (error) {
    throw handleApiError(error, 'fetchNearbyEmbassies');
  }
};

export const generateQuickTour = async (latitude?: number, longitude?: number, userInterests?: UserInterest[]): Promise<QuickTourPlan> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = generateQuickTourPrompt(latitude, longitude, userInterests);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    return processResponse<QuickTourPlan>(response, 'generateQuickTour');
  } catch (error) {
    throw handleApiError(error, 'generateQuickTour');
  }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<{city: string; country: string}> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = reverseGeocodePrompt(latitude, longitude);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return processResponse<{city: string; country: string}>(response, 'reverseGeocode');
  } catch (error) {
    throw handleApiError(error, 'reverseGeocode');
  }
};

export const fetchSupportLocations = async (latitude: number, longitude: number): Promise<SupportPoint[]> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = fetchSupportLocationsPrompt(latitude, longitude);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return processResponse<SupportPoint[]>(response, 'fetchSupportLocations');
  } catch (error) {
    throw handleApiError(error, 'fetchSupportLocations');
  }
};

export const fetchLocalInfo = async (latitude: number, longitude: number): Promise<LocalInfo> => {
  if (!apiKey) throw new Error("API key is missing.");
  try {
    const prompt = fetchLocalInfoPrompt(latitude, longitude);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return processResponse<LocalInfo>(response, 'fetchLocalInfo');
  } catch (error) {
    throw handleApiError(error, 'fetchLocalInfo');
  }
};


// --- Mock Community Photo Functions ---

export const fetchCommunityPhotos = async (): Promise<CommunityPhoto[]> => {
  console.log("Fetching community photos (mock)...");
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  const storedPhotos = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_PHOTOS_KEY);
  if (storedPhotos) {
      try {
          const photos = JSON.parse(storedPhotos);
          if (Array.isArray(photos)) return photos;
      } catch(e) { console.error("Could not parse stored photos", e); }
  }
  // If nothing stored or parse fails, use some default mock data
  return [
    { id: 'comm-photo-1', imageUrl: 'https://picsum.photos/seed/p1/600/400', caption: 'Beautiful sunset over the bay!', uploaderName: 'TravelerJane', likes: 125, uploadedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'comm-photo-2', imageUrl: 'https://picsum.photos/seed/p2/600/400', caption: 'Found this hidden waterfall today.', uploaderName: 'AdventurerAlex', likes: 230, uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'comm-photo-3', imageUrl: 'https://picsum.photos/seed/p3/600/400', caption: 'Amazing street food tour.', uploaderName: 'FoodieFrank', likes: 88, uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];
};


export const uploadCommunityPhoto = async (data: CommunityPhotoUploadData, uploaderName: string): Promise<CommunityPhoto> => {
    console.log("Uploading community photo (mock)...", data);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate upload delay

    if (data.caption && data.caption.toLowerCase().includes('fail')) {
        throw new Error("Mock upload failure: Caption contains 'fail'.");
    }

    const newPhoto: CommunityPhoto = {
        id: `comm-photo-${Date.now()}`,
        imageUrl: data.imageDataUrl, // In a real app, this would be a URL from a storage service
        caption: data.caption,
        uploaderName: uploaderName,
        likes: 0,
        uploadedAt: new Date().toISOString(),
        placeId: data.placeId,
    };
    
    // Simulate saving to localStorage
    const storedPhotos = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_PHOTOS_KEY);
    let photos: CommunityPhoto[] = [];
    if (storedPhotos) {
        try {
            photos = JSON.parse(storedPhotos);
        } catch(e) { /* ignore */ }
    }
    const updatedPhotos = [newPhoto, ...photos];
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_PHOTOS_KEY, JSON.stringify(updatedPhotos));

    return newPhoto;
};