'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedReceiver, setSelectedReceiver] = useState<number | null>(null);
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [bulkTransferAmounts, setBulkTransferAmounts] = useState<{[userId: number]: number}>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');

  useEffect(() => {
    if (isLoaded && currentUser) {
    loadRoomData();
    }
  }, [roomCode, isLoaded, currentUser]);

  // 페이지 이탈 시 방에서 나가기 (확인 포함)
  useEffect(() => {
    if (!currentUser || !room) return;

    const activeMembers = room.members || [];
    const currentMember = activeMembers.find(m => m.userId === currentUser.id);
    const isMember = !!currentMember;

    if (!isMember) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // 사용자에게 확인 메시지 표시
      event.preventDefault();
      event.returnValue = '정말 방에서 나가시겠습니까?';
      
      // 브라우저가 사용자 확인을 받은 후 실제로 나갈 때를 위한 처리
      // (실제 이탈은 다른 이벤트에서 처리)
      return '정말 방에서 나가시겠습니까?';
    };

    const handlePageHide = () => {
      // 실제 페이지가 숨겨질 때 (사용자가 확인 후 나갈 때)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms/${roomCode}/leave-immediately`;
      const data = JSON.stringify({ userId: currentUser.id });
      
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, new Blob([data], { type: 'application/json' }));
        } else {
          fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          }).catch(() => {});
        }
      } catch (error) {
        console.log('페이지 이탈 시 방 나가기:', error);
      }
    };

    // 브라우저 창/탭 닫기, 새로고침, 다른 페이지로 이동 시 확인
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 실제 페이지 이탈 시 API 호출
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [currentUser, room, roomCode]);

  // Next.js 라우터 변경 감지 (뒤로가기, 앞으로가기 등)
  useEffect(() => {
    if (!currentUser || !room) return;

    const activeMembers = room.members || [];
    const currentMember = activeMembers.find(m => m.userId === currentUser.id);
    const isMember = !!currentMember;

    if (!isMember) return;

    const handleRouteChange = () => {
      // 라우터 변경 시 (뒤로가기, 앞으로가기 등) 확인 메시지
      const confirmLeave = confirm('정말 방에서 나가시겠습니까?');
      
      if (confirmLeave) {
        // 사용자가 확인했을 때만 방에서 나가기
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/rooms/${roomCode}/leave-immediately`;
        const data = JSON.stringify({ userId: currentUser.id });
        
        try {
          if (navigator.sendBeacon) {
            navigator.sendBeacon(apiUrl, new Blob([data], { type: 'application/json' }));
          } else {
            fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: data,
              keepalive: true
            }).catch(() => {});
          }
        } catch (error) {
          console.log('라우터 변경 시 방 나가기:', error);
        }
        
        return true; // 라우터 변경 허용
      } else {
        // 사용자가 취소했을 때 라우터 변경 방지
        // Next.js에서는 이 방법이 제한적이므로 beforeunload가 더 효과적
        return false;
      }
    };

    // popstate 이벤트로 브라우저 뒤로가기/앞으로가기 감지
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const confirmLeave = confirm('정말 방에서 나가시겠습니까?');
      
      if (confirmLeave) {
        // 방에서 나가기 API 호출
        roomService.leaveRoomImmediately(roomCode, currentUser.id)
          .then(() => {
            console.log('뒤로가기 시 방 나가기 성공');
            // 실제 라우터 변경 수행
            window.history.back();
          })
          .catch((error) => {
            console.log('뒤로가기 시 방 나가기 실패:', error);
            // 에러가 발생해도 뒤로가기는 허용
            window.history.back();
          });
      } else {
        // 취소시 히스토리를 다시 앞으로 이동하여 현재 페이지 유지
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // 히스토리 스택에 현재 상태 추가 (뒤로가기 감지용)
    window.history.pushState(null, '', window.location.pathname);
    
    // popstate 이벤트 리스너 추가
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, room, roomCode]);

  // 방 데이터 자동 새로고침 (폴링)
  useEffect(() => {
    if (!currentUser || !room) return;

    const activeMembers = room.members || [];
    const currentMember = activeMembers.find(m => m.userId === currentUser.id);
    const isMember = !!currentMember;

    if (!isMember) return;

    // 3초마다 방 데이터를 백그라운드에서 새로고침
    const pollInterval = setInterval(async () => {
      try {
        const updatedRoom = await roomService.getRoomByCode(roomCode);
        
        // 현재 room 상태와 비교하여 변경사항이 있을 때만 업데이트
        const hasChanges = 
          updatedRoom.name !== room.name ||
          updatedRoom.gameName !== room.gameName ||
          updatedRoom.members?.length !== room.members?.length ||
          JSON.stringify(updatedRoom.members?.map(m => m.userId).sort()) !== 
          JSON.stringify(room.members?.map(m => m.userId).sort());

        if (hasChanges) {
          console.log('방 정보 변경 감지 - 자동 업데이트');
          setRoom(updatedRoom);
          setNewRoomName(updatedRoom.name);
          setNewGameName(updatedRoom.gameName || '');
        }
      } catch (error) {
        console.error('방 데이터 폴링 실패:', error);
        // 폴링 실패는 조용히 무시 (사용자 경험에 영향 없음)
      }
    }, 3000); // 3초마다 폴링

    return () => {
      clearInterval(pollInterval);
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
      console.log('방 이름 변경 완료 - 다른 사용자들에게 자동 전파됨');
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
      console.log('게임명 변경 완료 - 다른 사용자들에게 자동 전파됨');
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
      
      // 코인 전송 후 방 데이터 즉시 새로고침 (코인 수량 업데이트)
      const updatedRoom = await roomService.getRoomByCode(roomCode);
      setRoom(updatedRoom);
      
      alert('코인 전송이 완료되었습니다!');
      console.log('코인 전송 완료 - 다른 사용자들에게 자동 전파됨');
    } catch (error: any) {
      alert(error.message || '코인 전송에 실패했습니다.');
    }
  };

  const handleBulkTransfer = async () => {
    if (!currentUser) return;
    
    // 0보다 큰 금액이 입력된 전송만 필터링
    const validTransfers = Object.entries(bulkTransferAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([userId, amount]) => ({ receiverId: Number(userId), amount }));
    
    if (validTransfers.length === 0) {
      alert('전송할 코인을 입력해주세요.');
      return;
    }
    
    const totalAmount = validTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    if (totalAmount > currentUser.coinCount) {
      alert(`보유 코인이 부족합니다. (필요: ${totalAmount.toLocaleString()}, 보유: ${currentUser.coinCount.toLocaleString()})`);
      return;
    }
    
    try {
      // 일괄 전송 API 사용
      await coinService.bulkTransfer({
        senderId: currentUser.id,
        roomCode: roomCode,
        description: `방 "${room?.name}"에서 일괄 코인 전송`,
        transfers: validTransfers
      });
      
      setShowBulkTransfer(false);
      setBulkTransferAmounts({});
      
      // 코인 전송 후 방 데이터 즉시 새로고침
      const updatedRoom = await roomService.getRoomByCode(roomCode);
      setRoom(updatedRoom);
      
      alert(`${validTransfers.length}명에게 총 ${totalAmount.toLocaleString()} 코인을 전송했습니다!`);
      console.log('일괄 코인 전송 완료 - 다른 사용자들에게 자동 전파됨');
    } catch (error: any) {
      alert(error.message || '일괄 코인 전송에 실패했습니다.');
    }
  };

  const updateTransferAmount = (userId: number, amount: number) => {
    setBulkTransferAmounts(prev => ({
      ...prev,
      [userId]: amount || 0
    }));
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
        
        {/* 일괄 코인 전송 섹션 */}
        {isMember && activeMembers.length > 1 && (
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-title)' }}>
                💰 일괄 코인 전송
              </h3>
              <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                내 보유: {currentUser.coinCount.toLocaleString()} 코인
        </div>
      </div>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setShowBulkTransfer(true)}
              className="flex items-center justify-center gap-2"
            >
              🎯 방 전체에게 코인 전송
            </Button>
          </div>
        )}

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

        {/* 일괄 코인 전송 모달 */}
        {showBulkTransfer && (
          <div className="fixed inset-0 bg-modal-overlay flex items-center justify-center p-5 z-50">
            <Card className="w-full max-w-lg" padding="lg">
              <CardTitle className="text-2xl font-bold mb-4">
                🎯 일괄 코인 전송
              </CardTitle>
              
              <div className="space-y-4">
                {/* 참가자별 코인 입력 */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    각 참가자에게 전송할 코인 입력
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {activeMembers
                      .filter(member => member.userId !== currentUser.id)
                      .map(member => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: 'var(--color-gray-dark)' }}
                          >
                            {member.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{member.user.username}</div>
                            <div className="text-sm text-gray-600">💰 {member.user.coinCount.toLocaleString()} 코인</div>
                          </div>
                          <div className="w-24">
                            <input
                              type="number"
                              min="0"
                              value={bulkTransferAmounts[member.userId] || ''}
                              onChange={(e) => updateTransferAmount(member.userId, Number(e.target.value))}
                              placeholder="0"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* 총 필요 코인 표시 */}
                {(() => {
                  const validTransfers = Object.entries(bulkTransferAmounts).filter(([_, amount]) => amount > 0);
                  const totalAmount = validTransfers.reduce((sum, [_, amount]) => sum + amount, 0);
                  
                  if (validTransfers.length > 0) {
                    return (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          총 필요 코인: {totalAmount.toLocaleString()} 
                          ({validTransfers.length}명에게 전송)
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          내 보유: {currentUser.coinCount.toLocaleString()} 코인
                        </div>
                        {totalAmount > currentUser.coinCount && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠️ 보유 코인이 부족합니다!
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="danger" onClick={() => {
                    setShowBulkTransfer(false);
                    setBulkTransferAmounts({});
                  }}>
                    취소
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handleBulkTransfer}
                    disabled={(() => {
                      const validTransfers = Object.entries(bulkTransferAmounts).filter(([_, amount]) => amount > 0);
                      const totalAmount = validTransfers.reduce((sum, [_, amount]) => sum + amount, 0);
                      return validTransfers.length === 0 || totalAmount > currentUser.coinCount;
                    })()}
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