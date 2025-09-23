import React, { useState, useEffect } from 'react';
import { useUser } from '../components/providers';
import { useRouter } from 'next/navigation';
import { roomService, LobbyRoom } from '../api/services/roomService';

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

  return (
    <div className="min-h-screen p-5 max-w-6xl mx-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="text-center mb-8 card">
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-title)' }}>
          🎲 게임 방 목록
        </h1>
        <div className="text-lg font-medium" style={{ color: 'var(--color-text-light)' }}>
          총 {rooms.length}개의 방 | 활성 방: {rooms.filter(r => r.memberCount > 0).length}개
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {rooms.map((room) => (
          <div key={room.roomCode} className="card hover-lift min-h-80 flex flex-col">
            {/* 방 헤더 */}
            <div className="card-header">
              <div className="flex-1">
                <h3 className="card-title">{room.name}</h3>
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-semibold tracking-wide"
                  style={{ 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'var(--color-secondary)' 
                  }}
                >
                  {room.roomCode} (방 #{room.roomNumber})
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: getStatusColor(room) }}
                ></div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-title)' }}>
                  {getStatusText(room)}
                </span>
              </div>
            </div>

            {/* 방 정보 */}
            <div className="mb-5 flex-1">
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-title)' }}>
                📊 방 정보
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" 
                     style={{ backgroundColor: 'var(--color-gray)' }}>
                  <span style={{ color: 'var(--color-text)' }}>최대 인원</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-title)' }}>
                    {room.maxMembers}명
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg" 
                     style={{ backgroundColor: 'var(--color-gray)' }}>
                  <span style={{ color: 'var(--color-text)' }}>현재 인원</span>
                  <span className="font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                    {room.memberCount}명
                  </span>
                </div>
              </div>
            </div>

            {/* 인원 현황 */}
            <div className="mb-5 p-4 rounded-xl border-l-4"
                 style={{
                   backgroundColor: 'var(--color-gray)',
                   borderLeftColor: 'var(--color-primary)'
                 }}>
              <div className="font-semibold mb-2" style={{ color: 'var(--color-text-title)' }}>
                👥 참여 현황: {room.memberCount}/{room.maxMembers}
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden border" 
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
            <div className="mt-auto pt-4">
              <button
                className={room.memberCount >= room.maxMembers ? 'btn-disabled w-full' : 'btn-primary w-full'}
                onClick={() => handleJoinRoom(room)}
                disabled={room.memberCount >= room.maxMembers}
              >
                {room.memberCount >= room.maxMembers ? '🚫 가득참' : '🚪 입장하기'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 새로고침 안내 */}
      <div className="text-center mt-8 p-4 rounded-xl" 
           style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
        <p className="text-sm" style={{ color: 'var(--color-success)' }}>
          💡 방 목록은 3초마다 자동으로 새로고침됩니다
        </p>
      </div>
    </div>
  );
};

export default RoomListPage;