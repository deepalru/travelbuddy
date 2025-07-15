

export const Colors = {
  // --- Skyline Professional Theme ---
  // Primary Colors
  primary: '#00AEEF',           // Sky Blue
  primaryDark: '#003366',        // Midnight Blue
  primaryGradientEnd: '#003366', // Kept for compatibility, now Midnight Blue.
  primarySlightlyDark: '#0088CC', // A slightly darker blue for subtle gradients

  // Secondary / Accent Colors
  accentHighlight: '#FF6F3C',    // Sunset Orange
  accentSuccess: '#58B368',       // Leaf Green
  accentInfo: '#00BFA6',         // Teal
  accentSoft: '#C3B1E1',        // Lavender
  
  // Backgrounds
  background: '#F5F5F5',       // Light Gray
  sidebar: '#FFFFFF',          // Clean white sidebar
  cardBackground: '#FFFFFF',   // Pure White for cards & modals
  inputBackground: '#F0F9FF',   // Very light sky blue (adjusted for subtlety)

  // Text
  text: '#333333',             // Charcoal
  text_primary: '#003366',     // Midnight Blue for text
  text_secondary: '#999999',   // Medium Gray
  textOnDark: '#FFFFFF',       // White
  textOnDark_secondary: '#EAEAEA',

  // Status & System Colors (remapping for clarity)
  accentError: '#FF6F3C',       // Sunset Orange for errors/alerts
  accentWarning: '#FF6F3C',     // Sunset Orange for warnings
  gold: '#ffc107',              // Gold for premium badges (kept yellow)

  // Borders & Dividers
  cardBorder: '#EEEEEE',       // Lighter Medium Gray border
  
  // Shadows (Neutral gray shadows)
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  boxShadowSoft: '0 2px 8px rgba(0, 0, 0, 0.07)',
  boxShadowButton: '0 4px 8px -2px rgba(0, 174, 239, 0.4), 0 2px 4px -2px rgba(0, 174, 239, 0.3)', // Shadow for Sky Blue buttons
  boxShadowHeader: '0 2px 8px rgba(0, 0, 0, 0.07)',
  
  // Deprecated direct color names - Remapped for compatibility
  highlight: '#00AEEF', // Sky Blue
  secondary: '#58B368', // Leaf Green
  lock: '#999999',     // Medium Gray
};


// API related constants
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash';

// localStorage keys
export const LOCAL_STORAGE_FAVORITE_PLACES_KEY = 'travelBuddyFavoritePlaceIds';
export const LOCAL_STORAGE_SAVED_TRIP_PLANS_KEY = 'travelBuddySavedTripPlans';
export const LOCAL_STORAGE_SAVED_ONE_DAY_ITINERARIES_KEY = 'travelBuddySavedOneDayItineraries';
export const LOCAL_STORAGE_EMERGENCY_CONTACTS_KEY = 'travelBuddyEmergencyContacts';
export const LOCAL_STORAGE_CURRENT_USER_KEY = 'travelBuddyCurrentUser';
export const LOCAL_STORAGE_COMMUNITY_PHOTOS_KEY = 'travelBuddyCommunityPhotos';
export const LOCAL_STORAGE_USER_REVIEWS_KEY = 'travelBuddyUserReviews';
export const LOCAL_STORAGE_COMMUNITY_POSTS_KEY = 'travelBuddyCommunityPosts';


export const COMMON_CURRENCIES = [
  { code: "USD", name: "United States Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "KRW", name: "South Korean Won" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "MXN", name: "Mexican Peso" },
];

// i18n constants
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

// Subscription Tiers
import { SubscriptionTier, UserInterest } from '@/types';

export interface TierFeature {
  textKey: string;
  detailsKey?: string;
  isHighlighted?: boolean;
}

export interface SubscriptionTierInfo {
  key: SubscriptionTier;
  nameKey: string;
  priceMonthly: number;
  priceAnnually?: number;
  descriptionKey: string;
  features: TierFeature[];
  ctaKey: string;
  isCurrent?: boolean;
  isRecommended?: boolean;
  badgeTextKey?: string;
  badgeColor?: string; 
}

export const SUBSCRIPTION_TIERS: SubscriptionTierInfo[] = [
  {
    key: 'free',
    nameKey: 'subscriptionTiers.free.name',
    priceMonthly: 0,
    descriptionKey: 'subscriptionTiers.free.description',
    features: [
      { textKey: 'subscriptionTiers.features.placeDiscoveryBasic' },
      { textKey: 'subscriptionTiers.features.userReviewsRead' },
      { textKey: 'subscriptionTiers.features.dealsNearbyViewOnly' },
      { textKey: 'subscriptionTiers.features.emergencySOS', isHighlighted: true },
    ],
    ctaKey: 'subscriptionTiers.free.cta',
  },
  {
    key: 'basic',
    nameKey: 'subscriptionTiers.basic.name',
    priceMonthly: 1.99,
    priceAnnually: 19.99,
    descriptionKey: 'subscriptionTiers.basic.description',
    features: [
      { textKey: 'subscriptionTiers.features.allFree', isHighlighted: true },
      { textKey: 'subscriptionTiers.features.placeDiscoveryFull' },
      { textKey: 'subscriptionTiers.features.favorites' },
      { textKey: 'subscriptionTiers.features.oneDayItineraryGeneration' },
      { textKey: 'subscriptionTiers.features.communityViewAndLike' },
    ],
    ctaKey: 'subscriptionTiers.basic.cta',
    isRecommended: true,
  },
  {
    key: 'premium',
    nameKey: 'subscriptionTiers.premium.name',
    priceMonthly: 5.99,
    priceAnnually: 59.99,
    descriptionKey: 'subscriptionTiers.premium.description',
    features: [
      { textKey: 'subscriptionTiers.features.allBasic', isHighlighted: true },
      { textKey: 'subscriptionTiers.features.aiTripPlanner' },
      { textKey: 'subscriptionTiers.features.dealsNearbyPremium' },
      { textKey: 'subscriptionTiers.features.surpriseMe' },
      { textKey: 'subscriptionTiers.features.aiPlaceHelpers' },
      { textKey: 'subscriptionTiers.features.communityCreateAndShare' },
      { textKey: 'subscriptionTiers.features.userReviewsWrite' },
    ],
    ctaKey: 'subscriptionTiers.premium.cta',
    badgeTextKey: 'subscriptionTiers.premium.badge',
    badgeColor: Colors.primary,
  },
  {
    key: 'pro',
    nameKey: 'subscriptionTiers.pro.name',
    priceMonthly: 9.99,
    priceAnnually: 99.99,
    descriptionKey: 'subscriptionTiers.pro.description',
    features: [
      { textKey: 'subscriptionTiers.features.allPremium', isHighlighted: true },
      { textKey: 'subscriptionTiers.features.prioritySupport' },
      { textKey: 'subscriptionTiers.features.earlyAccess' },
    ],
    ctaKey: 'subscriptionTiers.pro.cta',
    badgeTextKey: 'subscriptionTiers.pro.badge',
    badgeColor: Colors.primarySlightlyDark,
  },
];

// User Interests
export const AVAILABLE_USER_INTERESTS: UserInterest[] = Object.values(UserInterest);