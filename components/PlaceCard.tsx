import React from 'react';
import { Place } from '../types.ts';
import { Colors } from '../constants.ts';
import LockIcon from './LockIcon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface PlaceCardProps {
  place: Place;
  onSelectPlaceDetail: (place: Place) => void;
  style?: React.CSSProperties;
  isSelectedForItinerary: boolean;
  onToggleSelectForItinerary: (placeId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  hasAccessToBasic: boolean;
  className?: string; 
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  onSelectPlaceDetail, 
  style,
  isSelectedForItinerary,
  onToggleSelectForItinerary,
  isFavorite,
  onToggleFavorite,
  hasAccessToBasic,
  className = ''
}) => {
  const { t } = useLanguage();
  
  const cardBorderStyle: React.CSSProperties = {
     border: `1px solid ${isSelectedForItinerary && hasAccessToBasic ? 'var(--color-primary)' : 'var(--color-glass-border)'}`,
     boxShadow: isSelectedForItinerary && hasAccessToBasic ? `0 0 12px var(--color-primary-light), var(--shadow-md)`: 'var(--shadow-md)',
  }

  // Prefer Google Place Photo if available
  let imageUrl = place.photoUrl || '/placeholder.jpg';
  let attribution: string | null = null;
  if (place.photos && Array.isArray(place.photos) && place.photos.length > 0 && place.photos[0].photo_reference) {
    // Use the correct env variable name for your API key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`;
    if (place.photos[0].html_attributions && place.photos[0].html_attributions.length > 0) {
      attribution = place.photos[0].html_attributions[0];
    }
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-md flex gap-4 p-4 mb-4 ${className}`}
      style={{...cardBorderStyle, ...style}}
      aria-labelledby={`place-name-${place.id}`}
    >
      <img
        src={imageUrl}
        alt={place.name}
        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
      />
      {attribution && (
        <div className="text-[10px] text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: attribution }} />
      )}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <h2 id={`place-name-${place.id}`} className="font-bold text-lg text-gray-900">{place.name}</h2>
          <span className="text-yellow-500 font-semibold flex items-center">★ {place.rating?.toFixed(1) || 'N/A'}</span>
          {place.user_ratings_total && (
            <span className="text-gray-500 text-sm">({place.user_ratings_total})</span>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {place.types && place.types[0]?.replace(/_/g, ' ')}
        </div>
        <div className="text-sm text-gray-700 mb-1">
          {place.vicinity || place.formatted_address}
        </div>
        <div className="text-xs mb-2">
          {place.opening_hours
            ? place.opening_hours.open_now
              ? <span className="text-green-600 font-semibold flex items-center">🟢 Open now</span>
              : <span className="text-red-600 font-semibold flex items-center">🔴 Closed</span>
            : null}
        </div>
        <div className="mt-auto flex gap-2">
          <button 
            onClick={() => onSelectPlaceDetail(place)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold shadow hover:bg-blue-700 transition-colors"
            aria-label={`${t('placeCard.viewDetailsButton')} for ${place.name}`}
          >
            {t('placeCard.viewDetailsButton')}
          </button>
          <button
            onClick={() => onToggleSelectForItinerary(place.id)}
            disabled={!hasAccessToBasic}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold border border-gray-300 disabled:opacity-70 disabled:cursor-not-allowed relative"
            aria-label={`${isSelectedForItinerary ? t('placeCard.selectedForItineraryButton') : t('placeCard.addToItineraryButton')} for ${place.name}`}
          >
            {!hasAccessToBasic && <LockIcon className="w-3.5 h-3.5 mr-1.5 absolute left-2 top-1/2 -translate-y-1/2" />}
            {isSelectedForItinerary ? t('placeCard.selectedForItineraryButton') : t('placeCard.addToItineraryButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;