import React, { useState } from 'react';
import { TripPace, TravelStyle, BudgetLevel, UserInterest } from '../types.ts';
import { Colors } from '../constants.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

// --- Icon Components (replaces lucide-react imports) ---
const Icon = ({ className = 'w-6 h-6', children }: { className?: string, children: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
);
const MapPin = ({className}:{className?:string}) => <Icon className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></Icon>;
const CalendarDays = ({className}:{className?:string}) => <Icon className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></Icon>;
const Wallet = ({className}:{className?:string}) => <Icon className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></Icon>;
const CreditCard = ({className}:{className?:string}) => <Icon className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></Icon>;
const Gem = ({className}:{className?:string}) => <Icon className={className}><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M12 22V9"/><path d="m3.5 8.5 17 0"/><path d="M2 9 12 3l10 6"/></Icon>;
const Footprints = ({className}:{className?:string}) => <Icon className={className}><path d="M4 16v-2.38c0-.9.6-1.7 1.48-1.93l3.3-1c.42-.12.87-.04 1.25.2l3.3 2.1c.38.24.83.33 1.27.26l3.3-1.04c.9-.28 1.9.23 2.18 1.13l.32.98"/><path d="M12 20.38c0-.9.6-1.7 1.48-1.93l3.3-1c.42-.12.87-.04 1.25.2l3.3 2.1c.38.24.83.33 1.27.26l3.3-1.04c.9-.28 1.9.23 2.18 1.13l.32.98"/><path d="M8 12.38c0-.9.6-1.7 1.48-1.93l3.3-1c.42-.12.87-.04 1.25.2l3.3 2.1c.38.24.83.33 1.27.26l3.3-1.04c.9-.28 1.9.23 2.18 1.13l.32.98"/></Icon>;
const Zap = ({className}:{className?:string}) => <Icon className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
const Bot = ({className}:{className?:string}) => <Icon className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></Icon>;
const Move = ({className}:{className?:string}) => <Icon className={className}><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></Icon>;
const Backpack = ({className}:{className?:string}) => <Icon className={className}><path d="M5 20V10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2Z"/><path d="M8 18h8"/><path d="M9 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/><path d="M12 8v2"/></Icon>;
const Building = ({className}:{className?:string}) => <Icon className={className}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></Icon>;
const Users = ({className}:{className?:string}) => <Icon className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
const Heart = ({className}:{className?:string}) => <Icon className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Icon>;
const Sprout = ({className}:{className?:string}) => <Icon className={className}><path d="M7 20h10"/><path d="M10 20v-6l-2-2"/><path d="M14 20v-6l2-2"/><path d="M12 14V2"/><path d="m14 4-2-2-2 2"/></Icon>;
const UtensilsCrossed = ({className}:{className?:string}) => <Icon className={className}><path d="m16 2-8.4 8.4a.9.9 0 0 0 0 1.2l6.8 6.8a.9.9 0 0 0 1.2 0l8.4-8.4"/><path d="m18 16 2-2"/><path d="m6 8-2 2"/><path d="m2 16 6 6"/><path d="M14 4 6 12"/></Icon>;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 p-6 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)' }}>
      <h3 className="text-xl font-bold mb-4" style={{color: 'var(--color-text-primary)'}}>{title}</h3>
      {children}
    </div>
);

interface AITripPlannerViewProps {
  tripDestination: string;
  setTripDestination: (value: string) => void;
  tripDuration: string;
  setTripDuration: (value: string) => void;
  tripInterests: string;
  setTripInterests: (value: string) => void;
  tripPace: TripPace;
  setTripPace: (value: TripPace) => void;
  tripTravelStyles: TravelStyle[];
  setTripTravelStyles: React.Dispatch<React.SetStateAction<TravelStyle[]>>;
  tripBudget: BudgetLevel;
  setTripBudget: (value: BudgetLevel) => void;
  isGeneratingTripPlan: boolean;
  handleGenerateTripPlan: () => void;
}

