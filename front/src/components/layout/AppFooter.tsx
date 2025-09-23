'use client'

import React from 'react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="border-t mt-12" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-sm mb-2" style={{ color: 'var(--color-text-light)' }}>
          Developed by 고재우 나산하 김선우
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>
          ©Coma
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
