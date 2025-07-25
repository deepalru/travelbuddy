import React, { useState, useEffect } from 'react';
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

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Enhanced placeholder with place initials
  const getPlaceholderImage = () => {
    const initials = place.name 
      ? place.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'PL';
    
    return `data:image/svg+xml;base64,${btoa(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" /><stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad)"/><text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">${initials.substring(0, 2)}</text></svg>`)}`;
  };

  useEffect(() => {
    const finalImageUrl = place.photoUrl || getPlaceholderImage();
    setImageUrl(finalImageUrl);
    setImageLoading(false);
  }, [place.photoUrl, place.name]);

  return (
    <div 
      className={`bg-white rounded-xl shadow-md flex gap-4 p-4 mb-4 ${className}`}
      style={{...cardBorderStyle, ...style}}
      aria-labelledby={`place-name-${place.id}`}
    >
      <div className="relative w-24 h-24 flex-shrink-0">
        {!imageUrl || imageLoading ? (
          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderImage();
            }}
          />
        )}
      </div>
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