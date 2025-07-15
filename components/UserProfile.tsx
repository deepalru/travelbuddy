

import React from 'react';
import { Colors, SUBSCRIPTION_TIERS, SubscriptionTierInfo } from '@/constants';
import { TripPlanSuggestion, CurrentUser, SubscriptionTier } from '@/types'; 
import { useLanguage } from '@/contexts/LanguageContext';
import LockIcon from '@/components/LockIcon'; 

interface UserProfileProps {
  user: CurrentUser; 
  onNavigateToPlaces: () => void;
  onNavigateToAccountSettings: () => void;
  favoritePlacesCount: number;
  savedTripPlans: TripPlanSuggestion[];
  onViewSavedTripPlan: (plan: TripPlanSuggestion) => void;
  onDeleteSavedTripPlan: (planId: string) => void;
  onStartTrial: (tier: SubscriptionTier) => void; 
  onSubscribe: (tier: SubscriptionTier) => void; 
  onCancelSubscription: () => void; 
  onUpgradeDowngradeTier: (newTier: SubscriptionTier) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onNavigateToPlaces, 
  onNavigateToAccountSettings, 
  favoritePlacesCount,
  savedTripPlans,
  onViewSavedTripPlan,
  onDeleteSavedTripPlan,
  onStartTrial,
  onSubscribe,
  onCancelSubscription,
  onUpgradeDowngradeTier
}) => {
  const { t } = useLanguage();

  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground, 
    border: `1px solid ${Colors.cardBorder}`,
    borderRadius: '0.75rem', 
    padding: '1.5rem', 
    boxShadow: Colors.boxShadow, 
    marginBottom: '1.5rem', 
    maxWidth: '900px', 
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const headingStyle: React.CSSProperties = {
    color: Colors.text, 
    fontSize: '1.5rem', 
    fontWeight: '700', 
    marginBottom: '1rem', 
    paddingBottom: '0.75rem', 
    borderBottom: `1px solid ${Colors.primary}60`, 
  };

  const textStyle: React.CSSProperties = {
    color: Colors.text_secondary, 
    fontSize: '1rem', 
    lineHeight: 1.6,
  };
  
  const baseButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem', 
    borderRadius: '0.625rem', 
    fontWeight: '600', 
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton,
    display: 'inline-block',
    textAlign: 'center',
    fontSize: '0.9375rem' 
  };

  const primaryGradientButtonStyle: React.CSSProperties = { 
    ...baseButtonStyle,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
  };
  
  const outlineButtonStyle: React.CSSProperties = { 
    ...baseButtonStyle,
    backgroundColor: 'transparent',
    color: Colors.primary,
    border: `1px solid ${Colors.primary}`,
    boxShadow: Colors.boxShadowSoft,
  };

  const errorAccentButtonStyle: React.CSSProperties = { 
    ...baseButtonStyle,
    backgroundColor: 'transparent',
    color: Colors.accentError,
    border: `1px solid ${Colors.accentError}`,
    boxShadow: Colors.boxShadowSoft,
  };

  const smallGradientButtonStyle: React.CSSProperties = {
    ...primaryGradientButtonStyle,
    padding: '0.625rem 1.25rem', 
    fontSize: '0.875rem', 
  };
  const smallOutlineButtonStyle: React.CSSProperties = {
    ...outlineButtonStyle,
    padding: '0.625rem 1.25rem', 
    fontSize: '0.875rem', 
  };


  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderTierCard = (tierInfo: SubscriptionTierInfo) => {
    const isCurrentUserTier = user.tier === tierInfo.key;
    const isUserActiveOnThisTier = isCurrentUserTier && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial');
    const isUserTrialOnThisTier = isCurrentUserTier && user.subscriptionStatus === 'trial';

    const isFreeTier = tierInfo.key === 'free';
    const featuresToShow = isFreeTier ? tierInfo.features.slice(0, 2) : tierInfo.features;
    
    let ctaButton;
    if (isUserActiveOnThisTier) {
      if (isUserTrialOnThisTier) {
         ctaButton = (
            <button 
                onClick={() => onSubscribe(tierInfo.key)} 
                style={primaryGradientButtonStyle} 
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 mt-auto w-full hover:-translate-y-0.5"
            >
                {t('subscriptionTiers.upgradeToFull', { price: tierInfo.priceMonthly.toString() })}
            </button>
        );
      } else { 
        ctaButton = (
            <p style={{...textStyle, fontWeight:'600', color: Colors.accentSuccess, textAlign: 'center'}} className="mt-auto py-3"> 
                {t('subscriptionTiers.currentPlan')}
            </p>
        );
      }
    } else { 
      if (tierInfo.key === 'free') {
         ctaButton = (user.tier === 'free' && (user.subscriptionStatus === 'none' || user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'canceled')) ? (
            <p style={{...textStyle, fontWeight:'600', color: Colors.accentSuccess, textAlign: 'center'}} className="mt-auto py-3"> 
                {t('subscriptionTiers.currentPlan')}
            </p>
         ) : (
            <button 
                onClick={() => onUpgradeDowngradeTier(tierInfo.key)} 
                style={outlineButtonStyle} 
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 mt-auto w-full hover:bg-gray-50"
            >
                {t(tierInfo.ctaKey) || t('subscriptionTiers.switchToFree')}
            </button>
         );
      } else {
         const canStartTrial = user.subscriptionStatus === 'none' || user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'canceled' || user.tier === 'free';
         ctaButton = (
            <button 
                onClick={() => canStartTrial ? onStartTrial(tierInfo.key) : onUpgradeDowngradeTier(tierInfo.key)} 
                style={primaryGradientButtonStyle} 
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 mt-auto w-full hover:-translate-y-0.5"
            >
                {canStartTrial ? t('subscriptionTiers.startTrialButton') : t(tierInfo.ctaKey)}
            </button>
        );
      }
    }

    return (
      <div 
        key={tierInfo.key} 
        className="flex flex-col rounded-xl p-5 transition-all duration-300"
        style={{
          backgroundColor: Colors.cardBackground,
          border: isUserActiveOnThisTier ? `2px solid ${Colors.primary}` : (tierInfo.isRecommended && !isUserActiveOnThisTier ? `2px solid ${Colors.accentSuccess}` : `1px solid ${Colors.cardBorder}`),
          boxShadow: Colors.boxShadow,
          position: 'relative',
          minHeight: '400px', 
          transform: isUserActiveOnThisTier ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {tierInfo.isRecommended && !isUserActiveOnThisTier && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg z-10" style={{backgroundColor: Colors.accentSuccess}}> 
            {t('subscriptionTiers.recommended')}
          </div>
        )}
        {tierInfo.badgeTextKey && tierInfo.badgeColor && (
          <span 
            className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold text-white rounded-full shadow-lg z-10" 
            style={{ backgroundColor: tierInfo.badgeColor }}
          >
            {t(tierInfo.badgeTextKey)}
          </span>
        )}
        <h3 className="text-xl font-bold mb-1.5 text-center" style={{ color: tierInfo.badgeColor || Colors.primary }}>{t(tierInfo.nameKey)}</h3> 
        <p className="text-3xl font-bold mb-1 text-center" style={{ color: Colors.text }}> 
          ${tierInfo.priceMonthly.toFixed(2)}<span className="text-sm font-normal opacity-70">/{t('subscriptionTiers.monthShort')}</span> 
        </p>
        {tierInfo.priceAnnually && (
             <p className="text-xs text-center mb-3 opacity-70" style={{ color: Colors.text_secondary }}> 
                {t('subscriptionTiers.orAnnually', { price: tierInfo.priceAnnually.toFixed(2) })}
             </p>
        )}
        <p className="text-xs text-center mb-4 min-h-[3em] opacity-90" style={{ color: Colors.text_secondary }}>{t(tierInfo.descriptionKey)}</p> 
        
        <ul className="space-y-2 mb-5 text-sm flex-grow">
          {featuresToShow.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg 
                className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0`}  
                fill="currentColor" viewBox="0 0 20 20"
                style={{color: feature.isHighlighted ? Colors.accentSuccess : Colors.text_secondary }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              <span style={{color: Colors.text_secondary}}>
                {t(feature.textKey)}
                {feature.detailsKey && <span className="block text-xs opacity-80">({t(feature.detailsKey)})</span>}
              </span>
            </li>
          ))}
          {isFreeTier && tierInfo.features.length > 2 && (
            <li className="flex items-start pt-2">
              <span className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"></span>
              <button
                type="button"
                onClick={() => {
                  const cardElement = document.getElementById('profileSubscriptionCard');
                  if (cardElement) {
                    cardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-sm font-medium text-left hover:underline focus:outline-none focus:ring-1 focus:ring-offset-1 rounded"
                style={{ color: Colors.primary }}
              >
                View more features...
              </button>
            </li>
          )}
        </ul>
        {ctaButton}
        {isUserActiveOnThisTier && tierInfo.key !== 'free' && (
             <button 
                onClick={onCancelSubscription} 
                style={{...errorAccentButtonStyle, width: '100%', marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.6rem 1rem'}} 
                className="focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-98 hover:bg-red-50"
            >
                {t('userProfile.cancelSubscriptionButton')}
            </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeInUp"> 
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10"> 
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-0" style={{ color: Colors.text }}>{t('userProfile.title')}</h1> 
        <button
            onClick={onNavigateToPlaces}
            style={{...primaryGradientButtonStyle, padding:'0.875rem 1.75rem', fontSize:'1rem'}} 
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:-translate-y-0.5"
          >
            {t('userProfile.backToExploring')}
        </button>
      </div>

      <div id="profileSubscriptionCard" className="mb-8" style={{...cardStyle, maxWidth: 'none', paddingBottom: '2rem' }}> 
        <h2 style={headingStyle}>{t('userProfile.subscriptionStatus')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
          {SUBSCRIPTION_TIERS.map(tier => renderTierCard(tier))}
        </div>
        <p className="text-xs text-center mt-6" style={{color: Colors.text_secondary}}> 
            {t('subscriptionTiers.managementNote')} <button onClick={(e) => { e.preventDefault(); onNavigateToAccountSettings(); }} className="underline hover:text-blue-500" style={{color:Colors.primary}}>{t('sideMenu.accountSettings')}</button>.
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={headingStyle}>{t('userProfile.profileInformation')}</h2>
        <div className="space-y-3"> 
          <p style={textStyle}>
            <strong style={{ color: Colors.text, fontWeight: '600' }}>{t('userProfile.username')}:</strong> {user.username}
          </p>
          <p style={textStyle}>
            <strong style={{ color: Colors.text, fontWeight: '600' }}>{t('userProfile.email')}:</strong> {user.email || 'Not provided'}
          </p>
           <p style={textStyle}>
            <strong style={{ color: Colors.text, fontWeight: '600' }}>{t('subscriptionTiers.currentTierLabel')}:</strong> {t((SUBSCRIPTION_TIERS.find(ts => ts.key === user.tier) || SUBSCRIPTION_TIERS[0]).nameKey)}
          </p>
           <p style={textStyle}>
            <strong style={{ color: Colors.text, fontWeight: '600' }}>{t('userProfile.status')}:</strong>
            <span style={{color: user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial' ? Colors.accentSuccess : Colors.text_secondary, marginLeft: '0.5rem', fontWeight:'500'}}>
                {t(`userProfile.status${user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}`)}
            </span>
             { (user.subscriptionStatus === 'trial' && user.trialEndDate) && ` (${t('userProfile.trialEndsOnShort', {date: formatDate(user.trialEndDate)})})` }
             { (user.subscriptionStatus === 'active' && user.subscriptionEndDate) && ` (${t('userProfile.renewsOnShort', {date: formatDate(user.subscriptionEndDate)})})` }
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={headingStyle}>{t('userProfile.myFavoritePlaces')}</h2>
        <p style={textStyle}>
          {t('userProfile.favoritesCount', { count: favoritePlacesCount.toString() })}
        </p>
        <p style={{...textStyle, marginTop: '0.5rem', fontSize: '0.875rem'}}> 
          {t('userProfile.favoritesFilterInfo')}
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={headingStyle}>{t('userProfile.mySavedTripPlans')}</h2>
        {savedTripPlans.length === 0 ? (
          <p style={textStyle}>
            {t('userProfile.noSavedTripPlans')}
          </p>
        ) : (
          <ul className="space-y-4"> 
            {savedTripPlans.map(plan => (
              <li 
                key={plan.id} 
                className="p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" 
                style={{
                  backgroundColor: Colors.inputBackground, 
                  border: `1px solid ${Colors.cardBorder}`,
                  boxShadow: Colors.boxShadowSoft
                }}
              >
                <div className="flex-grow">
                  <h3 className="font-semibold text-md" style={{ color: Colors.text }}> 
                    {plan.tripTitle || t('userProfile.tripPlanTitle', { destination: plan.destination })}
                  </h3>
                  <p className="text-sm" style={{color: Colors.text_secondary}}>
                    {plan.duration} in {plan.destination}
                  </p>
                </div>
                <div className="flex-shrink-0 flex gap-2.5 mt-2 sm:mt-0"> 
                  <button 
                    onClick={() => onViewSavedTripPlan(plan)}
                    style={smallGradientButtonStyle}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:-translate-y-0.5"
                    aria-label={`${t('userProfile.viewPlanButton')}: ${plan.tripTitle || plan.destination}`}
                  >
                    {t('userProfile.viewPlanButton')}
                  </button>
                  <button 
                    onClick={() => plan.id && onDeleteSavedTripPlan(plan.id)}
                    style={{...smallOutlineButtonStyle, color: Colors.accentError, borderColor: Colors.accentError}}
                    className="focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-98 hover:bg-red-50"
                    aria-label={`${t('userProfile.deletePlanButton')}: ${plan.tripTitle || plan.destination}`}
                  >
                    {t('userProfile.deletePlanButton')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={cardStyle}>
        <h2 style={headingStyle}>{t('userProfile.accountSettingsTitle')}</h2>
         <button
          onClick={onNavigateToAccountSettings}
          style={{...outlineButtonStyle, padding:'0.875rem 1.75rem', marginTop: '0.5rem'}} 
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:bg-gray-50"
        >
          {t('userProfile.manageAccountSettingsButton')}
        </button>
      </div>

    </div>
  );
};

export default UserProfile;