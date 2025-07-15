import React, { useState, useCallback } from 'react';
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';
import { searchPlaces } from '@/services/placesService';
import { Place } from '@/types';

interface AISearchBarProps {
  onPlacesFound: (places: Place[]) => void;
  userLocation?: { lat: number; lng: number };
  placeholder?: string;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({
  onPlacesFound,
  userLocation,
  placeholder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { t } = useLanguage();
  const { addToast } = useToast();

  const smartSuggestions = [
    'Best coffee shops near me',
    'Hidden gems for photography',
    'Family-friendly restaurants',
    'Romantic dinner spots',
    'Local art galleries',
    'Outdoor activities',
    'Historical landmarks',
    'Night markets',
    'Rooftop bars with views',
    'Authentic local cuisine'
  ];

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      addToast({ 
        message: `🤖 AI is searching for "${query}"...`, 
        type: 'info', 
        duration: 2000 
      });

      // Try Google Places first, fallback to Gemini-only if it fails
      let places: Place[] = [];
      try {
        places = await searchPlaces(query, userLocation);
      } catch (placesError) {
        console.warn('Google Places search failed, using AI-only search:', placesError);
        // Fallback to Gemini-only search by importing the original service
        const { fetchNearbyPlaces } = await import('@/services/geminiService');
        places = await fetchNearbyPlaces(userLocation?.lat, userLocation?.lng);
        // Filter results based on query
        const lowercaseQuery = query.toLowerCase();
        places = places.filter(place =>
          place.name.toLowerCase().includes(lowercaseQuery) ||
          place.type.toLowerCase().includes(lowercaseQuery) ||
          place.description.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      if (places.length > 0) {
        onPlacesFound(places);
        addToast({ 
          message: `🎯 Found ${places.length} places for "${query}"`, 
          type: 'success' 
        });
      } else {
        addToast({ 
          message: `No places found for "${query}". Try a different search.`, 
          type: 'warning' 
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      addToast({ 
        message: 'Search failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSearching(false);
    }
  }, [userLocation, onPlacesFound, addToast]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Show suggestions when user starts typing
    if (value.length > 2) {
      const filtered = smartSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    handleSearch(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    handleSearch(searchQuery);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || "🤖 Ask AI: 'Find romantic restaurants' or 'Best photo spots'"}
            disabled={isSearching}
            className="w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              backgroundColor: Colors.inputBackground,
              borderColor: Colors.cardBorder,
              color: Colors.text,
              fontSize: '1rem',
              focusRingColor: Colors.primary
            }}
            onFocus={() => {
              if (searchQuery.length <= 2) {
                setSuggestions(smartSuggestions.slice(0, 5));
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setSuggestions([]), 200);
            }}
          />
          
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: Colors.primary,
              color: 'white'
            }}
          >
            {isSearching ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* AI Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            backgroundColor: Colors.cardBackground,
            borderColor: Colors.cardBorder,
            boxShadow: Colors.boxShadow
          }}
        >
          <div className="p-2">
            <div className="text-xs font-semibold mb-2 px-2" style={{ color: Colors.text_secondary }}>
              🤖 AI Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
                style={{
                  color: Colors.text,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = Colors.inputBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔍</span>
                  <span className="text-sm">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {['Near me', 'Trending', 'Hidden gems', 'Photo spots'].map((chip) => (
          <button
            key={chip}
            onClick={() => handleSearch(chip)}
            disabled={isSearching}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: Colors.inputBackground,
              color: Colors.text_secondary,
              border: `1px solid ${Colors.cardBorder}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = Colors.primary;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = Colors.inputBackground;
              e.currentTarget.style.color = Colors.text_secondary;
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};