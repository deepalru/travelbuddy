
import React from 'react';
import { Colors } from '@/constants';

const AdminDashboardView: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };

  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Stat Cards */}
        {[
          { title: 'Total Users', value: '1,234', icon: '👥' },
          { title: 'Active Subscriptions', value: '567', icon: '💳' },
          { title: 'Managed Places', value: '890', icon: '📍' },
          { title: 'Active Deals', value: '45', icon: '🏷️' },
          { title: 'Pending Moderation', value: '12', icon: '👀' },
          { title: 'Reported Issues', value: '3', icon: '⚠️' },
        ].map(item => (
          <div key={item.title} style={cardStyle} className="flex items-center p-4">
            <div className="text-3xl mr-4">{item.icon}</div>
            <div>
              <p className="text-sm font-medium" style={{ color: Colors.text_secondary }}>{item.title}</p>
              <p className="text-2xl font-bold" style={{ color: Colors.text }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{...cardStyle, marginTop: '2rem'}}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: Colors.primary }}>Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 text-sm font-semibold rounded-lg" style={{backgroundColor: Colors.primary, color: 'white', boxShadow: cardStyle.boxShadow}}>Approve Content</button>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg" style={{backgroundColor: Colors.secondary, color: 'white', boxShadow: cardStyle.boxShadow}}>Add New Deal</button>
            <button className="px-4 py-2 text-sm font-semibold rounded-lg" style={{backgroundColor: Colors.highlight, color: 'white', boxShadow: cardStyle.boxShadow}}>View User List</button>
        </div>
      </div>
       <p className="mt-8 text-center text-sm" style={{color: Colors.text_secondary}}>
        Welcome, Admin! This is a placeholder dashboard. Full functionality will be implemented soon.
      </p>
    </div>
  );
};

export default AdminDashboardView;
