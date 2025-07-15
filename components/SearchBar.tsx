
import React from 'react';
import { Colors } from '@/constants';
// import { FaSearch } from 'react-icons/fa'; // Example for react-icons

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <div className="flex-grow relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {/* <FaSearch className="h-4 w-4" /> */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search destinations..." 
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
        style={{ 
          color: Colors.text, 
          backgroundColor: Colors.cardBackground,
          borderColor: Colors.cardBorder, 
        }}
        aria-label="Search destinations by name, type, or address"
      />
    </div>
  );
};

export default SearchBar;