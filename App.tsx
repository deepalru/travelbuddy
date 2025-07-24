import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Place, Deal, TripPlanSuggestion, TripPace, TravelStyle, BudgetLevel, PlaceSummary, SurpriseSuggestion, EmergencyContact, HospitalInfo, CurrentUser, SubscriptionStatus, SubscriptionTier, ExchangeRatesResponse, ExchangeRates, UserInterest, CommunityPhoto, CommunityPhotoUploadData, ActiveTab, PortalView, PlaceExplorerView as PlaceExplorerViewType, ItinerarySuggestion, UserReview, Post, QuickTourPlan, SupportPoint, LocalInfo, ChatMessage, PlannerView, LocalAgencyPlan, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, PostCategory } from './types.ts';
import { Colors as lightColors, LOCAL_STORAGE_FAVORITE_PLACES_KEY, LOCAL_STORAGE_SAVED_TRIP_PLANS_KEY, LOCAL_STORAGE_SAVED_ONE_DAY_ITINERARIES_KEY, LOCAL_STORAGE_EMERGENCY_CONTACTS_KEY, LOCAL_STORAGE_CURRENT_USER_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SUBSCRIPTION_TIERS, LOCAL_STORAGE_USER_REVIEWS_KEY, LOCAL_STORAGE_COMMUNITY_POSTS_KEY, GEMINI_MODEL_TEXT } from './constants.ts';
import { GoogleGenAI, Chat } from "@google/genai";
import { 
  fetchNearbyPlaces, 
  generateItinerary as generateItineraryService,
  generateComprehensiveTripPlan,
  fetchPlaceRecommendations,
  generateSurpriseSuggestion,
  fetchNearbyHospitals,
  fetchCommunityPhotos,
  uploadCommunityPhoto,
  generateQuickTour,
  reverseGeocode,
  fetchSupportLocations,
  fetchLocalInfo,
  generateLocalAgencyPlan,
  enrichMultiplePlaceDetailsPrompt, // <-- Import Gemini batch enrichment
  processResponse, // <-- Import Gemini response processor
  generateContentWithRetry // <-- Import Gemini content generator
} from './services/geminiService.ts';
import { fetchExchangeRates } from './services/exchangeRateService.ts';
import Header from './components/Header.tsx';
import ErrorDisplay from './components/ErrorDisplay.tsx';
import { PlaceDetailModal } from './components/PlaceDetailModal.tsx';
import TypeFilter from './components/TypeFilter.tsx';
import PlaceCardSkeleton from './components/PlaceCardSkeleton.tsx';
import { ItineraryModal } from './components/ItineraryModal.tsx';
import AuthModal from './components/AuthModal.tsx';
import ProfileView from './components/ProfileView.tsx';
import DealCard from './components/DealCard.tsx';
import { TripPlannerModal } from './components/TripPlannerModal.tsx';
import SurpriseModal from './components/SurpriseModal.tsx';
import { SOSModal } from './components/SOSModal.tsx';
import { useToast } from './hooks/useToast.ts';
import ToastContainer from './components/ToastContainer.tsx'; 
import { getCurrentGeoLocation } from './utils/geolocation.ts';
import SubscriptionRequiredOverlay from './components/SubscriptionRequiredOverlay.tsx';
import { useLanguage } from './contexts/LanguageContext.tsx'; 
import { useTheme } from './contexts/ThemeContext.tsx';
import { useDebounce } from './hooks/useDebounce.ts'; 
import LockIcon from './components/LockIcon.tsx';
import PhotoUploadModal from './components/PhotoUploadModal.tsx';
import HomeView from './components/HomeView.tsx';
import { Footer } from './components/Footer.tsx';
import CommunityView from './components/CommunityView.tsx';
import CreatePostModal from './components/CreatePostModal.tsx';
import AdminPortal from './admin/AdminPortal.tsx';
import BottomNavigationBar from './components/BottomNavigationBar.tsx';
import PlaceExplorerView from './components/PlaceExplorerView.tsx';
import AITripPlannerView from './components/AITripPlannerView.tsx';
import WelcomeWizardModal from './components/WelcomeWizardModal.tsx';
import AIAssistantView from './components/AIAssistantView.tsx';
import { CurrencyConverterModal } from './components/CurrencyConverterModal.tsx';
import { FeatureDiscoveryModal } from './components/FeatureDiscoveryModal.tsx';
import { LostAndFoundModal } from './components/LostAndFoundModal.tsx';
import { FlightHelpModal } from './components/FlightHelpModal.tsx';
import DealsView from './components/DealsView.tsx';
import OneDayItineraryView from './components/OneDayItineraryView.tsx';
import PlannerHomeView from './components/PlannerHomeView.tsx';
import LocalAgencyPlannerView from './components/LocalAgencyPlannerView.tsx';
import ShareModal from './components/ShareModal.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import { searchNearbyPlaces } from './services/placesService.ts'; // <-- Import Google Places fetcher

export const App: React.FC = () => {
  console.log('[App] App component mounted');
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<Place | null>(null);
  
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearchInput = useDebounce(searchInput, 300);
  const [actualSearchTerm, setActualSearchTerm] = useState<string>('');

  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Default to 'all'
  
  const { addToast, removeToast } = useToast(); 
  const { language, setLanguage, t } = useLanguage(); 
  const { colors, theme, setTheme } = useTheme();

  const [selectedPlaceIdsForItinerary, setSelectedPlaceIdsForItinerary] = useState<string[]>([]);
  const [showItineraryModal, setShowItineraryModal] = useState<boolean>(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItinerarySuggestion | null>(null);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState<boolean>(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);
  const [savedOneDayItineraries, setSavedOneDayItineraries] = useState<ItinerarySuggestion[]>(() => {
    const storedPlans = localStorage.getItem(LOCAL_STORAGE_SAVED_ONE_DAY_ITINERARIES_KEY);
    return storedPlans ? JSON.parse(storedPlans) : [];
  });

  const [favoritePlaceIds, setFavoritePlaceIds] = useState<string[]>(() => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITE_PLACES_KEY);
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);


  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser) as CurrentUser;
            return { 
                ...parsedUser, 
                tier: parsedUser.tier || 'free', 
                homeCurrency: parsedUser.homeCurrency || 'USD',
                language: parsedUser.language || DEFAULT_LANGUAGE, 
                subscriptionStatus: parsedUser.subscriptionStatus || 'none',
                selectedInterests: parsedUser.selectedInterests || [],
                hasCompletedWizard: parsedUser.hasCompletedWizard ?? true,
            };
        } catch (e) {
            console.error("Error parsing stored user from localStorage:", e);
            localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
            return null;
        }
    }
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showWelcomeWizard, setShowWelcomeWizard] = useState<boolean>(false);
  
  const [showTripPlannerModal, setShowTripPlannerModal] = useState<boolean>(false);
  const [tripDestination, setTripDestination] = useState<string>('');
  const [tripDuration, setTripDuration] = useState<string>('');
  const [tripInterests, setTripInterests] = useState<string>('');
  const [tripPace, setTripPace] = useState<TripPace>(TripPace.Moderate);
  const [tripTravelStyles, setTripTravelStyles] = useState<TravelStyle[]>([]);
  const [tripBudget, setTripBudget] = useState<BudgetLevel>(BudgetLevel.MidRange);
  const [generatedTripPlan, setGeneratedTripPlan] = useState<TripPlanSuggestion | null>(null);
  const [isGeneratingTripPlan, setIsGeneratingTripPlan] = useState<boolean>(false);
  const [tripPlanError, setTripPlanError] = useState<string | null>(null);
  
  const [savedTripPlans, setSavedTripPlans] = useState<TripPlanSuggestion[]>(() => {
    const storedPlans = localStorage.getItem(LOCAL_STORAGE_SAVED_TRIP_PLANS_KEY);
    return storedPlans ? JSON.parse(storedPlans) : [];
  });

  const [surpriseSuggestion, setSurpriseSuggestion] = useState<SurpriseSuggestion | null>(null);
  const [isLoadingSurprise, setIsLoadingSurprise] = useState<boolean>(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState<boolean>(false);
  const [surpriseError, setSurpriseError] = useState<string | null>(null);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerSentinelRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('forYou'); 
  const [plannerView, setPlannerView] = useState<PlannerView>('hub');

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isFetchingUserLocation, setIsFetchingUserLocation] = useState<boolean>(true); 
  const [userLocationError, setUserLocationError] = useState<string | null>(null);
  const [showSOSModal, setShowSOSModal] = useState<boolean>(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const storedContacts = localStorage.getItem(LOCAL_STORAGE_EMERGENCY_CONTACTS_KEY);
    return storedContacts ? JSON.parse(storedContacts) : [];
  });
  const [nearbyHospitals, setNearbyHospitals] = useState<HospitalInfo[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(false);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  const [portalView, setPortalView] = useState<PortalView>('userApp');
  const [placeExplorerView, setPlaceExplorerView] = useState<PlaceExplorerViewType>('grid');

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingExchangeRates, setIsLoadingExchangeRates] = useState<boolean>(false);

  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>([]);
  const [isLoadingCommunityPhotos, setIsLoadingCommunityPhotos] = useState<boolean>(false);
  const [communityPhotosError, setCommunityPhotosError] = useState<string | null>(null);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadPhotoError, setUploadPhotoError] = useState<string | null>(null);
  
  const [showCurrencyConverter, setShowCurrencyConverter] = useState<boolean>(false);
  const [featureDiscoveryState, setFeatureDiscoveryState] = useState<{isOpen: boolean, title: string, query: string}>({isOpen: false, title: '', query: ''});
  const [showLostAndFoundModal, setShowLostAndFoundModal] = useState<boolean>(false);
  const [showFlightHelpModal, setShowFlightHelpModal] = useState<boolean>(false);

  const [userReviews, setUserReviews] = useState<UserReview[]>(() => {
    const storedReviews = localStorage.getItem(LOCAL_STORAGE_USER_REVIEWS_KEY);
    return storedReviews ? JSON.parse(storedReviews) : [];
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const storedPosts = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_POSTS_KEY);
    return storedPosts ? JSON.parse(storedPosts) : [];
  });
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [postToShare, setPostToShare] = useState<Post | null>(null);
  
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const [quickTourPlan, setQuickTourPlan] = useState<QuickTourPlan | null>(null);
  const [isGeneratingQuickTour, setIsGeneratingQuickTour] = useState<boolean>(false);
  const [quickTourError, setQuickTourError] = useState<string | null>(null);

  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [supportLocations, setSupportLocations] = useState<SupportPoint[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo | null>(null);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState<boolean>(true);

  // AI Chat Assistant State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingAiResponse, setIsGeneratingAiResponse] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Local Agency Planner State
  const [localAgencyPlan, setLocalAgencyPlan] = useState<LocalAgencyPlan | null>(null);
  const [isGeneratingLocalAgencyPlan, setIsGeneratingLocalAgencyPlan] = useState<boolean>(false);
  const [localAgencyPlanError, setLocalAgencyPlanError] = useState<string | null>(null);

  // Voice Search State
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
    if (!currentUser) return requiredTier === 'free'; // Grant free features if not logged in
    const userTier = currentUser.tier;
    const tierHierarchy: Record<SubscriptionTier, number> = { free: 0, basic: 1, premium: 2, pro: 3 };
    
    if (tierHierarchy[userTier] < tierHierarchy[requiredTier]) return false;
    if (requiredTier === 'free') return true;
    
    const now = new Date();
    if (currentUser.subscriptionStatus === 'trial' && currentUser.trialEndDate && new Date(currentUser.trialEndDate) >= now) return true;
    if (currentUser.subscriptionStatus === 'active' && currentUser.subscriptionEndDate && new Date(currentUser.subscriptionEndDate) >= now) return true;
    
    return false;
  }, [currentUser]);

  // Init/Reset AI Chat Session
  useEffect(() => {
    if (activeTab === 'aiAssistant' && hasAccess('premium') && !chatSession) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: GEMINI_MODEL_TEXT,
                history: [],
                config: {
                    systemInstruction: "You are 'Buddy', a friendly and helpful travel assistant. Your goal is to help users with their travel-related questions and problems. Keep your responses concise, helpful, and use emojis to be friendly.",
                }
            });
            setChatSession(newChat);
            if (chatMessages.length === 0) {
                 setChatMessages([{ role: 'model', parts: [{ text: t('aiAssistantView.welcomeMessage') }] }]);
            }
        } catch (e) {
            console.error("Failed to initialize AI Chat:", e);
            setChatError(t('aiAssistantView.error'));
        }
    }
  }, [activeTab, hasAccess, chatSession, t, chatMessages.length]);

  useEffect(() => {
    if (activeTab !== 'planner') {
      setPlannerView('hub');
    }
  }, [activeTab]);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = mainContentRef.current?.scrollTop ?? 0;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsBottomNavVisible(false); // Hide on scroll down
      } else {
        setIsBottomNavVisible(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    const mainEl = mainContentRef.current;
    mainEl?.addEventListener('scroll', handleScroll);
    return () => mainEl?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    const currentSentinel = footerSentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [isLoading]); 

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USER_REVIEWS_KEY, JSON.stringify(userReviews));
  }, [userReviews]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_POSTS_KEY, JSON.stringify(posts));
  }, [posts]);


  useEffect(() => {
    if (currentUser?.language && SUPPORTED_LANGUAGES.some(l => l.code === currentUser.language)) {
      setLanguage(currentUser.language);
    } else {
      setLanguage(DEFAULT_LANGUAGE);
    }
  }, [currentUser?.language, setLanguage]);

  useEffect(() => {
    setActualSearchTerm(debouncedSearchInput);
  }, [debouncedSearchInput]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FAVORITE_PLACES_KEY, JSON.stringify(favoritePlaceIds));
  }, [favoritePlaceIds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SAVED_TRIP_PLANS_KEY, JSON.stringify(savedTripPlans));
  }, [savedTripPlans]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SAVED_ONE_DAY_ITINERARIES_KEY, JSON.stringify(savedOneDayItineraries));
  }, [savedOneDayItineraries]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_EMERGENCY_CONTACTS_KEY, JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    const loadExchangeRates = async () => {
      if (!currentUser?.homeCurrency) return;
      setIsLoadingExchangeRates(true);
      try {
        const ratesResponse = await fetchExchangeRates('USD'); 
        setExchangeRates(ratesResponse.rates);
      } catch (err) {
        console.error("Failed to load exchange rates:", err);
        setExchangeRates(null);
      } finally {
        setIsLoadingExchangeRates(false);
      }
    };
    loadExchangeRates();
  }, [currentUser?.homeCurrency]);

  const checkAndUpdateSubscriptionStatus = useCallback((user: CurrentUser): CurrentUser => {
    let updatedUser = { ...user };
    const now = new Date();

    if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
      if (new Date(user.trialEndDate) < now) {
        updatedUser.subscriptionStatus = 'expired';
        updatedUser.tier = 'free'; 
        addToast({ message: t('accountSettings.trialExpiredToast'), type: 'info' });
      }
    } else if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
      if (new Date(user.subscriptionEndDate) < now) {
        updatedUser.subscriptionStatus = 'expired';
        updatedUser.tier = 'free'; 
        addToast({ message: t('accountSettings.subscriptionExpiredToast'), type: 'info' });
      }
    }
    return updatedUser;
  }, [addToast, t]);

  useEffect(() => {
    if (currentUser) {
      const checkedUser = checkAndUpdateSubscriptionStatus(currentUser);
      if (JSON.stringify(checkedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(checkedUser);
      }
    }
  }, [currentUser, checkAndUpdateSubscriptionStatus]); 


  // Add a new state for geolocation status
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Add a constant for the default location (customizable)
  const DEFAULT_LOCATION = { latitude: 6.9271, longitude: 79.8612, label: 'Colombo, Sri Lanka' };

  // Refactor loadUserLocation to update status
  const loadUserLocation = useCallback(async () => {
    console.log('[App] loadUserLocation called');
    setIsFetchingUserLocation(true);
    setLocationStatus('loading');
    setUserLocationError(null);
    try {
      const location = await getCurrentGeoLocation();
      setUserLocation(location);
      setLocationStatus('success');
    } catch (error) {
      setLocationStatus('error');
      if (error instanceof Error) {
        setUserLocationError(error.message);
        addToast({ message: t('sosModal.locationError', {error: error.message}), type: "warning", duration: 3000 });
      } else {
        setUserLocationError(t('sosModal.unknownLocationError'));
        addToast({ message: t('sosModal.unknownLocationError'), type: 'warning' });
      }
      // Set default location if geolocation fails
      setUserLocation({ latitude: DEFAULT_LOCATION.latitude, longitude: DEFAULT_LOCATION.longitude });
    } finally {
      setIsFetchingUserLocation(false);
    }
  }, [addToast, t]);

  // Only load places after userLocation is set (not on initial render)
  useEffect(() => {
    if (userLocation) {
      loadPlaces(actualSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, actualSearchTerm]);

  useEffect(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  const loadPlaces = useCallback(async (searchQuery: string) => {
    setError(null);
    setIsLoading(true);
    try {
      addToast({ message: userLocation ? t('placeExplorer.fetchingNearby') : t('placeExplorer.fetchingDefault'), type: "info", duration: 1500 });
      // Step 1: Fetch places from Google Places API (backend) with category (omit if 'all')
      const factualPlaces = await searchNearbyPlaces(
        userLocation?.latitude || 0,
        userLocation?.longitude || 0,
        searchQuery ? [searchQuery] : [],
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      if (!factualPlaces || factualPlaces.length === 0) {
        setAllPlaces([]);
        addToast({ message: t('placeExplorer.noPlacesFound'), type: 'info', duration: 2000 });
        setIsLoading(false);
        return;
      }
      // Step 2: Enrich with Gemini AI
      const enrichmentPrompt = enrichMultiplePlaceDetailsPrompt(factualPlaces);
      const enrichmentResponse = await generateContentWithRetry({
        model: 'models/gemini-2.0-flash',
        contents: enrichmentPrompt,
        config: { responseMimeType: 'application/json' },
      });
      const creativeContents = processResponse<Array<Partial<Place> & { id: string }>>(enrichmentResponse, 'enrichMultiplePlaceDetails');
      const creativeMap = new Map(creativeContents.map(c => [c.id, c]));
      // Step 3: Merge
      const mergedPlaces = factualPlaces.map(placeFacts => {
        if (!placeFacts.place_id) return null;
        const creativeContent = creativeMap.get(placeFacts.place_id);
        if (!creativeContent) return { ...placeFacts };
        return {
          ...placeFacts,
          ...creativeContent,
          id: placeFacts.place_id,
          name: placeFacts.name,
          address: placeFacts.formatted_address || 'Unknown Address',
          type: creativeContent.type || (placeFacts.types && placeFacts.types.length > 0 ? placeFacts.types[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Point of Interest'),
          description: creativeContent.description || `An interesting place to visit: ${placeFacts.name}.`,
          localTip: creativeContent.localTip || 'Check online for opening hours before you visit.',
          handyPhrase: creativeContent.handyPhrase || 'Hello, how are you?',
        };
      }).filter((p): p is Place => p !== null);
      setAllPlaces(mergedPlaces);
      if (searchQuery) {
        addToast({ message: `Found ${mergedPlaces.length} places for "${searchQuery}"`, type: 'success', duration: 2000 });
      } else {
        addToast({ message: t('placeExplorer.placesLoadedSuccess'), type: "success", duration: 2000 });
      }
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.fetchErrorDefault');
      setError(errorMessage);
      addToast({ message: t('placeExplorer.fetchErrorDetailed', {error: errorMessage}), type: 'error' });
      setAllPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, addToast, t, selectedCategory]);

  useEffect(() => {
    if (userLocation) {
      const fetchHomeData = async () => {
        setIsLoadingHomeData(true);
        try {
          const [cityResult, supportResult, infoResult] = await Promise.all([
            reverseGeocode(userLocation.latitude, userLocation.longitude),
            fetchSupportLocations(userLocation.latitude, userLocation.longitude),
            fetchLocalInfo(userLocation.latitude, userLocation.longitude)
          ]);
          setUserCity(cityResult.city);
          setUserCountryCode(cityResult.countryCode);
          setSupportLocations(supportResult);
          setLocalInfo(infoResult);
        } catch (err) {
          console.error("Failed to fetch homepage data:", err);
          if (err instanceof Error) {
            addToast({ message: `Could not load local information: ${err.message}`, type: 'warning' });
          }
          setUserCity(null);
          setUserCountryCode(null);
          setSupportLocations([]);
          setLocalInfo(null);
        } finally {
          setIsLoadingHomeData(false);
        }
      };
      fetchHomeData();
    } else {
      setIsLoadingHomeData(false);
    }
  }, [userLocation, addToast]);

  const handleShowAuthModal = (view: 'login' | 'register') => {
    setAuthError(null);
    setAuthModalView(view);
    setShowAuthModal(true);
  };

  const handleLogin = async (identifier: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (identifier.toLowerCase() === 'admin' && pass === 'password') {
      const adminUser: CurrentUser = { username: 'Admin', email: 'admin@travelbuddy.app', isAdmin: true, subscriptionStatus: 'active', tier: 'pro', subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'USD', language: 'en', selectedInterests: [], hasCompletedWizard: true };
      setCurrentUser(adminUser);
      setShowAuthModal(false);
      addToast({ message: t('header.greeting', {username: adminUser.username}), type: 'success' });
    } else if (pass.length >= 6) {
      const newUser: CurrentUser = { username: identifier, email: `${identifier}@example.com`, subscriptionStatus: 'none', tier: 'free', homeCurrency: 'USD', language: 'en', selectedInterests: [], hasCompletedWizard: false };
      setCurrentUser(newUser);
      setShowAuthModal(false);
      addToast({ message: t('header.greeting', {username: newUser.username}), type: 'success' });
      setShowWelcomeWizard(true);
    } else {
      setAuthError(t('authModal.mockPasswordLengthError'));
    }
    setAuthLoading(false);
  };

  const handleRegister = async (username: string, email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (pass.length < 6) {
      setAuthError(t('authModal.passwordLengthError'));
    } else {
      const newUser: CurrentUser = { username, email, subscriptionStatus: 'none', tier: 'free', homeCurrency: 'USD', language: 'en', selectedInterests: [], hasCompletedWizard: false };
      setCurrentUser(newUser);
      setShowAuthModal(false);
      addToast({ message: t('authModal.welcomeUser', {username}), type: 'success' });
      setShowWelcomeWizard(true);
    }
    setAuthLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const googleUser: CurrentUser = { username: 'GoogleUser', email: 'google.user@example.com', subscriptionStatus: 'trial', tier: 'premium', trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'EUR', language: 'en', selectedInterests: [UserInterest.Adventure, UserInterest.Foodie], hasCompletedWizard: true };
    setCurrentUser(googleUser);
    setShowAuthModal(false);
    addToast({ message: t('authModal.signedInWithGoogle', {username: googleUser.username}), type: 'success' });
    setAuthLoading(false);
  };
  
  const handleUpdateUser = (updatedDetails: Partial<Omit<CurrentUser, 'username' | 'email'>>) => {
      if (currentUser) {
          setCurrentUser(prev => prev ? ({ ...prev, ...updatedDetails }) : null);
          addToast({ message: t('profileView.profileUpdated'), type: 'success' });
      }
  };

  const handleLogout = () => {
    const username = currentUser?.username || t('authModal.defaultUser');
    setCurrentUser(null);
    addToast({ message: t('authModal.goodbyeUser', {username}), type: 'info' });
    setPortalView('userApp');
    setActiveTab('forYou');
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'profile' && !currentUser) {
      addToast({ message: t('userProfile.loginRequiredToast', {featureName: 'Profile'}), type: 'warning' });
      handleShowAuthModal('login');
    } else {
      setActiveTab(tab);
    }
  };
  
  const handleNavigateToAdminPortal = () => {
    if(currentUser?.isAdmin) {
      setPortalView('adminPortal');
    }
  }
  
  const handleExitAdminPortal = () => {
    setPortalView('userApp');
    setActiveTab('forYou');
  }

  const handleToggleSelectForItinerary = (placeId: string) => {
    if (!hasAccess('basic')) {
      addToast({ message: t('placeExplorer.addPlaceToItinerary'), type: 'warning' });
      return;
    }
    setSelectedPlaceIdsForItinerary(prev =>
      prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
    );
    const place = allPlaces.find(p => p.id === placeId);
    if (place) {
      addToast({
        message: selectedPlaceIdsForItinerary.includes(placeId) ? t('placeExplorer.removedFromItinerary', {placeName: place.name}) : t('placeExplorer.addedToItinerary', {placeName: place.name}),
        type: 'info',
        duration: 1500
      });
    }
  };

  const handleClearItinerarySelection = () => {
    setSelectedPlaceIdsForItinerary([]);
    addToast({ message: t('placeExplorer.itinerarySelectionCleared'), type: 'info' });
  };

  const handleGenerateItinerary = async () => {
    if (selectedPlaceIdsForItinerary.length < 2) {
      setItineraryError(t('placeExplorer.selectAtLeastTwoPlaces'));
      addToast({message: t('placeExplorer.selectAtLeastTwoPlaces'), type: 'warning'});
      return;
    }
    setIsGeneratingItinerary(true);
    setGeneratedItinerary(null);
    setItineraryError(null);
    setShowItineraryModal(true);
    addToast({ message: t('placeExplorer.generatingOneDayItinerary'), type: 'info' });

    try {
      const selectedPlacesObjects = allPlaces.filter(p => selectedPlaceIdsForItinerary.includes(p.id));
      const itinerary = await generateItineraryService(selectedPlacesObjects);
      setGeneratedItinerary(itinerary);
      addToast({ message: t('placeExplorer.oneDayItineraryGenerated'), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.itineraryGenerationErrorUnknown');
      setItineraryError(errorMessage);
      addToast({ message: t('placeExplorer.itineraryGenerationFailed', {error: errorMessage}), type: 'error' });
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleToggleFavoritePlace = (placeId: string) => {
    if (!hasAccess('basic')) {
      addToast({ message: t('placeExplorer.subscribeToSaveFavorites'), type: 'warning' });
      return;
    }
    setFavoritePlaceIds(prev =>
      prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
    );
    const place = allPlaces.find(p => p.id === placeId);
    if (place) {
      addToast({
        message: favoritePlaceIds.includes(placeId) ? t('placeExplorer.removedFromFavorites', {placeName: place.name}) : t('placeExplorer.addedToFavorites', {placeName: place.name}),
        type: 'info',
        duration: 1500
      });
    }
  };

  const handleToggleShowFavorites = () => {
    if (!hasAccess('basic')) {
      addToast({ message: t('placeExplorer.subscribeToUseFavorites'), type: 'warning' });
      return;
    }
    setShowFavoritesOnly(prev => {
      const newState = !prev;
      addToast({ message: newState ? t('placeExplorer.showingFavorites') : t('placeExplorer.showingAllPlaces'), type: 'info', duration: 1500 });
      return newState;
    });
  };

  const handleToggleShowOpenOnly = () => {
    setShowOpenOnly(prev => !prev);
  };
  
  const handleGenerateTripPlan = async () => {
    if (!hasAccess('premium')) {
      addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', {featureName: t('features.aiTripPlanner')}), type: 'warning' });
      return;
    }
    setIsGeneratingTripPlan(true);
    setTripPlanError(null);
    setGeneratedTripPlan(null);
    setShowTripPlannerModal(true);
    addToast({message: t('modals.planGeneratedSuccess'), type: "info"});
    try {
      const plan = await generateComprehensiveTripPlan(
        tripDestination,
        tripDuration,
        tripInterests,
        tripPace,
        tripTravelStyles,
        tripBudget
      );
      setGeneratedTripPlan(plan);
      addToast({message: t('modals.planGeneratedSuccess'), type: "success"});
    } catch (err: any) {
      const errorMessage = err.message || t('modals.errorUnknown');
      setTripPlanError(errorMessage);
      addToast({message: `${t('modals.errorPrefix')} ${errorMessage}`, type: "error"});
    } finally {
      setIsGeneratingTripPlan(false);
    }
  };
  
  const handleGenerateLocalAgencyPlan = async (location: string, planType: string, interests: string) => {
    if (!hasAccess('premium')) {
        addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', {featureName: t('features.localAgencyPlan')}), type: 'warning' });
        return;
    }
    setIsGeneratingLocalAgencyPlan(true);
    setLocalAgencyPlan(null);
    setLocalAgencyPlanError(null);
    try {
        const plan = await generateLocalAgencyPlan(location, planType, interests);
        setLocalAgencyPlan(plan);
    } catch (err: any) {
        const errorMessage = err.message || t('localAgencyPlanner.error');
        setLocalAgencyPlanError(errorMessage);
        addToast({message: `${t('modals.errorPrefix')} ${errorMessage}`, type: "error"});
    } finally {
        setIsGeneratingLocalAgencyPlan(false);
    }
  };


  const handleSaveTripPlan = (plan: TripPlanSuggestion) => {
    if (!plan.id) {
        addToast({ message: t('modals.cannotSavePlanWithoutId'), type: 'error' });
        return;
    }
    if (!savedTripPlans.some(p => p.id === plan.id)) {
      setSavedTripPlans(prev => [...prev, plan]);
      addToast({ message: t('modals.planSaved'), type: 'success' });
    }
  };

  const handleDeleteSavedTripPlan = (planId: string) => {
    setSavedTripPlans(prev => prev.filter(p => p.id !== planId));
    addToast({ message: t('modals.planDeleted'), type: 'info' });
  };
  
  const handleViewSavedTripPlan = (plan: TripPlanSuggestion) => {
    setGeneratedTripPlan(plan);
    setShowTripPlannerModal(true);
  };
  
  const handleViewSavedOneDayItinerary = (itinerary: ItinerarySuggestion) => {
    setGeneratedItinerary(itinerary);
    setShowItineraryModal(true);
  };
  
  const handleDeleteSavedOneDayItinerary = (itineraryId: string) => {
    setSavedOneDayItineraries(prev => prev.filter(p => p.id !== itineraryId));
    addToast({ message: t('oneDayItineraryTab.itineraryDeletedToast'), type: 'info' });
  };


  const handleSurpriseMeClick = async () => {
    if (!hasAccess('premium')) {
      addToast({ message: t('placeExplorer.subscribeForSurprise'), type: 'warning' });
      return;
    }
    setIsLoadingSurprise(true);
    setSurpriseError(null);
    setShowSurpriseModal(true);
    setSurpriseSuggestion(null);
    addToast({ message: t('placeExplorer.findingSurprise'), type: 'info' });
    try {
      const suggestion = await generateSurpriseSuggestion();
      setSurpriseSuggestion(suggestion);
      addToast({ message: t('placeExplorer.surpriseFound'), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.surpriseGenerationError');
      setSurpriseError(errorMessage);
      addToast({ message: t('placeExplorer.surpriseError', {error: errorMessage}), type: 'error' });
    } finally {
      setIsLoadingSurprise(false);
    }
  };

  const handleSelectPlaceDetail = (place: Place | null) => {
    setSelectedPlaceDetail(place);
  };
  
  const handleSelectPlaceByNameOrId = (identifier: string, isId: boolean = true) => {
    const place = isId 
        ? allPlaces.find(p => p.id === identifier)
        : allPlaces.find(p => p.name.toLowerCase() === identifier.toLowerCase());
    
    if (place) {
      setSelectedPlaceDetail(place);
    } else {
      addToast({ message: t('modals.couldNotFindDetails', {identifier}), type: 'warning' });
    }
  };

  const handleFetchNearbyHospitals = async () => {
    if (!userLocation) return;
    setIsLoadingHospitals(true);
    setHospitalsError(null);
    try {
      const fetchedHospitals = await fetchNearbyHospitals(userLocation.latitude, userLocation.longitude);
      setNearbyHospitals(fetchedHospitals);
    } catch (err: any) {
      setHospitalsError(err.message || "Failed to fetch hospitals.");
    } finally {
      setIsLoadingHospitals(false);
    }
  };
  
  const handleAddEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = { ...contact, id: `contact-${Date.now()}` };
    setEmergencyContacts(prev => [...prev, newContact]);
    addToast({message: t('accountSettings.contactAdded', {name: contact.name}), type: 'success'});
  };
  
  const handleDeleteEmergencyContact = (contactId: string) => {
    const contactToDelete = emergencyContacts.find(c => c.id === contactId);
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
     if(contactToDelete) {
        addToast({message: t('accountSettings.contactRemoved', {name: contactToDelete.name}), type: 'info'});
    }
  };
  
  const startTrial = (tier: SubscriptionTier) => {
    if (!currentUser) return;
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    setCurrentUser(prev => prev ? ({ ...prev, tier, subscriptionStatus: 'trial', trialEndDate }) : null);
    const tierInfo = SUBSCRIPTION_TIERS.find(t => t.key === tier);
    addToast({message: t('accountSettings.freeTrialStartedForTier', {tierName: t(tierInfo?.nameKey || 'tier')}), type: 'success'});
  };

  const subscribe = (tier: SubscriptionTier) => {
    if (!currentUser) return;
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    setCurrentUser(prev => prev ? ({ ...prev, tier, subscriptionStatus: 'active', subscriptionEndDate: subscriptionEndDate.toISOString(), trialEndDate: undefined }) : null);
    const tierInfo = SUBSCRIPTION_TIERS.find(t => t.key === tier);
    addToast({message: t('accountSettings.subscriptionActivatedForTier', {tierName: t(tierInfo?.nameKey || 'tier')}), type: 'success'});
  };

  const cancelSubscription = () => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? ({ ...prev, subscriptionStatus: 'canceled' }) : null);
    addToast({message: t('accountSettings.subscriptionCanceled'), type: 'info'});
  };

  const upgradeDowngradeTier = (newTier: SubscriptionTier) => {
    if (!currentUser) return;
    if (newTier === 'free') {
      setCurrentUser(prev => prev ? ({ ...prev, tier: 'free', subscriptionStatus: 'canceled', subscriptionEndDate: undefined, trialEndDate: undefined }) : null);
      addToast({message: t('subscriptionTiers.downgradedToFree'), type: 'info'});
    } else {
      subscribe(newTier);
    }
  };
  
  const handleHomeCurrencyChange = (newCurrency: string) => {
      if (!currentUser) return;
      setCurrentUser(prev => prev ? ({ ...prev, homeCurrency: newCurrency }) : null);
      addToast({message: t('accountSettings.homeCurrencySet', {currency: newCurrency}), type: 'success'});
  };
  
  const handleLanguageChange = (newLanguage: string) => {
      if (!currentUser) return;
      setCurrentUser(prev => prev ? ({ ...prev, language: newLanguage }) : null);
      setLanguage(newLanguage); 
  };
  
  const handleSelectedInterestsChange = (interests: UserInterest[]) => {
    if(!currentUser) return;
    setCurrentUser(prev => prev ? ({ ...prev, selectedInterests: interests}) : null);
    addToast({ message: t('accountSettings.interestsUpdated'), type: 'success' });
  };
  
  const handleCheckInSafe = () => {
    // This is a mock action
    addToast({message: t('features.imSafeNotification'), type: "success"});
  };

  const handleUploadPhoto = async (uploadData: CommunityPhotoUploadData) => {
    if (!currentUser || !hasAccess('premium')) {
      setUploadPhotoError(t('userProfile.loginRequiredToast', {featureName: 'upload photos'}));
      addToast({message: t('userProfile.loginRequiredToast', {featureName: 'upload photos'}), type: 'warning'});
      return;
    }
    setIsUploadingPhoto(true);
    setUploadPhotoError(null);
    try {
      const newPhoto = await uploadCommunityPhoto(uploadData, currentUser.username);
      setCommunityPhotos(prev => [newPhoto, ...prev]);
      addToast({message: t('communityGallery.uploadSuccess'), type: 'success'});
      setShowPhotoUploadModal(false);
    } catch(err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadPhotoError(msg);
      addToast({message: `${t('communityGallery.uploadError')}: ${msg}`, type: 'error'});
    } finally {
      setIsUploadingPhoto(false);
    }
  };
  
  const handleCreatePost = async (content: string, imageUrls?: string[], attachedPlaceIds?: string[], attachedDealIds?: string[], category: PostCategory = 'Experience', tags: string[] = []) => {
    if (!currentUser || !hasAccess('premium')) {
      addToast({ message: t('userProfile.loginRequiredToast', {featureName: 'create posts'}) , type: 'warning' });
      return;
    }
    setIsCreatingPost(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate network
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser.username,
        avatar: `https://source.unsplash.com/100x100/?portrait,person&sig=${Date.now()}`,
        location: userCity || 'Unknown Location',
        verified: currentUser.tier === 'pro' || !!currentUser.isAdmin,
      },
      content: {
        text: content,
        images: imageUrls || [],
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
      },
      timestamp: new Date(),
      tags: tags,
      category: category,
      attachedPlaceIds,
      attachedDealIds,
    };
    setPosts(prev => [newPost, ...prev]);
    setIsCreatingPost(false);
    setShowCreatePostModal(false);
    addToast({ message: t('communityTab.postCreatedSuccess'), type: 'success' });
  };
  
  const handleLikePost = (postId: string) => {
    if (!currentUser) {
        addToast({ message: t('userProfile.loginRequiredToast', {featureName: 'like posts'}), type: 'warning' });
        return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.engagement.isLiked;
          return {
            ...post,
            engagement: {
              ...post.engagement,
              isLiked: !isLiked,
              likes: isLiked ? post.engagement.likes - 1 : post.engagement.likes + 1,
            },
          };
        }
        return post;
      })
    );
  };

  const handleBookmarkPost = (postId: string) => {
    if (!currentUser) {
      addToast({ message: t('userProfile.loginRequiredToast', { featureName: 'bookmark posts' }), type: 'warning' });
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, engagement: { ...post.engagement, isBookmarked: !post.engagement.isBookmarked } }
          : post
      )
    );
  };
  
  const handleShareTripPlanToCommunity = (plan: TripPlanSuggestion) => {
    if (!currentUser || !hasAccess('premium')) {
        addToast({ message: t('userProfile.loginRequiredToast', {featureName: 'share trips'}), type: 'warning' });
        return;
    }
    const newPost: Post = {
      id: `post-trip-${Date.now()}`,
      author: {
        name: currentUser.username,
        avatar: `https://source.unsplash.com/100x100/?portrait,person&sig=${Date.now()+1}`,
        location: userCity || "Unknown",
        verified: currentUser.tier === 'pro' || !!currentUser.isAdmin,
      },
      content: {
        text: `Check out my trip plan to ${plan.destination}!\n\n${plan.introduction}`,
        images: plan.dailyPlans.map(p => p.photoUrl).filter((url): url is string => !!url).slice(0,2),
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
      },
      timestamp: new Date(),
      tags: [plan.destination, 'trip-plan'],
      category: 'Itinerary',
      tripPlanId: plan.id,
      tripPlanSummary: {
        title: plan.tripTitle,
        destination: plan.destination,
        duration: plan.duration,
      },
    };
    setPosts(prev => [newPost, ...prev]);
    addToast({ message: t('communityTab.tripSharedSuccess'), type: 'success' });
  };
  
  const handleAddUserReview = (placeId: string, rating: number, text: string) => {
    if (!currentUser || !hasAccess('premium')) {
      addToast({ message: t('userProfile.loginRequiredToast', {featureName: 'write reviews'}), type: 'warning' });
      return;
    }
    const newReview: UserReview = {
      id: `review-${Date.now()}`,
      placeId,
      userId: currentUser.username,
      username: currentUser.username,
      rating,
      text,
      timestamp: new Date().toISOString(),
    };
    setUserReviews(prev => [...prev, newReview]);
    addToast({ message: t('placeDetailModal.reviewSubmittedSuccess'), type: 'success' });
  };

  const handleWelcomeWizardComplete = (preferences: { language: string; homeCurrency: string; selectedInterests: UserInterest[] }) => {
    if (currentUser) {
      setCurrentUser(prev => prev ? ({ 
        ...prev, 
        ...preferences,
        hasCompletedWizard: true,
      }) : null);
      addToast({message: t('welcomeWizard.preferencesSaved'), type: 'success'});
    }
    setShowWelcomeWizard(false);
  };
  
  const handleSendMessage = async (message: string) => {
    if (!chatSession) {
        setChatError(t('aiAssistantView.error'));
        return;
    }
    setChatMessages(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);
    setIsGeneratingAiResponse(true);
    setChatError(null);
    
    try {
        const response = await chatSession.sendMessage({ message });
        setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (e) {
        console.error("AI Chat send message error:", e);
        setChatError(e instanceof Error ? e.message : t('aiAssistantView.error'));
    } finally {
        setIsGeneratingAiResponse(false);
    }
  };
  
  const handleOpenFeatureDiscovery = (title: string, query: string) => {
    if (userLocation) {
        setFeatureDiscoveryState({ isOpen: true, title, query });
    } else {
        addToast({ message: t('sosModal.locationNotAvailable'), type: 'warning' });
    }
  };

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({ message: "Voice recognition is not supported by your browser.", type: 'warning' });
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        addToast({ message: "Listening...", type: 'info', duration: 2000 });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setSearchInput(finalTranscript + interimTranscript);
        if(finalTranscript){
            setActiveTab('placeExplorer');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = "Voice recognition error";
        if (event.error === 'no-speech') {
            errorMessage = "No speech was detected. Please try again.";
        } else if (event.error === 'audio-capture') {
            errorMessage = "Microphone problem. Please check your microphone.";
        } else if (event.error === 'not-allowed') {
            errorMessage = "Permission to use microphone was denied.";
        }
        addToast({ message: errorMessage, type: 'error' });
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';
    }


    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  }, [addToast, isListening, language]);


  const filteredPlaces = useMemo(() => {
    let placesToShow = allPlaces;

    if (showFavoritesOnly) {
      placesToShow = placesToShow.filter(place => favoritePlaceIds.includes(place.id));
    }

    if (showOpenOnly) {
      placesToShow = placesToShow.filter(place => place.opening_hours?.open_now);
    }

    if (selectedType !== 'All') {
      placesToShow = placesToShow.filter(place => place.type === selectedType);
    }

    return placesToShow;
  }, [allPlaces, showFavoritesOnly, favoritePlaceIds, showOpenOnly, selectedType]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(allPlaces.map(place => place.type));
    return ['All', ...Array.from(types)];
  }, [allPlaces]);
  
  const placesWithDeals = useMemo(() => {
    return allPlaces.filter(place => place.deal);
  }, [allPlaces]);
  
  const favoritePlaces = useMemo(() => {
    return allPlaces.filter(p => favoritePlaceIds.includes(p.id))
  }, [allPlaces, favoritePlaceIds]);

  // List of available categories for the dropdown
  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'landmarks', label: 'Landmarks' },
    { value: 'culture', label: 'Culture & History' },
    { value: 'nature', label: 'Nature & Outdoors' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'lodging', label: 'Accommodation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'events', label: 'Events & Festivals' },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    // Trigger a new search with the current search term
    loadPlaces(actualSearchTerm);
  };

  const renderMainContent = () => {
    if (portalView === 'adminPortal') {
        return (
            <AdminPortal 
              currentUser={currentUser}
              onExitAdminPortal={handleExitAdminPortal}
            />
        );
    }
    let content;
    switch (activeTab) {
      case 'forYou':
        content = (
            <HomeView
                currentUser={currentUser}
                userLocation={userLocation}
                userCity={userCity}
                localInfo={localInfo}
                isLoading={isLoadingHomeData}
                supportLocations={supportLocations}
                onShowSOSModal={() => setShowSOSModal(true)}
                onTabChange={handleTabChange}
                onSurpriseMeClick={handleSurpriseMeClick}
                favoritePlacesCount={favoritePlaceIds.length}
            />
        );
        break;
      case 'placeExplorer':
        content = (
          <>
            {/* Category Dropdown UI */}
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="category-select" className="font-semibold text-sm">Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="border rounded px-2 py-1 text-sm"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <PlaceExplorerView
                uniqueTypes={uniqueTypes}
                selectedType={selectedType}
                onSelectType={setSelectedType}
                filteredPlaces={filteredPlaces}
                isLoading={isLoading}
                error={error}
                onRetryLoadPlaces={() => loadPlaces(actualSearchTerm)}
                onSelectPlaceDetail={handleSelectPlaceDetail}
                selectedPlaceIdsForItinerary={selectedPlaceIdsForItinerary}
                onToggleSelectForItinerary={handleToggleSelectForItinerary}
                favoritePlaceIds={favoritePlaceIds}
                onToggleFavoritePlace={handleToggleFavoritePlace}
                showFavoritesOnly={showFavoritesOnly}
                onToggleShowFavorites={handleToggleShowFavorites}
                showOpenOnly={showOpenOnly}
                onToggleShowOpenOnly={handleToggleShowOpenOnly}
                onSurpriseMeClick={handleSurpriseMeClick}
                isLoadingSurprise={isLoadingSurprise}
                userLocation={userLocation}
                placeExplorerView={placeExplorerView}
                onTogglePlaceExplorerView={() => setPlaceExplorerView(prev => prev === 'grid' ? 'map' : 'grid')}
                placesWithDeals={placesWithDeals}
                onSelectPlaceByNameOrId={handleSelectPlaceByNameOrId}
                currentUserHomeCurrency={currentUser?.homeCurrency}
                exchangeRates={exchangeRates}
                hasAccessToBasic={hasAccess('basic')}
                hasAccessToPremium={hasAccess('premium')}
            />
          </>
        );
        break;
      case 'deals':
        content = (
          <DealsView
            placesWithDeals={placesWithDeals}
            onSelectPlaceByNameOrId={handleSelectPlaceByNameOrId}
            currentUserHomeCurrency={currentUser?.homeCurrency}
            exchangeRates={exchangeRates}
            hasAccessToPremiumDeals={hasAccess('premium')}
          />
        );
        break;
      case 'planner':
        let plannerContent;
        if (!hasAccess('basic')) {
            plannerContent = <SubscriptionRequiredOverlay currentUser={currentUser} onStartTrial={startTrial} onSubscribe={subscribe} onUpgradeDowngradeTier={upgradeDowngradeTier} featureName="Planner" requiredTier="basic" onNavigateToProfile={() => handleTabChange('profile')} />;
        } else {
            switch (plannerView) {
                case 'oneDay':
                    plannerContent = <OneDayItineraryView selectedPlaceIdsForItinerary={selectedPlaceIdsForItinerary} onGenerateItinerary={handleGenerateItinerary} onClearSelection={handleClearItinerarySelection} savedItineraries={savedOneDayItineraries} onViewSavedItinerary={handleViewSavedOneDayItinerary} onDeleteSavedItinerary={handleDeleteSavedOneDayItinerary} isPlanSavable={hasAccess('basic')} />;
                    break;
                case 'multiDay':
                      if (!hasAccess('premium')) {
                        plannerContent = <SubscriptionRequiredOverlay currentUser={currentUser} onStartTrial={startTrial} onSubscribe={subscribe} onUpgradeDowngradeTier={upgradeDowngradeTier} featureName={t('features.aiTripPlanner')} requiredTier="premium" onNavigateToProfile={() => handleTabChange('profile')} />;
                    } else {
                        plannerContent = <AITripPlannerView tripDestination={tripDestination} setTripDestination={setTripDestination} tripDuration={tripDuration} setTripDuration={setTripDuration} tripInterests={tripInterests} setTripInterests={setTripInterests} tripPace={tripPace} setTripPace={setTripPace} tripTravelStyles={tripTravelStyles} setTripTravelStyles={setTripTravelStyles} tripBudget={tripBudget} setTripBudget={setTripBudget} isGeneratingTripPlan={isGeneratingTripPlan} handleGenerateTripPlan={handleGenerateTripPlan} />;
                    }
                    break;
                case 'localAgency':
                    if (!hasAccess('premium')) {
                        plannerContent = <SubscriptionRequiredOverlay currentUser={currentUser} onStartTrial={startTrial} onSubscribe={subscribe} onUpgradeDowngradeTier={upgradeDowngradeTier} featureName={t('features.localAgencyPlan')} requiredTier="premium" onNavigateToProfile={() => handleTabChange('profile')} />;
                    } else {
                        plannerContent = <LocalAgencyPlannerView onGeneratePlan={handleGenerateLocalAgencyPlan} isGenerating={isGeneratingLocalAgencyPlan} generatedPlan={localAgencyPlan} error={localAgencyPlanError} onBack={() => setPlannerView('hub')} onReset={() => setLocalAgencyPlan(null)} userCity={userCity} />;
                    }
                    break;
                case 'hub':
                default:
                    plannerContent = <PlannerHomeView setPlannerView={setPlannerView} />;
            }
        }
        content = plannerContent;
        break;
      case 'community':
          content = (
              <CommunityView
                  posts={posts}
                  currentUser={currentUser}
                  onOpenCreatePostModal={() => setShowCreatePostModal(true)}
                  onLikePost={handleLikePost}
                  onBookmarkPost={handleBookmarkPost}
                  onSharePost={setPostToShare}
                  hasAccessToPremium={hasAccess('premium')}
              />
          );
          break;
      case 'aiAssistant':
          if (!hasAccess('premium')) {
              content = (
                <SubscriptionRequiredOverlay
                    currentUser={currentUser}
                    onStartTrial={startTrial}
                    onSubscribe={subscribe}
                    onUpgradeDowngradeTier={upgradeDowngradeTier}
                    featureName={t('features.aiAssistant')}
                    requiredTier="premium"
                    onNavigateToProfile={() => handleTabChange('profile')}
                />
              );
          } else {
              content = (
                  <AIAssistantView 
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isGeneratingResponse={isGeneratingAiResponse}
                      error={chatError}
                  />
              );
          }
          break;
      case 'profile':
        if (!currentUser) {
            // This case should ideally not be reached due to the check in handleTabChange,
            // but as a fallback, show login.
            content = <div className="p-8 text-center">Please log in to view your profile.</div>;
        } else {
            content = (
                <ProfileView 
                    user={currentUser}
                    onUpdateUser={handleUpdateUser}
                    favoritePlaces={favoritePlaces}
                    savedTripPlans={savedTripPlans}
                    onViewSavedTripPlan={handleViewSavedTripPlan}
                    onDeleteSavedTripPlan={handleDeleteSavedTripPlan}
                    onShareTripPlanToCommunity={handleShareTripPlanToCommunity}
                    onStartTrial={startTrial}
                    onSubscribe={subscribe}
                    onCancelSubscription={cancelSubscription}
                    onUpgradeDowngradeTier={upgradeDowngradeTier}
                    onHomeCurrencyChange={handleHomeCurrencyChange}
                    onLanguageChange={handleLanguageChange}
                    onSelectedInterestsChange={handleSelectedInterestsChange}
                    emergencyContacts={emergencyContacts}
                    onAddEmergencyContact={handleAddEmergencyContact}
                    onDeleteEmergencyContact={handleDeleteEmergencyContact}
                    theme={theme}
                    setTheme={setTheme}
                />
            );
        }
        break;
      default:
        content = <div className="text-center p-8">Select a tab to get started.</div>;
    }
    return (
      <>
        <Header
          currentUser={currentUser}
          onShowAuthModal={handleShowAuthModal}
          onLogout={handleLogout}
          onNavigateToProfile={() => handleTabChange('profile')}
          onShowSOSModal={() => setShowSOSModal(true)}
          onNavigateToAdminPortal={currentUser?.isAdmin ? handleNavigateToAdminPortal : undefined}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isListening={isListening}
          onVoiceSearchClick={handleVoiceSearch}
        />
          <main ref={mainContentRef} className="pt-24 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8 flex-grow overflow-y-auto">
          {content}
          <div ref={footerSentinelRef} style={{ height: '1px' }}></div>
        </main>
        {isFooterVisible && <Footer />}
        <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />
      </>
    );
  }

  // Move useMemo hooks here, before any conditional returns
  const userReviewsForSelectedPlace = useMemo(() => {
    if (!selectedPlaceDetail) return [];
    return userReviews.filter(review => review.placeId === selectedPlaceDetail.id);
  }, [userReviews, selectedPlaceDetail]);

  // Only after all hooks:
  if (locationStatus === 'loading') {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /> <span className="ml-2">Detecting your location...</span></div>;
  }
  if (locationStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <LoadingSpinner />
        <span className="mt-2 text-red-600">Could not get your location. Showing default places for {DEFAULT_LOCATION.label}.</span>
        {userLocationError && <span className="text-xs text-gray-500 mt-1">{userLocationError}</span>}
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={loadUserLocation}
          disabled={isFetchingUserLocation}
        >
          {isFetchingUserLocation ? 'Retrying...' : 'Retry Location'}
        </button>
        {renderMainContent()}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} view={authModalView} onSwitchView={() => setAuthModalView(v => v === 'login' ? 'register' : 'login')} onLogin={handleLogin} onRegister={handleRegister} onGoogleLogin={handleGoogleLogin} isLoading={authLoading} error={authError} />}
      {selectedPlaceDetail && <PlaceDetailModal place={selectedPlaceDetail} onClose={() => setSelectedPlaceDetail(null)} onSelectRecommendedPlaceById={handleSelectPlaceByNameOrId} homeCurrency={currentUser?.homeCurrency} exchangeRates={exchangeRates} userReviews={userReviewsForSelectedPlace} onAddUserReview={handleAddUserReview} currentUser={currentUser} hasAccessToBasic={hasAccess('basic')} hasAccessToPremium={hasAccess('premium')} />}
      {showItineraryModal && <ItineraryModal isOpen={showItineraryModal} onClose={() => setShowItineraryModal(false)} itinerary={generatedItinerary} isLoading={isGeneratingItinerary} error={itineraryError} selectedPlaces={allPlaces.filter(p => selectedPlaceIdsForItinerary.includes(p.id))} onSaveItinerary={(it) => { if (it.id && !savedOneDayItineraries.some(i => i.id === it.id)) { setSavedOneDayItineraries(prev => [...prev, it]); addToast({ message: t('oneDayItineraryTab.itinerarySavedToast'), type: 'success' }); } else { addToast({ message: t('oneDayItineraryTab.planAlreadySavedInfo'), type: 'info' }); } }} savedOneDayItineraryIds={savedOneDayItineraries.map(i => i.id || '')} isPlanSavable={hasAccess('basic')} />}
      {showTripPlannerModal && <TripPlannerModal isOpen={showTripPlannerModal} onClose={() => setShowTripPlannerModal(false)} tripPlan={generatedTripPlan} isLoading={isGeneratingTripPlan} error={tripPlanError} destination={tripDestination} duration={tripDuration} onSaveTripPlan={handleSaveTripPlan} isPlanSavable={hasAccess('premium')} onShareToCommunity={handleShareTripPlanToCommunity} />}
      {showSurpriseModal && <SurpriseModal isOpen={showSurpriseModal} onClose={() => setShowSurpriseModal(false)} suggestion={surpriseSuggestion} isLoading={isLoadingSurprise} error={surpriseError} />}
      {showSOSModal && <SOSModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} userLocation={userLocation} isFetchingUserLocation={isFetchingUserLocation} userLocationError={userLocationError} emergencyContacts={emergencyContacts} onFetchNearbyHospitals={handleFetchNearbyHospitals} nearbyHospitals={nearbyHospitals} isLoadingHospitals={isLoadingHospitals} hospitalsError={hospitalsError} onCheckInSafe={handleCheckInSafe} />}
      {showPhotoUploadModal && <PhotoUploadModal isOpen={showPhotoUploadModal} onClose={() => setShowPhotoUploadModal(false)} onUpload={handleUploadPhoto} isLoading={isUploadingPhoto} error={uploadPhotoError} />}
      {showCreatePostModal && <CreatePostModal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} onSubmit={handleCreatePost} isLoading={isCreatingPost} allPlaces={allPlaces} />}
      {postToShare && <ShareModal post={postToShare} onClose={() => setPostToShare(null)} />}
      {showWelcomeWizard && currentUser && <WelcomeWizardModal user={currentUser} onComplete={handleWelcomeWizardComplete} onClose={() => setShowWelcomeWizard(false)} />}
      {showCurrencyConverter && <CurrencyConverterModal isOpen={showCurrencyConverter} onClose={() => setShowCurrencyConverter(false)} baseCurrency={currentUser?.homeCurrency || 'USD'} exchangeRates={exchangeRates} />}
      {featureDiscoveryState.isOpen && userLocation && (
          <FeatureDiscoveryModal 
              isOpen={featureDiscoveryState.isOpen}
              onClose={() => setFeatureDiscoveryState({isOpen: false, title: '', query: ''})}
              title={featureDiscoveryState.title}
              query={featureDiscoveryState.query}
              userLocation={userLocation}
              onSelectPlaceDetail={handleSelectPlaceDetail}
          />
      )}
      {showLostAndFoundModal && (
          <LostAndFoundModal
              isOpen={showLostAndFoundModal}
              onClose={() => setShowLostAndFoundModal(false)}
              userCity={userCity || "your current city"}
          />
      )}
      {showFlightHelpModal && (
          <FlightHelpModal
              isOpen={showFlightHelpModal}
              onClose={() => setShowFlightHelpModal(false)}
          />
      )}
      {renderMainContent()}
    </div>
  );
}