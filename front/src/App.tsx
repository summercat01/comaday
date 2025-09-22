import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { userService } from "./api/services/userService";
import { User } from "./types/user";
import { rankingService } from "./api/services/rankingService";
import { RankingUser } from "./types/ranking";
import { coinService } from "./api/services/coinService";
import AdminPage from "./pages/AdminPage"; // AdminPage 컴포넌트 임포트 추가
import RoomListPage from "./pages/RoomListPage";
import RoomPage from "./pages/RoomPage";

// Types
interface MessageContextType {
  message: { text: string; type: "error" | "success" } | null;
  showError: (text: string) => void;
  showSuccess: (text: string) => void;
  clearMessage: () => void;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  sendCoin: (
    toUserId: number,
    amount: number
  ) => Promise<Result<CoinTransferEvent>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface CoinTransferEvent {
  type: "COIN_TRANSFER";
  data: {
    fromUser: User;
    toUser: User;
    amount: number;
  };
}

interface Result<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: "고재우, 나산하",
    coinCount: 100,
    isGuest: false,
    lastLoginAt: "2023-04-01T12:00:00",
  },
  {
    id: 2,
    username: "김연지, 김채민",
    coinCount: 100,
    isGuest: false,
    lastLoginAt: "2023-04-01T12:00:00",
  },
  {
    id: 3,
    username: "박지성, 이민재",
    coinCount: 100,
    isGuest: false,
    lastLoginAt: "2023-04-01T12:00:00",
  },
];

// Contexts
const MessageContext = createContext<MessageContextType | null>(null);
const UserContext = createContext<UserContextType | null>(null);

// Hooks
const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context)
    throw new Error("useMessage must be used within a MessageProvider");
  return context;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

// Components
const MessageBox = () => {
  const { message, clearMessage } = useMessage();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  if (!message) return null;
  return <div className={`message-box ${message.type}`}>{message.text}</div>;
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
  const { showError } = useMessage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sendCoin } = useUser();
  const { showSuccess } = useMessage();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { showError } = useMessage();
  const [receivers, setReceivers] = useState<
    { id: number; username: string }[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      }, 700); // 0.7초 후 새로고침
    } catch (error: any) {
      // 백엔드에서 온 구체적인 에러 메시지 표시
      const errorMessage = error.response?.data?.message || "코인 전송에 실패했습니다.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="coin-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="coin-transfer-title">코인 전송</h2>
        <form onSubmit={handleSubmit}>
          <div
            className="coin-transfer-form-group"
            style={{ position: "relative", width: "200px" }}
          >
            <label htmlFor="receiver">받는 사람:</label>
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowDropdown(true);
                setSelectedUserId("");
              }}
              placeholder="유저명 검색"
              style={{ marginBottom: "8px", width: "100%" }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
              className="coin-transfer-input"
            />
            {showDropdown && filtered.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "56px",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  zIndex: 10,
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                {filtered.map((user) => (
                  <li
                    key={user.id}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      background:
                        selectedUserId === String(user.id) ? "#e6fff7" : "#fff",
                    }}
                    onMouseDown={() => {
                      setSelectedUserId(user.id.toString());
                      setKeyword(`${user.id}.${user.username}`);
                      setShowDropdown(false);
                    }}
                  >
                    {user.id}.{user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="coin-transfer-form-group">
            <label htmlFor="amount">코인 수량:</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              className="coin-transfer-input"
            />
          </div>
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

// Providers
const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);

  const showError = (text: string) => {
    setMessage({ text, type: "error" });
    setTimeout(() => setMessage(null), 3000);
  };

  const showSuccess = (text: string) => {
    setMessage({ text, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  const clearMessage = () => setMessage(null);

  return (
    <MessageContext.Provider
      value={{ message, showError, showSuccess, clearMessage }}
    >
      {children}
    </MessageContext.Provider>
  );
};

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const { showError } = useMessage();

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
    const found = users.find((u) => u.id === user.id);
    if (!found) setUsers((prev) => [...prev, user]);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const sendCoin = async (
    toUserId: number,
    amount: number
  ): Promise<Result<CoinTransferEvent>> => {
    if (!currentUser) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    const toUser = users.find((u) => u.id === toUserId);
    if (!toUser) {
      return { success: false, message: "받는 사람을 찾을 수 없습니다." };
    }

    if (amount <= 0) {
      return { success: false, message: "올바른 코인 수량을 입력해주세요." };
    }

    if (currentUser.coinCount < amount) {
      return { success: false, message: "보유한 코인이 부족합니다." };
    }

    // 주의: 실제 구현 시 이 부분은 백엔드에서 트랜잭션으로 처리되어야 함
    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id)
        return { ...user, coinCount: user.coinCount - amount };
      if (user.id === toUserId)
        return { ...user, coinCount: user.coinCount + amount };
      return user;
    });

    setUsers(updatedUsers);
    const updatedCurrentUser = updatedUsers.find(
      (u) => u.id === currentUser.id
    )!;
    setCurrentUser(updatedCurrentUser);

    return {
      success: true,
      data: {
        type: "COIN_TRANSFER",
        data: {
          fromUser: updatedCurrentUser,
          toUser: updatedUsers.find((u) => u.id === toUserId)!,
          amount,
        },
      },
    };
  };

  return (
    <UserContext.Provider
      value={{ currentUser, users, login, logout, sendCoin, setCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Main App Content
const AppContent = ({ onGoToRooms }: { onGoToRooms: () => void }) => {
  const { currentUser, logout } = useUser();
  const [showTransfer, setShowTransfer] = useState(false);

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
              onClick={onGoToRooms}
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

// 라우터가 적용된 Root App Component
const App = () => {
  const [currentView, setCurrentView] = useState<'main' | 'rooms' | 'room'>('main');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

  const handleJoinRoom = (roomCode: string) => {
    setCurrentRoomCode(roomCode);
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomCode('');
    setCurrentView('rooms');
  };

  const handleGoToRooms = () => {
    setCurrentView('rooms');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGoToMain = () => {
    setCurrentView('main');
  };

  return (
    <MessageProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              currentView === 'main' ? (
                <AppContent onGoToRooms={handleGoToRooms} />
              ) : currentView === 'rooms' ? (
                <RoomListPage 
                  onJoinRoom={handleJoinRoom}
                  onCreateRoom={() => {}}
                />
              ) : currentView === 'room' ? (
                <RoomPage 
                  roomCode={currentRoomCode}
                  onLeaveRoom={handleLeaveRoom}
                />
              ) : (
                <AppContent onGoToRooms={handleGoToRooms} />
              )
            } />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </UserProvider>
    </MessageProvider>
  );
};

export default App;
