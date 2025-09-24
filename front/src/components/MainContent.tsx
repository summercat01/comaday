'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./providers";
import { LoginForm } from "./auth";
import { RankingTable } from "./ranking";
import { AppHeader, AppFooter, LoadingSpinner, SkeletonLoader } from "./layout";
import { Button } from "./ui";

// Main App Content
interface MainContentProps {
  onGoToRooms?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onGoToRooms }) => {
  const { currentUser, isLoaded, login } = useUser();
  const router = useRouter();

  const handleGoToRooms = () => {
    if (onGoToRooms) {
      onGoToRooms();
    } else {
      router.push('/rooms');
    }
  };


  // 로딩 중일 때는 랭킹 부분만 스켈레톤 UI 표시
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
        <AppHeader showLogout={false} />
        
        <main className="flex-1 max-w-4xl mx-auto p-5 space-y-8">
          {/* 랭킹 테이블 - 컨테이너는 유지하고 데이터만 스켈레톤 */}
          <RankingTable />

          {/* 액션 버튼들 - 정적 요소이므로 실제 버튼 표시 */}
          <div className="max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGoToRooms}
              className="flex items-center justify-center gap-2 hover-lift"
            >
              🏠 게임 방
            </Button>
          </div>
        </main>

        <AppFooter />
      </div>
    );
  }

  // 로그인하지 않은 경우 로그인 폼 표시
  if (!currentUser) {
    return <LoginForm onLogin={login} />;
  }

  // 메인 컨텐츠 렌더링
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <AppHeader />
      
      <div className="max-w-4xl mx-auto p-5 space-y-8">
        {/* 랭킹 테이블 */}
        <RankingTable />

        {/* 액션 버튼들 */}
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGoToRooms}
            className="flex items-center justify-center gap-2 hover-lift"
          >
            🧩 게임 방 보기
          </Button>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default MainContent;