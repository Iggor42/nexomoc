import React from "react";

export const NexoSymbol = ({ size = 36, strokeWidth = 1.2, className = "" }) => (
  <svg
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="18" fill="none" stroke="#E0DCD1" strokeWidth={strokeWidth} />
    <line x1="13" y1="13" x2="27" y2="27" stroke="#E0DCD1" strokeWidth={strokeWidth} />
    <line x1="27" y1="13" x2="13" y2="27" stroke="#E0DCD1" strokeWidth={strokeWidth} />
  </svg>
);
