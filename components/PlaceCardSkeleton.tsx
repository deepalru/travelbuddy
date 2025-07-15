
import React from 'react';
import { Colors } from '@/constants';

const PlaceCardSkeleton: React.FC = () => {
  return (
    <div 
      className="rounded-xl overflow-hidden flex flex-col bg-white shadow-md" 
      style={{ 
        border: `1px solid ${Colors.cardBorder}`,
        boxShadow: Colors.boxShadow
      }}
      aria-hidden="true"
    >
      <div className="w-full h-44 animate-pulse" style={{backgroundColor: Colors.inputBackground}}></div> 
      <div className="p-4 flex flex-col flex-grow"> 
        <div className="h-5 w-3/4 mb-2 animate-pulse rounded" style={{backgroundColor: `${Colors.primary}30`}}></div> 
        <div className="h-3.5 w-1/2 mb-1.5 animate-pulse rounded" style={{backgroundColor: `${Colors.text_secondary}20`}}></div> 
        <div className="h-3.5 w-1/3 mb-3 animate-pulse rounded" style={{backgroundColor: `${Colors.text_secondary}20`}}></div> 
        <div className="h-3 w-full mb-1.5 animate-pulse rounded" style={{backgroundColor: `${Colors.text_secondary}10`}}></div> 
        <div className="h-3 w-full mb-1.5 animate-pulse rounded" style={{backgroundColor: `${Colors.text_secondary}10`}}></div> 
        <div className="h-3 w-3/4 mb-3 animate-pulse rounded" style={{backgroundColor: `${Colors.text_secondary}10`}}></div> 
        <div className="mt-auto pt-3 border-t flex flex-col gap-2.5" style={{borderColor: Colors.cardBorder}}> 
           <div className="w-full h-9 animate-pulse rounded-lg" style={{backgroundColor: `${Colors.primary}30`}}></div> 
           <div className="w-full h-8 animate-pulse rounded-lg mt-1.5" style={{backgroundColor: `${Colors.text_secondary}20`}}></div> 
        </div>
      </div>
    </div>
  );
};

export default PlaceCardSkeleton;