const AITripPlannerView: React.FC<AITripPlannerViewProps> = ({
  tripDestination,
  setTripDestination,
  tripDuration,
  setTripDuration,
  tripInterests,
  setTripInterests,
  tripPace,
  setTripPace,
  tripTravelStyles,
  setTripTravelStyles,
  tripBudget,
  setTripBudget,
  isGeneratingTripPlan,
  handleGenerateTripPlan,
}) => {
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [weatherPreference, setWeatherPreference] = useState<string>('any');
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [showSavedGuides, setShowSavedGuides] = useState<boolean>(false);
  const [editingGuideIndex, setEditingGuideIndex] = useState<number | null>(null);
  const [editingGuide, setEditingGuide] = useState<any>(null);

  // New state for expense categories and expenses
  const [expenseCategories, setExpenseCategories] = useState<string[]>(['Accommodation', 'Food', 'Transport']);
  const [expenses, setExpenses] = useState<{ category: string; amount: number; description: string }[]>([]);

  // New state for saved trip plans
  const [savedTripPlans, setSavedTripPlans] = useState<any[]>([]);

  // Function to save current trip plan
  const handleSaveTripPlan = () => {
    if (!tripDestination || !tripDuration) {
      alert('Please enter trip destination and duration before saving.');
      return;
    }
    const newPlan = {
      destination: tripDestination,
      duration: tripDuration,
      interests: tripInterests,
      pace: tripPace,
      travelStyles: tripTravelStyles,
      budget: tripBudget,
      estimatedBudget,
      savedAt: new Date().toISOString(),
    };
    setSavedTripPlans(prev => [...prev, newPlan]);
    alert('Trip plan saved successfully!');
  };

  const quickTemplates = [
    { name: 'Weekend Getaway', duration: '2-3 days', styles: [TravelStyle.RomanticGetaway], pace: TripPace.Relaxed },
    { name: 'Adventure Trip', duration: '5-7 days', styles: [TravelStyle.Adventure, TravelStyle.NatureLover], pace: TripPace.FastPaced },
    { name: 'Cultural Explorer', duration: '4-6 days', styles: [TravelStyle.Cultural, TravelStyle.Foodie], pace: TripPace.Moderate },
    { name: 'Family Vacation', duration: '7-10 days', styles: [TravelStyle.FamilyFriendly], pace: TripPace.Relaxed },
  ];
  
  const applyTemplate = (template: any) => {
    setTripDuration(template.duration);
    setTripTravelStyles(template.styles);
    setTripPace(template.pace);
  };

  const handleSaveLocalGuide = () => {
    const newGuide = {
      destination: tripDestination,
      duration: tripDuration,
      interests: tripInterests,
      pace: tripPace,
      travelStyles: tripTravelStyles,
      budget: tripBudget,
      savedAt: new Date().toISOString(),
    };
    setSavedTemplates(prev => [...prev, newGuide]);
    alert('Local Guide saved successfully!');
  };

  const handleDeleteGuide = (index: number) => {
    setSavedTemplates(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditGuide = (index: number) => {
    setEditingGuideIndex(index);
    setEditingGuide(savedTemplates[index]);
    setShowSavedGuides(false);
  };

  const handleSaveEditedGuide = () => {
    if (editingGuideIndex !== null && editingGuide) {
      setSavedTemplates(prev => prev.map((guide, i) => i === editingGuideIndex ? editingGuide : guide));
      setEditingGuideIndex(null);
      setEditingGuide(null);
      alert('Local Guide updated successfully!');
    }
  };

  const { t } = useLanguage();

  const paceOptions = [
    { value: TripPace.Relaxed, labelKey: 'aiTripPlannerView.paceRelaxed', descKey: 'aiTripPlannerView.paceRelaxedDesc', icon: <Footprints className="w-6 h-6" /> },
    { value: TripPace.Moderate, labelKey: 'aiTripPlannerView.paceModerate', descKey: 'aiTripPlannerView.paceModerateDesc', icon: <Move className="w-6 h-6" /> },
    { value: TripPace.FastPaced, labelKey: 'aiTripPlannerView.paceFastPaced', descKey: 'aiTripPlannerView.paceFastPacedDesc', icon: <Zap className="w-6 h-6" /> },
  ];

  const budgetOptions = [
    { value: BudgetLevel.BudgetFriendly, labelKey: 'aiTripPlannerView.budgetBudgetFriendly', descKey: 'aiTripPlannerView.budgetBudgetFriendlyDesc', icon: <Wallet className="w-6 h-6" /> },
    { value: BudgetLevel.MidRange, labelKey: 'aiTripPlannerView.budgetMidRange', descKey: 'aiTripPlannerView.budgetMidRangeDesc', icon: <CreditCard className="w-6 h-6" /> },
    { value: BudgetLevel.Luxury, labelKey: 'aiTripPlannerView.budgetLuxury', descKey: 'aiTripPlannerView.budgetLuxuryDesc', icon: <Gem className="w-6 h-6" /> },
  ];
  
  const travelStyleToLabelKey = (style: TravelStyle): string => {
    return 'travelStyle.' + style.toLowerCase().replace(/ & /g, '').replace(/ /g, '').replace(/-/g, '');
  };
  
  const travelStyleOptions = [
    { value: TravelStyle.Adventure, icon: <Backpack className="w-4 h-4" /> },
    { value: TravelStyle.Cultural, icon: <Building className="w-4 h-4" /> },
    { value: TravelStyle.FamilyFriendly, icon: <Users className="w-4 h-4" /> },
    { value: TravelStyle.RomanticGetaway, icon: <Heart className="w-4 h-4" /> },
    { value: TravelStyle.Foodie, icon: <UtensilsCrossed className="w-4 h-4" /> },
    { value: TravelStyle.NatureLover, icon: <Sprout className="w-4 h-4" /> },
    { value: TravelStyle.Luxury, icon: <Gem className="w-4 h-4" /> },
    { value: TravelStyle.BudgetExplorer, icon: <Wallet className="w-4 h-4" /> },
  ];

  const handleStyleToggle = (style: TravelStyle) => {
    setTripTravelStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const userInterestToLabelKey = (interest: UserInterest): string => {
    const key = interest.replace(/ & /g, '').replace(/ /g, '').toLowerCase();
    return `userInterests.${key}`;
  }

  const handleInterestTagClick = (interest: UserInterest) => {
    const interestsArray = tripInterests.split(',').map(i => i.trim()).filter(Boolean);
    const translatedInterest = t(userInterestToLabelKey(interest));
    if (!interestsArray.some(i => i.toLowerCase() === translatedInterest.toLowerCase())) {
        setTripInterests([...interestsArray, translatedInterest].join(', '));
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeInUp">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 gradient-text">{t('aiTripPlannerView.mainTitle')}</h1>
        <p className="text-lg" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.mainSubtitle')}</p>
      </div>

      <Section title={t('aiTripPlannerView.theBasics')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{color: 'var(--color-text-secondary)'}}>
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={t('aiTripPlannerView.destinationPlaceholder')}
              value={tripDestination}
              onChange={e => setTripDestination(e.target.value)}
              className="input-base w-full pl-10 pr-4 py-3 text-md"
            />
          </div>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{color: 'var(--color-text-secondary)'}}>
                <CalendarDays className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder={t('aiTripPlannerView.durationPlaceholder')}
              value={tripDuration}
              onChange={e => setTripDuration(e.target.value)}
              className="input-base w-full pl-10 pr-4 py-3 text-md"
            />
          </div>
          <div className="relative">
            <select
              value={weatherPreference}
              onChange={e => setWeatherPreference(e.target.value)}
              className="input-base w-full py-3 text-md"
            >
              <option value="any">Any Weather</option>
              <option value="sunny">Sunny & Warm</option>
              <option value="mild">Mild & Pleasant</option>
              <option value="cool">Cool & Crisp</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Budget Estimation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--color-text-secondary)'}}>Estimated Budget (USD)</label>
            <input
              type="text"
              placeholder="e.g., $1000-2000"
              value={estimatedBudget}
              onChange={e => setEstimatedBudget(e.target.value)}
              className="input-base w-full"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-lg w-full" style={{backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-glass-border)'}}>
              <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>💡 Budget will be considered for accommodation, dining, and activity recommendations</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Expense Categories</h4>
              <ul className="mb-2">
                {expenseCategories.map((cat, idx) => (
                  <li key={idx} className="text-sm" style={{color: 'var(--color-text-secondary)'}}>{cat}</li>
                ))}
              </ul>
              <button onClick={() => {
                const newCategory = prompt('Enter new expense category:');
                if (newCategory && !expenseCategories.includes(newCategory)) {
                  setExpenseCategories(prev => [...prev, newCategory]);
                }
              }} className="btn btn-sm btn-outline">Add Category</button>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{color: 'var(--color-text-primary)'}}>Expenses</h4>
              <ul className="mb-2 max-h-40 overflow-y-auto border rounded p-2" style={{backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)'}}>
                {expenses.length === 0 && <li className="text-xs text-gray-500">No expenses added yet.</li>}
                {expenses.map((expense, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm mb-1">
                    <span>{expense.category}: ${expense.amount.toFixed(2)} - {expense.description}</span>
                    <button onClick={() => setExpenses(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">x</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => {
                const category = prompt('Enter expense category:');
                const amountStr = prompt('Enter expense amount:');
                const description = prompt('Enter expense description:');
                const amount = amountStr ? parseFloat(amountStr) : NaN;
                if (category && !isNaN(amount) && description) {
                  setExpenses(prev => [...prev, { category, amount, description }]);
                }
              }} className="btn btn-sm btn-outline">Add Expense</button>
            </div>
          </div>
        </div>
      </Section>

      <Section title={t('aiTripPlannerView.yourStyle')}>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.paceTitle')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paceOptions.map(option => (
                <button key={option.value} onClick={() => setTripPace(option.value)} className="p-4 rounded-xl text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400" style={{border: `2px solid ${tripPace === option.value ? 'var(--color-primary)' : 'var(--color-glass-border)'}`, transform: tripPace === option.value ? 'scale(1.05)' : 'scale(1)', backgroundColor: 'var(--color-surface)'}}>
                  <div className="mx-auto mb-2" style={{color: tripPace === option.value ? 'var(--color-primary)' : 'var(--color-text-secondary)'}}>{option.icon}</div>
                  <p className="font-semibold text-sm" style={{color: 'var(--color-text-primary)'}}>{t(option.labelKey)}</p>
                  <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>{t(option.descKey)}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.budgetTitle')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {budgetOptions.map(option => (
                <button key={option.value} onClick={() => setTripBudget(option.value)} className="p-4 rounded-xl text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400" style={{border: `2px solid ${tripBudget === option.value ? 'var(--color-primary)' : 'var(--color-glass-border)'}`, transform: tripBudget === option.value ? 'scale(1.05)' : 'scale(1)', backgroundColor: 'var(--color-surface)'}}>
                  <div className="mx-auto mb-2" style={{color: tripBudget === option.value ? 'var(--color-primary)' : 'var(--color-text-secondary)'}}>{option.icon}</div>
                  <p className="font-semibold text-sm" style={{color: 'var(--color-text-primary)'}}>{t(option.labelKey)}</p>
                  <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>{t(option.descKey)}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.stylesTitle')}</h4>
             <p className="text-xs mb-3" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.stylesSubtitle')}</p>
            <div className="flex flex-wrap gap-3">
              {travelStyleOptions.map(option => {
                const isSelected = tripTravelStyles.includes(option.value);
                return (
                  <button key={option.value} onClick={() => handleStyleToggle(option.value)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400" style={{backgroundColor: isSelected ? `var(--color-primary)30` : 'var(--color-surface)', color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)', border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-glass-border)'}`}}>
                    {option.icon}
                    <span>{t(travelStyleToLabelKey(option.value))}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
      
       <Section title={t('aiTripPlannerView.fineTune')}>
         <div>
            <h4 className="font-semibold mb-1" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.interestsTitle')}</h4>
             <p className="text-xs mb-3" style={{color: 'var(--color-text-secondary)'}}>{t('aiTripPlannerView.interestsSubtitle')}</p>
             <div className="flex flex-wrap gap-2 mb-4">
                {Object.values(UserInterest).map(interest => (
                    <button type="button" key={interest} onClick={() => handleInterestTagClick(interest)} className="px-2.5 py-1 text-xs rounded-md transition-colors duration-200" style={{backgroundColor: 'var(--color-surface)', border: `1px solid var(--color-glass-border)`, color: 'var(--color-text-secondary)'}}>
                        + {t(userInterestToLabelKey(interest))}
                    </button>
                ))}
             </div>
            <textarea
              placeholder={t('aiTripPlannerView.interestsPlaceholder')}
              value={tripInterests}
              onChange={e => setTripInterests(e.target.value)}
              className="input-base w-full p-3 text-sm"
              rows={3}
            ></textarea>
         </div>
      </Section>

      <Section title="Quick Templates">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => applyTemplate(template)}
              className="p-3 rounded-lg text-left transition-all hover:scale-105"
              style={{backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-glass-border)'}}
            >
              <p className="font-semibold text-sm" style={{color: 'var(--color-text-primary)'}}>{template.name}</p>
              <p className="text-xs" style={{color: 'var(--color-text-secondary)'}}>{template.duration}</p>
            </button>
          ))}
        </div>
      </Section>

      <div className="mt-8 text-center space-y-4">
        <button onClick={handleGenerateTripPlan} disabled={isGeneratingTripPlan || !tripDestination || !tripDuration} className="btn btn-primary w-full max-w-sm py-4 px-6 text-lg">
            {isGeneratingTripPlan ? (
                <>
                    <Bot className="animate-spin mr-3" />
                    {t('aiTripPlannerView.generatingButton')}
                </>
            ) : (
                <>
                    <Bot className="mr-3" />
                    {t('aiTripPlannerView.generateButton')}
                </>
            )}
        </button>
        <button onClick={handleSaveLocalGuide} disabled={!tripDestination || !tripDuration} className="btn btn-secondary w-full max-w-sm py-3 px-6 text-lg">
          Save as Local Guide
        </button>
        <button onClick={handleSaveTripPlan} disabled={!tripDestination || !tripDuration} className="btn btn-secondary w-full max-w-sm py-3 px-6 text-lg">
          Save Trip Plan
        </button>
        <button onClick={() => setShowSavedGuides(prev => !prev)} className="btn btn-outline w-full max-w-sm py-3 px-6 text-lg">
          {showSavedGuides ? 'Hide' : 'Show'} Saved Guides
        </button>
      </div>

      {showSavedGuides && (
        <div className="max-w-4xl mx-auto mt-6 p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)' }}>
          <h3 className="text-xl font-semibold mb-4">Saved Local Guides</h3>
          {savedTemplates.length === 0 ? (
            <p>No saved guides yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedTemplates.map((guide, index) => (
                <li key={index} className="border p-3 rounded flex justify-between items-center" style={{ borderColor: 'var(--color-glass-border)' }}>
                  <div>
                    <p><strong>Destination:</strong> {guide.destination}</p>
                    <p><strong>Duration:</strong> {guide.duration}</p>
                    <p><strong>Interests:</strong> {guide.interests}</p>
                    <p><strong>Pace:</strong> {guide.pace}</p>
                    <p><strong>Budget:</strong> {guide.budget}</p>
                    <p><small>Saved at: {new Date(guide.savedAt).toLocaleString()}</small></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditGuide(index)} className="btn btn-sm btn-primary">Edit</button>
                    <button onClick={() => handleDeleteGuide(index)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <h3 className="text-xl font-semibold mt-8 mb-4">Saved Trip Plans</h3>
          {savedTripPlans.length === 0 ? (
            <p>No saved trip plans yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedTripPlans.map((plan, index) => (
                <li key={index} className="border p-3 rounded flex justify-between items-center" style={{ borderColor: 'var(--color-glass-border)' }}>
                  <div>
                    <p><strong>Destination:</strong> {plan.destination}</p>
                    <p><strong>Duration:</strong> {plan.duration}</p>
                    <p><strong>Interests:</strong> {plan.interests}</p>
                    <p><strong>Pace:</strong> {plan.pace}</p>
                    <p><strong>Budget:</strong> {plan.budget}</p>
                    <p><strong>Estimated Budget:</strong> {plan.estimatedBudget}</p>
                    <p><small>Saved at: {new Date(plan.savedAt).toLocaleString()}</small></p>
                  </div>
                  <div>
                    <button onClick={() => setSavedTripPlans(prev => prev.filter((_, i) => i !== index))} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editingGuide && (
        <div className="max-w-4xl mx-auto mt-6 p-4 border rounded-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-glass-border)' }}>
          <h3 className="text-xl font-semibold mb-4">Edit Local Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Destination</label>
              <input type="text" value={editingGuide.destination} onChange={e => setEditingGuide({...editingGuide, destination: e.target.value})} className="input-base w-full" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Duration</label>
              <input type="text" value={editingGuide.duration} onChange={e => setEditingGuide({...editingGuide, duration: e.target.value})} className="input-base w-full" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Interests</label>
              <input type="text" value={editingGuide.interests} onChange={e => setEditingGuide({...editingGuide, interests: e.target.value})} className="input-base w-full" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Pace</label>
              <input type="text" value={editingGuide.pace} onChange={e => setEditingGuide({...editingGuide, pace: e.target.value})} className="input-base w-full" />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Budget</label>
              <input type="text" value={editingGuide.budget} onChange={e => setEditingGuide({...editingGuide, budget: e.target.value})} className="input-base w-full" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSaveEditedGuide} className="btn btn-primary">Save Changes</button>
            <button onClick={() => { setEditingGuide(null); setEditingGuideIndex(null); }} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITripPlannerView;