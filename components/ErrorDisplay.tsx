import React from 'react';
import { Colors } from '../constants.ts';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div 
      className="p-6 rounded-xl my-6 mx-auto max-w-2xl text-center border shadow-sm"
      style={{ 
        backgroundColor: `${Colors.accentError}1A`,
        color: Colors.accentError, 
        borderColor: `${Colors.accentError}30`, 
        boxShadow: Colors.boxShadowSoft,
      }}
      role="alert"
    >
      <div className="flex justify-center items-center mb-4">
        <svg className="h-10 w-10 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-bold text-xl" style={{color: Colors.text}}>Oops! Something went wrong.</p>
      </div>
      <p className="text-md mb-6" style={{color: Colors.text_secondary}}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 text-white font-semibold rounded-lg transition-all duration-300 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:-translate-y-0.5"
          style={{ 
            backgroundImage: `linear-gradient(135deg, ${Colors.primary}, ${Colors.primaryGradientEnd})`,
            boxShadow: Colors.boxShadowButton,
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;