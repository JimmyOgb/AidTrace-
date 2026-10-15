import React from "react";

export const AidTraceLogo: React.FC<{ className?: string; size?: number }> = ({
  className = "w-8 h-8",
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left green leaf/petal */}
      <path
        d="M18 10C15 6 10 5.5 6.5 9C3 12.5 3 18 6.5 22.5L18 32V23C18 20.5 16.5 18.5 14.5 17.5C12.5 16.5 11 14.5 11.5 12C12 9.5 14.5 8 17 9.5L18 10Z"
        fill="#00D084"
      />
      {/* Right light-blue/mint leaf/petal */}
      <path
        d="M18 10C21 6 26 5.5 29.5 9C33 12.5 33 18 29.5 22.5L18 32V23C18 20.5 19.5 18.5 21.5 17.5C23.5 16.5 25 14.5 24.5 12C24 9.5 21.5 8 19 9.5L18 10Z"
        fill="#A5F3FC"
      />
      {/* Center sprout stem branching out */}
      <path
        d="M18 32V14M18 14L13 8M18 14L23 8"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const GenLayerLogo: React.FC<{ className?: string; size?: number }> = ({
  className = "w-5 h-5",
  size = 20,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L3.5 6.8V17.2L12 22L20.5 17.2V6.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 12L3.5 6.8M12 12V22M12 12L20.5 6.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
};
