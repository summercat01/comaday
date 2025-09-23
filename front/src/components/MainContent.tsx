'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./providers";
import { 
  LoginForm, 
  RankingTable, 
  CoinTransferModal, 
  AppHeader, 
  AppFooter, 
  LoadingSpinner,
  Button 
} from "./";

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

  // 로딩 중일 때는 로딩 스피너 표시
  if (!isLoaded) {
    return <LoadingSpinner message="로딩 중..." fullScreen />;
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