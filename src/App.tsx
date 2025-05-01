import React, { useState } from 'react';
import './App.css';

/**
 * @typedef User
 * @description 사용자 정보 타입
 * @property {number} id - 사용자 고유 식별자
 * @property {string} name - 사용자 이름 (쉼표로 구분된 복수의 이름 가능)
 * @property {number} coin - 보유 코인 수량
 * 
 * @example
 * {
 *   "id": 1,
 *   "name": "고재우, 나산하",
 *   "coin": 100
 * }
 */
type User = {
  id: number;
  name: string;
  coin: number;
};

// 컴포넌트 Props 인터페이스 정의
interface LoginProps {
  onLogin: (user: User) => void;
}

interface CoinTransferProps {
  users: User[];
  onSendCoin: (userId: number, coin: number) => void;
  onClose: () => void;
}

interface UserInfoProps {
  user: User;
}

interface RankingTableProps {
  users: User[];
}

/**
 * @component UserInfo
 * @description 현재 로그인한 사용자의 정보를 표시하는 컴포넌트
 * @requires API - GET /api/users/:id (사용자 정보 조회)
 */
const UserInfo: React.FC<UserInfoProps> = ({ user }) => (
  <div className="user-info-box">
    <div className="user-info-item">번호: {user.id}</div>
    <div className="user-info-divider" />
    <div className="user-info-item">{user.name}</div>
    <div className="user-info-divider" />
    <div className="user-info-item">코인: {user.coin}</div>
  </div>
);

/**
 * @component RankingTable
 * @description 전체 사용자의 코인 보유량 랭킹을 표시하는 컴포넌트
 * @requires API - GET /api/ranking (전체 랭킹 조회)
 * @example Response
 * [
 *   { "id": 1, "name": "고재우, 나산하", "coin": 100 },
 *   { "id": 2, "name": "김연지, 김채민", "coin": 90 }
 * ]
 */
const RankingTable: React.FC<RankingTableProps> = ({ users }) => (
  <div className="ranking-section">
    <div className="ranking-header">랭킹</div>
    <table className="ranking-table">
      <thead>
        <tr>
          <th>순위</th>
          <th>이름</th>
          <th>코인</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={user.id}>
            <td>{index + 1} 위</td>
            <td>{user.name}</td>
            <td>{user.coin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * @component Login
 * @description 사용자 로그인 처리 컴포넌트
 * @requires API - POST /api/login
 * @example Request
 * {
 *   "id": "1",
 *   "password": "hashedPassword"
 * }
 * @example Response
 * {
 *   "id": 1,
 *   "name": "고재우, 나산하",
 *   "coin": 100,
 *   "token": "jwt_token_here"
 * }
 */
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      alert('회원 번호를 입력하세요.');
      return;
    }
    // TODO: API 연동 - POST /api/login
    // 현재는 더미 데이터로 처리
    onLogin({ id: userId, name: `사용자${userId}`, coin: 100 });
  };

  return (
    <div className="login-modal">
      <h2 className="login-title">로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-box login-inline-box">
          <label className="login-label">아이디:</label>
          <input
            className="login-input"
            type="text"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>
        <div className="login-box login-inline-box">
          <label className="login-label">비밀번호:</label>
          <input
            className="login-input"
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
          />
        </div>
        <button className="login-btn" type="submit">로그인</button>
      </form>
    </div>
  );
};

/**
 * @component CoinTransfer
 * @description 코인 전송 처리 컴포넌트
 * @requires API - POST /api/transfer
 * @example Request
 * {
 *   "fromUserId": 1,
 *   "toUserId": 2,
 *   "amount": 50
 * }
 * @example Response
 * {
 *   "success": true,
 *   "message": "전송 완료",
 *   "transaction": {
 *     "id": "tx_123",
 *     "timestamp": "2024-01-01T00:00:00Z",
 *     "fromUser": { "id": 1, "name": "고재우, 나산하", "newBalance": 50 },
 *     "toUser": { "id": 2, "name": "김연지, 김채민", "newBalance": 150 }
 *   }
 * }
 */
const CoinTransfer: React.FC<CoinTransferProps> = ({ users, onSendCoin, onClose }) => {
  const [userId, setUserId] = useState('');
  const [coin, setCoin] = useState('');

  const handleSend = () => {
    if (!userId || isNaN(Number(userId))) {
      alert('존재하는 회원 번호를 입력해주세요.');
      return;
    }
    if (!coin || isNaN(Number(coin)) || Number(coin) <= 0) {
      alert('보낼 코인을 입력해주세요.');
      return;
    }
    // TODO: API 연동 - POST /api/transfer
    onSendCoin(Number(userId), Number(coin));
    setCoin('');
    setUserId('');
    onClose();
  };

  return (
    <div className="coin-transfer-modal">
      <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
      <h2 className="coin-transfer-title">코인 전송</h2>
      <div className="coin-transfer-box">
        <label className="coin-label">보낼 번호:</label>
        <input
          className="coin-input"
          type="number"
          min="1"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
      </div>
      <div className="coin-transfer-box">
        <label className="coin-label">보낼 코인:</label>
        <input
          className="coin-input"
          type="number"
          min="1"
          value={coin}
          onChange={e => setCoin(e.target.value)}
        />
      </div>
      <button className="send-btn" onClick={handleSend}>보내기</button>
    </div>
  );
};

/**
 * @component App
 * @description 메인 애플리케이션 컴포넌트
 * @requires WebSocket - ws://your-api-domain/ws
 * @description 실시간 업데이트를 위한 웹소켓 연결이 필요합니다.
 * @example WebSocket Events
 * {
 *   "type": "COIN_TRANSFER",
 *   "data": {
 *     "fromUser": { "id": 1, "name": "고재우, 나산하", "coin": 50 },
 *     "toUser": { "id": 2, "name": "김연지, 김채민", "coin": 150 },
 *     "amount": 50
 *   }
 * }
 */
const App: React.FC = () => {
  // TODO: API 연동 시 상태 관리 라이브러리(Redux 등) 도입 고려
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: '고재우, 나산하', coin: 100 },
    { id: 2, name: '김연지, 김채민', coin: 100 },
    { id: 3, name: '홍길동', coin: 100 },
    { id: 4, name: '이순신', coin: 100 }
  ]);

  const handleLogin = (user: User) => {
    const found = users.find(u => u.id === user.id);
    if (found) {
      setCurrentUser(found);
    } else {
      alert('존재하지 않는 회원입니다.');
    }
  };

  const handleSendCoin = (userId: number, coin: number) => {
    const toUser = users.find(u => u.id === userId);
    if (!toUser) {
      alert('존재하지 않는 회원입니다.');
      return;
    }
    // TODO: API 연동 후 실제 전송 처리 및 상태 업데이트
    alert(`${toUser.name}에게 ${coin}개 보내졌습니다.`);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {showTransfer ? (
        <CoinTransfer 
          users={users} 
          onSendCoin={handleSendCoin} 
          onClose={() => setShowTransfer(false)} 
        />
      ) : (
        <>
          <h1 className="title">코마데이</h1>
          <UserInfo user={currentUser} />
          <RankingTable users={users} />
          <button className="coin-btn" onClick={() => setShowTransfer(true)}>
            코인 전송
          </button>
        </>
      )}
    </div>
  );
};

export default App;