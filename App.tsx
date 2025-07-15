

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Place, Deal, TripPlanSuggestion, TripPace, TravelStyle, BudgetLevel, PlaceSummary, SurpriseSuggestion, EmergencyContact, HospitalInfo, CurrentUser, SubscriptionStatus, SubscriptionTier, ExchangeRatesResponse, ExchangeRates, UserInterest, CommunityPhoto, CommunityPhotoUploadData, ActiveTab, PortalView, PlaceExplorerView as PlaceExplorerViewType, ItinerarySuggestion, UserReview, CommunityPost, QuickTourPlan, SupportPoint, LocalInfo } from '@/types';
import { Colors, LOCAL_STORAGE_FAVORITE_PLACES_KEY, LOCAL_STORAGE_SAVED_TRIP_PLANS_KEY, LOCAL_STORAGE_SAVED_ONE_DAY_ITINERARIES_KEY, LOCAL_STORAGE_EMERGENCY_CONTACTS_KEY, LOCAL_STORAGE_CURRENT_USER_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SUBSCRIPTION_TIERS, LOCAL_STORAGE_USER_REVIEWS_KEY, LOCAL_STORAGE_COMMUNITY_POSTS_KEY } from '@/constants';
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
} from '@/services/geminiService';
import {
  fetchEnhancedNearbyPlaces,
  generateEnhancedTripPlan,
  generateSmartItinerary,
  generateEnhancedQuickTour,
  getPersonalizedRecommendations
} from '@/services/enhancedGeminiService';
import { fetchExchangeRates } from '@/services/exchangeRateService';
import PlaceCard from '@/components/PlaceCard';
import Header from '@/components/Header';
import ErrorDisplay from '@/components/ErrorDisplay';
import { PlaceDetailModal } from '@/components/PlaceDetailModal';
import TypeFilter from '@/components/TypeFilter';
import PlaceCardSkeleton from '@/components/PlaceCardSkeleton';
import { ItineraryModal } from '@/components/ItineraryModal';
import AuthModal from '@/components/AuthModal';
import UserProfile from '@/components/UserProfile';
import AccountSettingsPage from '@/components/AccountSettingsPage';
import DealCard from '@/components/DealCard';
import { TripPlannerModal } from '@/components/TripPlannerModal';
import SurpriseModal from '@/components/SurpriseModal';
import { SOSModal } from '@/components/SOSModal';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer'; 
import { getCurrentGeoLocation } from '@/utils/geolocation';
import SubscriptionRequiredOverlay from '@/components/SubscriptionRequiredOverlay';
import { useLanguage } from '@/contexts/LanguageContext'; 
import { useDebounce } from '@/hooks/useDebounce'; 
import LockIcon from '@/components/LockIcon';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import HomeView from '@/components/HomeView';
import { Footer } from '@/components/Footer';
import CommunityView from '@/components/CommunityView';
import CreatePostModal from '@/components/CreatePostModal';
import AdminPortal from '@/admin/AdminPortal';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import PlaceExplorerView from '@/components/PlaceExplorerView';
import AITripPlannerView from '@/components/AITripPlannerView';
import { EnhancedAITripPlanner } from '@/components/EnhancedAITripPlanner';

