export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Location;
  southwest: Location;
}

export interface Geometry {
  location: Location;
  viewport?: Viewport;
}

export interface OpeningHoursTime {
  day: number; // 0-6 (Sunday-Saturday)
  time: string; // "HHMM" e.g., "1700" for 5 PM
}

export interface OpeningHoursPeriod {
  open: OpeningHoursTime;
  close?: OpeningHoursTime; // May not be present if open 24 hours
}

export interface OpeningHours {
  open_now?: boolean;
  periods?: OpeningHoursPeriod[];
  weekday_text?: string[]; // e.g., "Monday: 9:00 AM – 5:00 PM"
}

export interface Review {
  author_name: string;
  profile_photo_url?: string; // URL to an avatar
  rating: number; // 1-5
  relative_time_description: string; // e.g., "a month ago", "2 days ago"
  text: string;
  language?: string;
  time?: number; // Unix timestamp
}

export interface Photo {
  photo_reference: string; // This would be an ID for a real API
  height: number;
  width: number;
  html_attributions?: string[];
  // For our mock, we will use a direct URL.
  url: string; // Direct image URL for mock purposes
}

export interface PlaceAttributes {
  serves_beer?: boolean;
  serves_wine?: boolean;
  serves_breakfast?: boolean;
  serves_lunch?: boolean;
  serves_dinner?: boolean;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  curbside_pickup?: boolean;
  wheelchair_accessible_entrance?: boolean;
  reservable?: boolean;
  outdoor_seating?: boolean;
  live_music?: boolean;
  // Allow for other dynamic attributes
  [key: string]: boolean | string | number | undefined;
}

export interface PriceInfo {
  amount: number;
  currencyCode: string; // e.g., "USD"
}

export interface UserReview {
  id: string;
  placeId: string;
  userId: string; // From CurrentUser.username or a more robust ID if available
  username: string;
  rating: number; // 1-5
  text: string;
  timestamp: string; // ISO date string
}

export interface Place {
  id: string; 
  name: string;
  type: string; 
  rating: number; 
  address: string; 
  photoUrl: string; 
  description: string; 
  localTip: string; 
  handyPhrase: string; 
  insiderTips?: string[];
  deal?: Deal;
  examplePrice?: { // e.g., average meal cost, ticket price
    description: string; // "Average Meal", "Museum Ticket"
    amount: number;
    currencyCode: string; // e.g., "USD"
  };

  place_id?: string; 
  
  formatted_address?: string; 
  address_components?: AddressComponent[]; 
  
  types?: string[]; 

  geometry?: Geometry; 
  utc_offset_minutes?: number; 
  url?: string; 

  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;

  opening_hours?: OpeningHours; 
  business_status?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  price_level?: number; 

  user_ratings_total?: number; 
  reviewsArray?: Review[]; 
  
  additional_photos?: Photo[]; 

  attributes?: PlaceAttributes; 
  editorial_summary?: string; 

  // User Reviews
  userReviews?: UserReview[];
  averageUserRating?: number;
  totalUserReviews?: number;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  discount: string;
  placeName: string;
  price?: PriceInfo; // Price of the deal itself, if it's a fixed price offer
  isPremium?: boolean; // Added to denote premium deals
}

// --- Types for Itinerary Generation ---
export interface ItinerarySuggestion {
  id?: string; // Unique ID for the itinerary
  title: string;
  introduction: string;
  dailyPlan: Array<{ // For 1-day itinerary, this will have one element
    day?: number; 
    theme?: string; 
    activities: Array<{
      placeName?: string; // Name of the place (can be derived from placeId if not directly provided)
      placeId?: string; // Crucial: ID of the Place object used
      activityDescription: string; 
      estimatedTime?: string; // e.g., "9:00 AM - 11:00 AM" or "2 hours"
      notes?: string; // Optional notes or tips
    }>;
  }>;
  conclusion: string;
  travelTips?: string[]; // General travel tips for the day
}


// --- New Types for Enhanced Features ---

export enum TripPace {
  Relaxed = "Relaxed",
  Moderate = "Moderate",
  FastPaced = "Fast-paced"
}

export enum TravelStyle {
  Adventure = "Adventure",
  Cultural = "Cultural Immersion",
  FamilyFriendly = "Family-Friendly",
  RomanticGetaway = "Romantic Getaway",
  Luxury = "Luxury & Relaxation",
  BudgetExplorer = "Budget Explorer",
  Foodie = "Foodie Focus",
  NatureLover = "Nature Lover"
}

export enum BudgetLevel {
  BudgetFriendly = "Budget-Friendly",
  MidRange = "Mid-Range",
  Luxury = "Luxury"
}

export interface PlaceSummary {
  id: string; // Should be a unique ID, ideally matching an existing place if applicable
  name: string;
  type: string;
  photoUrl: string; // A representative photo
  short_description: string; // A very brief summary
}

export interface SurpriseSuggestion {
  title: string;
  description: string;
  photoUrl: string; // URL for an image representing the surprise
  funFact?: string;
  category?: string; // e.g., "Unique Destination", "Themed Activity"
}


// Interfaces for AI Trip Planner (existing, may need slight adjustments if new fields influence it)
export interface ActivityDetail {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Full Day' | 'Flexible';
  activityTitle: string;
  description: string;
  estimatedDuration?: string;
  location?: string;
  bookingLink?: string;
  notes?: string;
}

