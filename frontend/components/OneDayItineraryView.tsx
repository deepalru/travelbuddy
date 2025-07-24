
import React from 'react';
import { ItinerarySuggestion } from '../types.ts';
import { Colors } from '../constants.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface OneDayItineraryViewProps {
  selectedPlaceIdsForItinerary: string[];
  onGenerateItinerary: () => void;
  onClearSelection: () => void;
  savedItineraries: ItinerarySuggestion[];
  onViewSavedItinerary: (itinerary: ItinerarySuggestion) => void;
  onDeleteSavedItinerary: (itineraryId: string) => void;
  isPlanSavable: boolean;
}

const OneDayItineraryView: React.FC<OneDayItineraryViewProps> = ({
  selectedPlaceIdsForItinerary,
  onGenerateItinerary,
  onClearSelection,
  savedItineraries,
  onViewSavedItinerary,
  onDeleteSavedItinerary,
  isPlanSavable
}) => {
  const { t } = useLanguage();
  const selectedCount = selectedPlaceIdsForItinerary.length;
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground, 
    border: `1px solid ${Colors.cardBorder}`,
    borderRadius: '0.75rem', 
    padding: '1.5rem', 
    boxShadow: Colors.boxShadow, 
    marginBottom: '1.5rem',
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: '0.875rem 1.75rem', 
    borderRadius: '0.75rem', 
    fontWeight: '600', 
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
    fontSize: '1rem',
  };

  const secondaryButtonStyle: React.CSSProperties = { ...primaryButtonStyle, backgroundImage: 'none', backgroundColor: 'transparent', color: Colors.text_secondary, border: `1px solid ${Colors.cardBorder}`, boxShadow: 'none' };

  return (
    <div className="animate-fadeInUp max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: Colors.text }}>
        {t('oneDayItineraryTab.title')}
      </h1>
      
      <div style={cardStyle} className="text-center">
        {selectedCount > 0 ? (
          <p className="text-lg mb-4" style={{color: Colors.text_secondary}}>
            {t('oneDayItineraryTab.selectionInfo', {count: selectedCount.toString()})}
          </p>
        ) : (
          <p className="text-lg mb-4" style={{color: Colors.text_secondary}}>
            {t('oneDayItineraryTab.instruction')}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={onGenerateItinerary}
                disabled={selectedCount < 2}
                style={{...primaryButtonStyle, opacity: selectedCount < 2 ? 0.6 : 1}}
                className="disabled:cursor-not-allowed"
            >
                {t('oneDayItineraryTab.generateButton')}
            </button>
            {selectedCount > 0 && (
                <button onClick={onClearSelection} style={secondaryButtonStyle}>
                    {t('oneDayItineraryTab.clearSelectionButton', {count: selectedCount.toString()})}
                </button>
            )}
        </div>
         {selectedCount > 0 && selectedCount < 2 && (
            <p className="text-sm mt-3" style={{color: Colors.text_secondary}}>
                {t('oneDayItineraryTab.addMorePlacesNote')}
            </p>
        )}
      </div>

      <div style={{...cardStyle, marginTop: '2rem'}}>
        <h2 className="text-2xl font-bold mb-4" style={{color: Colors.text_primary, paddingBottom: '0.5rem', borderBottom: `1px solid ${Colors.cardBorder}`}}>
            {t('oneDayItineraryTab.mySavedOneDayItineraries')}
        </h2>
        {savedItineraries.length > 0 ? (
            <ul className="space-y-3">
                {savedItineraries.map(itinerary => (
                    <li key={itinerary.id} className="p-3 rounded-lg flex justify-between items-center" style={{backgroundColor: Colors.inputBackground}}>
                        <p className="font-semibold" style={{color: Colors.text}}>{itinerary.title}</p>
                        <div className="flex gap-2">
                            <button onClick={() => onViewSavedItinerary(itinerary)} className="text-xs px-3 py-1.5 rounded" style={{color:'white', backgroundColor: Colors.primary}}>{t('oneDayItineraryTab.viewOneDayItineraryButton')}</button>
                            <button onClick={() => itinerary.id && onDeleteSavedItinerary(itinerary.id)} className="text-xs px-3 py-1.5 rounded" style={{color: Colors.accentError, backgroundColor: `${Colors.accentError}20`}}>{t('oneDayItineraryTab.deleteOneDayItineraryButton')}</button>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center py-4" style={{color: Colors.text_secondary}}>{t('oneDayItineraryTab.noSavedOneDayItineraries')}</p>
        )}
      </div>
    </div>
  );
};

export default OneDayItineraryView;
