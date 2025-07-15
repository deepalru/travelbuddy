import React from 'react';
import { QuickTourPlan } from '@/types';
import { Colors } from '@/constants';
import { generateGoogleMapsLink } from '@/services/maps';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickTourCardProps {
  tour: QuickTourPlan;
  onStartTour?: () => void;
}

export const QuickTourCard: React.FC<QuickTourCardProps> = ({ tour, onStartTour }) => {
  const { t } = useLanguage();

  const handleOpenInMaps = () => {
    const mapsUrl = generateGoogleMapsLink(tour.placeNamesForMap);
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="quick-tour-card animate-fadeInUp"
      style={{
        backgroundColor: Colors.cardBackground,
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: Colors.boxShadow,
        border: `1px solid ${Colors.cardBorder}`,
        marginBottom: '1rem'
      }}
    >
      <div className="tour-header" style={{ marginBottom: '1rem' }}>
        <h3 
          style={{ 
            color: Colors.text_primary, 
            fontSize: '1.25rem', 
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}
        >
          {tour.title}
        </h3>
        <div className="tour-meta" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span 
            style={{ 
              color: Colors.text_secondary, 
              fontSize: '0.875rem',
              backgroundColor: Colors.inputBackground,
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              border: `1px solid ${Colors.cardBorder}`
            }}
          >
            ⏱️ {tour.estimatedDuration}
          </span>
          <span 
            style={{ 
              color: Colors.text_secondary, 
              fontSize: '0.875rem',
              backgroundColor: Colors.inputBackground,
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              border: `1px solid ${Colors.cardBorder}`
            }}
          >
            💰 {tour.estimatedCost}
          </span>
        </div>
      </div>

      <div className="tour-stops" style={{ marginBottom: '1.5rem' }}>
        <h4 
          style={{ 
            color: Colors.text_primary, 
            fontSize: '1rem', 
            fontWeight: '600',
            marginBottom: '0.75rem'
          }}
        >
          {t('quickTour.stops')}:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tour.stops.map((stop, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: Colors.inputBackground,
                borderRadius: '0.75rem',
                border: `1px solid ${Colors.cardBorder}`
              }}
            >
              <div 
                style={{
                  backgroundColor: Colors.primary,
                  color: 'white',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}
              >
                {index + 1}
              </div>
              <div>
                <div 
                  style={{ 
                    color: Colors.text_primary, 
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem'
                  }}
                >
                  {stop.placeName}
                </div>
                <div 
                  style={{ 
                    color: Colors.text_secondary, 
                    fontSize: '0.8rem',
                    lineHeight: '1.4'
                  }}
                >
                  {stop.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tour-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleOpenInMaps}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: Colors.boxShadowButton,
            backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
            color: 'white',
            fontSize: '0.875rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          🗺️ {t('quickTour.openInMaps')}
        </button>
        
        {onStartTour && (
          <button
            onClick={onStartTour}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: `1px solid ${Colors.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: Colors.inputBackground,
              color: Colors.text_secondary,
              fontSize: '0.875rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = Colors.cardBackground;
              e.currentTarget.style.color = Colors.text_primary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = Colors.inputBackground;
              e.currentTarget.style.color = Colors.text_secondary;
            }}
          >
            🚀 {t('quickTour.startTour')}
          </button>
        )}
      </div>
    </div>
  );
};