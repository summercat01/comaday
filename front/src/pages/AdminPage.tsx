// src/pages/AdminPage.tsx
import React, { useState, useEffect } from "react";
import "./AdminPage.css";
import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/endpoints";
// import { User } from "../types/user";

// 관리자 페이지에서 사용할 사용자 타입
interface AdminUser {
  id: number;
  username: string;
  coinCount: number;
  isGuest: boolean;
  lastLoginAt: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminPage = () => {
  // 관리자 인증 상태
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 환경 변수에서 관리자 비밀번호 가져오기
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "";

  // 백엔드에서 불러올 사용자 데이터를 위한 상태
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");

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

  // 백엔드에서 사용자 데이터 불러오기
  useEffect(() => {
    // 인증된 경우에만 데이터 로드
    if (authenticated) {
      const fetchUsers = async () => {
        setLoading(true);
        setLoadError("");
        try {
          const response = await axiosInstance.get<AdminUser[]>(API_ENDPOINTS.users);
          setUsers(response.data);
        } catch (error) {
          console.error('사용자 데이터 불러오기 오류:', error);
          setLoadError("사용자 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [authenticated]);

  // 입력값 변경 처리
  const handleInputChange = (userId: number, value: string) => {
    setInputValues({
      ...inputValues,
      [userId]: value,
    });
  };

  // 코인 추가/차감 처리
  const handleCoinUpdate = async (action: string, userId: number) => {
    const amount = parseInt(inputValues[userId] || "0");
    if (isNaN(amount) || amount <= 0) {
      alert("유효한 코인 수량을 입력해주세요.");
      return;
    }
    
    try {
      // action에 따라 코인 추가 또는 차감
      const finalAmount = action === "추가" ? amount : -amount;
      await axiosInstance.put(`${API_ENDPOINTS.users}/${userId}/coins`, {
        amount: finalAmount
      });
      
      // 사용자 목록과 랭킹 데이터 새로고침
      const [usersResponse] = await Promise.all([
        axiosInstance.get<AdminUser[]>(API_ENDPOINTS.users)
      ]);
      
      setUsers(usersResponse.data);
      // 랭킹 데이터도 상태로 관리하고 있다면 여기서 업데이트
      
      // 입력값 초기화
      setInputValues(prev => ({
        ...prev,
        [userId]: ""
      }));
      
      alert(`사용자의 코인이 ${action === "추가" ? "추가" : "차감"}되었습니다.`);
    } catch (error: any) {
      console.error('코인 업데이트 오류:', error);
      const errorMessage = error.response?.data?.message || "코인 업데이트 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
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

      {loadError && <div className="error-message">{loadError}</div>}
      {loading ? (
        <div className="loading-message">사용자 데이터를 불러오는 중입니다...</div>
      ) : (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>회원 정보</th>
              <th>코인 관리</th>
              <th>계정 상태</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-id">
                  <div>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>사용자명:</strong> {user.username}</p>
                    <p><strong>가입일:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>관리자:</strong> {user.isAdmin ? "예" : "아니오"}</p>
                  </div>
                </td>
                <td>
                  <div className="coin-management">
                    <span className="coin-label">현재 보유 코인: <strong>{user.coinCount}</strong></span>
                    <input
                      type="number"
                      min="1"
                      className="coin-input"
                      value={inputValues[user.id] || ""}
                      placeholder="코인 수량 입력"
                      onChange={(e) =>
                        handleInputChange(user.id, e.target.value)
                      }
                    />
                    <button
                      className="btn btn-add"
                      onClick={() => handleCoinUpdate("추가", user.id)}
                    >
                      추가
                    </button>
                    <button
                      className="btn btn-subtract"
                      onClick={() => handleCoinUpdate("차감", user.id)}
                    >
                      차감
                    </button>
                  </div>
                </td>
                <td className="user-status">
                  <div>
                    <p><strong>게스트:</strong> {user.isGuest ? "예" : "아니오"}</p>
                    <p><strong>마지막 로그인:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "없음"}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* 거래 제한 설정 섹션 */}
      <div className="admin-section">
        <h2 className="admin-section-title">거래 제한 설정</h2>
        <div className="limit-settings">
          <div className="setting-item">
            <span className="setting-label">연속 거래 제한:</span>
            <span className="setting-value">같은 사용자와 3회 연속 거래 금지</span>
            <span className="setting-status active">활성화</span>
          </div>
          <div className="setting-description">
            💡 두 사용자 간 연속된 포인트 거래를 제한하여 공정한 경쟁을 유도합니다.
          </div>
        </div>
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
