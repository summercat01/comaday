'use client'

// src/pages/AdminPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { userService } from "../api/services/userService";
import { roomService } from "../api/services/roomService";
import { User } from "../types/user";
import { Room, RoomMember } from "../types/room";

// 관리자 페이지에서 사용할 사용자 타입 (백엔드 API에 맞게)
interface AdminUser extends User {}

const AdminPage = () => {
  // 관리자 인증 상태
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 환경 변수에서 관리자 비밀번호 가져오기
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  // 백엔드에서 불러올 사용자 데이터를 위한 상태
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");

  // 방 현황 상태
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(false);
  const [roomsError, setRoomsError] = useState<string>("");
  const [roomsRefreshing, setRoomsRefreshing] = useState<boolean>(false);
  const [lastRoomsUpdatedAt, setLastRoomsUpdatedAt] = useState<Date | null>(null);
  const [kickingMemberId, setKickingMemberId] = useState<number | null>(null);

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const users = await userService.getAllUsers();
      setUsers(users);
    } catch (err: any) {
      console.error("사용자 데이터 불러오기 오류:", err);
      setLoadError(err?.message || "사용자 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRooms = useCallback(
    async (options: { showLoading?: boolean; recordRefresh?: boolean } = {}) => {
      const { showLoading = true, recordRefresh = false } = options;

      if (showLoading) {
        setRoomsLoading(true);
      }
      if (recordRefresh) {
        setRoomsRefreshing(true);
      }
      if (!showLoading && !recordRefresh) {
        // background refresh
        setRoomsError((prev) => prev);
      } else {
        setRoomsError("");
      }

      try {
        const roomList = await roomService.getAllRoomsWithMembers();
        setRooms(roomList);
        setLastRoomsUpdatedAt(new Date());
      } catch (err: any) {
        console.error("방 데이터 불러오기 오류:", err);
        setRoomsError(err?.message || "방 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (showLoading) {
          setRoomsLoading(false);
        }
        if (recordRefresh) {
          setRoomsRefreshing(false);
        }
      }
    },
    []
  );

  // 백엔드에서 사용자 및 방 데이터를 불러오기
  useEffect(() => {
    if (!authenticated) {
      return;
    }

    fetchUsers();
    fetchRooms();

    const interval = setInterval(() => {
      fetchRooms({ showLoading: false });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [authenticated, fetchUsers, fetchRooms]);

  // 입력값 변경 처리
  const handleInputChange = (userId: number, value: string) => {
    const parsedValue = value.replace(/[^0-9-]/g, "");
    setInputValues((prevValues) => ({
      ...prevValues,
      [userId]: parsedValue,
    }));
  };

  // 코인 추가/차감 처리
  const handleCoinUpdate = async (action: string, userId: number) => {
    const rawInput = inputValues[userId] || "0";
    const amount = parseInt(rawInput, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("유효한 코인 수량을 입력해주세요.");
      return;
    }

    try {
      // 현재 사용자 정보 가져오기
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        alert('사용자를 찾을 수 없습니다.');
        return;
      }

      // 새로운 코인 수량 계산
      const newCoinCount = action === "추가" 
        ? currentUser.coinCount + amount 
        : currentUser.coinCount - amount;

      if (newCoinCount < 0) {
        alert('코인이 부족하여 차감할 수 없습니다.');
        return;
      }

      // 코인 수량 업데이트
      const delta = action === "추가" ? amount : -amount;
      await userService.updateUserCoins(userId, delta);

      // 사용자 목록 새로고침
      await fetchUsers();

      // 입력값 초기화
      setInputValues(prev => ({
        ...prev,
        [userId]: ""
      }));

      alert(`사용자의 코인이 ${action === "추가" ? "추가" : "차감"}되었습니다.`);
    } catch (error: any) {
      console.error('코인 업데이트 오류:', error);
      alert(error.message || "코인 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleRefreshRooms = () => {
    fetchRooms({ showLoading: false, recordRefresh: true });
  };

  const handleKickMember = async (room: Room, member: RoomMember) => {
    const targetName = member.user?.username || `사용자 #${member.userId}`;

    const confirmed = window.confirm(
      `${room.name}(${room.roomCode})에서 ${targetName}님을 퇴장시키겠습니까?`
    );
    if (!confirmed) {
      return;
    }

    try {
      setKickingMemberId(member.id);
      await roomService.forceLeaveMember(room.roomCode, member.userId);
      await Promise.all([
        fetchRooms({ showLoading: false }),
        fetchUsers(),
      ]);
      alert(`${targetName}님을 방에서 퇴장시켰습니다.`);
    } catch (err: any) {
      console.error("사용자 퇴장 오류:", err);
      alert(err?.message || "사용자를 퇴장시키는 중 오류가 발생했습니다.");
    } finally {
      setKickingMemberId(null);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
  };

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => a.roomCode.localeCompare(b.roomCode));
  }, [rooms]);

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) {
      return "-";
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleString();
  };

  // 비밀번호 입력 화면
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-5">
        <div className="card w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-coma-dark mb-8">🔐 관리자 로그인</h1>
          {error && (
            <div className="message-error mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="block text-sm font-semibold text-coma-dark">
                비밀번호:
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="관리자 비밀번호를 입력하세요"
              />
            </div>
            <button type="submit" className="btn-danger w-full text-lg">
              로그인
            </button>
          </form>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-primary w-full mt-4"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 관리자 페이지 내용 (인증 후 표시)
  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="card">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-coma-dark">⚙️ 관리자 페이지</h1>
            <button onClick={handleLogout} className="btn-danger">
              로그아웃
            </button>
          </div>
        </div>

        {/* 오류 및 로딩 상태 */}
        {loadError && (
          <div className="message-error">
            {loadError}
          </div>
        )}
        
        {loading ? (
          <div className="card text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">사용자 데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          /* 사용자 관리 테이블 */
          <div className="card">
            <h2 className="card-title mb-6">👥 사용자 관리</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-coma-red text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">회원 정보</th>
                    <th className="px-6 py-4 text-left font-semibold">코인 관리</th>
                    <th className="px-6 py-4 text-left font-semibold">계정 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-coma-dark">
                            <span className="text-gray-600">ID:</span> {user.id}
                          </p>
                          <p className="font-medium">
                            <span className="text-gray-600">사용자명:</span> {user.username}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">가입일:</span> {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">관리자:</span> 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.isAdmin ? "예" : "아니오"}
                            </span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">현재 보유 코인:</span>
                            <span className="font-bold text-coma-green text-lg">{user.coinCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              className="input-field text-sm flex-1"
                              value={inputValues[user.id] || ""}
                              placeholder="수량 입력"
                              onChange={(e) => handleInputChange(user.id, e.target.value)}
                            />
                            <button
                              className="btn-success text-sm px-3 py-2"
                              onClick={() => handleCoinUpdate("추가", user.id)}
                            >
                              ➕ 추가
                            </button>
                            <button
                              className="btn-danger text-sm px-3 py-2"
                              onClick={() => handleCoinUpdate("차감", user.id)}
                            >
                              ➖ 차감
                            </button>
                          </div>
                        </div>
                      </td>
                             <td className="px-6 py-4">
                               <div className="space-y-2">
                                 <p className="text-sm">
                                   <span className="text-gray-600">계정 타입:</span>
                                   <span className="ml-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                     일반 사용자
                                   </span>
                                 </p>
                                 <p className="text-xs text-gray-600">
                                   <span className="font-medium">수정일:</span><br />
                                   {new Date(user.updatedAt).toLocaleString()}
                                 </p>
                               </div>
                             </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 방 현황 섹션 */}
        <div className="card">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h2 className="card-title">🏠 방 현황</h2>
              <p className="text-sm text-gray-500">
                전체 방 수: {sortedRooms.length}개 | 활성 방: {sortedRooms.filter((room) => (room.members?.length || 0) > 0).length}개
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {lastRoomsUpdatedAt && (
                <span className="text-gray-500">
                  마지막 업데이트: {formatDateTime(lastRoomsUpdatedAt)}
                </span>
              )}
              <button
                onClick={handleRefreshRooms}
                className="btn-primary text-sm px-3 py-2"
                disabled={roomsRefreshing}
              >
                {roomsRefreshing ? "새로고침 중..." : "🔄 새로고침"}
              </button>
            </div>
          </div>

          {roomsError && (
            <div className="message-error mb-4">{roomsError}</div>
          )}

          {roomsLoading ? (
            <div className="card text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">방 데이터를 불러오는 중입니다...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRooms.map((room) => {
                const memberCount = room.members?.length || 0;
                const occupancyRatio = room.maxMembers ? memberCount / room.maxMembers : 0;
                const occupancyBadgeClass = occupancyRatio >= 1
                  ? "bg-red-100 text-red-700"
                  : occupancyRatio >= 0.75
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700";

                return (
                  <div key={room.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-coma-dark">
                          {room.name}
                          <span className="ml-2 text-sm text-gray-500">({room.roomCode})</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          게임명: {room.gameName ? room.gameName : "미설정"}
                        </p>
                        <p className="text-xs text-gray-500">
                          시작 시간: {formatDateTime(room.startedAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${occupancyBadgeClass}`}>
                          {memberCount}/{room.maxMembers}명
                        </span>
                      </div>
                    </div>

                    {memberCount > 0 ? (
                      <div className="mt-4 space-y-3">
                        {room.members?.map((member) => {
                          const displayName = member.user?.username || `사용자 #${member.userId}`;
                          return (
                            <div
                              key={member.id}
                              className="flex flex-wrap justify-between items-center gap-3 border border-gray-100 rounded-lg p-3 bg-gray-50"
                            >
                              <div>
                                <p className="font-semibold text-coma-dark">{displayName}</p>
                                <p className="text-xs text-gray-500">
                                  입장: {formatDateTime(member.joinedAt)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  사용자 ID: {member.userId}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">
                                  보유 코인: {member.user?.coinCount?.toLocaleString() ?? "-"}
                                </span>
                                <button
                                  className="btn-danger text-xs px-3 py-2"
                                  onClick={() => handleKickMember(room, member)}
                                  disabled={kickingMemberId === member.id}
                                >
                                  {kickingMemberId === member.id ? "퇴장 중..." : "퇴장"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500">현재 참가자가 없습니다.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 거래 제한 설정 섹션 */}
        <div className="card">
          <h2 className="card-title mb-6">⚖️ 거래 제한 설정</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-coma-dark">연속 거래 제한:</span>
                <span className="text-gray-700">같은 사용자와 3회 연속 거래 금지</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                ✅ 활성화
              </span>
            </div>
            <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
              💡 두 사용자 간 연속된 포인트 거래를 제한하여 공정한 경쟁을 유도합니다.
            </div>
          </div>
        </div>

        {/* 메인으로 돌아가기 버튼 */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="btn-primary text-lg px-8"
          >
            🏠 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
