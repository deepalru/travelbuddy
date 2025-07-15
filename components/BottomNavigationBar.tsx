import React from 'react';
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { ActiveTab } from '@/types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tabName: ActiveTab) => void;
}

const BottomNavigationBar: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const navItems = [
    { name: 'forYou', labelKey: 'bottomNav.home', icon: '✨' },
    { name: 'placeExplorer', labelKey: 'bottomNav.places', icon: '🗺️' },
    { name: 'deals', labelKey: 'bottomNav.deals', icon: '🏷️' },
    { name: 'community', labelKey: 'bottomNav.community', icon: '🗣️' },
    { name: 'aiTripPlanner', labelKey: 'bottomNav.aiPlan', icon: '🤖' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        backgroundColor: Colors.cardBackground,
        borderTop: `1px solid ${Colors.cardBorder}`,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name as ActiveTab)}
              className="flex flex-col items-center justify-center w-full h-full transition-colors duration-200"
              style={{ color: isActive ? Colors.primary : Colors.text_secondary }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(item.labelKey)}
            >
              <span className="text-2xl mb-0.5">{item.icon}</span>
              <span className={`text-xs font-medium transition-all duration-200 ${isActive ? 'font-bold' : ''}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
