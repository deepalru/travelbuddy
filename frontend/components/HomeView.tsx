import React, { useState, useEffect } from 'react';
import { CurrentUser, SupportPoint, LocalInfo, ActiveTab } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import {
  MapPin, Clock, Thermometer, Compass, Calendar, Camera, ShieldCheck,
  Sparkles, Coffee, Map as MapIcon, Heart, Lightbulb, DollarSign
} from './Icons.tsx';

interface HomeViewProps {
  currentUser: CurrentUser | null;
  userLocation: { latitude: number; longitude: number } | null;
  userCity: string | null;
  localInfo: LocalInfo | null;
  isLoading: boolean;
  supportLocations: SupportPoint[];
  onShowSOSModal: () => void;
  onTabChange: (tab: ActiveTab) => void;
  onSurpriseMeClick: () => void;
  favoritePlacesCount: number;
}

const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  userCity,
  localInfo,
  isLoading,
  supportLocations,
  onShowSOSModal,
  onTabChange,
  onSurpriseMeClick,
  favoritePlacesCount,
}) => {
  const { t, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
    <div className={`card-base p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );

  const Section: React.FC<React.PropsWithChildren<{ title: string, icon: React.ReactNode, className?: string }>> = ({ title, icon, children, className }) => (
    <Card className={className}>
      <div className="flex items-center mb-4">
        <span className="text-blue-500 mr-2">{icon}</span>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      </div>
      {children}
    </Card>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Welcome Header */}
      <Card className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Hello, {currentUser?.username || "Traveler"}! 👋
        </h1>
        <p className="text-md mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Ready for your next adventure?
        </p>
        {currentUser && (
          <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4" style={{ backgroundColor: 'var(--color-input-bg)', color: 'var(--color-primary)' }}>
            {currentUser.tier.charAt(0).toUpperCase() + currentUser.tier.slice(1)} Plan
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
            <MapPin className="w-4 h-4" />
            <span>{isLoading ? 'Loading...' : userCity || "Location unavailable"}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US')}</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-input-bg)' }}>
            <Thermometer className="w-4 h-4" />
            <span>{isLoading ? '...' : localInfo?.weather || "22°C ☀️ Sunny"}</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Explore Places', icon: <Compass />, color: 'bg-blue-500', action: () => onTabChange('placeExplorer') },
          { label: 'Plan Trip', icon: <Calendar />, color: 'bg-green-500', action: () => onTabChange('planner') },
          { label: 'Nearby Places', icon: <Camera />, color: 'bg-purple-500', action: () => onTabChange('placeExplorer') },
          { label: 'Safety Hub', icon: <ShieldCheck />, color: 'bg-red-500', action: onShowSOSModal },
        ].map(action => (
          <button key={action.label} onClick={action.action} className="card-base p-4 flex flex-col items-center justify-center text-center space-y-2 transition-transform hover:scale-105">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${action.color}`}>
              {React.cloneElement(action.icon, { className: 'w-6 h-6' })}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* AI Suggestions */}
      <Section title="Personalized Suggestions" icon={<Sparkles className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'var(--color-input-bg)' }}>
            <Coffee className="w-8 h-8 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }}/>
            <div>
              <h3 className="font-semibold text-sm">Blue Bottle Coffee</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>0.3km away, ⭐ 4.8, Known for artisan coffee.</p>
            </div>
          </div>
          <div className="p-3 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'var(--color-input-bg)' }}>
             <MapIcon className="w-8 h-8 mt-1 flex-shrink-0" style={{ color: 'var(--color-primary)' }}/>
            <div>
              <h3 className="font-semibold text-sm">Old Town Square</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>1.2km away, ⭐ 4.6, 18th century architecture.</p>
            </div>
          </div>
        </div>
        <button onClick={onSurpriseMeClick} className="btn btn-secondary w-full">
          <Sparkles className="w-4 h-4 mr-2" />
          Surprise Me!
        </button>
      </Section>

      {/* Safety & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Nearby Support" icon={<ShieldCheck className="w-5 h-5" />}>
            <div className="space-y-2 mb-4">
                {supportLocations.slice(0, 3).map(loc => (
                    <div key={loc.id} className="text-xs p-2 rounded-md flex justify-between items-center" style={{backgroundColor: 'var(--color-input-bg)'}}>
                       <span>{loc.name}</span>
                       <span className="font-semibold px-2 py-0.5 rounded-full" style={{backgroundColor: 'var(--color-glass-bg)'}}>{loc.type}</span>
                    </div>
                ))}
            </div>
            <button onClick={onShowSOSModal} className="btn w-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30">
                Emergency SOS
            </button>
        </Section>
        <Section title="Travel Tips" icon={<Lightbulb className="w-5 h-5" />}>
           <div className="space-y-3">
             <div className="p-3 rounded-lg flex items-center gap-3 text-sm" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                <span>💡</span>
                <p>Keep digital copies of important documents in a secure cloud service.</p>
             </div>
             <div className="p-3 rounded-lg flex items-center gap-3 text-sm" style={{ backgroundColor: 'var(--color-input-bg)' }}>
                <span>💰</span>
                <p>Inform your bank about your travel dates to avoid card issues.</p>
             </div>
           </div>
        </Section>
      </div>

      {/* Favorites Preview */}
      <Section title="Recent Favorites" icon={<Heart className="w-5 h-5" />}>
          {favoritePlacesCount > 0 ? (
            <div className="text-center">
                <p style={{color: 'var(--color-text-secondary)'}}>You have {favoritePlacesCount} favorite places saved.</p>
                <button onClick={() => onTabChange('placeExplorer')} className="btn btn-secondary mt-4">
                    View All
                </button>
            </div>
          ) : (
            <div className="text-center py-4">
                <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-text-secondary)' }} />
                <p className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>No favorite places yet.</p>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Start exploring and tap the heart icon to save!</p>
                <button onClick={() => onTabChange('placeExplorer')} className="btn btn-primary">
                    <Compass className="w-4 h-4 mr-2" />
                    Explore Places
                </button>
            </div>
          )}
      </Section>
    </div>
  );
};

export default HomeView;
