

import React, { useState } from 'react';
import { Colors, COMMON_CURRENCIES, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, SUBSCRIPTION_TIERS, AVAILABLE_USER_INTERESTS } from '@/constants'; 
import { useToast } from '@/hooks/useToast';
import { EmergencyContact, CurrentUser, SubscriptionTier, UserInterest } from '@/types'; 
import { useLanguage } from '@/contexts/LanguageContext'; 

interface AccountSettingsPageProps {
  user: CurrentUser; 
  onNavigateToProfile: () => void;
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onDeleteEmergencyContact: (contactId: string) => void;
  onStartTrial: (tier: SubscriptionTier) => void; 
  onSubscribe: (tier: SubscriptionTier) => void; 
  onCancelSubscription: () => void; 
  onHomeCurrencyChange: (newCurrency: string) => void;
  onLanguageChange: (newLanguage: string) => void; 
  onUpgradeDowngradeTier: (newTier: SubscriptionTier) => void;
  onSelectedInterestsChange: (interests: UserInterest[]) => void;
}

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ 
  user, 
  onNavigateToProfile,
  emergencyContacts,
  onAddEmergencyContact,
  onDeleteEmergencyContact,
  onStartTrial,
  onSubscribe,
  onCancelSubscription,
  onHomeCurrencyChange,
  onLanguageChange,
  onUpgradeDowngradeTier,
  onSelectedInterestsChange
}) => {
  const { addToast } = useToast();
  const { t } = useLanguage(); 
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [itineraryReminders, setItineraryReminders] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedHomeCurrency, setSelectedHomeCurrency] = useState(user.homeCurrency || 'USD');
  const [selectedLanguageState, setSelectedLanguageState] = useState(user.language || DEFAULT_LANGUAGE);
  const [currentSelectedInterests, setCurrentSelectedInterests] = useState<UserInterest[]>(user.selectedInterests || []);

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    let changesMade = false;
    if (newPassword && newPassword === confirmNewPassword && newPassword.length >= 6) {
        addToast({ message: t('modals.passwordChangedSuccess'), type: 'success' });
        setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
        changesMade = true;
    } else if (newPassword && newPassword !== confirmNewPassword) {
        addToast({ message: t('modals.passwordsDoNotMatch'), type: 'error' });
    } else if (newPassword && newPassword.length < 6) {
        addToast({ message: t('modals.passwordTooShort'), type: 'warning'});
    }

    if(user.homeCurrency !== selectedHomeCurrency) {
        onHomeCurrencyChange(selectedHomeCurrency); changesMade = true;
    }
    if (user.language !== selectedLanguageState) {
        onLanguageChange(selectedLanguageState); changesMade = true;
    }
    const interestsChanged = !(
      currentSelectedInterests.length === (user.selectedInterests || []).length &&
      currentSelectedInterests.every(interest => (user.selectedInterests || []).includes(interest))
    );
    if (interestsChanged) {
      onSelectedInterestsChange(currentSelectedInterests); changesMade = true;
    }
    if (changesMade && (!newPassword && !interestsChanged)) { 
        addToast({ message: t('modals.settingsSaved'), type: 'success' });
    } else if (!newPassword && !changesMade) { 
        addToast({ message: t('noChangesToSave'), type: 'info' });
    }
  };

  const handleAddNewEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      addToast({ message: t('accountSettings.contactNameEmpty'), type: 'warning' }); return;
    }
    if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(newContactPhone)) { 
        addToast({ message: t('accountSettings.invalidPhone'), type: 'warning' }); return;
    }
    onAddEmergencyContact({ name: newContactName, phone: newContactPhone });
    setNewContactName(''); setNewContactPhone('');
  };

  const handleInterestToggle = (interest: UserInterest) => {
    setCurrentSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    border: `1px solid ${Colors.cardBorder}`,
    borderRadius: '0.75rem', 
    padding: '1.5rem', 
    boxShadow: Colors.boxShadow, 
    marginBottom: '1.5rem',
    maxWidth: '700px', 
    marginLeft: 'auto', marginRight: 'auto',
  };

  const headingStyle: React.CSSProperties = {
    color: Colors.text, 
    fontSize: '1.5rem', 
    fontWeight: '700',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: `1px solid ${Colors.primary}60`, 
  };

  const inputStyle: React.CSSProperties = {
    color: Colors.text,
    backgroundColor: Colors.inputBackground, 
    border: `1px solid ${Colors.cardBorder}`,
    borderRadius: '0.625rem', 
    padding: '0.75rem 1rem', 
    width: '100%',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    fontSize: '0.875rem',
  };
  
  const selectStyle: React.CSSProperties = {
    ...inputStyle, 
    appearance: 'none', 
    paddingRight: '2.5rem', 
    backgroundPosition: `right 0.75rem center`, 
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23${Colors.text.substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: Colors.text_secondary,
    marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500'
  };
  
  const baseButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem', borderRadius: '0.625rem', fontWeight: '600',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton, display: 'inline-block',
    textAlign: 'center', fontSize: '0.9375rem' 
  };

  const primaryGradientButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
  };

  const outlineButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: 'transparent', color: Colors.primary,
    border: `1px solid ${Colors.primary}`,
    boxShadow: Colors.boxShadowSoft,
  };
  
  const smallErrorAccentButtonStyle: React.CSSProperties = {
    ...baseButtonStyle, padding: '0.4rem 0.8rem', fontSize: '0.8125rem', 
    backgroundColor: 'transparent', color: Colors.accentError,
    border: `1px solid ${Colors.accentError}`,
    boxShadow: Colors.boxShadowSoft,
  };

  const toggleSwitchBaseStyle: React.CSSProperties = {
    width: '2.75rem', height: '1.5rem', borderRadius: '0.75rem', position: 'relative', 
    cursor: 'pointer', transition: 'background-color 0.2s ease',
    border: `1px solid ${Colors.cardBorder}`
  };

  const toggleSwitchThumbStyle: React.CSSProperties = {
    content: '""', position: 'absolute', top: '0.125rem', left: '0.125rem', 
    width: '1.25rem', height: '1.25rem', borderRadius: '50%', 
    backgroundColor: 'white', transition: 'transform 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderSubscriptionManagement = () => {
    const currentTierInfo = SUBSCRIPTION_TIERS.find(tInfo => tInfo.key === user.tier);
    const tierName = currentTierInfo ? t(currentTierInfo.nameKey) : user.tier;
    return (
      <>
        <p style={{...labelStyle, marginBottom:'0.5rem', fontSize: '1rem'}}> 
          {t('userProfile.status')}:&nbsp;
          <strong style={{color: (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') ? Colors.accentSuccess : Colors.text_secondary}}>
            {t(`userProfile.status${user.subscriptionStatus.charAt(0).toUpperCase() + user.subscriptionStatus.slice(1)}`)}
          </strong>
          &nbsp;({tierName})
        </p>
        {(user.subscriptionStatus === 'trial' && user.trialEndDate) && 
            <p style={{...labelStyle, marginBottom:'0.75rem'}} className="text-sm">{t('userProfile.trialEndsOn', {date: formatDate(user.trialEndDate)})}</p>} 
        {(user.subscriptionStatus === 'active' && user.subscriptionEndDate) && 
            <p style={{...labelStyle, marginBottom:'0.75rem'}} className="text-sm">{t('userProfile.activeUntil', {date: formatDate(user.subscriptionEndDate)})}</p>} 
        {(user.subscriptionStatus === 'canceled' && (user.subscriptionEndDate || user.trialEndDate)) &&
            <p style={{...labelStyle, marginBottom:'0.75rem'}} className="text-sm">{t('userProfile.accessContinuesUntil', {date: formatDate(user.subscriptionEndDate || user.trialEndDate)})}</p>} 
        
        <button type="button" onClick={onNavigateToProfile} style={{...primaryGradientButtonStyle, width: '100%', fontSize: '0.9375rem', padding: '0.75rem 1.5rem'}} className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:-translate-y-0.5 mt-2"> 
            {t('subscriptionTiers.manageButton')}
        </button>
      </>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeInUp"> 
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10"> 
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-0" style={{ color: Colors.text }}>{t('accountSettings.title')}</h1> 
        <button
            onClick={onNavigateToProfile}
            style={{...outlineButtonStyle, padding: '0.75rem 1.5rem', fontSize: '0.9375rem'}} 
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:bg-gray-50"
          >
            {t('accountSettings.backToProfile')}
        </button>
      </div>

      <form onSubmit={handleSaveChanges}>
        <div style={cardStyle}>
            <h2 style={headingStyle}>{t('accountSettings.subscriptionManagement')}</h2>
            {renderSubscriptionManagement()}
        </div>
        
        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.preferences')}</h2>
          <div className="space-y-5"> 
             <div>
              <label htmlFor="homeCurrencySelect" style={labelStyle}>{t('accountSettings.homeCurrencyLabel')}</label>
              <select id="homeCurrencySelect" value={selectedHomeCurrency} 
                onChange={e => setSelectedHomeCurrency(e.target.value)} style={selectStyle}
                className={`focus:ring-2 focus:ring-blue-500`}
              >
                {COMMON_CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code} style={{backgroundColor: Colors.background, color: Colors.text}}>{currency.name} ({currency.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="languageSelect" style={labelStyle}>{t('accountSettings.languageLabel')}</label>
              <select id="languageSelect" value={selectedLanguageState} 
                onChange={e => setSelectedLanguageState(e.target.value)} style={selectStyle}
                className={`focus:ring-2 focus:ring-blue-500`}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} style={{backgroundColor: Colors.background, color: Colors.text}}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.myInterests')}</h2>
          <p className="text-sm mb-4" style={labelStyle}>{t('accountSettings.selectInterestsDescription')}</p> 
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3"> 
            {AVAILABLE_USER_INTERESTS.map(interest => (
              <label key={interest} className="flex items-center space-x-2 cursor-pointer p-2.5 rounded-lg transition-all duration-200" 
                style={{
                  backgroundColor: currentSelectedInterests.includes(interest) ? `${Colors.primary}2A` : Colors.inputBackground, 
                  boxShadow: Colors.boxShadowSoft,
                  border: `1px solid ${currentSelectedInterests.includes(interest) ? Colors.primary : Colors.cardBorder }`
                }}
              >
                <input type="checkbox" checked={currentSelectedInterests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                  className="h-4 w-4 rounded border-gray-400 focus:ring-0 focus:ring-offset-0 text-blue-600"
                  style={{ accentColor: Colors.primary }}
                />
                <span className="text-sm font-medium" style={{color: currentSelectedInterests.includes(interest) ? Colors.primaryDark : Colors.text_secondary}}>
                    {t(`userInterests.${interest.toLowerCase().replace(/\s&/g, '')}`)}
                </span> 
              </label>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.notificationPreferences')}</h2>
          <div className="space-y-5"> 
            <div className="flex items-center justify-between">
              <label htmlFor="emailNotifs" style={{...labelStyle, marginBottom: 0, fontSize: '1rem'}}>{t('accountSettings.emailNotificationsLabel')}</label> 
              <button type="button" id="emailNotifs" role="switch" aria-checked={emailNotifications}
                onClick={() => setEmailNotifications(!emailNotifications)}
                style={{ ...toggleSwitchBaseStyle, backgroundColor: emailNotifications ? Colors.primary : Colors.inputBackground}}
                className={`focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <span style={{ ...toggleSwitchThumbStyle, transform: emailNotifications ? 'translateX(1.25rem)' : 'translateX(0)'}}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="itineraryReminders" style={{...labelStyle, marginBottom: 0, fontSize: '1rem'}}>{t('accountSettings.itineraryRemindersLabel')}</label> 
               <button type="button" id="itineraryReminders" role="switch" aria-checked={itineraryReminders}
                onClick={() => setItineraryReminders(!itineraryReminders)}
                style={{ ...toggleSwitchBaseStyle, backgroundColor: itineraryReminders ? Colors.primary : Colors.inputBackground}}
                className={`focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <span style={{ ...toggleSwitchThumbStyle, transform: itineraryReminders ? 'translateX(1.25rem)' : 'translateX(0)'}}></span>
              </button>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.changePassword')}</h2>
          <div className="space-y-5"> 
            <div>
              <label htmlFor="currentPassword" style={labelStyle}>{t('accountSettings.currentPasswordLabel')}</label>
              <input type="password" id="currentPassword" style={inputStyle} className={`focus:ring-2 focus:ring-blue-500`} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder={t('accountSettings.currentPasswordPlaceholder')} />
            </div>
            <div>
              <label htmlFor="newPassword" style={labelStyle}>{t('accountSettings.newPasswordLabel')}</label>
              <input type="password" id="newPassword" style={inputStyle} className={`focus:ring-2 focus:ring-blue-500`} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('accountSettings.newPasswordPlaceholder')} />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" style={labelStyle}>{t('accountSettings.confirmNewPasswordLabel')}</label>
              <input type="password" id="confirmNewPassword" style={inputStyle} className={`focus:ring-2 focus:ring-blue-500`} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder={t('accountSettings.confirmNewPasswordPlaceholder')} />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.emergencyContacts')}</h2>
          <form onSubmit={handleAddNewEmergencyContact} className="space-y-4 mb-6"> 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
              <div>
                <label htmlFor="contactName" style={labelStyle}>{t('accountSettings.contactNameLabel')}</label>
                <input type="text" id="contactName" style={inputStyle} className={`focus:ring-2 focus:ring-blue-500`} value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder={t('accountSettings.contactNamePlaceholder')} />
              </div>
              <div>
                <label htmlFor="contactPhone" style={labelStyle}>{t('accountSettings.contactPhoneLabel')}</label>
                <input type="tel" id="contactPhone" style={inputStyle} className={`focus:ring-2 focus:ring-blue-500`} value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} placeholder={t('accountSettings.contactPhonePlaceholder')} />
              </div>
            </div>
            <button type="submit" style={{...primaryGradientButtonStyle, padding: '0.625rem 1.25rem', fontSize: '0.875rem'}} 
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:-translate-y-0.5">
              {t('accountSettings.addEmergencyContactButton')}
            </button>
          </form>
          {emergencyContacts.length > 0 ? (
            <ul className="space-y-3"> 
              {emergencyContacts.map(contact => (
                <li key={contact.id} className="p-3 rounded-lg flex justify-between items-center" style={{backgroundColor: Colors.inputBackground , border: `1px solid ${Colors.cardBorder}`, boxShadow: Colors.boxShadowSoft}}> 
                  <div>
                    <p className="font-medium text-sm" style={{color: Colors.text}}>{contact.name}</p> 
                    <p className="text-sm" style={{color: Colors.text_secondary}}>{contact.phone}</p>
                  </div>
                  <button type="button" onClick={() => onDeleteEmergencyContact(contact.id)}
                    style={smallErrorAccentButtonStyle}
                    className="focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-red-500 active:scale-95 hover:bg-red-50" 
                    aria-label={t('accountSettings.deleteEmergencyContact', {name: contact.name})}>
                    {t('adminPortal.deleteUser')} 
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic" style={{color: Colors.text_secondary}}>{t('accountSettings.noEmergencyContactsYet')}</p> 
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={headingStyle}>{t('accountSettings.appearance')}</h2>
           <div>
              <label htmlFor="themeSelect" style={labelStyle}>{t('accountSettings.themeLabel')}</label>
              <select id="themeSelect" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}
                style={selectStyle} className={`focus:ring-2 focus:ring-blue-500`}>
                <option value="system" style={{backgroundColor: Colors.cardBackground, color: Colors.text}}>{t('accountSettings.themeSystem')}</option>
                <option value="light" disabled style={{backgroundColor: Colors.cardBackground, color: Colors.text_secondary}}>{t('accountSettings.themeLight')} (Default)</option>
                <option value="dark" disabled style={{backgroundColor: Colors.cardBackground, color: Colors.text_secondary}}>{t('accountSettings.themeDark')}</option>
              </select>
            </div>
        </div>

        <div className="mt-8 text-right"> 
          <button type="submit" style={primaryGradientButtonStyle}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-98 hover:-translate-y-0.5">
            {t('saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettingsPage;