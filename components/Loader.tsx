
import React from 'react';

interface LoaderProps {
  small?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ small = false }) => {
  const sizeClasses = small ? 'h-5 w-5' : 'h-6 w-6';
  const borderClasses = small ? 'border-2' : 'border-4';
  
  return (
    <div
      className={`${sizeClasses} ${borderClasses} border-t-transparent border-white rounded-full animate-spin mr-2`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
