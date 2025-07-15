
import React from 'react';
import { Colors } from '@/constants';

const AdminPlaceManagementView: React.FC = () => {
 const cardStyle: React.CSSProperties = {
    backgroundColor: Colors.cardBackground,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: Colors.boxShadow,
  };

  const placeholderPlaces = [
    { id: 'plc_001', name: 'Eiffel Tower', type: 'Landmark', location: 'Paris, France', status: 'Approved', added: '2025-01-01' },
    { id: 'plc_002', name: 'Hidden Cafe Gem', type: 'Cafe', location: 'Kyoto, Japan', status: 'Pending AI', added: '2025-04-05' },
    { id: 'plc_003', name: 'Grand Canyon National Park', type: 'National Park', location: 'Arizona, USA', status: 'Approved', added: '2024-12-15' },
  ];

  return (
    <div className="animate-fadeInUp">
      <h1 className="text-2xl font-bold mb-6" style={{ color: Colors.text }}>Place Management</h1>
      
      <div style={cardStyle}>
        <div className="flex justify-between items-center mb-4">
          <input 
            type="text" 
            placeholder="Search places by name, type, location..." 
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
            Add New Place (Mock)
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg" style={{border: `1px solid ${Colors.cardBorder}`}}>
          <table className="min-w-full divide-y" style={{borderColor: Colors.cardBorder}}>
            <thead style={{backgroundColor: Colors.inputBackground}}>
              <tr>
                {['Name', 'Type', 'Location', 'Status', 'Added On', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{color: Colors.text_secondary}}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{backgroundColor: Colors.cardBackground, borderColor: Colors.cardBorder}} className="divide-y">
              {placeholderPlaces.map(place => (
                <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium" style={{color: Colors.text}}>{place.name}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{color: Colors.text_secondary}}>{place.type}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{color: Colors.text_secondary}}>{place.location}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                  <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                        style={place.status === 'Approved' ? {backgroundColor: `${Colors.accentSuccess}20`, color: Colors.accentSuccess} : {backgroundColor: `${Colors.accentWarning}20`, color: Colors.accentWarning}}
                    >
                        {place.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm" style={{color: Colors.text_secondary}}>{place.added}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-xs px-2 py-1 rounded" style={{color: Colors.primary, backgroundColor: `${Colors.primary}10`}}>Edit</button>
                    <button className="text-xs px-2 py-1 rounded" style={{color: Colors.accentError, backgroundColor: `${Colors.accentError}10`}}>Delete</button>
                    {place.status === 'Pending AI' && <button className="text-xs px-2 py-1 rounded" style={{color: Colors.secondary, backgroundColor: `${Colors.secondary}10`}}>Approve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <p className="mt-4 text-xs text-right" style={{color: Colors.text_secondary}}>
            This table will display AI-generated and manually added places. Admins can approve, edit, or delete entries.
        </p>
      </div>
    </div>
  );
};

export default AdminPlaceManagementView;
