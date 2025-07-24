import React, { useState } from 'react';
import { Post } from '../types.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { Heart, MessageCircle, Share, Bookmark, MapPin as MapPinIcon, MoreHorizontal } from './Icons.tsx';

interface PostCardProps {
    post: Post;
    onLikePost: (id: string) => void;
    onBookmarkPost: (id: string) => void;
    onSharePost: (post: Post) => void;
}

const CommunityPostCard: React.FC<PostCardProps> = ({ post, onLikePost, onBookmarkPost, onSharePost }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const canExpand = post.content.text.length > 200;

    const formatTime = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y ${t('communityPage.post.ago')}`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo ${t('communityPage.post.ago')}`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d ${t('communityPage.post.ago')}`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h ${t('communityPage.post.ago')}`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m ${t('communityPage.post.ago')}`;
        return t('communityPage.post.justNow', { default: "Just now" });
    };

    const getCategoryStyle = (category: string) => {
        switch(category.toLowerCase()){
            case 'experience': return { bg: 'bg-blue-100', text: 'text-blue-800' };
            case 'tip': return { bg: 'bg-green-100', text: 'text-green-800' };
            case 'photo': return { bg: 'bg-purple-100', text: 'text-purple-800' };
            case 'itinerary': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
        }
    };
    const categoryStyle = getCategoryStyle(post.category);

    return (
        <div className="card-base p-5">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-indigo-600" style={{backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover'}}>
                        {!post.author.avatar && post.author.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm">{post.author.name}</span>
                            {post.author.verified && <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">{t('communityPage.post.verified')}</span>}
                        </div>
                         <p className="text-xs flex items-center gap-1" style={{color: 'var(--color-text-secondary)'}}>
                            <MapPinIcon size={12} /> {post.author.location} · {formatTime(post.timestamp)}
                        </p>
                    </div>
                </div>
                 <button className="p-1" style={{color: 'var(--color-text-secondary)'}}><MoreHorizontal size={20}/></button>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
                <p className="text-sm whitespace-pre-wrap" style={{color: 'var(--color-text-primary)'}}>
                    {isExpanded ? post.content.text : post.content.text.slice(0, 200)}
                    {canExpand && !isExpanded && '...'}
                    {canExpand && <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 text-sm ml-1">{isExpanded ? 'Read Less' : 'Read More'}</button>}
                </p>
                {post.content.images.length > 0 && (
                     <div className={`grid gap-2 ${post.content.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {post.content.images.map((img, idx) => <img key={idx} src={img} loading="lazy" className="rounded-lg object-cover w-full h-48" alt={`Post content ${idx+1}`}/>)}
                    </div>
                )}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>{post.category}</span>
                    {post.tags.map(tag => <span key={tag} className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: 'var(--color-input-bg)'}}>#{tag}</span>)}
                </div>
            </div>

            {/* Post Actions */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{borderColor: 'var(--color-glass-border)'}}>
                <div className="flex gap-4">
                    <button onClick={() => onLikePost(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.engagement.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                        <Heart size={18} className={`${post.engagement.isLiked ? 'fill-current' : ''}`}/> {post.engagement.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600">
                        <MessageCircle size={18}/> {post.engagement.comments}
                    </button>
                    <button onClick={() => onSharePost(post)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600">
                        <Share size={18}/>
                    </button>
                </div>
                <button onClick={() => onBookmarkPost(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.engagement.isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                    <Bookmark size={18} className={`${post.engagement.isBookmarked ? 'fill-current' : ''}`}/>
                </button>
            </div>
        </div>
    );
};

export default CommunityPostCard;