// Enhanced Google Maps service with real API integration

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const generateGoogleMapsLink = (placeNames: string[]): string => {
  if (placeNames.length === 0) return '';
  
  // For a single place, create a simple search link
  if (placeNames.length === 1) {
    const encodedPlace = encodeURIComponent(placeNames[0]);
    return `https://www.google.com/maps/search/${encodedPlace}`;
  }
  
  // For multiple places, create a directions link with waypoints
  const origin = encodeURIComponent(placeNames[0]);
  const destination = encodeURIComponent(placeNames[placeNames.length - 1]);
  
  let waypointsParam = '';
  if (placeNames.length > 2) {
    const waypoints = placeNames.slice(1, -1).map(name => encodeURIComponent(name)).join('|');
    waypointsParam = `&waypoints=${waypoints}`;
  }
  
  return `https://www.google.com/maps/dir/${origin}/${destination}${waypointsParam}`;
};

export const generatePlaceSearchLink = (placeName: string): string => {
  const encodedPlace = encodeURIComponent(placeName);
  return `https://www.google.com/maps/search/${encodedPlace}`;
};

// New function to get directions URL
export const getDirectionsUrl = (destination: string, origin?: string): string => {
  const encodedDestination = encodeURIComponent(destination);
  if (origin) {
    const encodedOrigin = encodeURIComponent(origin);
    return `https://www.google.com/maps/dir/${encodedOrigin}/${encodedDestination}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;
};

// Function to check if Google Maps is loaded
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).google !== 'undefined' && 
         typeof (window as any).google.maps !== 'undefined';
};

// Function to wait for Google Maps to load
export const waitForGoogleMaps = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isGoogleMapsLoaded()) {
      resolve();
      return;
    }
    
    const checkInterval = setInterval(() => {
      if (isGoogleMapsLoaded()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
};