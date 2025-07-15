import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { CurrentUser, ActiveTab } from '@/types';
import SearchBar from '@/components/SearchBar';
import UserMenuDropdown from '@/components/UserMenuDropdown';

interface HeaderProps {
  currentUser: CurrentUser | null;
  onShowAuthModal: (view: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToAccountSettings: () => void; 
  onShowSOSModal: () => void; 
  onNavigateToAdminPortal?: () => void; 
  searchInput: string; 
  onSearchInputChange: (term: string) => void;
  activeTab: ActiveTab;
  onTabChange: (tabName: ActiveTab) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onShowAuthModal,
  onLogout,
  onNavigateToProfile,
  onNavigateToAccountSettings,
  onShowSOSModal, 
  onNavigateToAdminPortal, 
  searchInput, 
  onSearchInputChange,
  activeTab,
  onTabChange
}) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const mainContentRef = document.querySelector('main');

  const navItems = [
    { name: 'forYou', labelKey: 'bottomNav.home' },
    { name: 'placeExplorer', labelKey: 'bottomNav.places' },
    { name: 'deals', labelKey: 'bottomNav.deals' },
    { name: 'community', labelKey: 'bottomNav.community' },
    { name: 'nearbyItinerary', labelKey: 'bottomNav.itinerary' },
    { name: 'aiTripPlanner', labelKey: 'bottomNav.aiPlan' },
  ];

  useEffect(() => {
    const handleScroll = () => {
        if (mainContentRef) {
          setIsScrolled(mainContentRef.scrollTop > 10);
        }
    };
    mainContentRef?.addEventListener('scroll', handleScroll);
    return () => mainContentRef?.removeEventListener('scroll', handleScroll);
  }, [mainContentRef]);
  
  const commonButtonStyles = "text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 whitespace-nowrap";
  
  const primaryButtonHeaderStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
    boxShadow: Colors.boxShadowButton
  };

  const secondaryButtonHeaderStyle: React.CSSProperties = {
    color: Colors.primary,
    backgroundColor: 'transparent',
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out`}
      style={{
        backgroundColor: isScrolled ? Colors.cardBackground : 'transparent',
        boxShadow: isScrolled ? Colors.boxShadowHeader : 'none',
        borderBottom: isScrolled ? `1px solid ${Colors.cardBorder}` : '1px solid transparent'
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`}}>
                <span className="text-white font-bold text-base">TB</span>
              </div>
              <span className={`text-xl font-bold transition-all duration-200 ease-in-out overflow-hidden`} style={{ color: Colors.primary }}>
                Travel Buddy
              </span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
                {navItems.map(item => {
                    const isActive = activeTab === item.name;
                    return (
                        <button
                            key={item.name}
                            onClick={() => onTabChange(item.name as ActiveTab)}
                            className="px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative"
                            style={{
                                color: isActive ? Colors.primary : Colors.text_secondary,
                            }}
                        >
                            {t(item.labelKey)}
                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                                    style={{ backgroundColor: Colors.primary }}
                                ></span>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>

        <div className="flex-grow max-w-lg mx-4 hidden sm:block">
          <SearchBar searchTerm={searchInput} onSearchTermChange={onSearchInputChange} />
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <UserMenuDropdown
              currentUser={currentUser}
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToAccountSettings={onNavigateToAccountSettings}
              onShowSOSModal={onShowSOSModal}
              onNavigateToAdminPortal={currentUser.isAdmin ? onNavigateToAdminPortal : undefined}
              onLogout={onLogout}
            />
          ) : (
            <>
              <button
                onClick={() => onShowAuthModal('login')}
                className={`${commonButtonStyles}`}
                style={secondaryButtonHeaderStyle}
                aria-label={t('header.login')}
              >
                {t('header.login')}
              </button>
              <button
                onClick={() => onShowAuthModal('register')}
                className={`${commonButtonStyles} hidden sm:inline-flex`} 
                style={primaryButtonHeaderStyle}
                aria-label={t('header.signUp')}
              >
                {t('header.signUp')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;