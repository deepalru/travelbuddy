
import React from 'react';
import { Place, ExchangeRates } from '../types.ts';
import { Colors } from '../constants.ts';
import DealCard from './DealCard.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface DealsViewProps {
  placesWithDeals: Place[];
  onSelectPlaceByNameOrId: (identifier: string, isId?: boolean) => void;
  currentUserHomeCurrency?: string;
  exchangeRates?: ExchangeRates | null;
  hasAccessToPremiumDeals: boolean;
}

const DealsView: React.FC<DealsViewProps> = ({
  placesWithDeals,
  onSelectPlaceByNameOrId,
  currentUserHomeCurrency,
  exchangeRates,
  hasAccessToPremiumDeals,
}) => {
  const { t } = useLanguage();

  return (
    <div className="animate-fadeInUp">
      <h1 className="text-3xl font-bold mb-6" style={{ color: Colors.text }}>
        {t('dealsTab.title')}
      </h1>
      
      {placesWithDeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {placesWithDeals.map(place => place.deal && (
            <DealCard
              key={`deal-page-${place.deal.id}`}
              deal={place.deal}
              onSelectPlace={() => onSelectPlaceByNameOrId(place.deal!.placeName, false)}
              homeCurrency={currentUserHomeCurrency}
              exchangeRates={exchangeRates}
              placePhotoUrl={place.photoUrl}
              hasAccessToPremiumDeals={hasAccessToPremiumDeals}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl" style={{ backgroundColor: Colors.cardBackground, boxShadow: Colors.boxShadow }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 mb-4" style={{ color: Colors.text_secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-semibold mb-2" style={{ color: Colors.text }}>
            {t('dealsTab.noDealsAvailable')}
          </p>
          <p className="text-md" style={{ color: Colors.text_secondary }}>
            {t('dealsTab.checkBackLater')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DealsView;
