import React from 'react';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl' };
  return <div className={`${sizes[size]} leading-none`} role="img" aria-label="CakeCampus">🍰</div>;
};
