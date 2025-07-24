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
    },
    {
      view: 'multiDay' as PlannerView,
      titleKey: 'plannerHubView.multiDayTitle',
      descKey: 'plannerHubView.multiDayDesc',
      buttonKey: 'plannerHubView.multiDayButton',
      icon: '✈️',
    },
    {
      view: 'localAgency' as PlannerView,
      titleKey: 'plannerHubView.localAgencyTitle',
      descKey: 'plannerHubView.localAgencyDesc',
      buttonKey: 'plannerHubView.localAgencyButton',
      icon: '🤵',
    },
  ];

  return (
    <div className="animate-fadeInUp max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 gradient-text">{t('plannerHubView.title')}</h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          {t('plannerHubView.subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planningOptions.map((option) => (
          <div
            key={option.view}
            className="card-base p-6 flex flex-col text-center"
          >
            <div className="text-5xl mb-4">{option.icon}</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {t(option.titleKey)}
            </h3>
            <p className="text-sm mb-6 flex-grow" style={{ color: 'var(--color-text-secondary)' }}>
              {t(option.descKey)}
            </p>
            <button
              onClick={() => setPlannerView(option.view)}
              className="btn btn-primary w-full mt-auto"
            >
              {t(option.buttonKey)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannerHomeView;
