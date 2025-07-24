import React from 'react';

type IconProps = {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
};

const IconWrapper: React.FC<React.PropsWithChildren<IconProps>> = ({ className = 'w-6 h-6', size, style: customStyle, children }) => {
  const sizeClass = size ? '' : className;
  const baseStyle = size ? { width: size, height: size } : {};
  const finalStyle = { ...baseStyle, ...customStyle };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={sizeClass}
      style={finalStyle}
    >
      {children}
    </svg>
  );
};

export const MapPin: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></IconWrapper>
);
export const Clock: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></IconWrapper>
);
export const Thermometer: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></IconWrapper>
);
export const Compass: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></IconWrapper>
);
export const Calendar: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></IconWrapper>
);
export const Camera: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></IconWrapper>
);
export const ShieldCheck: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></IconWrapper>
);
export const Sparkles: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="m12 3-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L3 3l1.9 1.9L3 6.8l1.9-1.9L3 3m18 0-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L18 3l1.9 1.9L18 6.8l1.9-1.9L18 3m-9 6-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L3 9l1.9 1.9L3 12.8l1.9-1.9L3 9m18 0-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L18 9l1.9 1.9L18 12.8l1.9-1.9L18 9m-9 6-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L3 15l1.9 1.9L3 18.8l1.9-1.9L3 15m18 0-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L18 15l1.9 1.9L18 18.8l1.9-1.9L18 15"/></IconWrapper>
);
export const Coffee: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></IconWrapper>
);
export const Map: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" x2="8" y1="2" y2="18" /><line x1="16" x2="16" y1="6" y2="22" /></IconWrapper>
);
export const Heart: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></IconWrapper>
);
export const Lightbulb: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-7 7c0 3.04 1.63 5.39 4 6.32V18h6v-2.68c2.37-.93 4-3.28 4-6.32a7 7 0 0 0-7-7Z" /></IconWrapper>
);
export const DollarSign: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></IconWrapper>
);

// New Icons for ProfileView
export const User: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconWrapper>
);
export const Crown: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z" /><path d="M5 16h14" /></IconWrapper>
);
export const Settings: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.1l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.1l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></IconWrapper>
);
export const Edit3: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></IconWrapper>
);
export const Download: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" y2="3" /></IconWrapper>
);
export const CheckCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></IconWrapper>
);
export const Bell: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></IconWrapper>
);
export const Sun: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></IconWrapper>
);
export const Moon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></IconWrapper>
);
export const Lock: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></IconWrapper>
);

// New Icons for Community View
export const MessageCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></IconWrapper>
);
export const Share: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></IconWrapper>
);
export const Bookmark: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></IconWrapper>
);
export const Globe: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></IconWrapper>
);
export const Star: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></IconWrapper>
);
export const TrendingUp: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></IconWrapper>
);
export const MoreHorizontal: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></IconWrapper>
);
export const Plus: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="M5 12h14" /><path d="M12 5v14" /></IconWrapper>
);
export const Send: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></IconWrapper>
);
export const Search: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></IconWrapper>
);
export const Link: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></IconWrapper>
);
export const Mail: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></IconWrapper>
);
export const TwitterX: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}><path d="m18 6-4 4 4 4m-4-8-4 4-4-4" /><path d="m6 18 4-4-4-4m4 8 4-4 4 4" /></IconWrapper>
);
export const WhatsApp: React.FC<IconProps> = (props) => (
    <IconWrapper {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></IconWrapper>
);