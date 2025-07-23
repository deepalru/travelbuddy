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

  return (
    <div 
      className={`card-base overflow-hidden flex flex-col group animate-fadeInUp relative ${className}`}
      style={{...cardBorderStyle, ...style}}
      aria-labelledby={`place-name-${place.id}`}
    >
      <div className="relative">
        <div className="w-full h-44 overflow-hidden">
          <img 
            src={place.photoUrl || 'https://picsum.photos/300/200?blur=2'} 
            alt={place.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/300/200?grayscale'; }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(place.id); }}
          disabled={!hasAccessToBasic}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed bg-white/80 hover:bg-white backdrop-blur-sm shadow-md`}
          style={{ color: isFavorite && hasAccessToBasic ? 'var(--color-accent-danger)' : 'var(--color-text-secondary)' }}
          aria-pressed={isFavorite && hasAccessToBasic}
          aria-label={isFavorite && hasAccessToBasic ? t('placeCard.removeFavoriteAria', {placeName: place.name}) : t('placeCard.addFavoriteAria', {placeName: place.name})}
        >
          {!hasAccessToBasic && <LockIcon className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color={'var(--color-lock)'} />}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
            <h3 id={`place-name-${place.id}`} className="font-bold text-base leading-tight" style={{color: 'var(--color-text-primary)'}}>{place.name}</h3>
            <div className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full" style={{backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text-secondary)'}}>
                <span>★</span>
                <span>{place.rating.toFixed(1)}</span>
                <span className="text-xs font-medium" style={{color: 'var(--color-primary)'}}>{t('placeCard.aiEstRating')}</span>
            </div>
        </div>
        <p className="text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>{place.type}</p>
        
        <p className="text-xs flex-grow" style={{color: 'var(--color-text-secondary)', lineHeight: 1.6}}>
          {place.description.length > 80 ? `${place.description.substring(0, 80)}...` : place.description}
        </p>
        
        <div className="mt-auto pt-3 border-t flex flex-col gap-2" style={{borderColor: 'var(--color-glass-border)'}}>
           <button 
             onClick={() => onSelectPlaceDetail(place)}
             className="w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-all duration-300 active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500"
             style={{
                backgroundImage: 'var(--gradient-accent)',
                boxShadow: 'var(--shadow-glow)'
             }}
             aria-label={`${t('placeCard.viewDetailsButton')} for ${place.name}`}
            >
              {t('placeCard.viewDetailsButton')}
           </button>
           <button
             onClick={() => onToggleSelectForItinerary(place.id)}
             disabled={!hasAccessToBasic}
             className="w-full text-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 active:scale-98 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed relative"
             style={{
                backgroundColor: isSelectedForItinerary ? `${Colors.primary}2A` : 'var(--color-input-bg)',
                color: isSelectedForItinerary ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                border: `1px solid ${isSelectedForItinerary ? 'var(--color-primary)' : 'var(--color-glass-border)'}`
             }}
             aria-label={`${isSelectedForItinerary ? t('placeCard.selectedForItineraryButton') : t('placeCard.addToItineraryButton')} for ${place.name}`}
            >
             {!hasAccessToBasic && <LockIcon className="w-3.5 h-3.5 mr-1.5 absolute left-3 top-1/2 -translate-y-1/2" />}
             {isSelectedForItinerary ? t('placeCard.selectedForItineraryButton') : t('placeCard.addToItineraryButton')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;