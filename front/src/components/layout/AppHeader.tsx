'use client'

import React from 'react';
import { Button } from '../ui';
import { useUser } from '../providers';

interface AppHeaderProps {
  title?: string;
  showLogout?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title = '코마데이',
  showLogout = true 
}) => {
  const { currentUser, logout, isLoaded } = useUser();

  return (
    <header className="relative">
      {/* 로고 섹션 */}
      <div className="text-center py-8">
        <img
          src="/logo.png"
          alt="코딩 마스터 로고"
          className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        />
        <h1 className="text-5xl font-bold mb-2 animate-bounce-gentle" style={{ color: 'var(--color-text-title)' }}>
          {title}
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          보드게임 코인 관리 시스템
        </p>
      </div>

      {/* 로그아웃 버튼 */}
      {isLoaded && currentUser && showLogout && (
        <Button
          onClick={logout}
          size="sm"
          variant="primary"
          className="absolute top-6 right-8 z-50 shadow-sm"
        >
          로그아웃
        </Button>
      )}
    </header>
  );
};

export default AppHeader;
