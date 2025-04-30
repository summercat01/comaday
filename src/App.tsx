import React, { useState, useEffect } from 'react';
import './App.css';

type User = { id: number; name: string };

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
      alert('보낼 코인 수를 입력해주세요.');
      return;
    }
    onSendCoin(Number(userId), Number(coin));
    setCoin('');
    setUserId('');
    onClose();
  };

  return (
    <div className="coin-transfer-modal large-modal">
      <button className="close-btn" onClick={onClose} aria-label="닫기">×</button>
      <h2 className="coin-transfer-title">코인 전송</h2>
      <div className="coin-transfer-box coin-inline-box">
        <label className="coin-label">사용자 번호:</label>
        <input
          className="coin-input"
          type="number"
          min="1"
          value={userId}
          onChange={e => setUserId(e.target.value)}
        />
      </div>
      <div className="coin-transfer-box coin-inline-box">
        <label className="coin-label">보낼 코인 수:</label>
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
    onLogin({ id: userId, name: `사용자${userId}` });
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

function App() {
  // [백엔드 연동] users는 서버에서 받아오도록 수정 필요
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: '고재우, 나산하' },
    { id: 2, name: '김연지, 김채민' },
    { id: 3, name: '홍길동' },
    { id: 4, name: '이순신' },
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);

  // [백엔드 연동] 실시간 랭킹 데이터 fetch 예시 (주기적 갱신)
  // useEffect(() => {
  //   async function fetchRanking() {
  //     const res = await fetch('/api/ranking');
  //     const data = await res.json();
  //     setUsers(data);
  //   }
  //   fetchRanking();
  //   const interval = setInterval(fetchRanking, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // [백엔드 연동] 로그인 처리 시 서버 인증 및 사용자 정보 받아오기
  const handleLogin = (user: User) => {
    // 실제로는 서버에서 인증 후 사용자 정보 받아옴
    const found = users.find(u => u.id === user.id);
    if (found) {
      setCurrentUser(found);
    } else {
      alert('존재하지 않는 회원입니다.');
    }
  };

  // [백엔드 연동] 코인 전송 시 서버에 요청 보내고, 필요시 users 상태 갱신
  const handleSendCoin = (userId: number, coin: number) => {
    const toUser = users.find(u => u.id === userId);
    if (!toUser) {
      alert('존재하지 않는 회원입니다.');
      return;
    }
    alert(`${toUser.name}에게 ${coin}개 보내졌습니다.`);
    // 실제로는 서버에 전송 후, users 상태 갱신 필요
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="main-container">
      {showTransfer ? (
        <CoinTransfer users={users} onSendCoin={handleSendCoin} onClose={() => setShowTransfer(false)} />
      ) : (
        <>
          <h1 className="title">코마데이</h1>
          <div className="user-info-row">
            <div className="user-info-box">회원 번호: {currentUser.id}</div>
            <div className="user-info-box">{currentUser.name}</div>
            <div className="user-info-box">보유 코인: 100</div>
          </div>
          <div className="ranking-table-container">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th colSpan={3} className="ranking-title">랭킹</th>
                </tr>
                <tr>
                  <th>순위</th>
                  <th>이름</th>
                  <th>보유 코인</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}위</td>
                    <td>{u.name}</td>
                    <td>100</td>
                  </tr>
                ))}
                {[...Array(10 - users.length)].map((_, i) => (
                  <tr key={1000 + i}>
                    <td>{users.length + i + 1}위</td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="coin-btn" onClick={() => setShowTransfer(true)}>코인 전송</button>
        </>
      )}
    </div>
  );
}

export default App;