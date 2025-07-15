
import React from 'react';
import { Colors } from '@/constants';

const AdminContentModerationView: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };
  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>Content Moderation</h1>
      <div style={cardStyle}>
        <p style={{ color: Colors.text_secondary }}>
          User-generated content (e.g., Community Photo Gallery images, reviews) awaiting moderation will appear here. Admins can approve or reject submissions.
        </p>
      </div>
    </div>
  );
};

export default AdminContentModerationView;
