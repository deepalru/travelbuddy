
import React, { useState } from 'react';
import { CommunityPost, CurrentUser, TripPlanSuggestion, Place } from '@/types';
import { Colors } from '@/constants';
import CommunityPostCard from '@/components/CommunityPostCard';
import { useLanguage } from '@/contexts/LanguageContext';
import LockIcon from '@/components/LockIcon';

// --- Icon Components (replaces lucide-react imports) ---
const Icon = ({ size = 18, className = '', children }: { size?: number, className?: string, children: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
);
const LayoutGrid = ({size, className}:{size?:number, className?:string}) => <Icon size={size} className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></Icon>;
const List = ({size, className}:{size?:number, className?:string}) => <Icon size={size} className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></Icon>;


interface CommunityViewProps {
  posts: CommunityPost[];
  currentUser: CurrentUser | null;
  onOpenCreatePostModal: () => void;
  onLikePost: (postId: string) => void;
  onViewTripPlan: (plan: TripPlanSuggestion) => void;
  allTripPlans: TripPlanSuggestion[];
  hasAccessToPremium: boolean;
  allPlaces: Place[];
  onViewPlaceDetail: (place: Place) => void;
}

type ViewMode = 'grid' | 'list';

const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  currentUser,
  onOpenCreatePostModal,
  onLikePost,
  onViewTripPlan,
  allTripPlans,
  hasAccessToPremium,
  allPlaces,
  onViewPlaceDetail,
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const sortedPosts = [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const primaryButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
    fontSize: '0.9375rem',
  };

  const viewToggleButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: Colors.inputBackground,
    color: Colors.text_secondary,
    border: `1px solid ${Colors.cardBorder}`,
    backgroundImage: 'none',
  };

  return (
    <div className="py-6 rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-center sm:text-left" style={{ color: Colors.text }}>
          {t('communityTab.communityFeedTitle')}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={viewToggleButtonStyle}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500/70 active:scale-98 flex items-center gap-2"
            aria-label={viewMode === 'grid' ? t('communityTab.switchToListView') : t('communityTab.switchToGridView')}
          >
            {viewMode === 'grid' ? (
              <List size={18} aria-hidden="true" />
            ) : (
              <LayoutGrid size={18} aria-hidden="true" />
            )}
            <span>{viewMode === 'grid' ? t('communityTab.listView') : t('communityTab.gridView')}</span>
          </button>
          <button
            onClick={onOpenCreatePostModal}
            disabled={!hasAccessToPremium}
            style={{...primaryButtonStyle, opacity: hasAccessToPremium ? 1 : 0.7}}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500/70 active:scale-98 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {!hasAccessToPremium && <LockIcon className="w-4 h-4" color="white" />}
            {t('communityTab.createTextPostButton')}
          </button>
        </div>
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-16 px-6 rounded-xl bg-white shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <p className="text-xl font-semibold mb-2 text-gray-900">{t('communityTab.noPostsYet')}</p>
          {hasAccessToPremium && <p className="text-sm text-gray-500">{t('communityTab.createTextPostPlaceholder', { username: currentUser?.username || 'User' })}</p>}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPosts.map(post => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLikePost={onLikePost}
              onViewTripPlan={onViewTripPlan}
              allTripPlans={allTripPlans}
              allPlaces={allPlaces}
              onViewPlaceDetail={onViewPlaceDetail}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto"> {/* List view can be centered and have max width */}
          {sortedPosts.map(post => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLikePost={onLikePost}
              onViewTripPlan={onViewTripPlan}
              allTripPlans={allTripPlans}
              allPlaces={allPlaces}
              onViewPlaceDetail={onViewPlaceDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityView;