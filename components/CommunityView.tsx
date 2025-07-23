import React, { useState, useMemo } from 'react';
import { Post, CurrentUser, TrendingDestination } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import {
  TrendingUp, Globe, Star, Camera as CameraIcon, Calendar, Plus, Send, Search, MapPin
} from './Icons.tsx';
import CommunityPostCard from './CommunityPostCard.tsx';

interface CommunityViewProps {
  posts: Post[];
  currentUser: CurrentUser | null;
  onOpenCreatePostModal: () => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onSharePost: (post: Post) => void;
  hasAccessToPremium: boolean;
}

type CommunityTab = 'feed' | 'trending' | 'myPosts';
export type PostFilter = 'All' | 'Experiences' | 'Tips' | 'Photos' | 'Itineraries';

// Mock Data
const trendingDestinations: TrendingDestination[] = [
    { name: 'Bali', country: 'Indonesia', posts: 1250, growth: '+15%', image: 'https://source.unsplash.com/80x80/?bali' },
    { name: 'Iceland', country: 'Iceland', posts: 980, growth: '+22%', image: 'https://source.unsplash.com/80x80/?iceland' },
    { name: 'Morocco', country: 'Morocco', posts: 760, growth: '+8%', image: 'https://source.unsplash.com/80x80/?morocco' },
];

const CommunityView: React.FC<CommunityViewProps> = (props) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');

  const renderContent = () => {
    switch (activeTab) {
      case 'trending': return <TrendingTabContent />;
      case 'myPosts': return <MyPostsTabContent posts={props.posts.filter(p => p.author.name === props.currentUser?.username)} onTabChange={setActiveTab} {...props} />;
      case 'feed':
      default:
        return <FeedTabContent {...props} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 animate-fadeInUp">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{t('communityPage.title')}</h1>
        <p className="mt-1 text-md" style={{ color: 'var(--color-text-secondary)' }}>{t('communityPage.description')}</p>
      </div>
      <div className="card-base p-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {(['feed', 'trending', 'myPosts'] as CommunityTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {t(`communityPage.tabs.${tab}`)}
              </button>
            ))}
          </div>
      </div>
      {renderContent()}
    </div>
  );
};

const FeedTabContent: React.FC<CommunityViewProps> = (props) => {
    const { posts, currentUser, onOpenCreatePostModal } = props;
    const { t } = useLanguage();
    const [filter, setFilter] = useState<PostFilter>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filters: { id: PostFilter, labelKey: string, icon: React.ReactNode }[] = [
        { id: 'All', labelKey: 'communityPage.filters.all', icon: <Globe size={16} /> },
        { id: 'Experiences', labelKey: 'communityPage.filters.experiences', icon: <Star size={16} /> },
        { id: 'Tips', labelKey: 'communityPage.filters.tips', icon: <TrendingUp size={16} /> },
        { id: 'Photos', labelKey: 'communityPage.filters.photos', icon: <CameraIcon size={16} /> },
        { id: 'Itineraries', labelKey: 'communityPage.filters.itineraries', icon: <Calendar size={16} /> },
    ];

    const filteredPosts = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return posts.filter(p => {
            const categoryMatch = filter === 'All' || p.category.toLowerCase() === filter.slice(0,-1).toLowerCase();
            const searchMatch = !searchQuery.trim() ||
                p.content.text.toLowerCase().includes(lowerCaseQuery) ||
                p.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)) ||
                p.author.name.toLowerCase().includes(lowerCaseQuery);
            return categoryMatch && searchMatch;
        });
    }, [posts, filter, searchQuery]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
                <div className="card-base p-4">
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input 
                            type="text"
                            placeholder={t('communityPage.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-base w-full pl-9 text-sm"
                        />
                    </div>
                    <textarea value={`${currentUser?.username || 'Traveler'}, ${t('communityPage.createPost.placeholder')}`} readOnly onClick={onOpenCreatePostModal} className="input-base w-full text-sm mb-2 cursor-pointer" rows={2}></textarea>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <button onClick={onOpenCreatePostModal} className="btn btn-secondary p-2"><CameraIcon size={16}/></button>
                            <button onClick={onOpenCreatePostModal} className="btn btn-secondary p-2"><MapPin size={16}/></button>
                        </div>
                        <button onClick={onOpenCreatePostModal} className="btn btn-primary p-2"><Send size={16}/></button>
                    </div>
                </div>
                 <div className="card-base p-4">
                    <h3 className="font-semibold mb-3">{t('communityPage.filters.title')}</h3>
                    <div className="space-y-2">
                        {filters.map(f => (
                             <button key={f.id} onClick={() => setFilter(f.id)}
                                className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${filter === f.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {f.icon} {t(f.labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
            {/* Main Feed */}
            <main className="lg:col-span-3 space-y-6">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <CommunityPostCard key={post.id} {...props} post={post} />
                    ))
                ) : (
                    <div className="card-base p-10 text-center">
                        <p className="font-semibold">No posts found.</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const TrendingTabContent: React.FC = () => {
    const { t } = useLanguage();
    return (
         <div className="card-base p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp /> {t('communityPage.trending.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingDestinations.map(dest => (
                    <div key={dest.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <img src={dest.image} alt={dest.name} className="w-16 h-16 rounded-md object-cover"/>
                        <div>
                            <p className="font-semibold">{dest.name}</p>
                            <p className="text-sm text-gray-500">{dest.country}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{dest.posts} posts</span>
                                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">{dest.growth}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyPostsTabContent: React.FC<{posts: Post[], onTabChange: (tab: CommunityTab) => void} & Omit<CommunityViewProps, 'posts'>> = ({ posts, onTabChange, ...props }) => {
    const { t } = useLanguage();
    if (posts.length === 0) {
        return (
            <div className="card-base p-10 text-center">
                <CameraIcon size={40} className="mx-auto text-gray-400 mb-4"/>
                <h3 className="text-lg font-semibold">{t('communityPage.myPosts.noPostsMessage')}</h3>
                <button onClick={() => onTabChange('feed')} className="btn btn-primary mt-4">
                    <Plus size={16} className="mr-2"/> {t('communityPage.myPosts.createFirstPostButton')}
                </button>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            {posts.map(post => (
                <CommunityPostCard key={post.id} {...props} post={post}/>
            ))}
        </div>
    );
};

export default CommunityView;