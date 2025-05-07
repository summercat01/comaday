import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { userService } from "./api/services/userService";
import { User } from "./types/user";

// App.tsx 파일의 AppContent 컴포넌트 내부
<>
  <img src="/logo.png" alt="코딩 마스터 로고" className="app-logo" />
  <h1 className="app-title">코마데이</h1>
  {/* 나머지 코드... */}
</>;
/**
 * @fileoverview 코마데이(ComaDay) - 실시간 코인 전송 및 랭킹 관리 시스템
 *
 * 백엔드 개발자를 위한 가이드:
 * 1. API 엔드포인트 구현 필요사항:
 *    - POST /api/auth/login: 사용자 로그인
 *    - GET /api/users: 전체 사용자 목록 조회
 *    - GET /api/users/{id}: 특정 사용자 정보 조회
 *    - POST /api/transactions: 코인 전송
 *    - GET /api/transactions: 거래 내역 조회
 *
 * 2. 실시간 업데이트 필요사항:
 *    - WebSocket 연결 필요 (/ws/transactions)
 *    - 실시간 코인 전송 시 전체 사용자에게 알림
 *    - 랭킹 변동 시 실시간 업데이트
 *
 * 3. 데이터 유효성 검사:
 *    - 코인 전송 시 잔액 확인
 *    - 중복 전송 방지
 *    - 동시성 제어
 */

// Types
/**
 * @interface User
 * @description 사용자 정보 인터페이스
 * @property {number} id - 사용자 고유 식별자
 * @property {string} username - 사용자 아이디
 * @property {number} coinCount - 보유 코인 수량
 * @property {boolean} isGuest - 게스트 여부
 * @property {string} lastLoginAt - 마지막 로그인 시간
 *
 * @example
 * // API Response 예시
 * {
 *   "id": 1,
 *   "username": "고재우, 나산하",
 *   "coinCount": 100,
 *   "isGuest": false,
 *   "lastLoginAt": "2023-04-01T12:00:00"
 * }
 */

/**
 * @interface MessageContextType
 * @description 메시지 표시 컨텍스트
 * @note 백엔드에서 에러 응답 시 message 필드를 포함해야 함
 */
interface MessageContextType {
  message: { text: string; type: "error" | "success" } | null;
  showError: (text: string) => void;
  showSuccess: (text: string) => void;
  clearMessage: () => void;
}

/**
 * @interface UserContextType
 * @description 사용자 관리 컨텍스트
 * @note 백엔드 API와 연동 시 이 인터페이스의 메서드들이 API 호출을 수행
 */
interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  sendCoin: (
    toUserId: number,
    amount: number
  ) => Promise<Result<CoinTransferEvent>>;
}

/**
 * @interface CoinTransferEvent
 * @description 코인 전송 이벤트 데이터 구조
 * @note WebSocket 이벤트 타입으로 사용됨
 *
 * @example
 * // WebSocket 메시지 예시
 * {
 *   "type": "COIN_TRANSFER",
 *   "data": {
 *     "fromUser": { "id": 1, "name": "고재우, 나산하", "coin": 90 },
 *     "toUser": { "id": 2, "name": "김연지, 김채민", "coin": 110 },
 *     "amount": 10
 *   }
 * }
 */
interface CoinTransferEvent {
  type: "COIN_TRANSFER";
  data: {
    fromUser: User;
    toUser: User;
    amount: number;
  };
}

/**
 * @interface Result
 * @description API 응답 결과 인터페이스
 * @template T - 응답 데이터 타입
 *
 * @example
 * // API 응답 예시
 * {
 *   "success": true,
 *   "data": { ... },
 *   "message": "성공적으로 처리되었습니다."
 * }
 */
interface Result<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * @const MOCK_USERS
 * @description 목업 사용자 데이터 (백엔드 API 구현 시 제거 예정)
 * @note GET /api/users 엔드포인트의 응답 형식과 동일
 */
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

const useUser = () => {
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

const UserInfo = () => {
  const { currentUser } = useUser();
  if (!currentUser) return null;

  return (
    <div className="user-info-box">
      <div className="user-info-content">
        번호: {currentUser.id} <span className="separator">|</span>{" "}
        {currentUser.username} <span className="separator">|</span> 코인:{" "}
        {currentUser.coinCount}
      </div>
    </div>
  );
};

const RankingTable = () => {
  const { users } = useUser();
  const sortedUsers = [...users].sort((a, b) => b.coinCount - a.coinCount);

  return (
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
          {sortedUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.coinCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  const { users, currentUser, sendCoin } = useUser();
  const { showError, showSuccess } = useMessage();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount) {
      showError("모든 필드를 입력해주세요.");
      return;
    }

    const result = await sendCoin(Number(selectedUserId), Number(amount));
    if (!result.success) {
      showError(result.message || "코인 전송에 실패했습니다.");
      return;
    }

    const toUser = users.find((u) => u.id === Number(selectedUserId));
    showSuccess(
      `${toUser?.username || "사용자"}님에게 ${amount}코인을 전송했습니다.`
    );
    setAmount("");
    setSelectedUserId("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="coin-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="coin-transfer-title">코인 전송</h2>
        <form onSubmit={handleSubmit}>
          <div className="coin-transfer-form-group">
            <label htmlFor="receiver">받는 사람:</label>
            <select
              id="receiver"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="coin-transfer-select"
            >
              <option value="">선택하세요</option>
              {users
                .filter((user) => user.id !== currentUser?.id)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
            </select>
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
            <button type="submit" className="coin-transfer-submit">
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

/**
 * @provider UserProvider
 * @description 사용자 관리 및 코인 전송 로직
 * @note 백엔드 API 연동 시 수정이 필요한 주요 부분
 */
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { showError } = useMessage();

  /**
   * @function login
   * @description 사용자 로그인 처리
   * @note POST /api/auth/login 엔드포인트로 대체 필요
   */
  const login = (user: User) => {
    const found = users.find((u) => u.id === user.id);
    if (found) {
      setCurrentUser(user);
    } else {
      setUsers((prev) => [...prev, user]);
      setCurrentUser(user);
    }
  };

  const logout = () => setCurrentUser(null);

  /**
   * @function sendCoin
   * @description 코인 전송 처리
   * @note
   * 1. POST /api/transactions 엔드포인트로 대체 필요
   * 2. 트랜잭션 원자성 보장 필요
   * 3. 동시성 제어 필요 (예: 낙관적 락)
   *
   * @example
   * // API Request 예시
   * POST /api/transactions
   * {
   *   "toUserId": 2,
   *   "amount": 10
   * }
   */
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
      value={{ currentUser, users, login, logout, sendCoin }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Main App Content
const AppContent = () => {
  const { currentUser } = useUser();
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <div className="App">
      <MessageBox />
      {!currentUser ? (
        <Login />
      ) : (
        <>
          <div className="logo-container">
            <img src="/logo.png" alt="코딩 마스터 로고" className="app-logo" />
          </div>
          <h1 className="app-title">코마데이</h1>
          <div className="user-section">
            <UserInfo />
          </div>
          <RankingTable />
          <div className="action-section">
            <button
              className="coin-transfer-btn"
              onClick={() => setShowTransfer(true)}
            >
              코인 전송
            </button>
          </div>
          {showTransfer && (
            <CoinTransfer onClose={() => setShowTransfer(false)} />
          )}
        </>
      )}
    </div>
  );
};

// Root App Component
const App = () => (
  <MessageProvider>
    <UserProvider>
      <AppContent />
    </UserProvider>
  </MessageProvider>
);

export default App;
