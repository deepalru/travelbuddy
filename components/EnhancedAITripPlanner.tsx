import React, { useState, useCallback } from 'react';
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import { TripPlanSuggestion, TripPace, TravelStyle, BudgetLevel } from '@/types';
import { generateEnhancedTripPlan } from '@/services/enhancedGeminiService';
import { searchPlaces } from '@/services/placesService';

interface EnhancedAITripPlannerProps {
  onTripGenerated: (trip: TripPlanSuggestion) => void;
  userLocation?: { lat: number; lng: number };
}

export const EnhancedAITripPlanner: React.FC<EnhancedAITripPlannerProps> = ({
  onTripGenerated,
  userLocation
}) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [interests, setInterests] = useState('');
  const [pace, setPace] = useState<TripPace>(TripPace.Moderate);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [budget, setBudget] = useState<BudgetLevel>(BudgetLevel.MidRange);
  const [isGenerating, setIsGenerating] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { t } = useLanguage();
  const { addToast } = useToast();

  const popularDestinations = [
    'Tokyo, Japan', 'Paris, France', 'New York, USA', 'London, UK',
    'Rome, Italy', 'Barcelona, Spain', 'Bangkok, Thailand', 'Sydney, Australia',
    'Dubai, UAE', 'Singapore', 'Amsterdam, Netherlands', 'Prague, Czech Republic'
  ];

  const handleDestinationChange = useCallback(async (value: string) => {
    setDestination(value);
    
    if (value.length > 2) {
      // Get real place suggestions
      try {
        const places = await searchPlaces(value, userLocation);
        const suggestions = places
          .map(p => p.formatted_address || p.address)
          .filter(addr => addr.includes(','))
          .slice(0, 5);
        
        // Combine with popular destinations
        const filtered = popularDestinations
          .filter(dest => dest.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 3);
        
        setDestinationSuggestions([...new Set([...suggestions, ...filtered])]);
      } catch (error) {
        // Fallback to popular destinations only
        const filtered = popularDestinations
          .filter(dest => dest.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5);
        setDestinationSuggestions(filtered);
      }
    } else {
      setDestinationSuggestions([]);
    }
  }, [userLocation]);

  const handleTravelStyleToggle = (style: TravelStyle) => {
    setTravelStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleGenerateTrip = useCallback(async () => {
    if (!destination.trim() || !duration.trim()) {
      addToast({ 
        message: 'Please enter both destination and duration', 
        type: 'warning' 
      });
      return;
    }

    setIsGenerating(true);
    try {
      addToast({ 
        message: '🤖 AI is crafting your perfect trip...', 
        type: 'info', 
        duration: 3000 
      });

      const trip = await generateEnhancedTripPlan(
        destination,
        duration,
        interests,
        userLocation
      );

      // Add the selected preferences to the trip
      const enhancedTrip = {
        ...trip,
        pace,
        travelStyles,
        budgetLevel: budget
      };

      onTripGenerated(enhancedTrip);
      addToast({ 
        message: '✨ Your personalized trip is ready!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Trip generation error:', error);
      addToast({ 
        message: 'Failed to generate trip. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsGenerating(false);
    }
  }, [destination, duration, interests, pace, travelStyles, budget, userLocation, onTripGenerated, addToast]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
    border: `1px solid ${Colors.cardBorder}`,
    marginBottom: '1rem'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: Colors.primaryDark }}>
          🤖 AI Trip Planner
        </h1>
        <p className="text-lg" style={{ color: Colors.text_secondary }}>
          Powered by real Google Maps data and AI insights
        </p>
      </div>

      {/* Basic Information */}
      <div style={cardStyle}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: Colors.text_primary }}>
          ✈️ Trip Basics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: Colors.text }}>
              Where to?
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="e.g., Tokyo, Japan"
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: Colors.inputBackground,
                borderColor: Colors.cardBorder,
                color: Colors.text
              }}
            />
            
            {/* Destination Suggestions */}
            {destinationSuggestions.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-40 overflow-y-auto"
                style={{
                  backgroundColor: Colors.cardBackground,
                  borderColor: Colors.cardBorder
                }}
              >
                {destinationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDestination(suggestion);
                      setDestinationSuggestions([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-opacity-80 transition-all duration-200"
                    style={{ color: Colors.text }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = Colors.inputBackground;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    📍 {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: Colors.text }}>
              How long?
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 5 days, 1 week"
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: Colors.inputBackground,
                borderColor: Colors.cardBorder,
                color: Colors.text
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2" style={{ color: Colors.text }}>
            What interests you?
          </label>
          <textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., street food, ancient temples, modern art, nightlife, hiking..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: Colors.inputBackground,
              borderColor: Colors.cardBorder,
              color: Colors.text,
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Travel Preferences */}
      <div style={cardStyle}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: Colors.text_primary }}>
          🎯 Your Travel Style
        </h2>

        {/* Pace Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: Colors.text }}>
            Travel Pace
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.values(TripPace).map((paceOption) => (
              <button
                key={paceOption}
                onClick={() => setPace(paceOption)}
                className="p-3 rounded-lg border transition-all duration-200 text-left"
                style={{
                  backgroundColor: pace === paceOption ? Colors.primary : Colors.inputBackground,
                  borderColor: pace === paceOption ? Colors.primary : Colors.cardBorder,
                  color: pace === paceOption ? 'white' : Colors.text
                }}
              >
                <div className="font-medium">{paceOption}</div>
                <div className="text-xs mt-1 opacity-80">
                  {paceOption === TripPace.Relaxed && 'Take it easy, enjoy the moment'}
                  {paceOption === TripPace.Moderate && 'Balanced mix of activities'}
                  {paceOption === TripPace.FastPaced && 'See and do as much as possible'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Travel Styles */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3" style={{ color: Colors.text }}>
            Travel Styles (Select multiple)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(TravelStyle).map((style) => (
              <button
                key={style}
                onClick={() => handleTravelStyleToggle(style)}
                className="p-2 rounded-lg border transition-all duration-200 text-sm"
                style={{
                  backgroundColor: travelStyles.includes(style) ? Colors.primary : Colors.inputBackground,
                  borderColor: travelStyles.includes(style) ? Colors.primary : Colors.cardBorder,
                  color: travelStyles.includes(style) ? 'white' : Colors.text
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Level */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: Colors.text }}>
            Budget Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.values(BudgetLevel).map((budgetOption) => (
              <button
                key={budgetOption}
                onClick={() => setBudget(budgetOption)}
                className="p-3 rounded-lg border transition-all duration-200 text-left"
                style={{
                  backgroundColor: budget === budgetOption ? Colors.primary : Colors.inputBackground,
                  borderColor: budget === budgetOption ? Colors.primary : Colors.cardBorder,
                  color: budget === budgetOption ? 'white' : Colors.text
                }}
              >
                <div className="font-medium">{budgetOption}</div>
                <div className="text-xs mt-1 opacity-80">
                  {budgetOption === BudgetLevel.BudgetFriendly && 'Affordable options'}
                  {budgetOption === BudgetLevel.MidRange && 'Comfortable balance'}
                  {budgetOption === BudgetLevel.Luxury && 'Premium experiences'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateTrip}
          disabled={isGenerating || !destination.trim() || !duration.trim()}
          className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryDark})`,
            color: 'white',
            boxShadow: Colors.boxShadowButton
          }}
        >
          {isGenerating ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              🤖 AI is planning your adventure...
            </div>
          ) : (
            '✨ Generate My Perfect Trip'
          )}
        </button>
      </div>
    </div>
  );
};