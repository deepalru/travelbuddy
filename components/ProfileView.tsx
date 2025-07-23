import React, { useState } from 'react';
import { CurrentUser, Place, TripPlanSuggestion, SubscriptionTier, EmergencyContact, UserInterest } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { Colors, SUBSCRIPTION_TIERS, SUPPORTED_LANGUAGES, AVAILABLE_USER_INTERESTS } from '../constants.ts';
import {
  User, Heart, Calendar, Crown, Settings, Edit3, Camera, Share, Download, CheckCircle, Bell, Sun, Moon, Globe, Lock, MapPin
} from './Icons.tsx';
import { useToast } from '../hooks/useToast.ts';

type ProfileTab = 'profile' | 'favorites' | 'trips' | 'subscription' | 'settings';

interface ProfileViewProps {
  user: CurrentUser;
  onUpdateUser: (updatedDetails: Partial<Omit<CurrentUser, 'username' | 'email'>>) => void;
  favoritePlaces: Place[];
  savedTripPlans: TripPlanSuggestion[];
  onViewSavedTripPlan: (plan: TripPlanSuggestion) => void;
  onDeleteSavedTripPlan: (planId: string) => void;
  onShareTripPlanToCommunity: (plan: TripPlanSuggestion) => void;
  onStartTrial: (tier: SubscriptionTier) => void;
  onSubscribe: (tier: SubscriptionTier) => void;
  onCancelSubscription: () => void;
  onUpgradeDowngradeTier: (newTier: SubscriptionTier) => void;
  onHomeCurrencyChange: (newCurrency: string) => void;
  onLanguageChange: (newLanguage: string) => void;
  onSelectedInterestsChange: (interests: UserInterest[]) => void;
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteEmergencyContact: (contactId: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ProfileView: React.FC<ProfileViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const { t } = useLanguage();

  const tabs: { id: ProfileTab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'profile', labelKey: 'profileView.tabs.profile', icon: <User size={18} /> },
    { id: 'favorites', labelKey: 'profileView.tabs.favorites', icon: <Heart size={18} /> },
    { id: 'trips', labelKey: 'profileView.tabs.trips', icon: <Calendar size={18} /> },
    { id: 'subscription', labelKey: 'profileView.tabs.subscription', icon: <Crown size={18} /> },
    { id: 'settings', labelKey: 'profileView.tabs.settings', icon: <Settings size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTabContent {...props} />;
      case 'favorites': return <FavoritesTabContent {...props} />;
      case 'trips': return <TripsTabContent {...props} />;
      case 'subscription': return <SubscriptionTabContent {...props} />;
      case 'settings': return <SettingsTabContent {...props} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeInUp">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{t('profileView.title')}</h1>
        <p className="mt-1 text-md" style={{ color: 'var(--color-text-secondary)' }}>{t('profileView.description')}</p>
      </div>
      <div className="card-base p-2 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
              }}
            >
              {tab.icon}
              <span>{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

// Sub-components for each tab
const ProfileTabContent: React.FC<ProfileViewProps> = ({ user }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    // Mock user data for editing that doesn't affect global state until saved
    const [name, setName] = useState(user.username);
    const [email, setEmail] = useState(user.email || '');

    const handleSave = () => {
        // Here you would call a prop function to update the user details globally
        console.log("Saving user details:", { name, email });
        setIsEditing(false);
    };
    
    const stats = [
        { labelKey: 'profileView.profile.statsCountries', value: 12 },
        { labelKey: 'profileView.profile.statsPlaces', value: 42 },
        { labelKey: 'profileView.profile.statsTrips', value: 5 },
    ];

    return (
        <Card title={t('profileView.profile.title')} icon={<User />}>
            <button onClick={() => setIsEditing(!isEditing)} className="absolute top-4 right-4 btn btn-secondary text-sm p-2">
                {isEditing ? t('profileView.profile.saveButton') : t('profileView.profile.editButton')} <Edit3 size={16} className="ml-2" />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold" style={{color: 'var(--color-primary)'}}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    {isEditing && (
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md">
                            <Camera size={16} />
                        </button>
                    )}
                </div>
                <div className="flex-grow text-center md:text-left">
                    {isEditing ? (
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-base text-2xl font-bold mb-1" />
                    ) : (
                        <h3 className="text-2xl font-bold">{user.username}</h3>
                    )}
                    {isEditing ? (
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base text-md" />
                    ) : (
                        <p className="text-md" style={{color: 'var(--color-text-secondary)'}}>{user.email}</p>
                    )}
                     <div className="mt-2 flex items-center gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1" style={{backgroundColor: `var(--color-primary)20`, color: 'var(--color-primary)'}}>
                            <Crown size={14}/> {user.tier} Plan
                        </span>
                        <span className="text-xs" style={{color: 'var(--color-text-secondary)'}}>Member since 2024</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t" style={{borderColor: 'var(--color-glass-border)'}}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {stats.map(stat => (
                        <div key={stat.labelKey}>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm" style={{color: 'var(--color-text-secondary)'}}>{t(stat.labelKey)}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </Card>
    );
};

