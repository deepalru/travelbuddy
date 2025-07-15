

import React, { useState } from 'react';
import { CurrentUser, SupportPoint, LocalInfo, SupportPointType, ActiveTab, QuickTourPlan } from '@/types';
import { Colors } from '@/constants';
import { MapView } from '@/components/MapView';
import { QuickTourCard } from '@/components/QuickTourCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/useToast';

interface HomeViewProps {
  currentUser: CurrentUser | null;
  userLocation: { latitude: number; longitude: number } | null;
  userCity: string | null;
  supportLocations: SupportPoint[];
  localInfo: LocalInfo | null;
  isLoading: boolean;
  quickTourPlan: QuickTourPlan | null;
  isGeneratingQuickTour: boolean;
  onShowSOSModal: () => void;
  onNavigateToAccountSettings: () => void;
  onLoginRequired: (view: 'login' | 'register') => void;
  onGenerateQuickTour: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  userLocation,
  userCity,
  supportLocations,
  localInfo,
  isLoading,
  quickTourPlan,
  isGeneratingQuickTour,
  onShowSOSModal,
  onGenerateQuickTour,
}) => {
  const { t } = useLanguage();
  const [mapFilters, setMapFilters] = useState<SupportPointType[]>(['hospital', 'police', 'embassy']);

  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1.25rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };
  
  const sectionHeadingStyle: React.CSSProperties = {
    color: Colors.text_primary,
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1.25rem',
    paddingBottom: '0.625rem',
    borderBottom: `2px solid ${Colors.cardBorder}`,
  };

  const handleFilterToggle = (filter: SupportPointType) => {
    setMapFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };
  
  const quickActions = [
    { labelKey: 'homeView.emergencySOS', icon: '🚨', action: onShowSOSModal },
    { labelKey: 'homeView.lostAndFound', icon: '🎒', action: () => {} },
    { labelKey: 'homeView.flightHelp', icon: '✈️', action: () => {} },
  ];

  const filteredSupportLocations = supportLocations.filter(point => mapFilters.includes(point.type));

  const mapFilterOptions: { key: SupportPointType; labelKey: string }[] = [
    { key: 'hospital', labelKey: 'homeView.hospitals' },
    { key: 'police', labelKey: 'homeView.police' },
    { key: 'embassy', labelKey: 'homeView.embassies' },
  ];
  
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return Colors.accentError;
      case 'medium': return Colors.accentWarning;
      case 'low':
      default: return Colors.accentInfo;
    }
  };


  return (
    <div className="animate-fadeInUp space-y-8">
      {/* Hero Section */}
      <div style={cardStyle} className="text-center">
        <h1 className="text-3xl font-extrabold" style={{color: Colors.primaryDark}}>
          {isLoading ? t('homeView.fetchingCity') : userCity ? t('homeView.supportIn', { city: userCity }) : t('homeView.supportInDefault')}
        </h1>
        <p className="mt-2 text-md" style={{color: Colors.text_secondary}}>{t('homeView.getSupport')}</p>
        <div className="flex gap-3 mt-4 justify-center flex-wrap">
          <button
            onClick={() => document.getElementById('support-map')?.scrollIntoView({ behavior: 'smooth' })}
            className="py-2.5 px-6 font-semibold rounded-lg text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{ backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryDark})`, boxShadow: Colors.boxShadowButton }}
          >
            {t('homeView.findHelp')}
          </button>
          <button
            onClick={onGenerateQuickTour}
            disabled={isGeneratingQuickTour}
            className="py-2.5 px-6 font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            style={{ 
              backgroundColor: Colors.inputBackground, 
              color: Colors.text_primary,
              border: `1px solid ${Colors.cardBorder}`,
              opacity: isGeneratingQuickTour ? 0.7 : 1
            }}
          >
            {isGeneratingQuickTour ? t('homeTab.generatingQuickTour') : t('homeTab.suggestPlanButton')}
          </button>
        </div>
      </div>

      {/* Quick Tour Section */}
      {quickTourPlan && (
        <QuickTourCard 
          tour={quickTourPlan}
          onStartTour={() => {
            // Could implement tour tracking or navigation here
            console.log('Starting tour:', quickTourPlan.title);
          }}
        />
      )}

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>{t('homeView.quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(action => (
            <button
              key={action.labelKey}
              onClick={action.action}
              disabled={action.labelKey !== 'homeView.emergencySOS'}
              className="p-4 flex flex-col items-center justify-center rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: Colors.inputBackground, border: `1px solid ${Colors.cardBorder}` }}
            >
              <span className="text-4xl mb-2">{action.icon}</span>
              <span className="font-semibold text-sm" style={{color: Colors.text}}>{t(action.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Map Section */}
      <div id="support-map" style={cardStyle}>
         <h2 style={sectionHeadingStyle}>{t('homeView.supportMap')}</h2>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-medium mr-2" style={{color: Colors.text_secondary}}>{t('homeView.filterBy')}</span>
            {mapFilterOptions.map(opt => {
              const isActive = mapFilters.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => handleFilterToggle(opt.key)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200"
                  style={{
                    color: isActive ? 'white' : Colors.text,
                    backgroundColor: isActive ? Colors.primary : Colors.inputBackground,
                    border: `1px solid ${isActive ? Colors.primary : Colors.cardBorder}`,
                  }}
                >
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
         <div className="h-[50vh] w-full rounded-lg overflow-hidden">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center" style={{backgroundColor: Colors.inputBackground}}>
                    <p style={{color: Colors.text_secondary}}>{t('homeView.loadingMap')}</p>
                </div>
            ) : (
                <MapView 
                    userLocation={userLocation}
                    supportPoints={filteredSupportLocations}
                    onSelectPlaceDetail={() => {}} // Not used for support points
                />
            )}
         </div>
      </div>

      {/* Local Intel Section */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>{t('homeView.localIntel')}</h2>
        {isLoading ? (
            <p style={{color: Colors.text_secondary}}>{t('homeView.loadingIntel')}</p>
        ) : localInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div style={{backgroundColor: Colors.inputBackground}} className="p-3 rounded-lg">
                <p className="text-sm font-semibold" style={{color: Colors.text_primary}}>{t('homeView.weather')}</p>
                <p className="text-md" style={{color: Colors.text_secondary}}>{localInfo.weather}</p>
              </div>
              <div style={{backgroundColor: Colors.inputBackground}} className="p-3 rounded-lg">
                <p className="text-sm font-semibold" style={{color: Colors.text_primary}}>{t('homeView.localTime')}</p>
                <p className="text-md" style={{color: Colors.text_secondary}}>{localInfo.localTime}</p>
              </div>
              {localInfo.currencyInfo && (
                  <div style={{backgroundColor: Colors.inputBackground}} className="p-3 rounded-lg">
                    <p className="text-sm font-semibold" style={{color: Colors.text_primary}}>{t('homeView.currency')}</p>
                    <p className="text-md" style={{color: Colors.text_secondary}}>{localInfo.currencyInfo}</p>
                  </div>
              )}
            </div>
            <div>
                <p className="text-sm font-semibold mb-2" style={{color: Colors.text_primary}}>{t('homeView.travelAlerts')}</p>
                <div className="space-y-3">
                  {localInfo.alerts.map((alert, index) => (
                    <div key={index} className="p-3 rounded-lg border-l-4" style={{borderColor: getSeverityColor(alert.severity), backgroundColor: `${getSeverityColor(alert.severity)}1A`}}>
                        <p className="font-semibold text-sm" style={{color: getSeverityColor(alert.severity)}}>{alert.title}</p>
                        <p className="text-xs mt-1" style={{color: Colors.text_secondary}}>{alert.description}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        ) : (
          <p style={{color: Colors.text_secondary}}>{t('homeView.supportUnavailable')}</p>
        )}
      </div>
    </div>
  );
};

export default HomeView;
