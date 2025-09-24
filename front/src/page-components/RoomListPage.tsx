'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '../components/providers';
import { roomService } from '../api/services/roomService';
import { LobbyRoom } from '../types/room';
import { Card, CardTitle, Button } from '../components/ui';
import { LoadingSpinner } from '../components/layout';
import { RoomCard } from '../components/rooms';

interface RoomListPageProps {
  onJoinRoom: (roomCode: string) => void;
  onCreateRoom: () => void;
  onGoBack?: () => void;
}

const RoomListPage: React.FC<RoomListPageProps> = ({ onJoinRoom, onGoBack }) => {
  const { currentUser, isLoaded } = useUser();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  // 방 목록 자동 새로고침 (폴링)
  useEffect(() => {
    if (!currentUser) return;

    // 5초마다 방 목록을 백그라운드에서 새로고침
    const pollInterval = setInterval(async () => {
      try {
        const response = await roomService.getLobbyStatus();
        
        // 현재 rooms 상태와 비교하여 변경사항이 있을 때만 업데이트
        const hasChanges = JSON.stringify(response.rooms) !== JSON.stringify(rooms);
        
        if (hasChanges) {
          console.log('방 목록 변경 감지 - 자동 업데이트');
          setRooms(response.rooms);
        }
      } catch (error) {
        console.error('방 목록 폴링 실패:', error);
        // 폴링 실패는 조용히 무시 (사용자 경험에 영향 없음)
      }
    }, 5000); // 5초마다 폴링

    return () => {
      clearInterval(pollInterval);
    };
  }, [currentUser, rooms]);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomService.getLobbyStatus();
      setRooms(response.rooms);
    } catch (err: any) {
      console.error('방 목록 불러오기 실패:', err);
      setError(err.response?.data?.message || '방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 방 배치 순서 변경: 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6
  const reorderRooms = (rooms: LobbyRoom[]): LobbyRoom[] => {
    const sorted = [...rooms].sort((a, b) => a.roomNumber - b.roomNumber);
    const reordered: LobbyRoom[] = [];
    
    const firstHalf = sorted.slice(0, 6); // 1-6
    const secondHalf = sorted.slice(6, 11); // 7-11
    
    for (let i = 0; i < firstHalf.length; i++) {
      reordered.push(firstHalf[i]);
      if (secondHalf[i]) {
        reordered.push(secondHalf[i]);
      }
    }
    
    return reordered;
  };

  const handleJoinRoom = async (room: LobbyRoom) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!currentUser.id) {
      alert('사용자 ID가 없습니다. 다시 로그인해주세요.');
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

  if (loading) {
    return <LoadingSpinner message="방 목록을 불러오는 중..." fullScreen />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>로그인이 필요합니다</h2>
          <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>방 목록을 보려면 먼저 로그인해주세요.</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>⚠️ 오류</h2>
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-light)' }}>{error}</p>
          <Button onClick={loadRooms} variant="primary">
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  const orderedRooms = reorderRooms(rooms);

  return (
    <div className="min-h-screen p-3 sm:p-5 max-w-6xl mx-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* 상단 헤더 */}
      <div className="relative flex items-center justify-center mb-6">
        {/* 뒤로가기 버튼 - 절대 위치 */}
        {onGoBack && (
          <button 
            onClick={onGoBack}
            className="absolute left-0 flex items-center justify-center w-10 h-10 p-0 text-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-text-title)' }}
          >
            ←
          </button>
        )}
        
        {/* 제목 - 절대 중앙 */}
        <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: 'var(--color-text-title)' }}>
          🎲 게임 방 목록
        </h1>
      </div>

      <Card className="text-center mb-6 sm:mb-8">
        <div className="text-sm sm:text-lg font-medium" style={{ color: 'var(--color-text-light)' }}>
          총 {rooms.length}개의 방 | 활성 방: {rooms.filter(r => r.memberCount > 0).length}개
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-5 max-w-5xl mx-auto">
        {orderedRooms.map((room) => (
          <RoomCard 
            key={room.roomCode} 
            room={room} 
            onJoinRoom={handleJoinRoom} 
          />
        ))}
      </div>

    </div>
  );
};

export default RoomListPage;