'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./providers";
import { LoginForm } from "./auth";
import { RankingTable } from "./ranking";
import { CoinTransferModal } from "./coin";
import { AppHeader, AppFooter, LoadingSpinner, SkeletonLoader } from "./layout";
import { Button } from "./ui";

// Main App Content
interface MainContentProps {
  onGoToRooms?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onGoToRooms }) => {
  const { currentUser, isLoaded, login } = useUser();
  const [showTransfer, setShowTransfer] = useState(false);
  const router = useRouter();

  const handleGoToRooms = () => {
    if (onGoToRooms) {
      onGoToRooms();
    } else {
      router.push('/rooms');
    }
  };

  const handleTransferSuccess = () => {
    // 전송 성공 후 페이지 새로고침 또는 상태 업데이트
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  // 로딩 중일 때는 필요한 부분만 스켈레톤 UI 표시
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
        <AppHeader showLogout={false} />
        
        <main className="flex-1 max-w-4xl mx-auto p-5 space-y-8">
          {/* 로고 섹션 - 정적 요소이므로 실제 콘텐츠 표시 */}
          <div className="text-center py-8">
            <img
              src="/logo.png"
              alt="코딩 마스터 로고"
              className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg"
            />
            <h1 className="text-5xl font-bold mb-2" style={{ color: 'var(--color-text-title)' }}>
              코마데이
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>보드게임 코인 관리 시스템</p>
          </div>

          {/* 사용자 정보 스켈레톤 - localStorage 로딩 중 */}
          <SkeletonLoader type="profile" />

          {/* 랭킹 테이블 스켈레톤 - API 데이터 로딩 중 */}
          <SkeletonLoader type="ranking" />

          {/* 액션 버튼들 - 정적 요소이므로 실제 버튼 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGoToRooms}
              className="flex items-center justify-center gap-2 hover-lift"
            >
              🏠 게임 방
            </Button>
            <Button
              variant="disabled"
              size="lg"
              disabled
              className="flex items-center justify-center gap-2"
            >
              💰 코인 전송
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGoToRooms}
            className="flex items-center justify-center gap-2 hover-lift"
          >
            🏠 게임 방
          </Button>
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => setShowTransfer(true)}
            className="flex items-center justify-center gap-2 hover-lift"
          >
            💰 코인 전송
          </Button>
        </div>

        {/* 코인 전송 모달 */}
        <CoinTransferModal
          isOpen={showTransfer}
          onClose={() => setShowTransfer(false)}
          onSuccess={handleTransferSuccess}
        />
      </div>

      <AppFooter />
    </div>
  );
};

export default MainContent;