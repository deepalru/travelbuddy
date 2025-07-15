

import React, { useEffect, useCallback, useState } from 'react';
import { TripPlanSuggestion, DailyTripPlan, ActivityDetail } from '@/types';
import { Colors } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/contexts/LanguageContext'; // Added useLanguage
import LockIcon from '@/components/LockIcon';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlanSuggestion | null;
  isLoading: boolean;
  error: string | null;
  destination: string;
  duration: string;
  onSaveTripPlan?: (plan: TripPlanSuggestion) => void;
  isPlanSavable?: boolean;
  onShareToCommunity?: (plan: TripPlanSuggestion) => void; // New prop
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  tripPlan,
  isLoading,
  error,
  destination,
  duration,
  onSaveTripPlan,
  isPlanSavable,
  onShareToCommunity, // New prop
}) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const [isPlanSavedInThisSession, setIsPlanSavedInThisSession] = useState<boolean>(false);
  const { addToast } = useToast();
  const { t } = useLanguage(); // Use language context


  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsPlanSavedInThisSession(false); 
    }
  }, [isOpen]);

  const handleCloseWithAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); 
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseWithAnimation();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleCloseWithAnimation]);

  const handleSavePlan = () => {
    if (tripPlan && onSaveTripPlan) {
      onSaveTripPlan(tripPlan);
      setIsPlanSavedInThisSession(true);
    }
  };

  const handleSharePlan = () => {
    if (tripPlan && onShareToCommunity) {
      onShareToCommunity(tripPlan);
      // Toast for sharing success will be handled in App.tsx
    }
  };
  
  const handleGetDirectionsForDay = (dayIndex: number) => {
    if (!tripPlan || !tripPlan.dailyPlans || dayIndex >= tripPlan.dailyPlans.length) {
      addToast({ message: "Day plan not available for directions.", type: "warning" });
      return;
    }
    const day = tripPlan.dailyPlans[dayIndex];
    if (!day.activities || day.activities.length === 0) {
      addToast({ message: `No activities with locations for Day ${day.day || dayIndex + 1}.`, type: "warning" });
      return;
    }

    const locations = day.activities
      .map(activity => activity.location)
      .filter(location => location && location.trim() !== "") as string[];

    if (locations.length === 0) {
      addToast({ message: `No valid locations found for Day ${day.day || dayIndex + 1}.`, type: "warning" });
      return;
    }
    if (locations.length === 1) {
      const dest = encodeURIComponent(locations[0]);
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
      addToast({ message: `Opening Google Maps for Day ${day.day || dayIndex + 1} location...`, type: "info" });
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const origin = encodeURIComponent(locations[0]);
    const destination = encodeURIComponent(locations[locations.length - 1]);
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    if (locations.length > 2) {
      const waypoints = locations.slice(1, -1).map(wp => encodeURIComponent(wp)).join('|');
      mapsUrl += `&waypoints=${waypoints}`;
    }
    
    addToast({ message: `Opening Google Maps for Day ${day.day || dayIndex + 1} directions...`, type: "info" });
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };


  if (!isOpen && !isVisible) {
    return null;
  }

  const renderActivity = (activity: ActivityDetail, index: number) => (
    <div 
      key={index} 
      className="mb-3 p-3 rounded-lg" 
      style={{
        border: `1px solid ${Colors.cardBorder}`, 
        backgroundColor: Colors.inputBackground, 
        boxShadow: Colors.boxShadowSoft,
      }}
    >
      <h5 className="font-semibold text-sm mb-0.5" style={{ color: Colors.primary }}> {/* Activity title to primary blue */}
        {activity.activityTitle}
      </h5>
      {activity.timeOfDay && <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{color: Colors.primaryGradientEnd}}>{activity.timeOfDay}</p>} {/* Time of day to darker blue */}
      <p className="text-xs mb-0.5" style={{color: Colors.text_secondary, lineHeight: 1.5}}>{activity.description}</p>
      {activity.estimatedDuration && <p className="text-xs italic" style={{color: Colors.text_secondary}}>Est. Duration: {activity.estimatedDuration}</p>}
      {activity.location && <p className="text-xs italic" style={{color: Colors.text_secondary}}>Location: {activity.location}</p>}
      {activity.notes && <p className="text-xs mt-1" style={{color: Colors.text_secondary}}><strong>Note:</strong> {activity.notes}</p>}
      {activity.bookingLink && 
        <a 
          href={activity.bookingLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs mt-1 inline-block font-semibold hover:underline"
          style={{color: Colors.primary}}
        >
          Booking/More Info (Mock)
        </a>
      }
    </div>
  );

  const renderDailyPlan = (dailyPlan: DailyTripPlan, index: number) => (
    <div key={index} className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-1.5 pb-1 border-b" style={{borderColor: `${Colors.primary}30`}}>
        <h4 className="text-lg font-semibold" style={{ color: Colors.primary }}>
          Day {dailyPlan.day}: {dailyPlan.title}
        </h4>
        {dailyPlan.activities && dailyPlan.activities.filter(a => a.location && a.location.trim() !== "").length > 0 && (
          <button
            onClick={() => handleGetDirectionsForDay(index)}
            className="text-xs px-2 py-1 font-semibold rounded-md transition-all duration-200 active:scale-95 focus:outline-none focus:ring-1 focus:ring-opacity-70"
            style={{ 
                backgroundImage: `linear-gradient(145deg, ${Colors.primary}CC, ${Colors.primaryGradientEnd}CC)`, // Directions button to blue gradient
                color: 'white',
                boxShadow: Colors.boxShadowSoft,
            }}
            aria-label={`Get directions for Day ${dailyPlan.day}`}
          >
            Directions for Day {dailyPlan.day}
          </button>
        )}
      </div>
      {dailyPlan.theme && <p className="italic text-sm mb-2.5" style={{color: Colors.primaryGradientEnd}}>{dailyPlan.theme}</p>} {/* Theme color to darker blue */}
      
      {dailyPlan.activities.map(renderActivity)}

      {dailyPlan.mealSuggestions && (
        <div className="mt-3 pt-2 border-t" style={{borderColor: `${Colors.cardBorder}`}}>
          <h5 className="font-semibold text-sm mb-0.5" style={{color: Colors.text}}>Meal Ideas:</h5>
          <ul className="list-disc list-inside text-xs space-y-0.5" style={{color: Colors.text_secondary}}>
            {dailyPlan.mealSuggestions.breakfast && <li><strong>Breakfast:</strong> {dailyPlan.mealSuggestions.breakfast}</li>}
            {dailyPlan.mealSuggestions.lunch && <li><strong>Lunch:</strong> {dailyPlan.mealSuggestions.lunch}</li>}
            {dailyPlan.mealSuggestions.dinner && <li><strong>Dinner:</strong> {dailyPlan.mealSuggestions.dinner}</li>}
          </ul>
        </div>
      )}
    </div>
  );
  
  const commonButtonStyles = "px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-70";

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-40 transition-opacity duration-300 ease-out
                  ${isVisible && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)' }}                  
      onClick={handleCloseWithAnimation}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-planner-modal-title"
    >
      <div
        className={`rounded-xl shadow-xl overflow-hidden w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col relative
                    transform transition-all duration-300 ease-out
                    ${isVisible && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{
          backgroundColor: Colors.cardBackground, // Changed from cardBackgroundGlass for solid white
          boxShadow: Colors.boxShadow
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b" style={{borderColor: Colors.cardBorder}}>
          <h2 id="trip-planner-modal-title" className="text-lg sm:text-xl font-semibold" style={{ color: Colors.text }}>
            {isLoading ? "Crafting Your Trip Plan..." : tripPlan?.tripTitle || `Your Trip to ${destination}`}
          </h2>
          <button
            onClick={handleCloseWithAnimation}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 ring-blue-500" // Ring color changed
            aria-label="Close trip planner modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div
                className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mb-3"
                style={{ borderColor: Colors.primaryGradientEnd, borderTopColor: Colors.primary }}
              ></div>
              <p className="text-md" style={{ color: Colors.text_secondary }}>AI is planning your adventure to {destination} ({duration})...</p>
            </div>
          )}

          {error && !isLoading && (
            <div
              className="p-3 my-1.5 rounded-lg text-sm text-center"
              style={{ backgroundColor: `${Colors.accentError}1A`, border: `1px solid ${Colors.accentError}50`, color: Colors.accentError }}
              role="alert"
            >
              <p className="font-semibold text-md mb-1">Trip Planning Failed</p>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && tripPlan && (
            <div className="prose prose-sm max-w-none" style={{color: Colors.text_secondary}}>
              {tripPlan.introduction && <p className="lead text-sm mb-4" style={{color: Colors.text, lineHeight: 1.6}}>{tripPlan.introduction}</p>}
              
              {tripPlan.dailyPlans?.map(renderDailyPlan)}

              {tripPlan.accommodationSuggestions && tripPlan.accommodationSuggestions.length > 0 && (
                <div className="mt-4 pt-3 border-t" style={{borderColor: Colors.cardBorder}}>
                    <h4 className="text-md font-semibold mb-1.5" style={{color: Colors.primary}}>Accommodation Ideas</h4>
                    <ul className="list-disc list-inside text-xs space-y-0.5">
                        {tripPlan.accommodationSuggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
                    </ul>
                </div>
              )}
              {tripPlan.transportationTips && tripPlan.transportationTips.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{borderColor: Colors.cardBorder}}>
                    <h4 className="text-md font-semibold mb-1.5" style={{color: Colors.primary}}>Transportation Tips</h4>
                    <ul className="list-disc list-inside text-xs space-y-0.5">
                        {tripPlan.transportationTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </div>
              )}
              {tripPlan.budgetConsiderations && (
                <div className="mt-3 pt-3 border-t" style={{borderColor: Colors.cardBorder}}>
                    <h4 className="text-md font-semibold mb-1.5" style={{color: Colors.primary}}>Budget Notes</h4>
                    <p className="text-xs">{tripPlan.budgetConsiderations}</p>
                </div>
              )}
              {tripPlan.packingTips && tripPlan.packingTips.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{borderColor: Colors.cardBorder}}>
                    <h4 className="text-md font-semibold mb-1.5" style={{color: Colors.primary}}>Packing List Ideas</h4>
                    <ul className="list-disc list-inside text-xs space-y-0.5">
                        {tripPlan.packingTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                    </ul>
                </div>
              )}
              {tripPlan.conclusion && <p className="mt-4 pt-3 border-t text-sm" style={{borderColor: Colors.cardBorder, color: Colors.text}}>{tripPlan.conclusion}</p>}
            </div>
          )}
           {!isLoading && !error && !tripPlan && (
             <div className="text-center py-8">
                <p className="text-md" style={{color: Colors.text_secondary}}>
                    Please fill in the destination and duration to generate your AI trip plan.
                </p>
             </div>
           )}
        </div>

        <div className="p-3 border-t flex flex-col sm:flex-row justify-end gap-2.5 items-center" style={{ backgroundColor: `${Colors.inputBackground}80`, borderColor: Colors.cardBorder }}>
          {onShareToCommunity && tripPlan && (
            <button
              onClick={handleSharePlan}
              className={`${commonButtonStyles} text-white w-full sm:w-auto hover:-translate-y-0.5 focus:ring-blue-400`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${Colors.accentInfo}, ${Colors.primary})`,
                boxShadow: Colors.boxShadowSoft,
              }}
              aria-label={t('communityTab.shareTripPlanButton')}
            >
              {t('communityTab.shareTripPlanButton')}
            </button>
          )}
          {onSaveTripPlan && tripPlan && (
             <button
                onClick={handleSavePlan}
                disabled={isPlanSavedInThisSession || !isPlanSavable}
                className={`${commonButtonStyles} text-white w-full sm:w-auto hover:-translate-y-0.5 focus:ring-green-500 disabled:opacity-70 flex items-center justify-center`}
                style={{ 
                    backgroundImage: `linear-gradient(135deg, ${Colors.accentSuccess}, ${Colors.secondary})`,
                    boxShadow: Colors.boxShadowSoft,
                }}
                aria-label="Save this trip plan"
            >
               {!isPlanSavable && <LockIcon className="w-4 h-4 mr-2" color="white" />}
               {isPlanSavedInThisSession ? "Plan Saved ✔" : "Save Trip Plan"}
            </button>
          )}
          <button
            onClick={handleCloseWithAnimation}
            className={`${commonButtonStyles} w-full sm:w-auto focus:ring-blue-500`}
            style={{
              backgroundColor: Colors.cardBackground,
              color: Colors.text_secondary,
              border: `1px solid ${Colors.cardBorder}`,
              boxShadow: Colors.boxShadowSoft,
            }}
            aria-label="Close trip planner"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// This TripPlanSuggestion type might be defined more globally if reused
// For now, it's specific to how TripPlannerModal expects AI output
// interface TripPlanSuggestion is in types.ts
