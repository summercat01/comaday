import React, { useState } from 'react';
import './App.css';

type User = {
  id: number;
  name: string;
  coin: number;
};

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      alert('회원 번호를 입력하세요.');
      return;
    }
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
}

function CoinTransfer({
  users,
  onSendCoin,
  onClose,
}: {
  users: User[];
  onSendCoin: (userId: number, coin: number) => void;
  onClose: () => void;
}) {
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
    onSendCoin(Number(userId), Number(coin));
    setCoin('');
    setUserId('');
    onClose();
  };

  return (
    <div className="coin-transfer-modal">
      <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
      <h2 className="coin-transfer-title">코인 전송</h2>
      <div className="coin-transfer-box coin-inline-box">
        <label className="coin-label">보낼 번호:</label>
        <input
          className="coin-input"
          type="number"
          min="1"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
      </div>
      <div className="coin-transfer-box coin-inline-box">
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
}

function App() {
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
          
          <div className="user-info-box">
            <div className="user-info-item">번호: {currentUser.id}</div>
            <div className="user-info-divider" />
            <div className="user-info-item">{currentUser.name}</div>
            <div className="user-info-divider" />
            <div className="user-info-item">코인: {currentUser.coin}</div>
          </div>

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

          <button className="coin-btn" onClick={() => setShowTransfer(true)}>
            코인 전송
          </button>
        </>
      )}
    </div>
  );
}

export default App;