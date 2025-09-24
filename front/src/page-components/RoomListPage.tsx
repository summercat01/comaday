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
}

const RoomListPage: React.FC<RoomListPageProps> = ({ onJoinRoom }) => {
  const { currentUser, isLoaded } = useUser();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      loadRooms();
      const interval = setInterval(loadRooms, 5000); // 5초마다 새로고침
      return () => clearInterval(interval);
    }
  }, [isLoaded]);

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

    if (room.memberCount >= room.maxMembers) {
      alert('방이 가득 찼습니다.');
      return;
    }

    try {
      await roomService.joinRoom(room.roomCode, currentUser.id);
      onJoinRoom(room.roomCode);
    } catch (error: any) {
      alert(error.response?.data?.message || '방 입장에 실패했습니다.');
    }
  };

  if (!isLoaded || loading) {
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
      <Card className="text-center mb-6 sm:mb-8">
        <CardTitle level={1} className="text-2xl sm:text-4xl mb-3">
          🎲 게임 방 목록
        </CardTitle>
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

      {/* 새로고침 안내 */}
      <div className="text-center mt-4 sm:mt-8 p-3 sm:p-4 rounded-xl" 
           style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-success)' }}>
          💡 방 목록은 5초마다 자동으로 새로고침됩니다
        </p>
      </div>
    </div>
  );
};

export default RoomListPage;