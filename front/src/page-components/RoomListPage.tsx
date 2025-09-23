import React, { useState, useEffect } from 'react';
import { useUser } from '../components/providers';
import { useRouter } from 'next/navigation';
import { roomService } from '../api/services/roomService';
import { LobbyRoom } from '../types/room';

interface RoomListPageProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => void;
}

const RoomListPage: React.FC<RoomListPageProps> = ({ onJoinRoom }) => {
  const { currentUser } = useUser();
  const router = useRouter();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 백엔드에서 방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await roomService.getLobbyStatus();
        setRooms(response.rooms);
      } catch (error: any) {
        console.error('방 목록 로딩 실패:', error);
        setError(error.message || '방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRooms();
      
      // 3초마다 방 목록 새로고침
      const interval = setInterval(fetchRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // 방 상태 텍스트
  const getStatusText = (room: LobbyRoom) => {
    if (room.memberCount === 0) return '대기중';
    if (room.memberCount >= room.maxMembers) return '가득찬';
    return '대기중';
  };

  // 상태 표시 색상
  const getStatusColor = (room: LobbyRoom) => {
    if (room.memberCount === 0) return 'var(--color-gray-dark)';
    if (room.memberCount >= room.maxMembers) return 'var(--color-error)';
    return 'var(--color-success)';
  };

  const handleJoinRoom = async (room: LobbyRoom) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (room.memberCount >= room.maxMembers) {
      alert('방이 가득 찼습니다.');
      return;
    }

    try {
      await roomService.joinRoom(room.roomCode, currentUser.id);
      onJoinRoom(room.roomCode);
    } catch (error: any) {
      alert(error.message || '방 입장에 실패했습니다.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>로그인이 필요합니다</h2>
          <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>방 목록을 보려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="card text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-text)' }}>방 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>오류 발생</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-light)' }}>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 방 배치 순서 변경: 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6
  const reorderRooms = (rooms: LobbyRoom[]): LobbyRoom[] => {
    const sorted = [...rooms].sort((a, b) => a.roomNumber - b.roomNumber);
    const reordered: LobbyRoom[] = [];
    
    // 첫 6개 방 (1-6)과 다음 5개 방 (7-11)으로 분리
    const firstHalf = sorted.slice(0, 6); // 1-6
    const secondHalf = sorted.slice(6, 11); // 7-11
    
    // 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6 순서로 배치
    for (let i = 0; i < firstHalf.length; i++) {
      reordered.push(firstHalf[i]); // 1, 2, 3, 4, 5, 6
      if (secondHalf[i]) {
        reordered.push(secondHalf[i]); // 7, 8, 9, 10, 11
      }
    }
    
    return reordered;
  };

  const orderedRooms = reorderRooms(rooms);

  return (
    <div className="min-h-screen p-3 sm:p-5 max-w-6xl mx-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center mb-6 sm:mb-8 card">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-title)' }}>
          🎲 게임 방 목록
        </h1>
        <div className="text-sm sm:text-lg font-medium" style={{ color: 'var(--color-text-light)' }}>
          총 {rooms.length}개의 방 | 활성 방: {rooms.filter(r => r.memberCount > 0).length}개
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5 max-w-5xl mx-auto">
        {orderedRooms.map((room) => (
          <div key={room.roomCode} className="card hover-lift flex flex-col min-h-[280px] sm:min-h-80">
            {/* 방 헤더 */}
            <div className="card-header">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 truncate" style={{ color: 'var(--color-text-title)' }}>
                  {room.name}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span 
                    className="inline-block px-2 py-1 rounded-full text-xs font-semibold tracking-wide"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      color: 'var(--color-secondary)' 
                    }}
                  >
                    방 #{room.roomNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: getStatusColor(room) }}
                    ></div>
                    <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
                      {getStatusText(room)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 방 정보 */}
            <div className="mb-3 sm:mb-5 flex-1">
              <h4 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-title)' }}>
                📊 방 정보
              </h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-center py-1 sm:py-2 px-2 sm:px-3 rounded-lg" 
                     style={{ backgroundColor: 'var(--color-gray)' }}>
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>최대 인원</span>
                  <span className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
                    {room.maxMembers}명
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 sm:py-2 px-2 sm:px-3 rounded-lg" 
                     style={{ backgroundColor: 'var(--color-gray)' }}>
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>현재 인원</span>
                  <span className="font-semibold text-xs sm:text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                    {room.memberCount}명
                  </span>
                </div>
              </div>
            </div>

            {/* 인원 현황 */}
            <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-xl border-l-4"
                 style={{
                   backgroundColor: 'var(--color-gray)',
                   borderLeftColor: 'var(--color-primary)'
                 }}>
              <div className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-title)' }}>
                👥 {room.memberCount}/{room.maxMembers}
              </div>
              <div className="w-full bg-white rounded-full h-2 sm:h-3 overflow-hidden border" 
                   style={{ borderColor: 'var(--color-border)' }}>
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${(room.memberCount / room.maxMembers) * 100}%`,
                    backgroundColor: room.memberCount >= room.maxMembers 
                      ? 'var(--color-error)' 
                      : room.memberCount > 0 
                        ? 'var(--color-success)' 
                        : 'var(--color-gray-dark)'
                  }}
                ></div>
              </div>
            </div>

            {/* 입장 버튼 */}
            <div className="mt-auto pt-2 sm:pt-4">
              <button
                className={`${room.memberCount >= room.maxMembers ? 'btn-disabled' : 'btn-primary'} w-full text-xs sm:text-sm py-2 sm:py-3`}
                onClick={() => handleJoinRoom(room)}
                disabled={room.memberCount >= room.maxMembers}
              >
                {room.memberCount >= room.maxMembers ? '🚫 가득참' : '🚪 입장'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 새로고침 안내 */}
      <div className="text-center mt-4 sm:mt-8 p-3 sm:p-4 rounded-xl" 
           style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-success)' }}>
          💡 방 목록은 3초마다 자동으로 새로고침됩니다
        </p>
      </div>
    </div>
  );
};

export default RoomListPage;