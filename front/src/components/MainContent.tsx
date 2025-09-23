'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../api/services/authService";
import { userService } from "../api/services/userService";
import { User } from "../types/user";
import { rankingService } from "../api/services/rankingService";
import { RankingUser } from "../types/ranking";
import { coinService } from "../api/services/coinService";
import { useUser } from "./providers";

// Components
const MessageBox = () => {
  // Message logic would be here - simplified for migration
  return null;
};

const UserInfo = ({ rankings }: { rankings: RankingUser[] }) => {
  const { currentUser } = useUser();
  if (!currentUser) return null;
  const myRanking = rankings.find((r) => r.id === currentUser.id);
  if (!myRanking) return null;
  return (
    <div className="card mb-6">
        <div className="flex items-center justify-center text-lg font-semibold" style={{ color: 'var(--color-text-title)' }}>
          <span className="px-3">번호: {myRanking.id}</span>
          <span style={{ color: 'var(--color-text-light)' }}>|</span>
          <span className="px-3">{myRanking.username}</span>
          <span style={{ color: 'var(--color-text-light)' }}>|</span>
          <span className="px-3" style={{ color: 'var(--color-primary-dark)' }}>코인: {myRanking.totalCoins}</span>
        </div>
    </div>
  );
};

const RankingTable = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await rankingService.getRankingsWithRank();
        setRankings(data);
      } catch (error) {
        console.error('랭킹 조회 실패:', error);
      }
    };
    fetchRankings();
  }, []);

  return (
    <>
      <UserInfo rankings={rankings} />
      <div className="card">
        <h2 className="card-title mb-5 text-center">🏆 랭킹</h2>
        <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-6 py-4 text-center font-semibold">순위</th>
                <th className="px-6 py-4 text-left font-semibold">이름</th>
                <th className="px-6 py-4 text-center font-semibold">코인</th>
              </tr>
            </thead>
            <tbody style={{ borderColor: 'var(--color-border)' }} className="divide-y">
              {rankings.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="transition-colors hover:bg-opacity-50"
                  style={{ 
                    backgroundColor: index % 2 === 0 ? 'var(--color-card-bg)' : 'var(--color-gray)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--color-card-bg)' : 'var(--color-gray)'}
                >
                  <td className="px-6 py-4 text-center font-bold" style={{ color: 'var(--color-primary-dark)' }}>{user.rank}</td>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-text-title)' }}>{user.username}</td>
                  <td className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-success)' }}>{user.totalCoins.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const Login = () => {
  const { login } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const showError = (text: string) => {
    alert(text); // Simplified for migration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showError("아이디와 비밀번호를 모두 입력하세요.");
      return;
    }

    try {
      // 백엔드 API에 맞게 authService.login 사용 (자동 계정 생성)
      const user = await authService.login({ username, password });
      login(user);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" 
         style={{ background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-background))' }}>
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--color-text-title)' }}>🔐 로그인</h2>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="아이디를 입력하세요"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full text-lg">
            로그인
          </button>
        </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-light)' }}>
            계정이 없다면 자동으로 생성됩니다
          </p>
      </div>
    </div>
  );
};

const CoinTransfer = ({ onClose }: { onClose: () => void }) => {
  const { currentUser } = useUser();
  const [receivers, setReceivers] = useState<
    { id: number; username: string }[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = (text: string) => alert(text);
  const showSuccess = (text: string) => alert(text);

  useEffect(() => {
    if (currentUser) {
      userService.getReceivers(currentUser.id).then(setReceivers);
    }
  }, [currentUser]);

  const filtered = receivers.filter((user) =>
    user.username.toLowerCase().includes(keyword.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedUserId || !amount || !currentUser) {
      showError("모든 필드를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await coinService.transfer(
        currentUser.id,
        Number(selectedUserId),
        Number(amount)
      );
      showSuccess("코인 전송이 완료되었습니다.");
      setAmount("");
      setSelectedUserId("");
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "코인 전송에 실패했습니다.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="card w-full max-w-md animate-slide-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center text-coma-dark mb-6">💰 코인 전송</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 받는 사람 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-coma-dark">받는 사람</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="사용자 이름을 검색하세요"
                className="input-field"
              />
              {showDropdown && filtered.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filtered.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSelectedUserId(user.id.toString());
                        setKeyword(user.username);
                        setShowDropdown(false);
                      }}
                    >
                      {user.username}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 코인 수량 */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-coma-dark">코인 수량</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="전송할 코인 수량"
              className="input-field"
              min="1"
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <button
              type="submit"
              className={isSubmitting ? "btn-disabled flex-1" : "btn-success flex-1"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "전송 중..." : "💸 전송"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-danger flex-1"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Content
interface MainContentProps {
  onGoToRooms?: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ onGoToRooms }) => {
  const { currentUser, logout, isLoaded } = useUser();
  const [showTransfer, setShowTransfer] = useState(false);

  const handleGoToRooms = () => {
    if (onGoToRooms) {
      onGoToRooms();
    }
  };


  // 로딩 중일 때는 빈 화면 또는 로딩 표시
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <MessageBox />
      {currentUser && (
        <button
          onClick={logout}
          className="fixed top-6 right-8 z-50 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition-all duration-200 shadow-sm"
          style={{ 
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-title)'
          }}
        >
          로그아웃
        </button>
      )}
      {!currentUser ? (
        <Login />
      ) : (
        <div className="max-w-4xl mx-auto p-5 space-y-8">
          {/* 로고 섹션 */}
          <div className="text-center py-8">
            <img 
              src="/logo.png" 
              alt="코딩 마스터 로고" 
              className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg hover:shadow-xl transition-shadow" 
            />
            <h1 className="text-5xl font-bold mb-2 animate-bounce-gentle" style={{ color: 'var(--color-text-title)' }}>
              코마데이
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>보드게임 코인 관리 시스템</p>
          </div>

          {/* 랭킹 테이블 */}
          <RankingTable />

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              className="btn-primary text-lg py-4 flex items-center justify-center gap-2 hover-lift"
              onClick={handleGoToRooms}
            >
              🏠 게임 방
            </button>
            <button
              className="btn-success text-lg py-4 flex items-center justify-center gap-2 hover-lift"
              onClick={() => setShowTransfer(true)}
            >
              💰 코인 전송
            </button>
          </div>

          {/* 코인 전송 모달 */}
          {showTransfer && (
            <CoinTransfer onClose={() => setShowTransfer(false)} />
          )}
        </div>
      )}
      
      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto p-6 text-center">
          <div className="text-gray-600 text-sm mb-2">
            Developed by 고재우 나산하 김선우
          </div>
          <div className="text-gray-500 text-xs">
            ©Coma
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainContent;