export interface DailyTripPlan {
  day: number;
  title: string;
  theme?: string;
  activities: ActivityDetail[];
  mealSuggestions?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export interface TripPlanSuggestion {
  id: string; // Ensure ID is always present
  tripTitle: string;
  destination: string;
  duration: string;
  introduction: string;
  dailyPlans: DailyTripPlan[];
  accommodationSuggestions?: string[];
  transportationTips?: string[];
  budgetConsiderations?: string;
  packingTips?: string[];
  conclusion: string;
  // New fields for customization context if we want to store them with the plan
  pace?: TripPace;
  travelStyles?: TravelStyle[];
  budgetLevel?: BudgetLevel;
}

// --- Type for Quick Tour ---
export interface QuickTourStop {
    placeName: string;
    description: string; // e.g., "Start here for amazing views"
}

export interface QuickTourPlan {
    title: string;
    estimatedCost: string; // e.g., "$10-20 USD", "Free"
    estimatedDuration: string; // e.g., "Approx. 2.5 hours"
    stops: QuickTourStop[];
    placeNamesForMap: string[]; // For generating Google Maps link
}

// --- Types for SOS Feature ---
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // Assuming phone as string for flexibility e.g., with country codes
}

export interface HospitalInfo {
  name: string;
  address: string;
  lat?: number; // Optional, for future map integration
  lng?: number; // Optional, for future map integration
}

export interface SuggestedEmergencyNumbers {
  police?: string;
  ambulance?: string;
  fire?: string;
  general?: string; // For places with a single emergency number like 112
  notes?: string; // Any disclaimers or additional info from AI
  disclaimer: string; // Mandatory disclaimer
}

export interface EmbassyInfo {
  id: string; // Unique ID for the embassy suggestion
  name: string;
  address: string;
  phone?: string; // Mock phone number
  website?: string; // Mock website
  notes?: string;
}

// --- New Types for Location-based Homepage ---
export type SupportPointType = 'hospital' | 'embassy' | 'police';

export interface SupportPoint {
  id: string;
  name: string;
  type: SupportPointType;
  address: string;
  geometry: Geometry;
}

export interface LocalInfoAlert {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
}

export interface LocalInfo {
    weather: string;
    localTime: string;
    currencyInfo?: string;
    alerts: LocalInfoAlert[];
}


// User type used in App.tsx
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'canceled';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro';

export enum UserInterest {
  Adventure = "Adventure",
  History = "History",
  Foodie = "Foodie",
  ArtCulture = "Art & Culture",
  NatureOutdoors = "Nature & Outdoors",
  Shopping = "Shopping",
  Nightlife = "Nightlife",
  RelaxationWellness = "Relaxation & Wellness",
}

export interface CurrentUser {
  username: string;
  email?: string;
  isAdmin?: boolean; 
  subscriptionStatus: SubscriptionStatus;
  tier: SubscriptionTier; 
  trialEndDate?: string; 
  subscriptionEndDate?: string; 
  homeCurrency: string; 
  language: string; 
  selectedInterests?: UserInterest[]; // Array of selected interests
}

export interface ExchangeRates {
    [key: string]: number;
}

export interface ExchangeRatesResponse {
    result: string;
    base_code: string;
    rates: ExchangeRates;
    time_last_update_unix: number;
}

// Types for Community Photo Gallery
export interface CommunityPhoto {
  id: string;
  imageUrl: string;
  caption?: string;
  uploaderName: string; // Mock username for now
  userId?: string; // Optional: ID of the user who uploaded
  likes: number;
  uploadedAt: string; // ISO date string
  placeId?: string; // Optional: To link photo to a specific place
}

export interface CommunityPhotoUploadData {
  imageDataUrl: string; // Base64 data URL of the image
  caption?: string;
  placeId?: string; // Optional
}

// --- Community Feature Types ---
export interface CommunityPost {
  id: string;
  type: 'text' | 'tripPlan';
  userId: string; // Username of the post creator
  username: string; // Display name of the post creator
  timestamp: string; // ISO date string
  content?: string; // For text posts
  tripPlanId?: string; // For shared trip plans, links to TripPlanSuggestion.id
  tripPlanSummary?: { // For quick display on the card
    title: string;
    destination: string;
    duration: string;
  };
  likes: number;
  likedBy: string[]; // Array of user IDs (usernames) who liked the post
  // New fields for richer posts
  imageUrls?: string[]; // Array of image URLs (base64 for mock)
  attachedPlaceIds?: string[]; // Array of Place IDs
  attachedDealIds?: string[]; // Array of Deal IDs
}

export interface CommunityComment { // Basic structure for future
  id: string;
  postId: string;
  userId: string;
  username: string;
  timestamp: string;
  text: string;
  likes: number;
  likedBy: string[];
}


// App view types
export type ActiveTab = 'forYou' | 'placeExplorer' | 'deals' | 'nearbyItinerary' | 'aiTripPlanner' | 'community';
export type PortalView = 'userApp' | 'adminPortal';
export type PlaceExplorerView = 'grid' | 'map';

// Stub for Google Maps types to fix compilation errors
declare global {
  namespace google.maps {
      export type Map = any;
      export type MapTypeStyle = any;
      export type InfoWindow = any;
      export type LatLngBounds = any;
      export type Size = any;
      export type LatLng = any;
      export type LatLngLiteral = any;
      export type MapOptions = any;
      export type Padding = any;
      export type LatLngBoundsLiteral = any;
      namespace marker {
          export type AdvancedMarkerElement = any;
      }
  }
}

// Ensure this file is treated as a module, even if only declarations are present.
export {};