const FavoritesTabContent: React.FC<ProfileViewProps> = ({ favoritePlaces }) => {
    const { t } = useLanguage();
    const mockTags = ["Must-See", "Popular"];
    return (
        <Card title={t('profileView.favorites.title')} icon={<Heart />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritePlaces.map(place => (
                    <div key={place.id} className="p-3 rounded-lg relative overflow-hidden" style={{backgroundColor: 'var(--color-input-bg)'}}>
                        <img src={place.photoUrl} alt={place.name} className="w-full h-24 object-cover rounded-md mb-2"/>
                        <h4 className="font-semibold text-sm">{place.name}</h4>
                        <p className="text-xs flex items-center gap-1" style={{color: 'var(--color-text-secondary)'}}>
                            <MapPin size={12} /> {place.address.split(',')[0]}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{color: 'var(--color-text-secondary)'}}>
                           ⭐ {place.rating}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {mockTags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{backgroundColor: `var(--color-primary)20`, color: 'var(--color-primary)'}}>{tag}</span>)}
                        </div>
                        <button className="absolute top-2 right-2 p-1.5 bg-white/70 rounded-full">
                            <Heart size={16} className="text-red-500 fill-current" />
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const TripsTabContent: React.FC<ProfileViewProps> = ({ savedTripPlans, onViewSavedTripPlan }) => {
    const { t } = useLanguage();
    const getStatusStyle = (status: string) => {
        switch(status){
            case 'upcoming': return {backgroundColor: `var(--color-accent-info)20`, color: 'var(--color-accent-info)'};
            case 'completed': return {backgroundColor: `var(--color-accent-success)20`, color: 'var(--color-accent-success)'};
            default: return {backgroundColor: `var(--color-accent-warning)20`, color: 'var(--color-accent-warning)'};
        }
    };
    return (
        <Card title={t('profileView.trips.title')} icon={<Calendar />}>
            <div className="space-y-4">
                {savedTripPlans.map(plan => (
                     <div key={plan.id} className="p-3 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4" style={{backgroundColor: 'var(--color-input-bg)'}}>
                        <img src={plan.dailyPlans[0]?.photoUrl || '/api/placeholder/300/200'} alt={plan.destination} className="w-full md:w-32 h-20 object-cover rounded-md"/>
                        <div className="flex-grow">
                            <h4 className="font-semibold">{plan.tripTitle}</h4>
                            <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>{plan.duration} to {plan.destination}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 text-xs rounded-full font-semibold" style={getStatusStyle('upcoming')}>Upcoming</span>
                                <span className="px-2 py-0.5 text-xs rounded-full" style={{backgroundColor: 'var(--color-input-bg)'}}>{plan.duration}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 self-start md:self-center">
                            <button onClick={() => onViewSavedTripPlan(plan)} className="p-2 btn-secondary"><Edit3 size={16}/></button>
                            <button className="p-2 btn-secondary"><Share size={16}/></button>
                            <button className="p-2 btn-secondary"><Download size={16}/></button>
                        </div>
                     </div>
                ))}
            </div>
        </Card>
    );
};

const SubscriptionTabContent: React.FC<ProfileViewProps> = ({ user, onUpgradeDowngradeTier }) => {
    const { t } = useLanguage();
    return (
        <Card title={t('profileView.subscription.title')} icon={<Crown />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_TIERS.filter(t => t.key !== 'pro').map(tier => {
                    const isCurrent = user.tier === tier.key;
                    return (
                        <div key={tier.key} className={`p-6 rounded-xl transition-all duration-300 ${isCurrent ? 'border-2' : 'border'}`}
                            style={{
                                borderColor: isCurrent ? 'var(--color-primary)' : 'var(--color-glass-border)',
                                backgroundColor: isCurrent ? 'var(--color-primary)10' : 'transparent',
                            }}
                        >
                            <h4 className="text-xl font-bold" style={{color: 'var(--color-primary)'}}>{t(tier.nameKey)}</h4>
                            <p className="text-3xl font-bold my-2">${tier.priceMonthly}<span className="text-sm font-normal">/mo</span></p>
                            <ul className="space-y-2 my-4 text-sm">
                                {tier.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle size={16} className="mt-0.5 text-green-500" />
                                        <span>{t(feat.textKey)}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => !isCurrent && onUpgradeDowngradeTier(tier.key)}
                                disabled={isCurrent}
                                className={`w-full mt-4 btn ${isCurrent ? 'btn-secondary' : 'btn-primary'} disabled:opacity-70`}
                            >
                                {isCurrent ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
};

const SettingsTabContent: React.FC<ProfileViewProps> = ({ onLanguageChange, theme, setTheme }) => {
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState({push: true, email: true, safety: false, deals: true});
    
    const handleNotifToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({...prev, [key]: !prev[key]}));
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={t('profileView.settings.notifications.title')} icon={<Bell />}>
                <div className="space-y-4">
                    {Object.keys(notifications).map(key => (
                        <div key={key} className="flex justify-between items-center">
                            <label className="text-sm">{t(`profileView.settings.notifications.${key}`)}</label>
                            <button 
                                onClick={() => handleNotifToggle(key as keyof typeof notifications)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${notifications[key as keyof typeof notifications] ? 'justify-end bg-indigo-500' : 'justify-start bg-gray-200'}`}
                            >
                                <span className="w-4 h-4 bg-white rounded-full block"></span>
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title={t('profileView.settings.preferences.title')} icon={<Settings />}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm block mb-2">{t('profileView.settings.preferences.theme.title')}</label>
                        <div className="flex gap-2">
                            <button onClick={() => setTheme('light')} className={`btn text-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}><Sun size={16} className="mr-2"/>{t('profileView.settings.preferences.theme.light')}</button>
                            <button onClick={() => setTheme('dark')} className={`btn text-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}><Moon size={16} className="mr-2"/>{t('profileView.settings.preferences.theme.dark')}</button>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm block mb-2">{t('profileView.settings.preferences.language.title')}</label>
                        <select onChange={(e) => onLanguageChange(e.target.value)} className="input-base">
                            {SUPPORTED_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm block mb-2">{t('profileView.settings.preferences.privacy.title')}</label>
                        <button className="btn btn-secondary text-sm"><Lock size={16} className="mr-2"/>{t('profileView.settings.preferences.privacy.button')}</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const Card: React.FC<React.PropsWithChildren<{title: string, icon: React.ReactNode}>> = ({title, icon, children}) => (
    <div className="card-base p-6 relative">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-3" style={{color: 'var(--color-text-primary)'}}>
            <span style={{color: 'var(--color-primary)'}}>{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);


export default ProfileView;