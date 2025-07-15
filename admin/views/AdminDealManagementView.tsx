
import React from 'react';
import { Colors } from '@/constants';

const AdminDealManagementView: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };
  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>Deal Management</h1>
      <div style={cardStyle}>
        <p style={{ color: Colors.text_secondary }}>
          Deal management interface will be built here. Admins will be able to create, edit, activate, and deactivate promotional deals linked to places.
        </p>
        <button 
            className="mt-4 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
            style={{
                backgroundImage: `linear-gradient(145deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
                boxShadow: cardStyle.boxShadow
            }}
          >
            Create New Deal (Mock)
        </button>
      </div>
    </div>
  );
};

export default AdminDealManagementView;