export const App: React.FC = () => {
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<Place | null>(null);
  
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearchInput = useDebounce(searchInput, 300);
  const [actualSearchTerm, setActualSearchTerm] = useState<string>('');

  const [selectedType, setSelectedType] = useState<string>('All');
  
  const { addToast, removeToast } = useToast(); 
  const { language, setLanguage, t } = useLanguage(); 

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
  
  const [currentAppView, setCurrentAppView] = useState<'places' | 'profile' | 'accountSettings'>('places'); 

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

  const [userReviews, setUserReviews] = useState<UserReview[]>(() => {
    const storedReviews = localStorage.getItem(LOCAL_STORAGE_USER_REVIEWS_KEY);
    return storedReviews ? JSON.parse(storedReviews) : [];
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const storedPosts = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_POSTS_KEY);
    return storedPosts ? JSON.parse(storedPosts) : [];
  });
  const [showCreatePostModal, setShowCreatePostModal] = useState<boolean>(false);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const [quickTourPlan, setQuickTourPlan] = useState<QuickTourPlan | null>(null);
  const [isGeneratingQuickTour, setIsGeneratingQuickTour] = useState<boolean>(false);
  const [quickTourError, setQuickTourError] = useState<string | null>(null);

  // New state for location-based homepage
  const [userCity, setUserCity] = useState<string | null>(null);
  const [supportLocations, setSupportLocations] = useState<SupportPoint[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo | null>(null);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState<boolean>(true);

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
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY_POSTS_KEY, JSON.stringify(communityPosts));
  }, [communityPosts]);


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

  const loadUserLocation = useCallback(async () => {
    setIsFetchingUserLocation(true); 
    setUserLocationError(null);
    try {
      const location = await getCurrentGeoLocation();
      setUserLocation(location);
    } catch (error) {
      if (error instanceof Error) {
        setUserLocationError(error.message);
        addToast({ message: t('sosModal.locationError', {error: error.message}), type: "warning", duration: 3000 });
      } else {
        setUserLocationError(t('sosModal.unknownLocationError'));
        addToast({ message: t('sosModal.unknownLocationError'), type: 'warning' });
      }
    } finally {
      setIsFetchingUserLocation(false);
    }
  }, [addToast, t]);

  useEffect(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  const loadPlaces = useCallback(async (searchQuery: string) => {
    setError(null);
    setIsLoading(true);
    try {
      addToast({ message: userLocation ? t('placeExplorer.fetchingNearby') : t('placeExplorer.fetchingDefault'), type: "info", duration: 1500 });
      
      const interestsToUse = searchQuery ? [] : (currentUser?.selectedInterests || []);
      
      // Use enhanced service for better AI-powered results
      const fetchedPlaces = await fetchEnhancedNearbyPlaces(userLocation?.latitude, userLocation?.longitude, interestsToUse);
      
      let placesToSet = fetchedPlaces;
      if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        placesToSet = fetchedPlaces.filter(place =>
          place.name.toLowerCase().includes(lowercasedQuery) ||
          place.type.toLowerCase().includes(lowercasedQuery) ||
          place.address.toLowerCase().includes(lowercasedQuery)
        );
      }
      setAllPlaces(placesToSet);
      addToast({ message: t('placeExplorer.placesLoadedSuccess'), type: "success", duration: 2000 });
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.fetchErrorDefault');
      setError(errorMessage);
      addToast({ message: t('placeExplorer.fetchErrorDetailed', {error: errorMessage}), type: 'error' });
      setAllPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, addToast, currentUser?.selectedInterests, t]);

  useEffect(() => {
    loadPlaces(actualSearchTerm);
  }, [actualSearchTerm, loadPlaces]);

  // New useEffect to fetch all home data
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
          setSupportLocations(supportResult);
          setLocalInfo(infoResult);
        } catch (err) {
          console.error("Failed to fetch homepage data:", err);
          if (err instanceof Error) {
            addToast({ message: `Could not load local information: ${err.message}`, type: 'warning' });
          }
          setUserCity(null);
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

  // Authentication Handlers
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
      const adminUser: CurrentUser = { username: 'Admin', email: 'admin@travelbuddy.app', isAdmin: true, subscriptionStatus: 'active', tier: 'pro', subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'USD', language: 'en', selectedInterests: [], };
      setCurrentUser(adminUser);
      setShowAuthModal(false);
      addToast({ message: t('authModal.welcomeUser', { username: 'Admin' }), type: 'success' });
    } else if (identifier && pass.length >= 6) {
      const user: CurrentUser = { username: identifier.includes('@') ? identifier.split('@')[0] : identifier, email: identifier.includes('@') ? identifier : `${identifier}@example.com`, isAdmin: false, subscriptionStatus: 'trial', tier: 'premium', trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'USD', language: 'en', selectedInterests: [UserInterest.Adventure, UserInterest.Foodie] };
      setCurrentUser(user);
      setShowAuthModal(false);
      addToast({ message: t('authModal.welcomeUser', { username: user.username }), type: 'success' });
    } else {
      setAuthError(pass.length < 6 ? t('authModal.mockPasswordLengthError') : t('authModal.usernameEmailEmpty'));
    }
    setAuthLoading(false);
  };
  
  const handleRegister = async (username: string, email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (username && email && pass) {
       const user: CurrentUser = { username, email, isAdmin: false, subscriptionStatus: 'trial', tier: 'premium', trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'USD', language: 'en', selectedInterests: [] };
      setCurrentUser(user);
      setShowAuthModal(false);
      addToast({ message: t('authModal.welcomeUser', { username }), type: 'success' });
    } else {
      setAuthError(t('authModal.allFieldsRequired'));
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    const user: CurrentUser = { username: 'Googler', email: 'googler@example.com', isAdmin: false, subscriptionStatus: 'active', tier: 'premium', subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), homeCurrency: 'USD', language: 'en', selectedInterests: [UserInterest.Adventure, UserInterest.Foodie] };
    setCurrentUser(user);
    setShowAuthModal(false);
    addToast({ message: t('authModal.signedInWithGoogle', { username: 'Googler' }), type: 'success' });
  };
  
  const handleLogout = () => {
    addToast({ message: t('authModal.goodbyeUser', { username: currentUser?.username || t('authModal.defaultUser') }), type: 'info' });
    setCurrentUser(null);
    setCurrentAppView('places');
    setActiveTab('forYou');
  };

  const handleNavigateToProfile = () => setCurrentAppView('profile');
  const handleNavigateToAccountSettings = () => setCurrentAppView('accountSettings');
  
  const handleTabChange = (tabName: ActiveTab) => {
    if (currentAppView !== 'places') {
        setCurrentAppView('places');
    }
    setActiveTab(tabName);
  };

  const handleSelectPlaceDetail = (place: Place) => {
    setSelectedPlaceDetail(place);
  };

  const handleSelectPlaceByNameOrId = (identifier: string, isId: boolean = false) => {
      const foundPlace = allPlaces.find(p => isId ? p.id === identifier : p.name === identifier);
      if (foundPlace) {
          setSelectedPlaceDetail(foundPlace);
      } else {
          addToast({ message: t('modals.couldNotFindDetails', {identifier}), type: 'error' });
      }
  };

  // Place/Itinerary Handlers
  const handleToggleFavorite = useCallback((placeId: string) => {
    if (!hasAccess('basic')) {
      addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.favorites') }), type: 'warning' });
      return;
    }
    const placeName = allPlaces.find(p => p.id === placeId)?.name || 'Place';
    setFavoritePlaceIds(prevIds => {
      if (prevIds.includes(placeId)) {
        addToast({ message: t('placeExplorer.removedFromFavorites', { placeName }), type: 'info' });
        return prevIds.filter(id => id !== placeId);
      } else {
        addToast({ message: t('placeExplorer.addedToFavorites', { placeName }), type: 'success' });
        return [...prevIds, placeId];
      }
    });
  }, [allPlaces, hasAccess, t, addToast]);
  
  const handleToggleSelectForItinerary = useCallback((placeId: string) => {
    if (!hasAccess('basic')) {
      addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.oneDayItineraryGeneration') }), type: 'warning' });
      return;
    }
    const placeName = allPlaces.find(p => p.id === placeId)?.name || 'Place';
    setSelectedPlaceIdsForItinerary(prevIds => {
      if (prevIds.includes(placeId)) {
        addToast({ message: t('placeExplorer.removedFromItinerary', { placeName }), type: 'info' });
        return prevIds.filter(id => id !== placeId);
      } else {
        addToast({ message: t('placeExplorer.addedToItinerary', { placeName }), type: 'success' });
        return [...prevIds, placeId];
      }
    });
  }, [allPlaces, hasAccess, addToast, t]);

  const handleClearItinerarySelection = () => {
    setSelectedPlaceIdsForItinerary([]);
    addToast({ message: t('placeExplorer.itinerarySelectionCleared'), type: 'info' });
  };

  const handleGenerateItinerary = useCallback(async () => {
    if (!hasAccess('basic')) {
        addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.oneDayItineraryGeneration') }), type: 'warning' });
        return;
    }
    const selectedPlaces = allPlaces.filter(p => selectedPlaceIdsForItinerary.includes(p.id));
    if (selectedPlaces.length < 2) {
      setItineraryError(t('placeExplorer.selectAtLeastTwoPlaces'));
      addToast({ message: t('placeExplorer.selectAtLeastTwoPlaces'), type: 'warning' });
      return;
    }
    setIsGeneratingItinerary(true);
    setItineraryError(null);
    setGeneratedItinerary(null);
    setShowItineraryModal(true);
    try {
      addToast({ message: t('placeExplorer.generatingOneDayItinerary'), type: 'info', duration: 3000 });
      const itinerary = await generateItineraryService(selectedPlaces);
      setGeneratedItinerary(itinerary);
      addToast({ message: t('placeExplorer.oneDayItineraryGenerated'), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.itineraryGenerationErrorUnknown');
      setItineraryError(errorMessage);
      addToast({ message: t('placeExplorer.itineraryGenerationFailed', {error: errorMessage}), type: 'error' });
    } finally {
      setIsGeneratingItinerary(false);
    }
  }, [allPlaces, selectedPlaceIdsForItinerary, addToast, t, hasAccess]);
  
  const handleSaveOneDayItinerary = (itinerary: ItinerarySuggestion) => {
    if (!hasAccess('basic')) {
        addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.oneDayItineraryGeneration') }), type: 'warning' });
        return;
    }
    if (!itinerary.id) {
        addToast({ message: t('modals.cannotSavePlanWithoutId'), type: 'error' });
        return;
    }
    if (savedOneDayItineraries.some(i => i.id === itinerary.id)) {
        addToast({ message: t('oneDayItineraryTab.planAlreadySavedInfo'), type: 'info' });
        return;
    }
    setSavedOneDayItineraries(prev => [...prev, itinerary]);
    addToast({ message: t('oneDayItineraryTab.itinerarySavedToast'), type: 'success' });
  };

  const handleDeleteOneDayItinerary = (itineraryId: string) => {
    setSavedOneDayItineraries(prev => prev.filter(i => i.id !== itineraryId));
    addToast({ message: t('oneDayItineraryTab.itineraryDeletedToast'), type: 'info' });
  };

  // Trip Plan Handlers
  const handleGenerateTripPlan = useCallback(async () => {
    if (!tripDestination || !tripDuration) {
      addToast({ message: t('aiTripPlannerTab.destinationDurationRequired'), type: 'warning' });
      return;
    }
    setIsGeneratingTripPlan(true);
    setTripPlanError(null);
    setGeneratedTripPlan(null);
    setShowTripPlannerModal(true);
    try {
      const plan = await generateComprehensiveTripPlan(tripDestination, tripDuration, tripInterests, tripPace, tripTravelStyles, tripBudget);
      setGeneratedTripPlan(plan);
      addToast({ message: t('modals.planGeneratedSuccess'), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('modals.errorUnknown');
      setTripPlanError(errorMessage);
      addToast({ message: t('aiTripPlannerTab.tripPlanningFailed', { error: errorMessage }), type: 'error' });
    } finally {
      setIsGeneratingTripPlan(false);
    }
  }, [tripDestination, tripDuration, tripInterests, tripPace, tripTravelStyles, tripBudget, addToast, t]);

  const handleSaveTripPlan = (plan: TripPlanSuggestion) => {
    if (!hasAccess('premium')) {
        addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.aiTripPlanner') }), type: 'warning' });
        return;
    }
    if (!plan.id) {
      addToast({ message: t('modals.cannotSavePlanWithoutId'), type: 'error' });
      return;
    }
    if (savedTripPlans.some(p => p.id === plan.id)) {
        addToast({ message: t('oneDayItineraryTab.planAlreadySavedInfo'), type: 'info' }); // Re-use translation
        return;
    }
    setSavedTripPlans(prev => [...prev, plan]);
    addToast({ message: t('modals.planSaved'), type: 'success' });
  };

  const handleViewSavedTripPlan = (plan: TripPlanSuggestion) => {
    setGeneratedTripPlan(plan);
    setShowTripPlannerModal(true);
  };
  
  const handleDeleteSavedTripPlan = (planId: string) => {
    setSavedTripPlans(prev => prev.filter(p => p.id !== planId));
    addToast({ message: t('modals.planDeleted'), type: 'info' });
  };
  
  const handleShareTripPlanToCommunity = (plan: TripPlanSuggestion) => {
    if (!currentUser || !hasAccess('premium')) return;
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      type: 'tripPlan',
      userId: currentUser.username,
      username: currentUser.username,
      timestamp: new Date().toISOString(),
      tripPlanId: plan.id,
      tripPlanSummary: {
        title: plan.tripTitle,
        destination: plan.destination,
        duration: plan.duration,
      },
      likes: 0,
      likedBy: [],
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    addToast({ message: t('communityTab.tripSharedSuccess'), type: 'success' });
    setShowTripPlannerModal(false);
    setActiveTab('community');
  };

  const handleAISearchResults = useCallback((places: Place[]) => {
    setAllPlaces(places);
    addToast({ message: `🤖 AI found ${places.length} places for you!`, type: 'success' });
  }, [addToast]);

  const handleSurpriseMe = useCallback(async () => {
    if (!hasAccess('premium')) {
      addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.surpriseMe') }), type: 'warning' });
      return;
    }
    setIsLoadingSurprise(true);
    setSurpriseError(null);
    setSurpriseSuggestion(null);
    setShowSurpriseModal(true);
    try {
      const suggestion = await generateSurpriseSuggestion();
      setSurpriseSuggestion(suggestion);
      addToast({ message: t('placeExplorer.surpriseFound'), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('placeExplorer.surpriseGenerationError');
      setSurpriseError(errorMessage);
      addToast({ message: t('placeExplorer.surpriseError', { error: errorMessage }), type: 'error' });
    } finally {
      setIsLoadingSurprise(false);
    }
  }, [hasAccess, addToast, t]);

  const handleFetchNearbyHospitals = useCallback(async () => {
    if (!userLocation) {
      addToast({ message: t('sosModal.locationNotAvailable'), type: 'warning' });
      return;
    }
    setIsLoadingHospitals(true);
    setHospitalsError(null);
    try {
      const hospitals = await fetchNearbyHospitals(userLocation.latitude, userLocation.longitude);
      setNearbyHospitals(hospitals);
      addToast({ message: t('sosModal.mockHospitalsFound', { count: hospitals.length.toString() }), type: 'success' });
    } catch (err: any) {
      const errorMessage = err.message || t('sosModal.hospitalSearchErrorUnknown');
      setHospitalsError(errorMessage);
      addToast({ message: t('sosModal.hospitalSearchError', { error: errorMessage }), type: 'error' });
    } finally {
      setIsLoadingHospitals(false);
    }
  }, [userLocation, addToast, t]);

  const handleGenerateQuickTour = useCallback(async () => {
    if (!hasAccess('premium')) {
        addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.quickTour') }), type: 'warning' });
        return;
    }
    setIsGeneratingQuickTour(true);
    setQuickTourError(null);
    setQuickTourPlan(null);
    addToast({ message: t('homeTab.generatingQuickTour'), type: 'info' });
    try {
        // Use enhanced service for better real place integration
        const tour = await generateEnhancedQuickTour(
            userLocation?.latitude, 
            userLocation?.longitude, 
            currentUser?.selectedInterests
        );
        setQuickTourPlan(tour);
        addToast({ message: t('homeTab.quickTourGenerated'), type: 'success' });
    } catch (err: any) {
        const errorMessage = err.message || t('homeTab.quickTourError');
        setQuickTourError(errorMessage);
        addToast({ message: `${t('modals.errorPrefix')} ${errorMessage}`, type: 'error' });
    } finally {
        setIsGeneratingQuickTour(false);
    }
}, [userLocation, currentUser, hasAccess, addToast, t]);


  // Account & Subscription Handlers
  const handleAddEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = { ...contact, id: `contact-${Date.now()}` };
    setEmergencyContacts(prev => [...prev, newContact]);
    addToast({ message: t('accountSettings.contactAdded', { name: contact.name }), type: 'success' });
  };
  
  const handleDeleteEmergencyContact = (contactId: string) => {
    const contactName = emergencyContacts.find(c => c.id === contactId)?.name || '';
    setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
    addToast({ message: t('accountSettings.contactRemoved', { name: contactName }), type: 'info' });
  };
  
  const handleStartTrial = (tier: SubscriptionTier) => {
    if (!currentUser || tier === 'free') return;
    setCurrentUser(prev => prev && {
        ...prev,
        tier,
        subscriptionStatus: 'trial',
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    addToast({ message: t('accountSettings.freeTrialStartedForTier', { tierName: t(`subscriptionTiers.${tier}.name`) }), type: 'success' });
  };
  
  const handleSubscribe = (tier: SubscriptionTier) => {
    if (!currentUser || tier === 'free') return;
    setCurrentUser(prev => prev && {
        ...prev,
        tier,
        subscriptionStatus: 'active',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndDate: undefined,
    });
    addToast({ message: t('accountSettings.subscriptionActivatedForTier', { tierName: t(`subscriptionTiers.${tier}.name`) }), type: 'success' });
  };
  
  const handleCancelSubscription = () => {
    if (!currentUser) return;
    setCurrentUser(prev => prev && { ...prev, subscriptionStatus: 'canceled' });
    addToast({ message: t('accountSettings.subscriptionCanceled'), type: 'info' });
  };
  
  const handleUpgradeDowngradeTier = (newTier: SubscriptionTier) => {
    if (!currentUser) return;
    handleSubscribe(newTier);
  };
  
  const handleHomeCurrencyChange = (newCurrency: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev && { ...prev, homeCurrency: newCurrency });
    addToast({ message: t('accountSettings.homeCurrencySet', { currency: newCurrency }), type: 'success' });
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev && { ...prev, language: newLanguage });
    setLanguage(newLanguage);
  };
  
  const handleSelectedInterestsChange = (interests: UserInterest[]) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev && { ...prev, selectedInterests: interests });
    addToast({ message: t('accountSettings.interestsUpdated'), type: 'success' });
  };

  const handleAddUserReview = (placeId: string, rating: number, text: string) => {
    if (!currentUser || !hasAccess('premium')) {
      addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', { featureName: t('features.userReviewsWrite') }), type: 'warning' });
      return;
    }
    const newReview: UserReview = {
        id: `review-${placeId}-${Date.now()}`,
        placeId,
        userId: currentUser.username,
        username: currentUser.username,
        rating,
        text,
        timestamp: new Date().toISOString(),
    };
    setUserReviews(prev => [newReview, ...prev]);
    // Also update the specific place's reviews
    setAllPlaces(prevPlaces => prevPlaces.map(p => {
        if (p.id === placeId) {
            const existingReviews = p.userReviews || [];
            const updatedReviews = [newReview, ...existingReviews];
            const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
            return {
                ...p,
                userReviews: updatedReviews,
                averageUserRating: totalRating / updatedReviews.length,
                totalUserReviews: updatedReviews.length,
            };
        }
        return p;
    }));
    addToast({ message: t('placeDetailModal.reviewSubmittedSuccess'), type: 'success' });
  };

  // Community Handlers
  const handleUploadPhoto = async (data: CommunityPhotoUploadData) => {
    if (!currentUser) return;
    setIsUploadingPhoto(true);
    setUploadPhotoError(null);
    try {
      await uploadCommunityPhoto(data, currentUser.username);
      addToast({ message: t('communityGallery.photoUploadedSuccess'), type: 'success' });
      setShowPhotoUploadModal(false);
      const updatedPhotos = await fetchCommunityPhotos(); // Re-fetch
      setCommunityPhotos(updatedPhotos);
    } catch (err: any) {
      setUploadPhotoError(err.message || t('communityGallery.errorUploadingPhoto'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) { addToast({ message: t('userProfile.loginRequiredToast', {featureName: "liking posts"}), type: 'warning' }); return; }
    if (!hasAccess('basic')) { addToast({ message: t('subscriptionOverlay.pleaseSubscribeToast', {featureName: "liking posts"}), type: 'warning' }); return; }

    setCommunityPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedBy.includes(currentUser.username);
          const newLikedBy = isLiked
            ? post.likedBy.filter(u => u !== currentUser.username)
            : [...post.likedBy, currentUser.username];
          return { ...post, likes: newLikedBy.length, likedBy: newLikedBy };
        }
        return post;
      })
    );
    addToast({ message: t('communityTab.postLikedSuccess'), type: 'success' });
  };

  const handleCreatePost = async (content: string, imageUrls?: string[], attachedPlaceIds?: string[], attachedDealIds?: string[]) => {
      if (!currentUser || !hasAccess('premium')) return;
      setIsCreatingPost(true);
      await new Promise(r => setTimeout(r, 1000)); // simulate network
      const newPost: CommunityPost = {
          id: `post-${Date.now()}`,
          type: 'text',
          userId: currentUser.username,
          username: currentUser.username,
          timestamp: new Date().toISOString(),
          content: content.trim() || undefined,
          imageUrls: imageUrls,
          attachedPlaceIds: attachedPlaceIds,
          attachedDealIds: attachedDealIds,
          likes: 0,
          likedBy: [],
      };
      setCommunityPosts(prev => [newPost, ...prev]);
      setIsCreatingPost(false);
      setShowCreatePostModal(false);
      addToast({message: t('communityTab.postCreatedSuccess'), type:'success'});
  };

  // Computed Values
  const uniqueTypes = useMemo(() => ['All', ...Array.from(new Set(allPlaces.map(p => p.type)))], [allPlaces]);
  
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(place => {
      const typeMatch = selectedType === 'All' || place.type === selectedType;
      const favoriteMatch = !showFavoritesOnly || favoritePlaceIds.includes(place.id);
      const openNowMatch = !showOpenOnly || place.opening_hours?.open_now === true;
      return typeMatch && favoriteMatch && openNowMatch;
    });
  }, [allPlaces, selectedType, showFavoritesOnly, favoritePlaceIds, showOpenOnly]);

  const placesWithDeals = useMemo(() => allPlaces.filter(p => p.deal), [allPlaces]);

  const renderPlacesContent = () => {
      switch(activeTab) {
          case 'forYou':
              return <HomeView
                          currentUser={currentUser}
                          userLocation={userLocation}
                          userCity={userCity}
                          supportLocations={supportLocations}
                          localInfo={localInfo}
                          isLoading={isLoadingHomeData || isFetchingUserLocation}
                          quickTourPlan={quickTourPlan}
                          isGeneratingQuickTour={isGeneratingQuickTour}
                          onShowSOSModal={() => setShowSOSModal(true)}
                          onNavigateToAccountSettings={handleNavigateToAccountSettings}
                          onLoginRequired={handleShowAuthModal}
                          onGenerateQuickTour={handleGenerateQuickTour}
                      />;
          case 'placeExplorer':
              return <PlaceExplorerView
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
                  onToggleFavoritePlace={handleToggleFavorite}
                  showFavoritesOnly={showFavoritesOnly}
                  onToggleShowFavorites={() => setShowFavoritesOnly(v => !v)}
                  showOpenOnly={showOpenOnly}
                  onToggleShowOpenOnly={() => setShowOpenOnly(v => !v)}
                  onSurpriseMeClick={handleSurpriseMe}
                  isLoadingSurprise={isLoadingSurprise}
                  userLocation={userLocation}
                  placeExplorerView={placeExplorerView}
                  onTogglePlaceExplorerView={() => setPlaceExplorerView(v => v === 'grid' ? 'map' : 'grid')}
                  placesWithDeals={placesWithDeals}
                  onSelectPlaceByNameOrId={handleSelectPlaceByNameOrId}
                  currentUserHomeCurrency={currentUser?.homeCurrency}
                  exchangeRates={exchangeRates}
                  hasAccessToBasic={hasAccess('basic')}
                  hasAccessToPremium={hasAccess('premium')}
                  onAISearchResults={handleAISearchResults}
              />;
          case 'deals':
              return (
                <div className="animate-fadeInUp">
                  <h2 className="text-2xl font-bold mb-6">{t('dealsTab.title')}</h2>
                  {placesWithDeals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {placesWithDeals.map(place => place.deal && (
                        <DealCard
                          key={`deal-tab-${place.id}`}
                          deal={place.deal}
                          onSelectPlace={() => handleSelectPlaceDetail(place)}
                          placePhotoUrl={place.photoUrl}
                          hasAccessToPremiumDeals={hasAccess('premium')}
                          homeCurrency={currentUser?.homeCurrency}
                          exchangeRates={exchangeRates}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8">{t('dealsTab.noDealsAvailable')}</p>
                  )}
                </div>
              );
          case 'nearbyItinerary':
              if (!hasAccess('basic')) return <SubscriptionRequiredOverlay currentUser={currentUser} requiredTier="basic" featureName={t('features.oneDayItineraryGeneration')} onNavigateToProfile={handleNavigateToProfile} onStartTrial={handleStartTrial} onSubscribe={handleSubscribe} onUpgradeDowngradeTier={handleUpgradeDowngradeTier} />;
              const selectedPlaces = allPlaces.filter(p => selectedPlaceIdsForItinerary.includes(p.id));
              return (
                <div className="animate-fadeInUp text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">{t('oneDayItineraryTab.title')}</h2>
                    <p className="mb-4 text-sm" style={{color: Colors.text_secondary}}>
                      {selectedPlaceIdsForItinerary.length > 0
                        ? t('oneDayItineraryTab.selectionInfo', {count: selectedPlaceIdsForItinerary.length.toString()})
                        : t('oneDayItineraryTab.instruction')}
                    </p>
                    {selectedPlaceIdsForItinerary.length >= 2 ? (
                      <button onClick={handleGenerateItinerary} style={{...primaryGradientButtonStyle, fontSize: '1rem', padding: '0.75rem 1.5rem'}}>{t('oneDayItineraryTab.generateButton')}</button>
                    ) : <p className="text-xs text-orange-500">{t('oneDayItineraryTab.addMorePlacesNote')}</p>}
                    {selectedPlaceIdsForItinerary.length > 0 && (
                      <button onClick={handleClearItinerarySelection} style={{...secondaryButtonStyle, marginTop: '1rem'}}>{t('oneDayItineraryTab.clearSelectionButton', {count: selectedPlaceIdsForItinerary.length.toString()})}</button>
                    )}
                </div>
              );
          case 'aiTripPlanner':
              if (!hasAccess('premium')) return <SubscriptionRequiredOverlay currentUser={currentUser} requiredTier="premium" featureName={t('features.aiTripPlanner')} onNavigateToProfile={handleNavigateToProfile} onStartTrial={handleStartTrial} onSubscribe={handleSubscribe} onUpgradeDowngradeTier={handleUpgradeDowngradeTier} />;
              return (
                  <EnhancedAITripPlanner
                    onTripGenerated={(trip) => {
                      setGeneratedTripPlan(trip);
                      setShowTripPlannerModal(true);
                    }}
                    userLocation={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined}
                  />
              );
          case 'community':
              if (!hasAccess('basic')) return <SubscriptionRequiredOverlay currentUser={currentUser} requiredTier="basic" featureName="Community Feed" onNavigateToProfile={handleNavigateToProfile} onStartTrial={handleStartTrial} onSubscribe={handleSubscribe} onUpgradeDowngradeTier={handleUpgradeDowngradeTier} />;
              return <CommunityView
                        posts={communityPosts}
                        currentUser={currentUser}
                        onOpenCreatePostModal={() => setShowCreatePostModal(true)}
                        onLikePost={handleLikePost}
                        onViewTripPlan={handleViewSavedTripPlan}
                        allTripPlans={savedTripPlans}
                        hasAccessToPremium={hasAccess('premium')}
                        allPlaces={allPlaces}
                        onViewPlaceDetail={handleSelectPlaceDetail}
                       />;
          default:
              return <p>Coming Soon</p>;
      }
  }

  const primaryGradientButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.625rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...primaryGradientButtonStyle,
    backgroundImage: 'none',
    backgroundColor: Colors.inputBackground,
    color: Colors.text_secondary,
    border: `1px solid ${Colors.cardBorder}`
  }


  return (
    <div className={`app-container ${portalView === 'adminPortal' ? 'admin-view' : ''}`} style={{ backgroundColor: Colors.background, color: Colors.text }}>
      {portalView === 'adminPortal' && currentUser?.isAdmin ? (
        <AdminPortal currentUser={currentUser} onExitAdminPortal={() => setPortalView('userApp')} />
      ) : (
        <>
          <Header
            currentUser={currentUser}
            onShowAuthModal={handleShowAuthModal}
            onLogout={handleLogout}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToAccountSettings={handleNavigateToAccountSettings}
            onShowSOSModal={() => setShowSOSModal(true)}
            onNavigateToAdminPortal={currentUser?.isAdmin ? () => setPortalView('adminPortal') : undefined}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          <main ref={mainContentRef} className="main-content">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 pb-24"> 
              {currentAppView === 'places' && renderPlacesContent()}
              {currentAppView === 'profile' && currentUser && (
                <UserProfile
                  user={currentUser}
                  onNavigateToPlaces={() => setCurrentAppView('places')}
                  onNavigateToAccountSettings={handleNavigateToAccountSettings}
                  favoritePlacesCount={favoritePlaceIds.length}
                  savedTripPlans={savedTripPlans}
                  onViewSavedTripPlan={handleViewSavedTripPlan}
                  onDeleteSavedTripPlan={handleDeleteSavedTripPlan}
                  onStartTrial={handleStartTrial}
                  onSubscribe={handleSubscribe}
                  onCancelSubscription={handleCancelSubscription}
                  onUpgradeDowngradeTier={handleUpgradeDowngradeTier}
                />
              )}
              {currentAppView === 'accountSettings' && currentUser && (
                 <AccountSettingsPage
                    user={currentUser}
                    onNavigateToProfile={handleNavigateToProfile}
                    emergencyContacts={emergencyContacts}
                    onAddEmergencyContact={handleAddEmergencyContact}
                    onDeleteEmergencyContact={handleDeleteEmergencyContact}
                    onStartTrial={handleStartTrial}
                    onSubscribe={handleSubscribe}
                    onCancelSubscription={handleCancelSubscription}
                    onHomeCurrencyChange={handleHomeCurrencyChange}
                    onLanguageChange={handleLanguageChange}
                    onUpgradeDowngradeTier={handleUpgradeDowngradeTier}
                    onSelectedInterestsChange={handleSelectedInterestsChange}
                  />
              )}
            </div>
            <div ref={footerSentinelRef} />
          </main>
          
          <Footer />
          
          {portalView === 'userApp' && <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />}

          {selectedPlaceDetail && (
            <PlaceDetailModal 
                place={selectedPlaceDetail} 
                onClose={() => setSelectedPlaceDetail(null)} 
                onSelectRecommendedPlaceById={handleSelectPlaceByNameOrId}
                homeCurrency={currentUser?.homeCurrency}
                exchangeRates={exchangeRates}
                userReviews={userReviews.filter(r => r.placeId === selectedPlaceDetail.id)}
                onAddUserReview={handleAddUserReview}
                currentUser={currentUser}
                hasAccessToBasic={hasAccess('basic')}
                hasAccessToPremium={hasAccess('premium')}
            />
          )}

          {showItineraryModal && (
            <ItineraryModal 
                isOpen={showItineraryModal} 
                onClose={() => setShowItineraryModal(false)}
                itinerary={generatedItinerary}
                isLoading={isGeneratingItinerary}
                error={itineraryError}
                selectedPlaces={allPlaces.filter(p => selectedPlaceIdsForItinerary.includes(p.id))}
                onSaveItinerary={handleSaveOneDayItinerary}
                savedOneDayItineraryIds={savedOneDayItineraries.map(i => i.id || '')}
                isPlanSavable={hasAccess('basic')}
            />
          )}
          
          {showTripPlannerModal && (
              <TripPlannerModal 
                  isOpen={showTripPlannerModal}
                  onClose={() => setShowTripPlannerModal(false)}
                  tripPlan={generatedTripPlan}
                  isLoading={isGeneratingTripPlan}
                  error={tripPlanError}
                  destination={tripDestination}
                  duration={tripDuration}
                  onSaveTripPlan={handleSaveTripPlan}
                  isPlanSavable={hasAccess('premium')}
                  onShareToCommunity={hasAccess('premium') ? handleShareTripPlanToCommunity : undefined}
              />
          )}
          
          {showSurpriseModal && (
              <SurpriseModal 
                  isOpen={showSurpriseModal}
                  onClose={() => setShowSurpriseModal(false)}
                  suggestion={surpriseSuggestion}
                  isLoading={isLoadingSurprise}
                  error={surpriseError}
              />
          )}

          {showSOSModal && (
            <SOSModal
              isOpen={showSOSModal}
              onClose={() => setShowSOSModal(false)}
              userLocation={userLocation}
              isFetchingUserLocation={isFetchingUserLocation}
              userLocationError={userLocationError}
              emergencyContacts={emergencyContacts}
              onFetchNearbyHospitals={handleFetchNearbyHospitals}
              nearbyHospitals={nearbyHospitals}
              isLoadingHospitals={isLoadingHospitals}
              hospitalsError={hospitalsError}
            />
          )}

          {showPhotoUploadModal && (
              <PhotoUploadModal
                  isOpen={showPhotoUploadModal}
                  onClose={() => setShowPhotoUploadModal(false)}
                  onUpload={handleUploadPhoto}
                  isLoading={isUploadingPhoto}
                  error={uploadPhotoError}
              />
          )}

          {showCreatePostModal && (
            <CreatePostModal
              isOpen={showCreatePostModal}
              onClose={() => setShowCreatePostModal(false)}
              onSubmit={handleCreatePost}
              isLoading={isCreatingPost}
              allPlaces={allPlaces}
            />
          )}
        </>
      )}
      
      <ToastContainer />

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          view={authModalView}
          onSwitchView={() => setAuthModalView(v => v === 'login' ? 'register' : 'login')}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onGoogleLogin={handleGoogleLogin}
          isLoading={authLoading}
          error={authError}
        />
      )}
    </div>
  );
};
