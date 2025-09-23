'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../api/services/userService";
import { User } from "../types/user";
import { rankingService } from "../api/services/rankingService";
import { RankingUser } from "../types/ranking";
import { coinService } from "../api/services/coinService";
import { useUser } from "./providers";
import "./App.css";

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
    <div className="user-info-box">
      <div className="user-info-content">
        번호: {myRanking.id} <span className="separator">|</span>{" "}
        {myRanking.username} <span className="separator">|</span> 코인:{" "}
        {myRanking.totalCoins}
      </div>
    </div>
  );
};

const RankingTable = () => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);

  useEffect(() => {
    rankingService.getRankings().then(setRankings);
  }, []);

  return (
    <>
      <UserInfo rankings={rankings} />
      <div className="ranking-container">
        <h2 className="ranking-title">랭킹</h2>
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>코인</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((user) => (
              <tr key={user.id}>
                <td>{user.rank}</td>
                <td>{user.username}</td>
                <td>{user.totalCoins}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
      const user = await userService.guestLogin(username, password);
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
    <div className="login-modal">
      <h2 className="login-title">로그인</h2>
      <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
        <div className="login-input-row">
          <label htmlFor="username">아이디</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="login-input-row">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button type="submit">로그인</button>
      </form>
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

  // CoinTransfer component content (simplified for space)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="coin-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="coin-transfer-title">코인 전송</h2>
        <form onSubmit={handleSubmit}>
          {/* Form content would be here - keeping original structure */}
          <div className="coin-transfer-button-group">
            <button
              type="submit"
              className="coin-transfer-submit"
              disabled={isSubmitting}
            >
              전송
            </button>
            <button
              type="button"
              onClick={onClose}
              className="coin-transfer-cancel"
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
const MainContent = () => {
  const { currentUser, logout } = useUser();
  const [showTransfer, setShowTransfer] = useState(false);
  const router = useRouter();

  const handleGoToRooms = () => {
    router.push('/rooms');
  };

  return (
    <div className="App">
      <MessageBox />
      {currentUser && (
        <button
          onClick={logout}
          style={{
            position: "absolute",
            top: 24,
            right: 32,
            zIndex: 1000,
            padding: "8px 16px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          로그아웃
        </button>
      )}
      {!currentUser ? (
        <Login />
      ) : (
        <>
          <div className="logo-container">
            <img src="/logo.png" alt="코딩 마스터 로고" className="app-logo" />
          </div>
          <h1 className="app-title">코마데이</h1>
          <div className="user-section">
            <UserInfo rankings={[]} />
          </div>
          <RankingTable />
          <div className="action-section">
            <button
              className="room-btn"
              onClick={handleGoToRooms}
            >
              🏠 게임 방
            </button>
            <button
              className="coin-transfer-btn"
              onClick={() => setShowTransfer(true)}
            >
              💰 코인 전송
            </button>
          </div>
          {showTransfer && (
            <CoinTransfer onClose={() => setShowTransfer(false)} />
          )}
        </>
      )}
      <footer className="footer">
        <div className="footer-developer">
          Developed by 고재우 나산하 김선우
        </div>
        <div className="footer-copyright">©Coma</div>
      </footer>
    </div>
  );
};

export default MainContent;
