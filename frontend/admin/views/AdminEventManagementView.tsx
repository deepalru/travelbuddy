
import React from 'react';
import { Colors } from '../../constants.ts';

const AdminEventManagementView: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };
  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>Event Management</h1>
      <div style={cardStyle}>
        <p style={{ color: Colors.text_secondary }}>
          Events (e.g., from Eventbrite or manually added local events) will be managed here. Admins can feature or hide events.
        </p>
      </div>
    </div>
  );
};

export default AdminEventManagementView;
