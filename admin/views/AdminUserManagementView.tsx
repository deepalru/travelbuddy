
import React from 'react';
import { Colors } from '@/constants';

const AdminUserManagementView: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };

  const placeholderUsers = [
    { id: 'usr_001', name: 'Alice Wonderland', email: 'alice@example.com', role: 'User', status: 'Active', joined: '2025-01-15' },
    { id: 'usr_002', name: 'Bob The Builder', email: 'bob@example.com', role: 'User', status: 'Suspended', joined: '2025-02-20' },
    { id: 'usr_003', name: 'Charlie Admin', email: 'charlie@example.com', role: 'Admin', status: 'Active', joined: '2025-03-10' },
  ];

  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>User Management</h1>
      
      <div style={cardStyle}>
        <div className="flex justify-between items-center mb-4">
          <input 
            type="text" 
            placeholder="Search users by name, email, role..." 
            className="px-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 w-1/2"
            style={{ 
              color: Colors.text,
              backgroundColor: Colors.inputBackground,
              boxShadow: Colors.boxShadowSoft,
              borderColor: Colors.cardBorder,
            }}
          />
          <button 
            className="px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
            style={{
                backgroundImage: `linear-gradient(145deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
                boxShadow: cardStyle.boxShadow
            }}
          >
            Add New User (Mock)
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg" style={{border: `1px solid ${Colors.cardBorder}`}}>
          <table className="min-w-full divide-y" style={{borderColor: Colors.cardBorder}}>
            <thead style={{backgroundColor: Colors.inputBackground}}>
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: Colors.text_secondary}}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{backgroundColor: Colors.cardBackground, borderColor: Colors.cardBorder}} className="divide-y">
              {placeholderUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium" style={{color: Colors.text}}>{user.name}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{color: Colors.text_secondary}}>{user.email}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                    <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                        style={user.role === 'Admin' ? {backgroundColor: `${Colors.primary}20`, color: Colors.primary} : {backgroundColor: `${Colors.secondary}20`, color: Colors.secondary}}
                    >
                        {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                  <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                        style={user.status === 'Active' ? {backgroundColor: `${Colors.accentSuccess}20`, color: Colors.accentSuccess} : {backgroundColor: `${Colors.accentError}20`, color: Colors.accentError}}
                    >
                        {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{color: Colors.text_secondary}}>{user.joined}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-xs px-2 py-1 rounded" style={{color: Colors.primary, backgroundColor: `${Colors.primary}10`}}>Edit</button>
                    <button className="text-xs px-2 py-1 rounded" style={{color: Colors.accentError, backgroundColor: `${Colors.accentError}10`}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <p className="mt-4 text-xs text-right" style={{color: Colors.text_secondary}}>
            Mock data shown. Full table features (sorting, pagination) will be added.
        </p>
      </div>
    </div>
  );
};

export default AdminUserManagementView;
