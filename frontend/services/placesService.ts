import { Place } from '../types.ts';

declare global {
  interface ImportMetaEnv {
    VITE_GOOGLE_PLACES_API_KEY: string;
  }
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}
// Use backend proxy for Google Places API
export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  keywords: string[],
  category?: string
): Promise<Partial<Place>[]> => {
  const keyword = keywords.join(' ').trim();
  let url = `http://localhost:3001/api/places?lat=${latitude}&lng=${longitude}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  // If backend returns an array, use it directly
  if (Array.isArray(data)) {
    return data.map((result: any) => ({
      place_id: result.place_id,
      name: result.name,
      formatted_address: result.vicinity,
      types: result.types,
      geometry: result.geometry,
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      business_status: result.business_status,
      additional_photos: result.photos,
      opening_hours: result.opening_hours,
    }));
  }
  // Fallback for old object format
  if (data.results) {
    return data.results.map((result: any) => ({
      place_id: result.place_id,
      name: result.name,
      formatted_address: result.vicinity,
      types: result.types,
      geometry: result.geometry,
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      business_status: result.business_status,
      additional_photos: result.photos,
      opening_hours: result.opening_hours,
    }));
  }
  return [];
};
