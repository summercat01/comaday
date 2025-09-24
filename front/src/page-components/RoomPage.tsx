'use client'

import React, { useState, useEffect } from 'react';
import { roomService } from '../api/services/roomService';
import { coinService } from '../api/services/coinService';
import { Room } from '../types/room';
import { useUser } from '../components/providers';
import { Card, CardTitle, Button, Input } from '../components/ui';
import { LoadingSpinner } from '../components/layout';

interface RoomPageProps {
  roomCode: string;
  onLeaveRoom: () => void;
}

const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onLeaveRoom }) => {
  const { currentUser, isLoaded } = useUser();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  useEffect(() => {
    if (isLoaded && currentUser) {
      loadRoomData();
      const interval = setInterval(loadRoomData, 3000);
      return () => clearInterval(interval);
    }
  }, [roomCode, isLoaded, currentUser]);

  const loadRoomData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const roomData = await roomService.getRoomByCode(roomCode);
      setRoom(roomData);
      setNewRoomName(roomData.name);
      setNewGameName(roomData.gameName || '');
    } catch (err: any) {
      console.error('방 정보 불러오기 실패:', err);
      setError(err.message || '방 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentUser) return;
    
    if (window.confirm('정말 방에서 나가시겠습니까?')) {
      try {
        await roomService.leaveRoom(roomCode, currentUser.id);
        onLeaveRoom();
      } catch (error: any) {
        alert(error.message || '방 나가기에 실패했습니다.');
      }
    }
  };

  const handleUpdateRoomName = async () => {
    if (!currentUser || !room || !newRoomName.trim()) return;
    
    try {
      const updatedRoom = await roomService.updateRoomName(roomCode, currentUser.id, newRoomName);
      setRoom(updatedRoom);
      setIsEditingName(false);
    } catch (error: any) {
      alert(error.message || '방 이름 수정에 실패했습니다.');
    }
  };

  const handleUpdateGameName = async () => {
    if (!currentUser || !room) return;
    
    // 임시로 로컬 상태만 업데이트 (백엔드에 게임명 업데이트 API가 없음)
    setRoom({ ...room, gameName: newGameName });
    setIsEditingGame(false);
    alert('게임명이 임시로 변경되었습니다. (페이지 새로고침 시 초기화됨)');
  };

  const handleCoinTransfer = async () => {
    if (!currentUser || !selectedReceiver || transferAmount <= 0) return;
    
    try {
      await coinService.transfer(currentUser.id, selectedReceiver, transferAmount, roomCode);
      setShowTransfer(false);
      setTransferAmount(0);
      setSelectedReceiver(null);
      loadRoomData();
      alert('코인 전송이 완료되었습니다!');
    } catch (error: any) {
      alert(error.message || '코인 전송에 실패했습니다.');
    }
  };

  // 참가자 위치 계산 (원형 배치)
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // -90도부터 시작
    const radius = 120; // 반지름
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y };
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 ml-4">방 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="text-center">
          <CardTitle className="text-2xl font-bold mb-4 text-red-600">오류 발생</CardTitle>
          <p className="mb-4" style={{ color: 'var(--color-text-light)' }}>{error}</p>
          <Button variant="primary" onClick={loadRoomData}>다시 시도</Button>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="text-center">
          <CardTitle className="text-2xl font-bold mb-4 text-red-600">로그인이 필요합니다</CardTitle>
          <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>방에 입장하려면 먼저 로그인해주세요.</p>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: 'var(--color-background)' }}>
        <Card className="text-center">
          <CardTitle className="text-2xl font-bold mb-4 text-red-600">방을 찾을 수 없습니다</CardTitle>
          <p className="mb-4" style={{ color: 'var(--color-text-light)' }}>존재하지 않거나 닫힌 방입니다.</p>
          <Button variant="primary" onClick={onLeaveRoom}>방 목록으로 돌아가기</Button>
        </Card>
      </div>
    );
  }

  const activeMembers = room.members || [];
  const currentMember = activeMembers.find(m => m.userId === currentUser.id);
  const roomNumber = parseInt(room.roomCode.replace('ROOM', '').replace(/^0+/, ''));
  const isMember = !!currentMember;

  return (
    <div className="min-h-screen p-3" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-md mx-auto">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-secondary)' 
              }}
            >
              No.{roomNumber}
            </span>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="text-lg font-bold w-32"
                  />
                  <Button variant="success" size="sm" onClick={handleUpdateRoomName}>
                    ✓
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setIsEditingName(false)}>
                    ✕
                  </Button>
                </div>
              ) : (
                <h1 
                  className="text-lg font-bold cursor-pointer"
                  style={{ color: 'var(--color-text-title)' }}
                  onClick={() => setIsEditingName(true)}
                >
                  {room.name}
                </h1>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsEditingName(true)}>
              편집
            </Button>
            <Button variant="danger" size="sm" onClick={handleLeaveRoom}>
              퇴장
            </Button>
          </div>
        </div>

        {/* 중앙 게임 영역 */}
        <div className="relative mb-8 bg-white rounded-2xl p-8 shadow-lg min-h-[400px] flex flex-col">
          {/* 게임명 (중앙 상단) */}
          <div className="text-center mb-8">
            {isEditingGame ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  placeholder="게임명 입력"
                  className="text-center font-bold text-lg w-40"
                />
                <Button variant="success" size="sm" onClick={handleUpdateGameName}>
                  ✓
                </Button>
                <Button variant="danger" size="sm" onClick={() => setIsEditingGame(false)}>
                  ✕
                </Button>
              </div>
            ) : (
              <div 
                className="inline-block px-6 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsEditingGame(true)}
              >
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-title)' }}>
                  {room.gameName || '게임명을 입력하세요'}
                </h2>
              </div>
            )}
          </div>

          {/* 참가자 원형 배치 */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* 중앙 현재 인원 표시 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {activeMembers.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  / {room.maxMembers}
                </div>
              </div>

              {/* 참가자들 원형 배치 */}
              {activeMembers.map((member, index) => {
                const position = getPlayerPosition(index, Math.max(activeMembers.length, 3));
                const isCurrentUser = member.userId === currentUser.id;
                
                return (
                  <div
                    key={member.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`
                    }}
                  >
                    <div className="text-center">
                      {/* 아바타 */}
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                          isCurrentUser ? 'ring-4 ring-green-400' : ''
                        }`}
                        style={{ 
                          backgroundColor: isCurrentUser ? 'var(--color-primary)' : 'var(--color-gray-dark)'
                        }}
                      >
                        {member.user.username.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* 사용자명 */}
                      <div className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-title)' }}>
                        {member.user.username}
                        {isCurrentUser && <span className="text-xs text-green-600 ml-1">✓</span>}
                      </div>
                      
                      {/* 코인 수 */}
                      <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                        {member.user.coinCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 빈 자리 표시 (물음표) */}
              {Array.from({ length: room.maxMembers - activeMembers.length }).map((_, index) => {
                const position = getPlayerPosition(activeMembers.length + index, Math.max(room.maxMembers, 3));
                
                return (
                  <div
                    key={`empty-${index}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${position.x}px)`,
                      top: `calc(50% + ${position.y}px)`
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-2xl"
                        style={{ 
                          borderColor: 'var(--color-gray)', 
                          color: 'var(--color-gray-dark)' 
                        }}
                      >
                        ?
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        {isMember && (
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowTransfer(true)}
              className="w-full max-w-xs"
            >
              💰 코인 전송
            </Button>
          </div>
        )}

        {/* 코인 전송 모달 */}
        {showTransfer && (
          <div className="fixed inset-0 bg-modal-overlay flex items-center justify-center p-5 z-50">
            <Card className="w-full max-w-md" padding="lg">
              <CardTitle className="text-2xl font-bold mb-4">
                💰 코인 전송
              </CardTitle>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    받는 사람
                  </label>
                  <select
                    value={selectedReceiver || ''}
                    onChange={(e) => setSelectedReceiver(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="">선택하세요</option>
                    {activeMembers
                      .filter(m => m.userId !== currentUser.id)
                      .map((member) => (
                        <option key={member.id} value={member.userId}>
                          {member.user.username} ({member.user.coinCount.toLocaleString()} 코인)
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <Input
                  label="전송할 코인"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  min="1"
                  max={currentUser.coinCount}
                  placeholder={`1 ~ ${currentUser.coinCount}`}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="danger" onClick={() => setShowTransfer(false)}>
                    취소
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handleCoinTransfer}
                    disabled={!selectedReceiver || transferAmount <= 0 || transferAmount > currentUser.coinCount}
                  >
                    전송
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;