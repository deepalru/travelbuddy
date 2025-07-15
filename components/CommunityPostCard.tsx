
import React from 'react';
import { CommunityPost, CurrentUser, TripPlanSuggestion, Place } from '@/types';
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommunityPostCardProps {
  post: CommunityPost;
  currentUser: CurrentUser | null;
  onLikePost: (postId: string) => void;
  onViewTripPlan: (plan: TripPlanSuggestion) => void;
  allTripPlans: TripPlanSuggestion[];
  allPlaces: Place[]; // New prop
  onViewPlaceDetail: (place: Place) => void; // New prop
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  currentUser,
  onLikePost,
  onViewTripPlan,
  allTripPlans,
  allPlaces,
  onViewPlaceDetail,
}) => {
  const { t } = useLanguage();
  const isLikedByCurrentUser = currentUser ? post.likedBy.includes(currentUser.username) : false;

  const handleViewTrip = () => {
    if (post.type === 'tripPlan' && post.tripPlanId) {
      const fullPlan = allTripPlans.find(p => p.id === post.tripPlanId);
      if (fullPlan) {
        onViewTripPlan(fullPlan);
      } else {
        console.warn(`Trip plan with ID ${post.tripPlanId} not found.`);
      }
    }
  };
  
  const baseButtonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '0.625rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowSoft,
    fontSize: '0.875rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
  };

  const likeButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: isLikedByCurrentUser ? `${Colors.primary}2A` : Colors.inputBackground,
    color: isLikedByCurrentUser ? Colors.primary : Colors.text_secondary,
    borderColor: isLikedByCurrentUser ? Colors.primary : Colors.cardBorder,
    borderWidth: '1px',
    borderStyle: 'solid',
  };

  const viewTripButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
  };
  
  const smallActionButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}CC, ${Colors.primaryGradientEnd}CC)`,
    color: 'white',
  };

  return (
    <div
      className="bg-white shadow-lg rounded-xl p-5 border"
      style={{ borderColor: Colors.cardBorder }}
    >
      <div className="flex items-center mb-3">
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white mr-3"
          style={{ backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.accentInfo})` }}
        >
          {post.username.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: Colors.text }}>
            {post.username}
          </p>
          <p className="text-xs" style={{ color: Colors.text_secondary }}>
            {new Date(post.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {post.content && (
        <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: Colors.text_secondary, lineHeight: 1.6 }}>
          {post.content}
        </p>
      )}

      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className={`grid grid-cols-${Math.min(post.imageUrls.length, 3)} gap-2 mb-3`}>
          {post.imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`post image ${index + 1}`} className="w-full h-auto max-h-48 object-cover rounded-md border" style={{borderColor: Colors.cardBorder}}/>
          ))}
        </div>
      )}

      {post.attachedPlaceIds && post.attachedPlaceIds.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{color: Colors.primary}}>{t('communityTab.attachedPlacesLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {post.attachedPlaceIds.map(placeId => {
              const place = allPlaces.find(p => p.id === placeId);
              if (!place) return null;
              return (
                <div key={placeId} className="p-2 rounded-md flex items-center justify-between" style={{backgroundColor: Colors.inputBackground, border: `1px solid ${Colors.cardBorder}`, flexBasis: 'calc(50% - 0.25rem)'}}>
                  <span className="text-xs font-medium" style={{color: Colors.text}}>{place.name}</span>
                  <button onClick={() => onViewPlaceDetail(place)} style={smallActionButtonStyle}>
                    {t('communityTab.viewPlaceButton')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {post.attachedDealIds && post.attachedDealIds.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{color: Colors.primary}}>{t('communityTab.attachedDealsLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {post.attachedDealIds.map(dealId => {
              const placeWithDeal = allPlaces.find(p => p.deal?.id === dealId);
              const deal = placeWithDeal?.deal;
              if (!deal || !placeWithDeal) return null;
              return (
                <div key={dealId} className="p-2 rounded-md flex items-center justify-between" style={{backgroundColor: Colors.inputBackground, border: `1px solid ${Colors.cardBorder}`, flexBasis: 'calc(50% - 0.25rem)'}}>
                  <div>
                    <span className="text-xs font-medium block" style={{color: Colors.text}}>{deal.title} ({deal.discount})</span>
                    <span className="text-2xs block" style={{color: Colors.text_secondary}}>{t('dealsTab.atLabel')}: {placeWithDeal.name}</span>
                  </div>
                  <button onClick={() => onViewPlaceDetail(placeWithDeal)} style={smallActionButtonStyle}>
                    {t('communityTab.viewDealsPlaceButton')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {post.type === 'tripPlan' && post.tripPlanSummary && (
        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: Colors.inputBackground, border: `1px solid ${Colors.cardBorder}`}}>
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{color: Colors.primary}}>{t('communityTab.sharedATrip')}</p>
          <h4 className="font-semibold text-md" style={{ color: Colors.text }}>
            {post.tripPlanSummary.title}
          </h4>
          <p className="text-xs" style={{ color: Colors.text_secondary }}>
            {post.tripPlanSummary.destination} - {post.tripPlanSummary.duration}
          </p>
          <button
            onClick={handleViewTrip}
            style={{...viewTripButtonStyle, marginTop: '0.75rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem'}}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500/70 active:scale-98 hover:-translate-y-0.5"
          >
            {t('communityTab.viewTripPlanButton')}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: Colors.cardBorder }}>
        <button
          onClick={() => onLikePost(post.id)}
          style={likeButtonStyle}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500/70 active:scale-95"
          aria-pressed={isLikedByCurrentUser}
          aria-label={isLikedByCurrentUser ? t('communityTab.unlikeButton') : t('communityTab.likeButton')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            {isLikedByCurrentUser ? (
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865.802L6 10.333z" />
            ) : (
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656zM10 15.233l5.828-5.829a2 2 0 10-2.828-2.828L10 9.172l-2.99-2.99a2 2 0 00-2.828 2.828L10 15.233z" clipRule="evenodd" />
            )}
          </svg>
          <span>{isLikedByCurrentUser ? t('communityTab.unlikeButton') : t('communityTab.likeButton')}</span>
        </button>
        <span className="text-xs" style={{ color: Colors.text_secondary }}>
          {t('communityTab.likesCount', { count: post.likes.toString() })}
        </span>
      </div>
    </div>
  );
};

export default CommunityPostCard;