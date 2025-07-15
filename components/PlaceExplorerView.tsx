
import React from 'react';
import { Place, ExchangeRates } from '@/types';
import { Colors } from '@/constants';
import PlaceCard from '@/components/PlaceCard';
import DealCard from '@/components/DealCard';
import ErrorDisplay from '@/components/ErrorDisplay';
import { AISearchBar } from '@/components/AISearchBar';
import TypeFilter from '@/components/TypeFilter';
import PlaceCardSkeleton from '@/components/PlaceCardSkeleton';
import { MapView } from '@/components/MapView'; 
import LockIcon from '@/components/LockIcon';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlaceExplorerViewProps {
  uniqueTypes: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
  filteredPlaces: Place[];
  isLoading: boolean;
  error: string | null;
  onRetryLoadPlaces: () => void;
  onSelectPlaceDetail: (place: Place) => void;
  selectedPlaceIdsForItinerary: string[];
  onToggleSelectForItinerary: (placeId: string) => void;
  favoritePlaceIds: string[];
  onToggleFavoritePlace: (placeId: string) => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
  showOpenOnly: boolean;
  onToggleShowOpenOnly: () => void;
  onSurpriseMeClick: () => void;
  isLoadingSurprise: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  placeExplorerView: 'grid' | 'map';
  onTogglePlaceExplorerView: () => void;
  placesWithDeals: Place[];
  onSelectPlaceByNameOrId: (identifier: string, isId?: boolean) => void;
  currentUserHomeCurrency?: string;
  exchangeRates?: ExchangeRates | null;
  hasAccessToBasic: boolean;
  hasAccessToPremium: boolean;
  onAISearchResults: (places: Place[]) => void;
}

const PlaceExplorerView: React.FC<PlaceExplorerViewProps> = ({
  uniqueTypes,
  selectedType,
  onSelectType,
  filteredPlaces,
  isLoading,
  error,
  onRetryLoadPlaces,
  onSelectPlaceDetail,
  selectedPlaceIdsForItinerary,
  onToggleSelectForItinerary,
  favoritePlaceIds,
  onToggleFavoritePlace,
  showFavoritesOnly,
  onToggleShowFavorites,
  showOpenOnly,
  onToggleShowOpenOnly,
  onSurpriseMeClick,
  isLoadingSurprise,
  userLocation,
  placeExplorerView,
  onTogglePlaceExplorerView,
  placesWithDeals,
  onSelectPlaceByNameOrId,
  currentUserHomeCurrency,
  exchangeRates,
  hasAccessToBasic,
  hasAccessToPremium,
  onAISearchResults,
}) => {
  const { t } = useLanguage();

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => <PlaceCardSkeleton key={index} />)}
    </div>
  );

  const commonViewToggleButtonStyles = "px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-95 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center gap-2";

  return (
    <>
      {/* AI-Powered Search Bar */}
      <div className="mb-8">
        <AISearchBar 
          onPlacesFound={onAISearchResults}
          userLocation={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined}
          placeholder="🤖 Ask AI: 'Find romantic restaurants' or 'Best photo spots near me'"
        />
      </div>

      <div className="mb-6 md:flex md:items-center md:justify-between gap-4">
        {uniqueTypes.length > 1 && (
           <TypeFilter types={uniqueTypes} selectedType={selectedType} onSelectType={(type) => { onSelectType(type); /* Toast handled in App.tsx */ }} />
        )}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 md:ml-auto items-center">
          <label className="flex items-center cursor-pointer select-none" style={{color: Colors.text}}>
            <span className="text-sm font-semibold mr-2">{t('placeExplorer.openNowFilter')}</span>
            <div className="relative">
              <input type="checkbox" checked={showOpenOnly} onChange={onToggleShowOpenOnly} className="sr-only" />
              <div className={`block w-12 h-6 rounded-full transition-colors`} style={{backgroundColor: showOpenOnly ? Colors.primary : Colors.inputBackground, border: `1px solid ${Colors.cardBorder}`}}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform` } style={{transform: showOpenOnly ? 'translateX(1.5rem)' : 'translateX(0)'}}></div>
            </div>
          </label>
          <button 
            onClick={onTogglePlaceExplorerView}
            className={commonViewToggleButtonStyles}
            style={{ 
                color: Colors.text, 
                backgroundColor: Colors.cardBackground, 
                boxShadow: Colors.boxShadow, 
                borderColor: Colors.primary,
            }}
            aria-label={placeExplorerView === 'grid' ? t('placeExplorer.mapView') : t('placeExplorer.gridView')}
          >
            {placeExplorerView === 'grid' ? (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {t('placeExplorer.mapView')}</>
            ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                {t('placeExplorer.gridView')}</>
            )}
          </button>
          <button
              onClick={onToggleShowFavorites}
              disabled={!hasAccessToBasic && !showFavoritesOnly} 
              className={`${commonViewToggleButtonStyles} disabled:opacity-60 disabled:cursor-not-allowed relative`}
              style={{ color: showFavoritesOnly ? Colors.cardBackground : Colors.text, backgroundColor: Colors.cardBackground, backgroundImage: showFavoritesOnly ? `linear-gradient(to right, ${Colors.primaryGradientEnd}, ${Colors.primary})` : undefined, boxShadow: Colors.boxShadow, border: showFavoritesOnly ? `1px solid ${Colors.primaryGradientEnd}` : `1px solid ${Colors.background}`, borderColor: showFavoritesOnly ? Colors.primaryGradientEnd : Colors.primary }}
            >
              {!hasAccessToBasic && !showFavoritesOnly && <LockIcon className="w-3.5 h-3.5 mr-1.5 absolute -left-1 -top-1" color={Colors.lock} />}
              {showFavoritesOnly ? t('placeExplorer.showAll') : t('placeExplorer.favorites', {count: favoritePlaceIds.length.toString()})}
          </button>
        </div>
      </div>

      <div className="mb-6 text-center">
        <button
          onClick={onSurpriseMeClick}
          disabled={isLoadingSurprise || !hasAccessToPremium}
          className="px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-70 disabled:opacity-70 flex items-center justify-center mx-auto relative"
          style={{ 
            color: 'white', 
            backgroundImage: `linear-gradient(145deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`, 
            boxShadow: Colors.boxShadowButton,
            borderColor: Colors.primary,
          }}
        >
          {!hasAccessToPremium && <LockIcon className="w-5 h-5 mr-2" />}
          {isLoadingSurprise ? t('placeExplorer.surpriseMeLoading') : t('placeExplorer.surpriseMe')}
        </button>
      </div>

      {placesWithDeals.length > 0 && !isLoading && !error && placeExplorerView === 'grid' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{color: Colors.text}}>{t('placeExplorer.hotNearbyDeals')}</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" 
               style={{WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {placesWithDeals.map(place => place.deal && (
              <div key={`deal-${place.id}`} className="min-w-[280px] sm:min-w-[300px] lg:min-w-[320px] flex-shrink-0">
                <DealCard 
                  deal={place.deal} 
                  onSelectPlace={() => onSelectPlaceByNameOrId(place.deal!.placeName, false)}
                  isTripDeal={selectedPlaceIdsForItinerary.includes(place.id)}
                  homeCurrency={currentUserHomeCurrency}
                  exchangeRates={exchangeRates}
                  placePhotoUrl={place.photoUrl}
                  hasAccessToPremiumDeals={hasAccessToPremium}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <ErrorDisplay message={error} onRetry={onRetryLoadPlaces} />}
      {!error && isLoading && (placeExplorerView === 'grid' ? renderSkeletons() : <div className="h-96 flex items-center justify-center" style={{backgroundColor: Colors.inputBackground, boxShadow: 'none'}}><p style={{color: Colors.text_secondary}}>{t('placeExplorer.loadingMapData')}</p></div>)}
      
      {!error && !isLoading && (
        placeExplorerView === 'map' ? (
          <div className="h-[60vh] md:h-[70vh] w-full mb-6">
            <MapView places={filteredPlaces} onSelectPlaceDetail={onSelectPlaceDetail} userLocation={userLocation} />
          </div>
        ) : (
          filteredPlaces.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-2xl" style={{backgroundColor: Colors.cardBackground, boxShadow: Colors.boxShadow}}>
              <svg className="mx-auto h-16 w-16 mb-4" style={{color: Colors.text_secondary}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xl font-semibold mb-2" style={{color: Colors.text}}>{showFavoritesOnly ? (favoritePlaceIds.length === 0 ? t('placeExplorer.noFavoritesYet') : t('placeExplorer.noMatchingFavorites')) : (filteredPlaces.length === 0 && !isLoading ? t('placeExplorer.aiFetchingPlaces') : t('placeExplorer.noPlacesMatchSearch'))}</p>
              <p className="text-md" style={{color: Colors.text_secondary}}>{showFavoritesOnly ? (favoritePlaceIds.length === 0 ? t('placeExplorer.exploreAndSaveFavorites') : t('placeExplorer.tryAdjustingFilters')) : (filteredPlaces.length === 0 && !isLoading ? t('placeExplorer.aiFetchingPlaces') : t('placeExplorer.tryDifferentSearch'))}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
              {filteredPlaces.map((place, index) => (
                <PlaceCard key={place.id} place={place} onSelectPlaceDetail={onSelectPlaceDetail} style={{ animationDelay: `${index * 80}ms` }} isSelectedForItinerary={selectedPlaceIdsForItinerary.includes(place.id)} onToggleSelectForItinerary={onToggleSelectForItinerary} isFavorite={favoritePlaceIds.includes(place.id)} onToggleFavorite={onToggleFavoritePlace} hasAccessToBasic={hasAccessToBasic} />
              ))}
            </div>
          )
        )
      )}
    </>
  );
};

export default PlaceExplorerView;
