import React from 'react';

interface DottedSeparatorProps {
  className?: string;
  dotCount?: number;
  dotColor?: string;
}

const DottedSeparator: React.FC<DottedSeparatorProps> = ({
  className = "",
  dotCount = 100,
  dotColor = "text-[#222]"
}) => {
  return (
    <div className={`w-full flex items-center justify-between py-6 ${className}`}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <div 
          key={index}
          className={`w-1 h-1 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default DottedSeparator;