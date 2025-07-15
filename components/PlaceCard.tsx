

import React from 'react';
import { Place } from '@/types';
import { Colors } from '@/constants';
import LockIcon from '@/components/LockIcon';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlaceCardProps {
  place: Place;
  onSelectPlaceDetail: (place: Place) => void;
  style?: React.CSSProperties;
  isSelectedForItinerary: boolean;
  onToggleSelectForItinerary: (placeId: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
  hasAccessToBasic: boolean;
  averageUserRating?: number;
  totalUserReviews?: number;
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
  averageUserRating,
  totalUserReviews,
  className = ''
}) => {
  const { t } = useLanguage();
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground, 
    borderRadius: '12px', 
    border: `1px solid ${isSelectedForItinerary && hasAccessToBasic ? Colors.primary : Colors.cardBorder}`,
    transition: 'all 0.3s ease-in-out',
    boxShadow: isSelectedForItinerary && hasAccessToBasic ? `0 0 12px ${Colors.primary}40, ${Colors.boxShadowSoft}`: Colors.boxShadow,
    ...style,
  };

  const primaryButtonStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
    boxShadow: Colors.boxShadowButton,
  };
  
  const secondaryButtonStyle: React.CSSProperties = {
    backgroundColor: Colors.inputBackground,
    border: `1px solid ${Colors.cardBorder}`,
    color: Colors.text_secondary, 
  };
  
  const activeSecondaryButtonStyle: React.CSSProperties = {
    backgroundColor: `${Colors.primary}20`,
    border: `1px solid ${Colors.primary}`,
    color: Colors.primary,
  };

  return (
    <div 
      className={`overflow-hidden flex flex-col group animate-fadeInUp hover:shadow-lg hover:-translate-y-1 relative rounded-xl ${className}`}
      style={cardStyle}
      aria-labelledby={`place-name-${place.id}`}
    >
      <div className="relative">
        <img 
          src={place.photoUrl || 'https://picsum.photos/300/200?blur=2'} 
          alt={place.name} 
          loading="lazy"
          className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105" 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/300/200?grayscale'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(place.id); }}
          disabled={!hasAccessToBasic}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed bg-white/80 hover:bg-white backdrop-blur-sm shadow-md`}
          style={{ color: isFavorite && hasAccessToBasic ? Colors.accentError : Colors.text_secondary }}
          aria-pressed={isFavorite && hasAccessToBasic}
          aria-label={isFavorite && hasAccessToBasic ? t('placeCard.removeFavoriteAria', {placeName: place.name}) : t('placeCard.addFavoriteAria', {placeName: place.name})}
        >
          {!hasAccessToBasic && <LockIcon className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color={Colors.lock} />}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isFavorite && hasAccessToBasic ? (
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            ) : (
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            )}
          </svg>
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow"> 
        <h3 id={`place-name-${place.id}`} className="text-lg font-bold mb-1 truncate" style={{ color: Colors.text }}>{place.name}</h3> 
        <p className="text-sm mb-1" style={{color: Colors.text_secondary}}> 
          <span className="font-semibold" style={{color: Colors.primary}}>{place.type}</span> - {place.address}
        </p>
        <p className="text-xs mb-2"> 
          {averageUserRating !== undefined && totalUserReviews !== undefined && totalUserReviews > 0 ? (
            <>
              <span style={{color: Colors.gold}}>{'★'.repeat(Math.round(averageUserRating))}</span>
              <span style={{color: '#E0E0E0'}}>{'★'.repeat(5 - Math.round(averageUserRating))}</span>
              <span className="ml-1" style={{color: Colors.text_secondary}}>
                ({averageUserRating.toFixed(1)})
                <span className="ml-1">({totalUserReviews} {t('placeCard.userReviewsCount', {count: (totalUserReviews || 0).toString()})})</span>
              </span>
            </>
          ) : (
            <>
              <span style={{color: Colors.gold}}>{'★'.repeat(Math.round(place.rating))}</span>
              <span style={{color: '#E0E0E0'}}>{'★'.repeat(5 - Math.round(place.rating))}</span>
              <span className="ml-1" style={{color: Colors.text_secondary}}>({place.rating.toFixed(1)}) (AI)</span>
            </>
          )}
        </p>
        <p className="text-sm mb-3 flex-grow" style={{ color: Colors.text_secondary, lineHeight: 1.5 }}>{place.description}</p> 
        
        <div className="mt-auto pt-3 border-t flex flex-col gap-2" style={{borderColor: Colors.cardBorder}}> 
           <button 
            onClick={() => onSelectPlaceDetail(place)}
            className="w-full font-semibold py-2 px-3 rounded-lg transition-all duration-200 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative text-sm hover:-translate-y-0.5"
            style={primaryButtonStyle}
            aria-label={`${t('placeCard.viewDetailsButton')} for ${place.name}`}
          >
            {t('placeCard.viewDetailsButton')}
          </button>
          <button
            onClick={() => onToggleSelectForItinerary(place.id)}
            disabled={!hasAccessToBasic}
            className="w-full font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed relative text-sm"
            style={isSelectedForItinerary && hasAccessToBasic ? activeSecondaryButtonStyle : secondaryButtonStyle}
            aria-pressed={isSelectedForItinerary && hasAccessToBasic}
            aria-label={isSelectedForItinerary && hasAccessToBasic ? `Remove ${place.name} from itinerary` : `Add ${place.name} to itinerary`}
          >
            {!hasAccessToBasic && <LockIcon className="w-3.5 h-3.5 mr-1.5 inline-block -ml-0.5" color={Colors.primary}/>} 
            {isSelectedForItinerary && hasAccessToBasic ? t('placeCard.selectedForItineraryButton') : t('placeCard.addToItineraryButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlaceCard);