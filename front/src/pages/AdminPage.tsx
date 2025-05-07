// src/pages/AdminPage.tsx
import React, { useState, useEffect } from "react";
import "./AdminPage.css";

// 임시 데이터 타입
interface User {
  id: number;
  username: string;
  coins: number;
  approved: boolean;
}

const AdminPage = () => {
  // 관리자 인증 상태
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 환경 변수에서 관리자 비밀번호 가져오기
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "";

  // 나중에 백엔드에서 불러올 사용자 데이터를 위한 상태
  const [users, setUsers] = useState<User[]>([
    // 임시 데이터
    { id: 1, username: "아이디1", coins: 100, approved: true },
    { id: 2, username: "아이디2", coins: 150, approved: true },
    { id: 3, username: "아이디3", coins: 200, approved: false },
    { id: 4, username: "아이디4", coins: 50, approved: false },
  ]);

  // 임시 입력값 저장을 위한 상태
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});

  // 비밀번호 확인 함수
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 환경 변수가 설정되지 않은 경우 오류 메시지 표시
    if (!ADMIN_PASSWORD) {
      setError(
        "관리자 비밀번호가 설정되지 않았습니다. 서버 관리자에게 문의하세요."
      );
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  // 백엔드에서 사용자 데이터 불러오기 (실제 구현 시에 사용)
  useEffect(() => {
    // 인증된 경우에만 데이터 로드
    if (authenticated) {
      // 예시 - 실제 구현 시에는 API 호출 코드로 대체
      // const fetchUsers = async () => {
      //   try {
      //     const response = await fetch('/api/users');
      //     const data = await response.json();
      //     setUsers(data);
      //   } catch (error) {
      //     console.error('Error fetching users:', error);
      //   }
      // };
      // fetchUsers();
    }
  }, [authenticated]);

  // 입력값 변경 처리
  const handleInputChange = (userId: number, value: string) => {
    setInputValues({
      ...inputValues,
      [userId]: value,
    });
  };

  // 버튼 클릭 처리 (예시)
  const handleButtonClick = (action: string, userId: number) => {
    // 실제 구현 시에는 API 호출 코드로 대체
    console.log(
      `${action} 버튼이 클릭되었습니다. 유저 ID: ${userId}, 입력값: ${
        inputValues[userId] || ""
      }`
    );
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
  };

  // 비밀번호 입력 화면
  if (!authenticated) {
    return (
      <div className="admin-login-container">
        <h1 className="admin-login-title">관리자 로그인</h1>
        {error && <p className="admin-login-error">{error}</p>}
        <form className="admin-login-form" onSubmit={handlePasswordSubmit}>
          <div className="admin-login-input-group">
            <label htmlFor="admin-password">비밀번호:</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input"
            />
          </div>
          <button type="submit" className="admin-login-button">
            로그인
          </button>
        </form>
        <button
          onClick={() => (window.location.href = "/")}
          className="back-button"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  // 관리자 페이지 내용 (인증 후 표시)
  return (
    <div className="admin-page">
      <h1 className="admin-title">관리자 페이지</h1>
      <div className="admin-logout-container">
        <button onClick={handleLogout} className="admin-logout-button">
          로그아웃
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>회원 정보</th>
              <th>코인 관리</th>
              <th>가입 승인</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-id">{user.username}</td>
                <td>
                  <div className="coin-management">
                    <span className="coin-label">보유 코인</span>
                    <input
                      type="text"
                      className="coin-input"
                      value={inputValues[user.id] || ""}
                      onChange={(e) =>
                        handleInputChange(user.id, e.target.value)
                      }
                    />
                    <button
                      className="btn btn-add"
                      onClick={() => handleButtonClick("추가", user.id)}
                    >
                      추가
                    </button>
                    <button
                      className="btn btn-subtract"
                      onClick={() => handleButtonClick("차감", user.id)}
                    >
                      차감
                    </button>
                  </div>
                </td>
                <td className="approval-buttons">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleButtonClick("승낙", user.id)}
                  >
                    승낙
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleButtonClick("거부", user.id)}
                  >
                    거부
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="back-button-container">
        <button
          onClick={() => (window.location.href = "/")}
          className="back-button"
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
