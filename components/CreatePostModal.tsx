
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'; // Added useMemo
import { Colors } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { Place, Deal } from '@/types'; // Import Place and Deal
import { useToast } from '@/hooks/useToast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    imageUrls?: string[],
    attachedPlaceIds?: string[],
    attachedDealIds?: string[]
  ) => Promise<void>;
  isLoading: boolean;
  allPlaces: Place[]; // To populate place and deal selectors
}

const MAX_IMAGES = 3;

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  allPlaces,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { addToast } = useToast();

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setContent('');
      setError(null);
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setSelectedPlaceIds([]);
      setSelectedDealIds([]);
    }
  }, [isOpen]);

  const handleCloseWithAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseWithAnimation();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleCloseWithAnimation]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
      if (selectedImageFiles.length + files.length > MAX_IMAGES) {
        addToast({ message: t('communityTab.maxImagesError', { count: MAX_IMAGES.toString() }), type: 'warning' });
        return;
      }
      const newFilesArray = Array.from(files);
      const validImageFiles = newFilesArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          addToast({ message: t('communityTab.invalidFileType', { fileName: file.name }), type: 'warning' });
          return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          addToast({ message: t('communityTab.fileTooLargeError', { fileName: file.name }), type: 'warning' });
          return false;
        }
        return true;
      });

      setSelectedImageFiles(prev => [...prev, ...validImageFiles]);
      validImageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  const removeImage = (index: number) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPlace = (placeId: string) => {
    if (placeId && !selectedPlaceIds.includes(placeId)) {
      setSelectedPlaceIds(prev => [...prev, placeId]);
    }
  };

  const removeAttachedPlace = (placeId: string) => {
    setSelectedPlaceIds(prev => prev.filter(id => id !== placeId));
  };

  const availableDeals = useMemo(() => {
    return allPlaces.filter(p => p.deal).map(p => ({ ...p.deal!, placeId: p.id, placeName: p.name }));
  }, [allPlaces]);

  const handleAddDeal = (dealId: string) => {
    if (dealId && !selectedDealIds.includes(dealId)) {
      setSelectedDealIds(prev => [...prev, dealId]);
    }
  };
  
  const removeAttachedDeal = (dealId: string) => {
    setSelectedDealIds(prev => prev.filter(id => id !== dealId));
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!content.trim() && imagePreviews.length === 0 && selectedPlaceIds.length === 0 && selectedDealIds.length === 0) {
      setError(t('communityTab.postContentEmpty'));
      addToast({ message: t('communityTab.postContentEmpty'), type: 'warning' });
      return;
    }
    await onSubmit(content, imagePreviews, selectedPlaceIds, selectedDealIds);
  };

  const commonButtonStyles: React.CSSProperties = {
    padding: '0.625rem 1.25rem',
    borderRadius: '0.625rem',
    fontWeight: '600',
    transition: 'all 0.2s ease-in-out',
    boxShadow: Colors.boxShadowButton,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  };
  
  const smallChipStyle: React.CSSProperties = {
    backgroundColor: `${Colors.primary}1A`,
    color: Colors.primary,
    padding: '0.25rem 0.625rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    margin: '0.125rem',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...commonButtonStyles,
    backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
    color: 'white',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...commonButtonStyles,
    backgroundColor: Colors.inputBackground,
    color: Colors.text_secondary,
    border: `1px solid ${Colors.cardBorder}`,
  };
  
  const textareaStyle: React.CSSProperties = {
    color: Colors.text,
    backgroundColor: Colors.inputBackground,
    border: `1px solid ${Colors.cardBorder}`,
    borderRadius: '0.625rem',
    padding: '0.75rem 1rem',
    width: '100%',
    minHeight: '100px',
    fontSize: '0.875rem',
    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.03)',
  };

  const selectStyle: React.CSSProperties = {
    ...textareaStyle,
    minHeight: 'auto',
    paddingRight: '2.5rem', 
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23${Colors.text.substring(1)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundPosition: `right 0.75rem center`,
    backgroundRepeat: 'no-repeat',
  };


  if (!isOpen && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out ${isVisible && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ backgroundColor: 'rgba(30, 41, 58, 0.5)', backdropFilter: 'blur(5px)' }}
      onClick={handleCloseWithAnimation}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-modal-title"
    >
      <div
        className={`rounded-xl shadow-xl overflow-hidden w-full sm:max-w-lg md:max-w-xl flex flex-col relative transform transition-all duration-300 ease-out ${isVisible && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ backgroundColor: Colors.cardBackground, boxShadow: Colors.boxShadow, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: Colors.cardBorder }}>
          <h2 id="create-post-modal-title" className="text-lg font-semibold" style={{ color: Colors.text }}>
            {t('communityTab.createTextPostButton')}
          </h2>
          <button
            onClick={handleCloseWithAnimation}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 ring-blue-500"
            aria-label={t('close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="postContent" className="sr-only">{t('communityTab.createTextPostPlaceholder', { username: '' })}</label>
            <textarea
              id="postContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('communityTab.createTextPostPlaceholder', { username: 'Traveler' })}
              style={textareaStyle}
              className="focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-right mt-1" style={{color: Colors.text_secondary}}>{content.length}/500</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{color: Colors.text_secondary}}>{t('communityTab.addImagesLabel')}</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden"/>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={secondaryButtonStyle} disabled={isLoading || imagePreviews.length >= MAX_IMAGES}>
              {t('communityTab.selectImagesButton')} ({imagePreviews.length}/{MAX_IMAGES})
            </button>
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`preview ${index + 1}`} className="w-full h-20 object-cover rounded-md border" style={{borderColor: Colors.cardBorder}} />
                    <button type="button" onClick={() => removeImage(index)} 
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 leading-none text-xs opacity-70 group-hover:opacity-100 transition-opacity"
                            aria-label={t('communityTab.removeImageAria', {index: (index+1).toString()})}
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attach Place */}
          <div className="space-y-2">
            <label htmlFor="attachPlaceSelect" className="block text-sm font-medium" style={{color: Colors.text_secondary}}>{t('communityTab.attachPlaceLabel')}</label>
            <div className="flex gap-2">
              <select id="attachPlaceSelect" style={{...selectStyle, flexGrow:1}} disabled={isLoading} defaultValue="">
                <option value="" disabled>{t('communityTab.selectPlaceToAttach')}</option>
                {allPlaces.map(place => (
                  <option key={place.id} value={place.id} disabled={selectedPlaceIds.includes(place.id)} style={{backgroundColor:Colors.background, color:Colors.text}}>{place.name}</option>
                ))}
              </select>
              <button type="button" style={{...secondaryButtonStyle, flexShrink:0}}
                      onClick={() => {
                        const select = document.getElementById('attachPlaceSelect') as HTMLSelectElement;
                        if(select.value) handleAddPlace(select.value);
                      }}
                      disabled={isLoading}>
                {t('communityTab.addPlaceButton')}
              </button>
            </div>
            {selectedPlaceIds.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium" style={{color: Colors.text_secondary}}>{t('communityTab.attachedPlacesLabel')}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedPlaceIds.map(placeId => {
                    const place = allPlaces.find(p => p.id === placeId);
                    return (
                      <span key={placeId} style={smallChipStyle}>
                        {place?.name || placeId}
                        <button type="button" onClick={() => removeAttachedPlace(placeId)} className="ml-1.5 text-red-500 hover:text-red-700 text-xs" aria-label={t('communityTab.removeAttachedPlaceAria', {name: place?.name || placeId})}>&#x2715;</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Attach Deal */}
          {availableDeals.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="attachDealSelect" className="block text-sm font-medium" style={{color: Colors.text_secondary}}>{t('communityTab.attachDealLabel')}</label>
              <div className="flex gap-2">
                <select id="attachDealSelect" style={{...selectStyle, flexGrow:1}} disabled={isLoading} defaultValue="">
                  <option value="" disabled>{t('communityTab.selectDealToAttach')}</option>
                  {availableDeals.map(deal => (
                    <option key={deal.id} value={deal.id} disabled={selectedDealIds.includes(deal.id)} style={{backgroundColor:Colors.background, color:Colors.text}}>{deal.title} ({deal.placeName})</option>
                  ))}
                </select>
                <button type="button" style={{...secondaryButtonStyle, flexShrink:0}}
                        onClick={() => {
                          const select = document.getElementById('attachDealSelect') as HTMLSelectElement;
                           if(select.value) handleAddDeal(select.value);
                        }}
                        disabled={isLoading}>
                  {t('communityTab.addDealButton')}
                </button>
              </div>
              {selectedDealIds.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium" style={{color: Colors.text_secondary}}>{t('communityTab.attachedDealsLabel')}</span>
                   <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedDealIds.map(dealId => {
                      const deal = availableDeals.find(d => d.id === dealId);
                      return (
                        <span key={dealId} style={smallChipStyle}>
                          {deal?.title || dealId}
                          <button type="button" onClick={() => removeAttachedDeal(dealId)} className="ml-1.5 text-red-500 hover:text-red-700 text-xs" aria-label={t('communityTab.removeAttachedDealAria', {name: deal?.title || dealId})}>&#x2715;</button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}


          {error && (
            <p className="text-xs py-1.5 px-2.5 rounded-md" style={{ color: Colors.accentError, backgroundColor: `${Colors.accentError}1A` }}>
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseWithAnimation}
              style={secondaryButtonStyle}
              className="active:scale-98 focus:ring-blue-500/70"
              disabled={isLoading}
            >
              {t('placeDetailModal.cancelButton')}
            </button>
            <button
              type="submit"
              style={primaryButtonStyle}
              className="active:scale-98 focus:ring-blue-500/70 disabled:opacity-70"
              disabled={isLoading || (!content.trim() && imagePreviews.length === 0 && selectedPlaceIds.length === 0 && selectedDealIds.length === 0)}
            >
              {isLoading ? t('communityTab.creatingPost') : t('communityTab.createTextPostButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
