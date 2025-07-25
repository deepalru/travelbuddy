import React from 'react';
import { Colors } from '../constants.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { PlannerView } from '../types.ts';

interface PlannerHomeViewProps {
  setPlannerView: (view: PlannerView) => void;
}

const PlannerHomeView: React.FC<PlannerHomeViewProps> = ({ setPlannerView }) => {
  const { t } = useLanguage();

  const planningOptions = [
    {
      view: 'oneDay' as PlannerView,
      titleKey: 'plannerHubView.oneDayTitle',
      descKey: 'plannerHubView.oneDayDesc',
      buttonKey: 'plannerHubView.oneDayButton',
      icon: '🗺️',
      gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      tier: 'basic',
    },
    {
      view: 'multiDay' as PlannerView,
      titleKey: 'plannerHubView.multiDayTitle',
      descKey: 'plannerHubView.multiDayDesc',
      buttonKey: 'plannerHubView.multiDayButton',
      icon: '✈️',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      tier: 'premium',
    },
    {
      view: 'localAgency' as PlannerView,
      titleKey: 'plannerHubView.localAgencyTitle',
      descKey: 'plannerHubView.localAgencyDesc',
      buttonKey: 'plannerHubView.localAgencyButton',
      icon: '🤵',
      gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
      tier: 'premium',
    },
  ];

  return (
    <div className="animate-fadeInUp max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <span className="text-sm font-semibold">✨ AI-Powered Planning</span>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 gradient-text">{t('plannerHubView.title')}</h1>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          {t('plannerHubView.subtitle')}
        </p>
      </div>

      {/* Planning Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {planningOptions.map((option, index) => (
          <div
            key={option.view}
            className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ 
              backgroundColor: 'var(--color-surface)', 
              borderColor: 'var(--color-glass-border)',
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Gradient Header */}
            <div 
              className="h-24 relative flex items-center justify-center"
              style={{ background: option.gradient }}
            >
              <div className="text-4xl filter drop-shadow-lg">{option.icon}</div>
              {option.tier === 'premium' && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 rounded-full">
                  <span className="text-xs font-bold text-white">PRO</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {t(option.titleKey)}
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {t(option.descKey)}
              </p>
              
              {/* Action Button */}
              <button
                onClick={() => setPlannerView(option.view)}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
                style={{ background: option.gradient }}
              >
                {t(option.buttonKey)}
              </button>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-input-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          💡 <strong>Pro Tip:</strong> Start with a one-day itinerary to explore your destination, then upgrade to multi-day planning for longer adventures!
        </p>
      </div>
    </div>
  );
};

export default PlannerHomeView;
