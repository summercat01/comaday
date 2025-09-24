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
    }
  }, [roomCode, isLoaded, currentUser]);

  // 페이지 이탈 시 방에서 즉시 나가기
  useEffect(() => {
    if (!currentUser || !room) return;

    const activeMembers = room.members || [];
    const currentMember = activeMembers.find(m => m.userId === currentUser.id);
    const isMember = !!currentMember;

    if (!isMember) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // beforeunload에서는 비동기 작업이 제한되므로 sendBeacon 사용
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms/${roomCode}/leave-immediately`;
      const data = JSON.stringify({ userId: currentUser.id });
      
      try {
        // navigator.sendBeacon은 페이지 이탈 시에도 확실히 전송됨
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, new Blob([data], { type: 'application/json' }));
        } else {
          // sendBeacon을 지원하지 않는 브라우저를 위한 fallback
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true // 페이지 이탈 후에도 요청 유지
          }).catch(() => {
            // 에러 무시 (API 특성상 관대)
          });
        }
      } catch (error) {
        console.log('페이지 이탈 시 방 나가기:', error);
      }
    };

    const handleVisibilityChange = async () => {
      // 탭이 백그라운드로 갈 때 (완전 이탈은 아니지만 참고용)
      if (document.visibilityState === 'hidden') {
        try {
          await roomService.leaveRoomImmediately(roomCode, currentUser.id);
        } catch (error) {
          console.log('탭 백그라운드 시 방 나가기:', error);
        }
      }
    };

    // 브라우저 창/탭 닫기, 새로고침, 다른 페이지로 이동
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 탭 백그라운드 전환 (선택적)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, room, roomCode]);

  // 하트비트 시스템 (1분 30초마다)
  useEffect(() => {
    if (!currentUser || !room) return;

    const activeMembers = room.members || [];
    const currentMember = activeMembers.find(m => m.userId === currentUser.id);
    const isMember = !!currentMember;

    if (!isMember) return;

    const sendHeartbeat = async () => {
      try {
        await roomService.sendHeartbeat(roomCode, currentUser.id);
        console.log('하트비트 전송 성공');
      } catch (error) {
        console.error('하트비트 전송 실패:', error);
        // 하트비트 실패 시 방에서 자동으로 제거될 수 있으므로 
        // 방 데이터를 다시 로드하여 상태 확인
        loadRoomData();
      }
    };

    // 즉시 한 번 전송
    sendHeartbeat();

    // 1분 30초(90초)마다 하트비트 전송
    const heartbeatInterval = setInterval(sendHeartbeat, 90000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [currentUser, room, roomCode]);

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
        const result = await roomService.leaveRoom(roomCode, currentUser.id);
        console.log('방 나가기 성공:', result.message);
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
    if (!currentUser || !room || !newGameName.trim()) return;
    
    try {
      const updatedRoom = await roomService.updateGameName(roomCode, currentUser.id, newGameName);
      setRoom(updatedRoom);
      setIsEditingGame(false);
      alert('게임명이 성공적으로 변경되었습니다!');
    } catch (error: any) {
      alert(error.message || '게임명 수정에 실패했습니다.');
    }
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

        {/* 게임 정보 */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="text-center">
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
                className="inline-block px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsEditingGame(true)}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-title)' }}>
                  🎮 {room.gameName || '게임명을 입력하세요'}
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* 인원 현황 */}
        <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-title)' }}>
              👥 참가자
            </h3>
            <div className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              {activeMembers.length} / {room.maxMembers}
            </div>
          </div>

          {/* 참가자 리스트 */}
          <div className="space-y-3">
            {activeMembers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😴</div>
                <p className="text-gray-500">아직 참가자가 없습니다</p>
              </div>
            ) : (
              activeMembers.map((member) => {
                const isCurrentUser = member.userId === currentUser.id;
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      isCurrentUser
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* 아바타 */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ 
                        backgroundColor: isCurrentUser ? 'var(--color-primary)' : 'var(--color-gray-dark)'
                      }}
                    >
                      {member.user.username.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* 사용자 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--color-text-title)' }}>
                          {member.user.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            나
                          </span>
                        )}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                        💰 {member.user.coinCount.toLocaleString()} 코인
                      </div>
                    </div>

                    {/* 코인 전송 버튼 (다른 사용자에게만) */}
                    {!isCurrentUser && isMember && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedReceiver(member.userId);
                          setShowTransfer(true);
                        }}
                      >
                        전송
                      </Button>
                    )}
                  </div>
                );
              })
            )}

            {/* 빈 자리 표시 */}
            {Array.from({ length: room.maxMembers - activeMembers.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400">
                  ?
                </div>
                <div className="flex-1 text-gray-400">
                  빈 자리
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 방 정보 */}
        {!isMember && (
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800">
              🔒 방에 입장하지 않았습니다. 다른 사용자의 정보만 볼 수 있습니다.
            </p>
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
                {/* 받는 사람 정보 표시 */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    받는 사람
                  </label>
                  {selectedReceiver && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                      {(() => {
                        const receiver = activeMembers.find(m => m.userId === selectedReceiver);
                        return receiver ? (
                          <>
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: 'var(--color-gray-dark)' }}
                            >
                              {receiver.user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{receiver.user.username}</div>
                              <div className="text-sm text-gray-600">💰 {receiver.user.coinCount.toLocaleString()} 코인</div>
                            </div>
                          </>
                        ) : (
                          <div>사용자를 찾을 수 없습니다</div>
                        );
                      })()}
                    </div>
                  )}
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