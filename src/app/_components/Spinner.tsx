import React from 'react';

interface SpinnerProps {
  size?: string;
  color?: string;
  strokeWidth?: number;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'h-8 w-8', color = 'text-blue-500', strokeWidth = 4 }) => {
  return (
    <div className={`flex items-center justify-center h-full ${color}`}>
      <svg
        className={`animate-spin ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <path
          className="opacity-75"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          d="M12 2 A 10 10 0 0 1 22 12" // Arc path command
        />
      </svg>
    </div>
  );
};

export default Spinner;
